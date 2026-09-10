/**
 * LINK HELPER
 * ===========
 * Our site does not live at the root of a web address. It lives inside a
 * folder: https://novato-high-school.github.io/Dev-Club/
 *
 * That means a plain link like <a href="/build"> is BROKEN, because it points
 * at .../build instead of .../Dev-Club/build.
 *
 * So: every internal link and every image path on this site goes through the
 * href() function below. If you remember one rule from this file, remember
 * that one. It is the single most common way to break this website.
 *
 *   Right:  <a href={href('/build')}>Build</a>
 *   Wrong:  <a href="/build">Build</a>
 *
 * Links to OTHER websites (anything starting with http) do not use href().
 */

import { BASE } from '../config/site';

/**
 * Turns a site path into a full, working link.
 *
 *   href('/build')  ->  '/Dev-Club/build'
 *   href('build')   ->  '/Dev-Club/build'   (leading slash is optional)
 *   href('/')       ->  '/Dev-Club/'
 */
export function href(path = '/'): string {
  // Leave links to other websites and mail links completely alone.
  if (/^([a-z]+:)?\/\//i.test(path) || path.startsWith('mailto:')) {
    return path;
  }

  // Glue the base and the path together, then clean up any doubled slashes
  // that appear when both pieces have one (for example '/Dev-Club' + '/build').
  const joined = `${BASE}/${path}`.replace(/\/{2,}/g, '/');

  // The home page should keep its trailing slash; other pages should not have
  // one, so that '/Dev-Club/build/' and '/Dev-Club/build' do not look like two
  // different pages to search engines.
  if (joined === BASE || joined === `${BASE}/`) return `${BASE}/`;
  return joined.replace(/\/$/, '');
}
