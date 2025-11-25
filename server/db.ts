import { Database } from 'bun:sqlite';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'portfolio.db');
export const db = new Database(dbPath, { create: true });

// Initialize schema
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published BOOLEAN DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS socialFeeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    username TEXT,
    apiKey TEXT,
    enabled BOOLEAN DEFAULT 0
  )
`);

// Seed default admin user ONLY in development
const existingUser = db.query('SELECT id FROM users WHERE username = ?').get('admin');
if (!existingUser) {
  // Only create default admin in development mode
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ No admin user exists! Create one manually with hashed password.');
    console.error('❌ Never use default credentials in production.');
  } else {
    const defaultPasswordHash = bcrypt.hashSync('admin123', 10);
    db.run('INSERT INTO users (username, passwordHash) VALUES (?, ?)', ['admin', defaultPasswordHash]);
    console.log('✓ DEV ONLY: Seeded default admin (username: admin, password: admin123)');
    console.warn('⚠️  This account is ONLY for development. Do NOT use in production!');
  }
}

export interface User {
  id: number;
  username: string;
  passwordHash: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
}

export interface SocialFeed {
  id: number;
  platform: string;
  username: string | null;
  apiKey: string | null;
  enabled: boolean;
}

// Database helpers
export const getPosts = () => db.query('SELECT * FROM posts ORDER BY createdAt DESC').all() as Post[];
export const getPost = (id: number) => db.query('SELECT * FROM posts WHERE id = ?').get(id) as Post | null;
export const createPost = (title: string, content: string, published: boolean = false) => {
  db.run('INSERT INTO posts (title, content, published) VALUES (?, ?, ?)', [title, content, published ? 1 : 0]);
  return db.query('SELECT * FROM posts WHERE id = last_insert_rowid()').get() as Post;
};
export const updatePost = (id: number, title: string, content: string, published: boolean) => {
  db.run('UPDATE posts SET title = ?, content = ?, published = ? WHERE id = ?', [title, content, published ? 1 : 0, id]);
  return getPost(id);
};
export const deletePost = (id: number) => db.run('DELETE FROM posts WHERE id = ?', [id]);

export const getSocialFeeds = () => db.query('SELECT * FROM socialFeeds').all() as SocialFeed[];
export const getUserByUsername = (username: string) => db.query('SELECT * FROM users WHERE username = ?').get(username) as User | null;

console.log('✓ Database initialized at', dbPath);
