const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

console.log('--- DATABASE STORAGE VERIFICATION ---');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('Existing Tables (' + tables.length + '):', tables.map(t => t.name).join(', '));

const counts = {};
for (const table of tables) {
  if (table.name.startsWith('sqlite_')) continue;
  try {
    const res = db.prepare(`SELECT COUNT(*) as count FROM "${table.name}"`).get();
    counts[table.name] = res.count;
  } catch (e) {
    counts[table.name] = 'error: ' + e.message;
  }
}

console.log('\nRow Counts per Table:');
console.table(counts);

try {
  const topScores = db.prepare(`
    SELECT nr.submission_id, p.title as project_name, nr.rank, 
           ROUND(nr.final_normalized_score, 3) as normalized_score, 
           ROUND(nr.raw_score_average, 2) as raw_average,
           ROUND(nr.aggregate_z_score, 3) as z_score
    FROM normalization_results nr
    LEFT JOIN submissions s ON s.id = nr.submission_id
    LEFT JOIN projects p ON p.id = s.project_id
    ORDER BY nr.rank ASC
    LIMIT 10
  `).all();

  console.log('\nTop Normalized Leaderboard:');
  console.table(topScores);
} catch (e) {
  console.log('Error querying normalization_results:', e.message);
}
