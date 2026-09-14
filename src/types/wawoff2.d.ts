/**
 * Type declarations for wawoff2.
 *
 * The package has no types of its own. We only use one function: it takes a
 * compressed .woff2 font and returns plain TrueType bytes, which is the only
 * format the PNG renderer can read.
 */
declare module 'wawoff2' {
  export function decompress(input: Uint8Array): Promise<Uint8Array>;
  export function compress(input: Uint8Array): Promise<Uint8Array>;
}
