/**
 * One-off: tạo bảng BML_SAMPLE_REJECTIONS
 * Usage: node scripts/run-sample-rejections-sql.js
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
        const trimmed = line.trim();
        const m = trimmed.match(/^([^#=\s]+)\s*=\s*(.*)$/);
        if (m) process.env[m[1]] = m[2].trim();
    }
}
const oracledb = require('oracledb');

async function main() {
    const connectString = `${process.env.DB_HOST || '192.168.7.248'}:${process.env.DB_PORT || 1521}/${process.env.DB_SERVICE_NAME || 'orclstb'}`;

    const connection = await oracledb.getConnection({
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        connectString,
    });

    const sqlPath = path.join(__dirname, '..', 'sql', 'BML_SAMPLE_REJECTIONS.sql');
    const raw = fs.readFileSync(sqlPath, 'utf8');
    const statements = raw
        .split(';')
        .map((s) => s.replace(/--[^\n]*/g, '').trim())
        .filter((s) => s.length > 0);

    try {
        for (const stmt of statements) {
            console.log('Executing:', stmt.slice(0, 80).replace(/\s+/g, ' ') + '...');
            await connection.execute(stmt);
        }
        await connection.commit();
        console.log('OK: BML_SAMPLE_REJECTIONS created successfully.');
    } catch (err) {
        if (err.errorNum === 955) {
            console.log('Table/index already exists — skipping.');
        } else {
            throw err;
        }
    } finally {
        await connection.close();
    }
}

main().catch((err) => {
    console.error('Failed:', err.message);
    process.exit(1);
});
