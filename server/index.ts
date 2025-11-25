import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getSocialFeeds,
  getUserByUsername,
  type Post,
  type SocialFeed,
} from './db';

// Secure auth middleware with HMAC signing
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Request validation schemas
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  published: z.boolean().optional().default(false),
});

const updatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  published: z.boolean(),
});

const AUTH_SECRET = process.env.AUTH_SECRET;

// In production, AUTH_SECRET must be set
if (!AUTH_SECRET && process.env.NODE_ENV === 'production') {
  console.error('❌ FATAL: AUTH_SECRET environment variable MUST be set in production!');
  console.error('❌ Server startup aborted for security reasons.');
  process.exit(1);
}

if (!AUTH_SECRET) {
  console.warn('⚠️  WARNING: AUTH_SECRET not set - using development fallback.');
  console.warn('⚠️  This is ONLY safe for local development!');
}

const SECRET = AUTH_SECRET || 'dev-secret-INSECURE-DO-NOT-USE-IN-PRODUCTION';

interface AuthContext {
  userId?: number;
  username?: string;
}

function generateToken(userId: number, username: string): string {
  const payload = { userId, username, exp: Date.now() + 24 * 60 * 60 * 1000 }; // 24h expiry
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  
  // Sign the payload using HMAC-SHA256
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payloadBase64)
    .digest('base64');
  
  return `${payloadBase64}.${signature}`;
}

function verifyToken(token: string): AuthContext | null {
  try {
    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) {
      return null; // Invalid token format
    }
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(payloadBase64)
      .digest('base64');
    
    if (signature !== expectedSignature) {
      console.warn('Token signature verification failed');
      return null; // Invalid signature
    }
    
    // Decode and validate payload
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    if (payload.exp < Date.now()) {
      console.warn('Token expired');
      return null; // Token expired
    }
    
    return { userId: payload.userId, username: payload.username };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

function requireAuth(request: any): AuthContext {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    const error: any = new Error('Unauthorized: Missing or invalid Authorization header');
    error.status = 401;
    throw error;
  }

  const token = authHeader.substring(7);
  const auth = verifyToken(token);
  if (!auth) {
    const error: any = new Error('Unauthorized: Invalid or expired token');
    error.status = 401;
    throw error;
  }

  return auth;
}

