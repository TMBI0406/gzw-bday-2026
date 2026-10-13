/// <reference types="vite/client" />

/** "/photos/x.jpg" → relativ zur Seite, damit es auch unter einem Unterordner (GitHub Pages) klappt */
export function asset(src: string) {
  return src.startsWith("/") && !src.startsWith("//") ? import.meta.env.BASE_URL + src.slice(1) : src;
}
