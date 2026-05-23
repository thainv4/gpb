/**
 * GEN2 Phase 0 — inventory, DDL (idempotent), backfill, verify.
 * Uses LIS_RS credentials from gpb/.env (DB_HOST, DB_USERNAME, ...).
 *
 * Usage:
 *   node scripts/run-gen2-phase0.mjs              # full phase 0
 *   node scripts/run-gen2-phase0.mjs --dry-run      # inventory + DDL check + counts only (no MERGE)
 *   node scripts/run-gen2-phase0.mjs --inventory    # inventory only
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import oracledb from 'oracledb';

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = false;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const planSqlDir = path.resolve(repoRoot, '..', 'plan', 'sql');
const reportsDir = path.resolve(repoRoot, '..', 'plan', 'sql', 'reports');

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const inventoryOnly = args.has('--inventory');

function loadEnv() {
  const envPath = path.join(repoRoot, '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error(`Missing ${envPath}`);
  }
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const m = t.match(/^([^=]+)=(.*)$/);
    if (m && process.env[m[1].trim()] === undefined) {
      process.env[m[1].trim()] = m[2].trim();
    }
  }
}

function log(lines, msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  lines.push(line);
}

async function runQuery(conn, sql, binds = {}, opts = {}) {
  const result = await conn.execute(sql, binds, opts);
  return result;
}

async function columnExists(conn) {
  const res = await runQuery(
    conn,
    `SELECT COUNT(*) AS CNT FROM user_tab_columns
     WHERE table_name = 'BML_STORED_SR_SERVICES' AND column_name = 'TESTING_METHOD_GEN_ID'`,
  );
  const row = res.rows[0];
  return Number(row.CNT ?? row.cnt ?? 0) > 0;
}

async function runInventory(conn, lines) {
  log(lines, '=== INVENTORY (GEN2_00) ===');

  const queries = [
    {
      name: 'header_with_method',
      sql: `SELECT COUNT(*) AS CNT FROM BML_STORED_SERVICE_REQUESTS r WHERE r.TESTING_METHOD_GEN_ID IS NOT NULL`,
    },
    {
      name: 'service_rows_to_backfill',
      sql: `SELECT COUNT(*) AS CNT FROM BML_STORED_SR_SERVICES s
            INNER JOIN BML_STORED_SERVICE_REQUESTS r ON s.STORED_SERVICE_REQ_ID = r.ID
            WHERE r.TESTING_METHOD_GEN_ID IS NOT NULL`,
    },
    {
      name: 'orphan_header_fk (go/no-go = 0)',
      sql: `SELECT COUNT(*) AS CNT FROM BML_STORED_SERVICE_REQUESTS r
            LEFT JOIN BML_TESTING_METHOD_GEN m ON m.ID = r.TESTING_METHOD_GEN_ID
            WHERE r.TESTING_METHOD_GEN_ID IS NOT NULL AND m.ID IS NULL`,
    },
    {
      name: 'signed_docs_active',
      sql: `SELECT COUNT(*) AS CNT FROM BML_STORED_SIGNED_DOCUMENTS WHERE DELETED_AT IS NULL`,
    },
  ];

  const metrics = {};
  for (const q of queries) {
    const res = await runQuery(conn, q.sql);
    const cnt = Number(res.rows[0].CNT ?? res.rows[0].cnt ?? 0);
    metrics[q.name] = cnt;
    log(lines, `  ${q.name}: ${cnt}`);
  }

  const dist = await runQuery(
    conn,
    `SELECT service_count, COUNT(*) AS req_count FROM (
       SELECT STORED_SERVICE_REQ_ID, COUNT(*) AS service_count
       FROM BML_STORED_SR_SERVICES GROUP BY STORED_SERVICE_REQ_ID
     ) GROUP BY service_count ORDER BY service_count`,
  );
  log(lines, '  service_count distribution:');
  for (const row of dist.rows) {
    const sc = row.SERVICE_COUNT ?? row.service_count;
    const rc = row.REQ_COUNT ?? row.req_count;
    log(lines, `    ${sc} service(s)/req: ${rc} request(s)`);
  }

  const dupSigned = await runQuery(
    conn,
    `SELECT STORED_SERVICE_REQ_ID, COUNT(*) AS CNT FROM BML_STORED_SIGNED_DOCUMENTS
     WHERE DELETED_AT IS NULL GROUP BY STORED_SERVICE_REQ_ID HAVING COUNT(*) > 1 ORDER BY COUNT(*) DESC`,
  );
  if (dupSigned.rows.length === 0) {
    log(lines, '  duplicate signed docs per storedServiceReqId: none');
  } else {
    log(lines, `  duplicate signed docs per storedServiceReqId: ${dupSigned.rows.length} req(s)`);
    for (const row of dupSigned.rows.slice(0, 10)) {
      log(lines, `    ${row.STORED_SERVICE_REQ_ID ?? row.stored_service_req_id}: ${row.CNT ?? row.cnt}`);
    }
  }

  return metrics;
}

async function runDdl(conn, lines) {
  log(lines, '=== DDL (GEN2_01) ===');
  const exists = await columnExists(conn);
  if (exists) {
    log(lines, '  TESTING_METHOD_GEN_ID already exists on BML_STORED_SR_SERVICES — skip ALTER');
    return false;
  }
  if (dryRun) {
    log(lines, '  [dry-run] Would ADD column TESTING_METHOD_GEN_ID VARCHAR2(36) NULL');
    return true;
  }
  await runQuery(
    conn,
    `ALTER TABLE BML_STORED_SR_SERVICES ADD (TESTING_METHOD_GEN_ID VARCHAR2(36) NULL)`,
  );
  await conn.commit();
  log(lines, '  ALTER TABLE committed');
  return true;
}

async function runBackfill(conn, lines, columnReady) {
  log(lines, '=== BACKFILL (GEN2_02) ===');
  const countSql = columnReady
    ? `SELECT COUNT(*) AS CNT FROM BML_STORED_SR_SERVICES s
       INNER JOIN BML_STORED_SERVICE_REQUESTS r ON s.STORED_SERVICE_REQ_ID = r.ID
       WHERE r.TESTING_METHOD_GEN_ID IS NOT NULL AND s.TESTING_METHOD_GEN_ID IS NULL`
    : `SELECT COUNT(*) AS CNT FROM BML_STORED_SR_SERVICES s
       INNER JOIN BML_STORED_SERVICE_REQUESTS r ON s.STORED_SERVICE_REQ_ID = r.ID
       WHERE r.TESTING_METHOD_GEN_ID IS NOT NULL`;
  const countRes = await runQuery(conn, countSql);
  const toUpdate = Number(countRes.rows[0].CNT ?? countRes.rows[0].cnt ?? 0);
  log(
    lines,
    columnReady
      ? `  rows_to_update (line NULL, header set): ${toUpdate}`
      : `  rows_to_update (pre-DDL estimate, all lines under header): ${toUpdate}`,
  );

  if (toUpdate === 0) {
    log(lines, '  nothing to backfill');
    return 0;
  }
  if (dryRun) {
    log(lines, '  [dry-run] skip MERGE');
    return toUpdate;
  }

  const mergeRes = await runQuery(
    conn,
    `MERGE INTO BML_STORED_SR_SERVICES s
     USING (
       SELECT r.ID AS stored_service_req_id, r.TESTING_METHOD_GEN_ID AS method_id
       FROM BML_STORED_SERVICE_REQUESTS r
       WHERE r.TESTING_METHOD_GEN_ID IS NOT NULL
     ) src ON (s.STORED_SERVICE_REQ_ID = src.stored_service_req_id)
     WHEN MATCHED THEN UPDATE SET s.TESTING_METHOD_GEN_ID = src.method_id
     WHERE s.TESTING_METHOD_GEN_ID IS NULL`,
  );
  await conn.commit();
  const merged = mergeRes.rowsAffected ?? 0;
  log(lines, `  MERGE committed, rowsAffected=${merged}`);
  return merged;
}

async function runVerify(conn, lines) {
  log(lines, '=== VERIFY (GEN2_03) ===');

  const checkA = await runQuery(
    conn,
    `SELECT COUNT(*) AS CNT FROM BML_STORED_SR_SERVICES s
     INNER JOIN BML_STORED_SERVICE_REQUESTS r ON s.STORED_SERVICE_REQ_ID = r.ID
     WHERE r.TESTING_METHOD_GEN_ID IS NOT NULL AND s.TESTING_METHOD_GEN_ID IS NULL`,
  );
  const cntA = Number(checkA.rows[0].CNT ?? checkA.rows[0].cnt ?? 0);
  log(lines, `  A) lines_still_null_while_header_set: ${cntA}`);

  const checkB = await runQuery(
    conn,
    `SELECT COUNT(*) AS CNT FROM BML_STORED_SR_SERVICES s
     INNER JOIN BML_STORED_SERVICE_REQUESTS r ON s.STORED_SERVICE_REQ_ID = r.ID
     WHERE r.TESTING_METHOD_GEN_ID IS NOT NULL AND s.TESTING_METHOD_GEN_ID IS NOT NULL
       AND s.TESTING_METHOD_GEN_ID <> r.TESTING_METHOD_GEN_ID`,
  );
  const cntB = Number(checkB.rows[0].CNT ?? checkB.rows[0].cnt ?? 0);
  log(lines, `  B) line_method <> header_method: ${cntB}`);

  const checkC = await runQuery(
    conn,
    `SELECT COUNT(*) AS CNT FROM (
       SELECT r.ID FROM BML_STORED_SERVICE_REQUESTS r
       JOIN BML_STORED_SR_SERVICES s ON s.STORED_SERVICE_REQ_ID = r.ID
       WHERE s.TESTING_METHOD_GEN_ID IS NOT NULL
       GROUP BY r.ID HAVING COUNT(DISTINCT s.TESTING_METHOD_GEN_ID) > 1
     )`,
  );
  const cntC = Number(checkC.rows[0].CNT ?? checkC.rows[0].cnt ?? 0);
  log(lines, `  C) requests with multiple distinct line methods: ${cntC} (info)`);

  const ok = cntA === 0 && cntB === 0;
  log(lines, ok ? '  VERIFY: PASS' : '  VERIFY: FAIL — review exceptions (P0-08)');
  return { ok, cntA, cntB, cntC };
}

async function main() {
  loadEnv();
  const user = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  const connectString = `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`;

  if (!user || !password || !process.env.DB_HOST) {
    throw new Error('Set DB_HOST, DB_PORT, DB_SERVICE_NAME, DB_USERNAME, DB_PASSWORD in gpb/.env');
  }

  const lines = [];
  log(lines, `GEN2 Phase 0 — connect ${process.env.DB_HOST}/${process.env.DB_SERVICE_NAME} as ${user}`);
  if (dryRun) log(lines, 'Mode: --dry-run (no MERGE, DDL may be skipped if column missing)');
  if (inventoryOnly) log(lines, 'Mode: --inventory only');

  const conn = await oracledb.getConnection({ user, password, connectString });

  try {
    const metrics = await runInventory(conn, lines);

    if (metrics['orphan_header_fk (go/no-go = 0)'] > 0) {
      log(lines, 'ABORT: orphan_header_fk > 0 — fix data before DDL/backfill');
      process.exitCode = 1;
      return;
    }

    if (inventoryOnly) {
      log(lines, 'Done (inventory only).');
      return;
    }

    const colBefore = await columnExists(conn);
    await runDdl(conn, lines);

    const colAfter = await columnExists(conn);
    if (!colBefore && !dryRun && !colAfter) {
      throw new Error('DDL failed: column still missing');
    }

    const columnReady = colAfter || colBefore;
    if (!columnReady && dryRun) {
      await runBackfill(conn, lines, false);
      log(lines, 'Done (dry-run). Run npm run gen2:phase0 to apply DDL + backfill.');
      return;
    }

    if (!columnReady) {
      log(lines, 'SKIP backfill: column does not exist');
      return;
    }

    await runBackfill(conn, lines, true);
    if (!dryRun) {
      const verify = await runVerify(conn, lines);
      if (!verify.ok) process.exitCode = 1;
    }
  } finally {
    await conn.close();
  }

  fs.mkdirSync(reportsDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const reportPath = path.join(reportsDir, `phase0-${stamp}.log`);
  fs.writeFileSync(reportPath, lines.join('\n') + '\n', 'utf8');
  log(lines, `Report: ${reportPath}`);
  console.log(`\nWrote ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
