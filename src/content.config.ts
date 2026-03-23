import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			// 使用 z.union 允許兩種格式：
			// 1. image() 會驗證本地相對路徑（如 ../../assets/pic.jpg）並回傳 Metadata
			// 2. z.string().url() 則接受外部網址
			heroImage: z.union([image(), z.string()]).optional(),
		}),
});

export const collections = { blog };
