import Database from 'better-sqlite3';

const db = new Database('sqlite.db');

console.log('--- DATABASE STORAGE VERIFICATION ---');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[];
console.log('Existing Tables:', tables.map(t => t.name));

const counts: Record<string, number> = {};
for (const table of tables) {
  if (table.name.startsWith('sqlite_') || table.name === '_drizzle_migrations') continue;
  try {
    const res = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number };
    counts[table.name] = res.count;
  } catch (e: any) {
    counts[table.name] = -1;
  }
}

console.log('Row Counts per Table:');
console.table(counts);

// Check sample data in submissions and normalized_scores
const topScores = db.prepare(`
  SELECT ns.submission_id, p.name as project_name, ns.rank, ns.normalized_score, ns.raw_average_score
  FROM normalized_scores ns
  LEFT JOIN submissions s ON s.id = ns.submission_id
  LEFT JOIN projects p ON p.id = s.project_id
  ORDER BY ns.rank ASC
  LIMIT 5
`).all();

console.log('Top Normalized Leaderboard:');
console.table(topScores);
