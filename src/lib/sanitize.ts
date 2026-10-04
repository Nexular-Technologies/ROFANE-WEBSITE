import sanitizeHtml from "sanitize-html";

/**
 * Blog posts are written as HTML in the Tiptap editor and injected into the
 * page with innerHTML, so the stored HTML is sanitised on the way in. The
 * allow-list covers what the editor can produce (formatting, lists, links,
 * images, code blocks and text alignment) and drops everything else —
 * scripts, event handlers, iframes, javascript: URLs and style injection.
 */
export function sanitizeBlogHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "hr", "span", "div",
      "strong", "b", "em", "i", "u", "s", "mark", "sub", "sup",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "blockquote", "code", "pre",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      "*": ["style"],
    },
    // Only text alignment is kept; no colours, positioning or url() values.
    allowedStyles: {
      "*": { "text-align": [/^(left|right|center|justify)$/] },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    allowProtocolRelative: false,
    // Outbound links can't reach back into the opener window.
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
    },
  });
}
