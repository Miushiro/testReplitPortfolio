#!/usr/bin/env bun
/**
 * Production Admin User Creation Script
 * 
 * This script creates a new admin user with a securely hashed password.
 * Use this for production deployments where default credentials are disabled.
 * 
 * Usage:
 *   bun run scripts/create-admin.ts
 */

import { Database } from 'bun:sqlite';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'portfolio.db');
const db = new Database(dbPath);

async function promptUser(question: string): Promise<string> {
  process.stdout.write(question);
  
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.resume();
    stdin.once('data', (data) => {
      stdin.pause();
      resolve(data.toString().trim());
    });
  });
}

async function promptPassword(question: string): Promise<string> {
  // Note: In a real production script, you'd use a proper password input library
  // that hides the input. For now, this is a simple implementation.
  process.stdout.write(question);
  
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    
    let password = '';
    stdin.on('data', (char) => {
      const ch = char.toString('utf8');
      
      switch (ch) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D
          stdin.setRawMode(false);
          stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          process.exit();
          break;
        case '\u007f': // Backspace
        case '\b':
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += ch;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function createAdmin() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Production Admin User Creation');
  console.log('═══════════════════════════════════════════════\n');
  
  // Get username
  const username = await promptUser('Enter admin username: ');
  
  if (!username || username.length < 3) {
    console.error('❌ Username must be at least 3 characters long');
    process.exit(1);
  }
  
  // Check if user already exists
  const existing = db.query('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    console.error(`❌ User "${username}" already exists!`);
    process.exit(1);
  }
  
  // Get password
  const password = await promptPassword('Enter password: ');
  
  if (!password || password.length < 8) {
    console.error('\n❌ Password must be at least 8 characters long');
    process.exit(1);
  }
  
  const confirmPassword = await promptPassword('Confirm password: ');
  
  if (password !== confirmPassword) {
    console.error('\n❌ Passwords do not match!');
    process.exit(1);
  }
  
  // Hash password and insert
  console.log('\n⏳ Hashing password (this may take a moment)...');
  const passwordHash = bcrypt.hashSync(password, 10);
  
  db.run('INSERT INTO users (username, passwordHash) VALUES (?, ?)', [username, passwordHash]);
  
  console.log(`✅ Admin user "${username}" created successfully!`);
  console.log('\n⚠️  Remember to:');
  console.log('  - Store credentials securely');
  console.log('  - Never commit credentials to version control');
  console.log('  - Set AUTH_SECRET environment variable before starting server');
  console.log('\n═══════════════════════════════════════════════\n');
  
  process.exit(0);
}

// Run the script
createAdmin().catch((error) => {
  console.error('❌ Error creating admin user:', error);
  process.exit(1);
});
