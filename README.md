<h1 align="center">
  Astro Blog
</h1>

My personal code blog at [aibistin.com](https://aibistin.com).

## Key Features

- **Astro 5** static site generation
- **Tailwind CSS 4** — CSS-first configuration, no config file
- **MDX** posts with Expressive Code syntax highlighting (solarized dark/light)
- **Dark/light mode** with `localStorage` persistence
- **Pagefind** static search
- **Auto-generated OG images** via Satori
- **RSS feed**, sitemap, and webmentions
- **Table of contents** on posts with headings

## Commands

| Command               | Action                                                        |
| :-------------------- | :------------------------------------------------------------ |
| `npm install`         | Install dependencies                                          |
| `npm run dev`         | Start local dev server at `localhost:4321`                    |
| `npm run build`       | Type-check + build production site to `./dist/`               |
| `npm run prod_build`  | Build without type-checking (used by Netlify)                 |
| `npm run preview`     | Preview production build locally                              |
| `npm run check`       | Run Astro type checking only                                  |
| `npm run format`      | Format all files with Prettier                                |

Search (`pagefind --site dist`) runs automatically after `npm run build` via the `postbuild` npm hook.

## Configure

Edit `src/site.config.ts` to change the site title, author, description, date locale, nav links, and Expressive Code theme.

## Adding Posts

Posts use [Content Collections](https://docs.astro.build/en/guides/content-collections/) — add `.md` or `.mdx` files to `src/content/post/`. The filename becomes the URL slug.

### Frontmatter

| Property (* required) | Description |
| --------------------- | ----------- |
| `title` *             | Page `<h1>` and `<title>`. Max 60 chars. |
| `description` *       | SEO meta description. 50–160 chars. |
| `publishDate` *       | Publication date. Format: `YYYY-MM-DD`. Locale set in `src/site.config.ts` (currently **en-US**). |
| `updatedDate`         | Optional. When provided, `sortMDByDate()` sorts by this field instead of `publishDate`. |
| `tags`                | Optional array. Tags are auto-lowercased and deduplicated. Generates `/tags/[tag]` pages. |
| `coverImage`          | Optional `{ src, alt }` object. Adds a cover image above the post. |
| `ogImage`             | Optional. If omitted, an OG image is auto-generated via Satori at `/og-image/[slug].png`. |
| `draft`               | Optional, defaults to `false`. Draft posts are visible in dev but excluded from production builds. |

### Frontmatter Example

```yaml
---
title: "My Post Title"
description: "A short description between 50 and 160 characters for SEO."
publishDate: "2026-01-15"
updatedDate: "2026-02-01"
tags: ["astro", "javascript"]
coverImage:
  src: "./cover.png"
  alt: "Cover image description"
draft: false
---
```

## Deploy

### Netlify

The site deploys automatically via Netlify. The build command in `netlify.toml` is:

```
npm run prod_build && pagefind --site dist
```

### Docker

A `Dockerfile` and `docker-compose.yaml` are included for local containerised builds:

```bash
docker compose up
```

Runs on port 3000.

## Acknowledgment

Based on the [astro-cactus](https://astro-cactus.chriswilliams.dev/) theme by Chris Williams, which was inspired by [Hexo Theme Cactus](https://github.com/probberechts/hexo-theme-cactus).

## License

MIT
