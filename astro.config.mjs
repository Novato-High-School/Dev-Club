// @ts-check
/**
 * ASTRO CONFIGURATION
 * ===================
 * Astro is the framework that turns the files in src/ into a plain HTML
 * website. This file tells it three things: where the site lives, which
 * add-ons to load, and how to handle CSS.
 *
 * You will rarely need to edit this. Site settings live in src/config/site.ts.
 */

import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

import { satteri } from '@astrojs/markdown-satteri';

import { SITE_URL, BASE } from './src/config/site.ts';
import { satteriBaseLinks } from './src/lib/satteri-base-links.mjs';

export default defineConfig({
  // The public address and folder of the site. Read the comments in
  // src/config/site.ts before changing either of these.
  site: SITE_URL,
  base: BASE,

  integrations: [
    // Lets us write pages in Markdown with components mixed in (.mdx files).
    mdx(),
    // Gives us the Lucide icon set as <Icon name="lucide:github" /> components.
    icon(),
  ],

  // Syntax highlighting for code blocks, powered by Shiki (built into Astro).
  // "github-dark" matches our near-black colour scheme out of the box.
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
    // Sätteri is Astro's built-in Markdown engine. We only configure one thing:
    // a plugin that lets club members write plain links like [Build](/build)
    // and have them come out pointing at the right place. See the plugin file
    // for the full explanation.
    processor: satteri({
      hastPlugins: [satteriBaseLinks],
    }),
  },

  vite: {
    // Tailwind 4 plugs into Vite directly. The old @astrojs/tailwind
    // integration is for Tailwind 3 and should not be added back.
    plugins: [tailwindcss()],
  },
});
