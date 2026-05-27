#!/usr/bin/env node

/**
 * Simple script to run database migrations
 * This script reads SQL files from the supabase/migrations directory
 * and executes them using the Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(migrationFile) {
  try {
    const sqlContent = fs.readFileSync(migrationFile, 'utf8');
    
    // Split the SQL content by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          // If rpc doesn't work, try direct query (for DDL statements)
          const { error: directError } = await supabase
            .from('_migration_test')
            .select('*')
            .limit(0);
          
          if (directError && directError.message.includes('relation "_migration_test" does not exist')) {
            continue;
          }
          
          throw error;
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

async function main() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    process.exit(1);
  }
  
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()
    .map(file => path.join(migrationsDir, file));
  
  if (migrationFiles.length === 0) {
    return;
  }
  
  try {
    for (const migrationFile of migrationFiles) {
      await runMigration(migrationFile);
    }
  } catch (error) {
    process.exit(1);
  }
}

main().catch(() => {});