// Rate limiting for login endpoint
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function getClientIP(request: any): string {
  // Priority order for IP extraction:
  // 1. Cloudflare (cf-connecting-ip) - most trusted
  // 2. Direct connection (socket) - cannot be spoofed
  // 3. Trusted proxy mode (TRUST_PROXY=true) - use X-Real-IP
  
  // Cloudflare provides the real client IP (most trusted)
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;
  
  // If NOT behind a trusted proxy, use the real socket connection IP
  // This cannot be spoofed as it comes from the TCP connection
  if (process.env.TRUST_PROXY !== 'true') {
    const remoteAddress = (request as any)?.server?.requestIP?.(request) || 
                         (request as any)?.socket?.remoteAddress ||
                         'unknown';
    return remoteAddress;
  }
  
  // TRUST_PROXY mode: Behind nginx/HAProxy that correctly sets X-Real-IP
  // IMPORTANT: Only enable TRUST_PROXY if you control the reverse proxy
  // and have configured it to strip/sanitize client-supplied headers
  
  // X-Real-IP is set by the trusted proxy (nginx: proxy_set_header X-Real-IP $remote_addr)
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;
  
  // Fall back to socket address if proxy headers missing
  const fallbackIP = (request as any)?.server?.requestIP?.(request) || 
                    (request as any)?.socket?.remoteAddress ||
                    'unknown';
  
  return fallbackIP;
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  
  if (!attempt || now > attempt.resetAt) {
    // Reset or initialize
    loginAttempts.set(ip, { count: 1, resetAt: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (attempt.count >= 5) {
    // Too many attempts - log for monitoring
    console.warn(`Rate limit exceeded for IP: ${ip}`);
    return false;
  }
  
  attempt.count++;
  return true;
}

function resetRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

const app = new Elysia()
  .use(cors())
  .onError(({ code, error, set }) => {
    // Handle auth errors with proper 401 status
    if ((error as any).status === 401 || code === 'UNAUTHORIZED') {
      set.status = 401;
      return { error: 'Unauthorized', message: 'Authentication required' };
    }
    
    // Handle not found
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { error: 'Not Found', message: 'Resource not found' };
    }
    
    // Sanitize all other errors - don't leak stack traces
    console.error('Server error:', error);
    set.status = 500;
    return { error: 'Internal Server Error', message: 'An unexpected error occurred' };
  })
  .get('/api/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  
  // Public posts endpoints (read-only)
  .get('/api/posts', () => {
    const posts = getPosts().filter(p => p.published);
    return posts;
  })
  
  .get('/api/posts/:id', ({ params, set }) => {
    const post = getPost(Number(params.id));
    if (!post || !post.published) {
      set.status = 404;
      return { error: 'Not Found', message: 'Post not found' };
    }
    return post;
  })
  
  // Protected admin posts endpoints
  .get('/api/admin/posts', ({ request }) => {
    requireAuth(request);
    return getPosts();
  })
  
  .post('/api/admin/posts', ({ request, body, set }) => {
    requireAuth(request);
    
    // Validate request body
    const validation = createPostSchema.safeParse(body);
    if (!validation.success) {
      set.status = 400;
      return { 
        error: 'Validation Error', 
        message: 'Invalid request data',
        details: validation.error.issues 
      };
    }
    
    const { title, content, published } = validation.data;
    const post = createPost(title, content, published);
    return post;
  })
  
  .put('/api/admin/posts/:id', ({ request, params, body, set }) => {
    requireAuth(request);
    const id = Number(params.id);
    const existingPost = getPost(id);
    
    if (!existingPost) {
      set.status = 404;
      return { error: 'Not Found', message: 'Post not found' };
    }
    
    // Validate request body
    const validation = updatePostSchema.safeParse(body);
    if (!validation.success) {
      set.status = 400;
      return { 
        error: 'Validation Error', 
        message: 'Invalid request data',
        details: validation.error.issues 
      };
    }
    
    const { title, content, published } = validation.data;
    const post = updatePost(id, title, content, published);
    return post;
  })
  
  .delete('/api/admin/posts/:id', ({ request, params, set }) => {
    requireAuth(request);
    const id = Number(params.id);
    const existingPost = getPost(id);
    
    if (!existingPost) {
      set.status = 404;
      return { error: 'Not Found', message: 'Post not found' };
    }
    
    deletePost(id);
    return { success: true };
  })
  
  // Social feeds endpoints (protected)
  .get('/api/admin/social-feeds', ({ request }) => {
    requireAuth(request);
    const feeds = getSocialFeeds();
    return feeds;
  })
  
  // Auth endpoints
  .post('/api/auth/login', async ({ body, request, set }) => {
    // Validate request body
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      set.status = 400;
      return { 
        success: false,
        message: 'Invalid request data',
        details: validation.error.issues 
      };
    }
    
    // Get real client IP (cannot be spoofed)
    const ip = getClientIP(request);
    
    // Rate limiting check
    if (!checkRateLimit(ip)) {
      console.warn(`Login rate limit exceeded for IP: ${ip}`);
      set.status = 429;
      return { 
        success: false, 
        message: 'Too many login attempts. Please try again later.' 
      };
    }
    
    const { username, password } = validation.data;
    const user = getUserByUsername(username);
    
    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }
    
    // Verify password hash
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return { success: false, message: 'Invalid credentials' };
    }
    
    // Successful login - reset rate limit
    resetRateLimit(ip);
    
    const token = generateToken(user.id, user.username);
    return { 
      success: true, 
      token,
      user: { id: user.id, username: user.username } 
    };
  })
  
  .listen(3001);

console.log(`🦊 ElysiaJS server running at http://localhost:${app.server?.port}`);
