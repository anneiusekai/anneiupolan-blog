// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap()],
	image: {
		// 把你的 R2.dev 網址貼在這裡（不要包含 https:// 和後面的路徑）
		domains: ['pub-7e355146c9504fa4af57be0afd2a07ea.r2.dev'], 
	}
});


