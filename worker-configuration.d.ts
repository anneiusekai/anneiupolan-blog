/// <reference types="astro/client" />

type D1Database = import("@cloudflare/workers-types/experimental").D1Database;

type ENV = {
  anneiupolan_blog_db: D1Database;
  ADMIN_PASSWORD: string;
};

declare module "cloudflare:workers" {
  export const env: ENV;
}

declare global {
  const EasyMDE: any;
}
