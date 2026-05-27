import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://iwzotxudjklostywactg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3em90eHVkamtsb3N0eXdhY3RnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjEwMjkzNywiZXhwIjoyMDg3Njc4OTM3fQ.1Njnzpk7vie4ijXL_xizjdWtCSSKjF_lp7niAs-P374';

const supabase = createClient(supabaseUrl, supabaseKey);

function escapeString(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'number' || typeof str === 'boolean') return str;
  return `'${String(str).replace(/'/g, "''")}'`;
}

async function exportDatabase() {
  // Get all tables
  const { data: tables, error } = await supabase.rpc('get_tables');

  if (error) {
    console.log('Using fallback method to get tables...');
    // Fallback: try common table names or get from schema
    const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
    console.error('Could not fetch tables automatically. Please list your table names.');
    return;
  }

  let output = '-- Database Export\n-- Generated: ' + new Date().toISOString() + '\n\n';

  for (const table of tables) {
    const tableName = table.table_name;
    console.log(`Exporting ${tableName}...`);

    const { data, error } = await supabase.from(tableName).select('*');

    if (error) {
      console.error(`Error exporting ${tableName}:`, error);
      continue;
    }

    if (!data || data.length === 0) {
      output += `-- Table: ${tableName} (empty)\n\n`;
      continue;
    }

    output += `-- Table: ${tableName}\n`;
    
    for (const row of data) {
      const columns = Object.keys(row).join(', ');
      const values = Object.values(row).map(escapeString).join(', ');
      output += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
    }
    
    output += '\n';
  }

  fs.writeFileSync('backup.sql', output);
  console.log('Export complete! Saved to backup.sql');
}

exportDatabase();
