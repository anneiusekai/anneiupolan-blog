import type { APIRoute } from 'astro';

export const GET: APIRoute = () =>
  new Response(null, {
    status: 303,
    headers: {
      Location: '/admin/editor',
    },
  });

export const POST: APIRoute = ({ cookies }) => {
  cookies.set('admin_auth', '', {
    path: '/',
    maxAge: 0,
  });

  return new Response(null, {
    status: 303,
    headers: {
      Location: '/admin/editor',
    },
  });
};
