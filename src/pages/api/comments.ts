// 评论 API 端点 - 使用 Cloudflare D1 存储评论
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

const FIREBASE_ID_TOKEN_VERIFY_URL = (apiKey: string) =>
  `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const verifyFirebaseIdToken = async (idToken: string) => {
  // Try to get API key from env (Cloudflare Workers environment)
  // Fall back to import.meta.env for local dev
  const apiKey = env.PUBLIC_FIREBASE_API_KEY || import.meta.env.PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error(`Firebase API key is not configured (env.PUBLIC_FIREBASE_API_KEY=${env.PUBLIC_FIREBASE_API_KEY}, import.meta.env=${import.meta.env.PUBLIC_FIREBASE_API_KEY})`);
  }

  const response = await fetch(FIREBASE_ID_TOKEN_VERIFY_URL(apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Firebase token verification failed: ${errorBody}`);
  }

  const data = await response.json();
  const user = data?.users?.[0];
  if (!user) {
    throw new Error('Invalid Firebase user token');
  }

  return {
    uid: user.localId,
    displayName: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoUrl || null,
  };
};

export const POST: APIRoute = async ({ request }) => {
  try {
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const authorization = request.headers.get('Authorization') || '';
    const idToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
    const body = await request.json().catch(() => null);
    if (!body) {
      return jsonResponse({ error: 'Invalid request body' }, 400);
    }

    // If this is a moderator reply action, validate admin cookie instead of Firebase
    if (body.action === 'reply') {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/(?:^|; )admin_auth=([^;]+)/);
      const adminCookieValue = match ? decodeURIComponent(match[1]) : null;
      if (adminCookieValue !== env.ADMIN_PASSWORD) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

      const commentId = Number(body.commentId);
      const replyContent = String(body.replyContent || '').trim();
      if (!Number.isInteger(commentId) || commentId <= 0 || !replyContent) {
        return jsonResponse({ error: 'Missing required fields' }, 400);
      }

      const db = env.anneiupolan_blog_db;
      await db.prepare(
        `UPDATE Comments SET ReplyContent = ?, ReplyBy = ?, ReplyAt = CURRENT_TIMESTAMP WHERE Id = ?`
      ).bind(replyContent, 'admin', commentId).run();

      return jsonResponse({ success: true, message: 'Reply saved' }, 200);
    }

    // Non-reply path: require Firebase idToken
    if (!idToken) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const articleId = Number(body.articleId);
    const content = body.content;
    if (!Number.isInteger(articleId) || articleId <= 0 || !content) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    const trimmedContent = String(content).trim();
    if (trimmedContent.length < 2 || trimmedContent.length > 5000) {
      return jsonResponse({ error: 'Comment content must be between 2 and 5000 characters' }, 400);
    }

    const firebaseUser = await verifyFirebaseIdToken(idToken);
    const db = env.anneiupolan_blog_db;

    const result = await db
      .prepare(
        `INSERT INTO Comments (ArticleId, UserId, UserName, UserEmail, UserAvatar, Content, CreatedAt, UpdatedAt, Approved)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)`
      )
      .bind(
        articleId,
        firebaseUser.uid,
        firebaseUser.displayName,
        firebaseUser.email,
        firebaseUser.photoURL,
        trimmedContent
      )
      .run();

    return jsonResponse(
      {
        success: true,
        commentId: result?.lastInsertRowId || null,
        message: 'Comment submitted successfully and is pending moderation',
      },
      201
    );
  } catch (error) {
    console.error('Comment API error:', error);
    return jsonResponse(
      {
        error: 'Failed to submit comment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const articleId = Number(url.searchParams.get('articleId'));
    if (!Number.isInteger(articleId) || articleId <= 0) {
      return jsonResponse({ error: 'Missing articleId parameter' }, 400);
    }

    const db = env.anneiupolan_blog_db;
    const result = await db
      .prepare(
        `SELECT Id, UserId, UserName, UserEmail, UserAvatar, Content, CreatedAt, ReplyContent, ReplyBy, ReplyAt
         FROM Comments
         WHERE ArticleId = ? AND Approved = 1
         ORDER BY CreatedAt DESC`
      )
      .bind(articleId)
      .all<{ Id: number; UserId: string; UserName: string; UserEmail: string; UserAvatar: string | null; Content: string; CreatedAt: string; }>();

    const comments = result.results.map((row: any) => ({
      id: row.Id,
      userId: row.UserId,
      userName: row.UserName,
      userEmail: row.UserEmail,
      userAvatar: row.UserAvatar,
      content: row.Content,
      createdAt: row.CreatedAt,
      replyContent: row.ReplyContent || null,
      replyBy: row.ReplyBy || null,
      replyAt: row.ReplyAt || null,
    }));

    return jsonResponse(comments, 200);
  } catch (error) {
    console.error('Get comments error:', error);
    return jsonResponse({ error: 'Failed to fetch comments' }, 500);
  }
};
