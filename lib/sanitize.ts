import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * TipTap'ten gelen HTML kullanıcı tarafından üretildiği ve herkese
 * gösterildiği için XSS'e karşı temizlenir. Yalnızca editörün ürettiği
 * etiketlere izin verilir.
 */
export function sanitizeArticleHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "strike",
      "h2", "h3", "ul", "ol", "li", "blockquote", "a", "img",
      "code", "pre", "hr",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      // Tüm bağlantılar güvenli şekilde yeni sekmede açılsın.
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      }),
    },
  });
}

/** HTML'den düz metin çıkarır (okuma süresi, meta açıklaması vb. için). */
export function htmlToText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}
