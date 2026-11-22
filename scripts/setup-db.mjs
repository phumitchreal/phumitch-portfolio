import fs from "node:fs";
import path from "node:path";

const PROJECT_REF = "bzdsqdorqpwjkdioopzk";
const token = process.env.SUPABASE_ACCESS_TOKEN || process.argv[2];

if (!token) {
  console.error("Usage: node scripts/setup-db.mjs <SUPABASE_ACCESS_TOKEN>");
  console.error("Or set SUPABASE_ACCESS_TOKEN=<token>");
  process.exit(1);
}

async function runMigration() {
  const sqlPath = path.resolve(process.cwd(), "supabase-schema.sql");
  const query = fs.readFileSync(sqlPath, "utf-8");

  console.log(`Running migration for project: ${PROJECT_REF}...`);

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Migration failed (${res.status}):`, errorText);
    process.exit(1);
  }

  const result = await res.json();
  console.log("Migration executed successfully!", result);
}

runMigration().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
