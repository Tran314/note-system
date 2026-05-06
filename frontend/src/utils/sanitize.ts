const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote',
  'a',
  'img',
  'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span',
]);

const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'title', 'width', 'height']),
  '*': new Set(['class', 'style']),
};

const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:'];

function isSafeUrl(url: string): boolean {
  if (!url) return true;
  const lowerUrl = url.toLowerCase().trim();
  return !DANGEROUS_PROTOCOLS.some((protocol) => lowerUrl.startsWith(protocol));
}

function sanitizeHtml(html: string): string {
  if (typeof DOMParser === 'undefined') {
    return html;
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const sanitizeNode = (node: Node) => {
    if (node.nodeType === Node.COMMENT_NODE) {
      node.parentNode?.removeChild(node);
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.parentNode?.removeChild(node);
      return;
    }

    const element = node as Element;
    const tagName = element.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tagName)) {
      const fragment = document.createDocumentFragment();
      while (element.firstChild) {
        fragment.appendChild(element.firstChild);
        sanitizeNode(fragment.lastChild!);
      }
      element.parentNode?.replaceChild(fragment, element);
      return;
    }

    const attrs = element.attributes;
    for (let i = attrs.length - 1; i >= 0; i--) {
      const attr = attrs[i];
      const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || ALLOWED_ATTRIBUTES['*'];
      if (!allowedAttrs?.has(attr.name.toLowerCase())) {
        element.removeAttribute(attr.name);
        continue;
      }

      if (attr.name.toLowerCase() === 'href' || attr.name.toLowerCase() === 'src') {
        if (!isSafeUrl(attr.value)) {
          element.removeAttribute(attr.name);
        }
      }
    }

    if (tagName === 'a') {
      element.setAttribute('rel', 'noopener noreferrer');
      element.setAttribute('target', '_blank');
    }

    Array.from(element.childNodes).forEach(sanitizeNode);
  };

  Array.from(doc.body.childNodes).forEach(sanitizeNode);
  return doc.body.innerHTML;
}

export { sanitizeHtml, isSafeUrl };
