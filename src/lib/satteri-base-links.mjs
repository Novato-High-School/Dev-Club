/**
 * BASE-AWARE LINKS INSIDE MARKDOWN
 * ================================
 * In .astro files we fix up internal links by calling href(). But inside a
 * Markdown file you just write a normal link:
 *
 *     See the [Build](/build) page.
 *
 * On its own that link would break, because our site lives in a folder
 * (/Dev-Club/). Asking every club member to remember to type "/Dev-Club/build"
 * would be annoying, easy to forget, and it would all have to be rewritten if
 * we ever moved to a real domain name.
 *
 * So this small plugin runs while Markdown is being turned into HTML and adds
 * the base path to any link or image starting with a single "/". Members write
 * the simple version; the plugin makes it correct.
 *
 * Links to other websites (https://...), page anchors (#section), and email
 * links are left exactly as they are.
 *
 * Technical note: Astro 7 processes Markdown with Sätteri, which has its own
 * plugin system rather than the older remark/rehype one. `defineHastPlugin`
 * below is Sätteri's way of saying "look at the finished HTML and change
 * these tags".
 */

import { defineHastPlugin } from 'satteri';

import { BASE } from '../config/site.ts';

/** Which attribute holds a path, for each tag we care about. */
const PATH_ATTRIBUTES = { a: 'href', img: 'src' };

export const satteriBaseLinks = defineHastPlugin({
  name: 'dev-club-base-links',

  element: {
    // Sätteri only hands us the tags we ask for, which keeps this fast.
    filter: ['a', 'img'],

    visit(node, ctx) {
      const attribute = PATH_ATTRIBUTES[node.tagName];
      const value = node.properties?.[attribute];
      if (typeof value !== 'string') return;

      // Only rewrite paths starting with exactly one slash. That leaves out
      // full URLs, protocol-relative "//example.com", "#anchors" and "mailto:".
      if (!value.startsWith('/') || value.startsWith('//')) return;

      // Do not add the base twice if somebody already typed it out.
      if (value === BASE || value.startsWith(`${BASE}/`)) return;

      ctx.setProperty(node, attribute, `${BASE}${value}`.replace(/\/{2,}/g, '/'));
    },
  },
});
