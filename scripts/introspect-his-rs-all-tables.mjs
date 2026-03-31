/**
 * READ-ONLY: dump ALL tables + views in HIS_RS with columns (Oracle data dictionary).
 * No DDL/DML. Usage: node scripts/introspect-his-rs-all-tables.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import oracledb from 'oracledb';

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const m = t.match(/^([^=]+)=(.*)$/);
    if (m && process.env[m[1].trim()] === undefined) {
      process.env[m[1].trim()] = m[2].trim();
    }
  }
}

const OWNER = 'HIS_RS';

function fmtType(r) {
  let typ = r.DATA_TYPE || r.data_type;
  const len = r.DATA_LENGTH ?? r.data_length;
  const prec = r.DATA_PRECISION ?? r.data_precision;
  const scale = r.DATA_SCALE ?? r.data_scale;
  if (typ === 'VARCHAR2' || typ === 'CHAR' || typ === 'NVARCHAR2') typ += `(${len})`;
  if (typ === 'NUMBER' && prec != null)
    typ += `(${prec}${scale != null ? `,${scale}` : ''})`;
  return typ;
}

async function main() {
  const user = process.env.DB_USERNAME_HIS;
  const password = process.env.DB_PASSWORD_HIS;
  const connectString = `${process.env.DB_HOST_HIS}:${process.env.DB_PORT_HIS}/${process.env.DB_SERVICE_NAME_HIS}`;
  const conn = await oracledb.getConnection({ user, password, connectString });

  let tables = [];
  let views = [];
  let colRows = [];

  try {
    const tRes = await conn.execute(
      `SELECT table_name FROM all_tables WHERE owner = :o ORDER BY table_name`,
      [OWNER],
    );
    tables = (tRes.rows || []).map((r) => r.TABLE_NAME || r.table_name);

    const vRes = await conn.execute(
      `SELECT view_name FROM all_views WHERE owner = :o ORDER BY view_name`,
      [OWNER],
    );
    views = (vRes.rows || []).map((r) => r.VIEW_NAME || r.view_name);

    const cRes = await conn.execute(
      `
      SELECT table_name, column_name, data_type, data_length, data_precision, data_scale, nullable, column_id
      FROM all_tab_columns
      WHERE owner = :o
      ORDER BY table_name, column_id
      `,
      [OWNER],
    );
    colRows = cRes.rows || [];
  } finally {
    await conn.close();
  }

  const byTable = new Map();
  for (const r of colRows) {
    const tn = r.TABLE_NAME || r.table_name;
    if (!byTable.has(tn)) byTable.set(tn, []);
    byTable.get(tn).push(r);
  }

  const snapshotAt = new Date().toISOString();
  const lines = [];

  lines.push('# HIS_RS — danh mục toàn bộ bảng và view (Oracle)');
  lines.push('');
  lines.push('> **Chỉ đọc data dictionary** (`ALL_TABLES`, `ALL_VIEWS`, `ALL_TAB_COLUMNS`). Không thay đổi database.');
  lines.push(`> **Snapshot:** ${snapshotAt}`);
  lines.push(`> **Schema:** \`${OWNER}\``);
  lines.push(`> **Số bảng (TABLE):** ${tables.length}`);
  lines.push(`> **Số view (VIEW):** ${views.length}`);
  lines.push(`> **Số đối tượng có mô tả cột:** ${byTable.size}`);
  lines.push('');
  lines.push('## Mục lục nhanh');
  lines.push('');
  lines.push('- [Danh sách tên bảng](#danh-sách-tên-bảng-alphabetical)');
  lines.push('- [Danh sách tên view](#danh-sách-tên-view-alphabetical)');
  lines.push('- [Chi tiết cột theo từng đối tượng](#chi-tiết-cột-theo-từng-đối-tượng)');
  lines.push('');
  lines.push('## Kết nối (GPB backend)');
  lines.push('');
  lines.push('Biến: `DB_HOST_HIS`, `DB_PORT_HIS`, `DB_USERNAME_HIS`, `DB_PASSWORD_HIS`, `DB_SERVICE_NAME_HIS` — datasource TypeORM `hisConnection` (`src/config/his-database.config.ts`).');
  lines.push('');
  lines.push('## Danh sách tên bảng (alphabetical)');
  lines.push('');
  for (const name of tables) lines.push(`- \`${name}\``);
  lines.push('');
  lines.push('## Danh sách tên view (alphabetical)');
  lines.push('');
  for (const name of views) lines.push(`- \`${name}\``);
  lines.push('');
  lines.push('## Chi tiết cột theo từng đối tượng');
  lines.push('');
  lines.push('Mỗi mục: tên bảng/view + bảng markdown cột / kiểu / nullable.');
  lines.push('');

  const allNames = [...new Set([...tables, ...views])].sort();
  for (const name of allNames) {
    const cols = byTable.get(name);
    const kind = tables.includes(name) ? 'TABLE' : views.includes(name) ? 'VIEW' : '?';
    lines.push(`### ${name} (${kind})`);
    lines.push('');
    if (!cols || !cols.length) {
      lines.push('*Không có dòng trong `ALL_TAB_COLUMNS` (hiếm — kiểm tra quyền hoặc synonym).*');
      lines.push('');
      continue;
    }
    lines.push('| # | Cột | Kiểu | Nullable |');
    lines.push('|---|-----|------|----------|');
    let i = 1;
    for (const r of cols) {
      const cn = r.COLUMN_NAME || r.column_name;
      const nu = r.NULLABLE || r.nullable;
      lines.push(`| ${i} | ${cn} | ${fmtType(r)} | ${nu} |`);
      i++;
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('Cập nhật: `node scripts/introspect-his-rs-all-tables.mjs`');
  lines.push('');

  const outPath = path.resolve(__dirname, '..', 'docs', 'his-rs-all-tables.md');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log('Wrote', outPath, `(${lines.length} lines)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
