export function mountAssistantOnOfferPage(html, portfolioHtml) {
  if (!/<body\b[^>]*class="[^"]*\boffer-page\b/i.test(html) || html.includes('id="ask-ankur"')) return html;
  const widget = portfolioHtml.match(/<div class="ask-ankur" id="ask-ankur">[\s\S]*?<\/dialog>/)?.[0];
  if (!widget) throw new Error('AI Twin widget markup was not found in the portfolio page');
  if (!html.includes('</head>') || !html.includes('</body>')) throw new Error('Offer page is missing a document closing tag');
  const script = /<script\b[^>]*src="[^"]*assistant-widget[^"]*"/i.test(html)
    ? '' : '\n<script type="module" src="/scripts/assistant-widget.js"></script>';
  return html.replace('</body>', `${widget}${script}\n</body>`);
}
