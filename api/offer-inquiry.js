import { createHash } from 'node:crypto';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const offers = {
  product_development: 'Product Development Sprint',
  seo_ai_search: 'Search-led GTM',
  exploring: 'Project inquiry',
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const submissions = new Map();
const attempts = new Map();

function reply(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(status).json(body);
}

function sameSiteOrigin(req) {
  try {
    const origin = new URL(req.headers.origin);
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
    return (origin.protocol === 'https:' && ['ankur.works', 'www.ankur.works'].includes(origin.hostname))
      || (origin.protocol === 'https:' && origin.host === host && host.endsWith('.vercel.app'))
      || (origin.protocol === 'http:' && origin.host === host && ['localhost', '127.0.0.1'].includes(origin.hostname));
  } catch { return false; }
}

function clean(value, max) {
  return typeof value === 'string' ? value.trim().replace(/\r/g, '').slice(0, max + 1) : '';
}

export function validateInquiry(body) {
  const source = clean(body?.source, 20) || 'offer_form';
  const offer = clean(body?.offer, 32);
  const name = clean(body?.name, 80);
  const email = clean(body?.email, 254).toLowerCase();
  const website = clean(body?.website, 300);
  const brief = clean(body?.brief, 1800);
  const submissionId = clean(body?.submissionId, 64);
  const honeypot = clean(body?.companyFax, 200);
  const conversationId = clean(body?.conversationId, 64);
  const page = clean(body?.page, 100);
  const context = Array.isArray(body?.context) ? body.context.slice(-8).map((item) => ({
    role: item?.role, content: clean(item?.content, 600),
  })) : [];
  const attribution = Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign']
    .map((key) => [key, clean(body?.[key], 80).replace(/[^a-z0-9 _./-]/gi, '')]));
  if (honeypot) return { honeypot: true };
  if (!['offer_form', 'chat'].includes(source) || !offers[offer] || source !== 'chat' && offer === 'exploring'
    || source === 'chat' && (!UUID.test(conversationId) || !/^\/[a-z0-9/-]{0,100}$/.test(page))
    || context.some((item) => !['user', 'assistant'].includes(item.role) || !item.content || item.content.length > 600)
    || name.length < 2 || name.length > 80 || /[\n\x00-\x1f]/.test(name)
    || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || brief.length < 12 || brief.length > 1800 || !UUID.test(submissionId)) return null;
  if (website) {
    try {
      const url = new URL(website);
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.') || website.length > 300) return null;
    } catch { return null; }
  }
  return { source, offer, name, email, website, brief, submissionId, attribution,
    conversationId: source === 'chat' ? conversationId : null, page: source === 'chat' ? page : null,
    context: source === 'chat' ? context : [] };
}

function rateLimited(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const key = createHash('sha256').update(ip).digest('hex');
  const now = Date.now();
  const prior = (attempts.get(key) || []).filter((time) => now - time < 60 * 60 * 1000);
  if (prior.length >= 4) return true;
  attempts.set(key, [...prior, now]);
  return false;
}

function notification(inquiry, from, to) {
  const { offer, name, email, website, brief, attribution, source, context, conversationId, page } = inquiry;
  const subject = offer === 'exploring' ? 'Project note' : `${offers[offer]} inquiry`;
  const text = [
    `New ${subject} from ankur.works`, '',
    `Name: ${name}`, `Email: ${email}`, `Website: ${website || 'Not provided'}`, '',
    'Project scope shared by visitor:', brief, '',
    ...(source === 'chat' ? [
      `Chat ID: ${conversationId}`, `Page: ${page}`,
      ...(context.length ? ['', 'Chat context (visitor chose to include it):', ...context.map((turn) => `${turn.role === 'user' ? 'Visitor' : 'AI Twin'}: ${turn.content}`)] : []), '',
    ] : []),
    `Offer: ${offer}`, `Source: ${source}`, `UTM source: ${attribution.utm_source || 'none'}`,
    `UTM medium: ${attribution.utm_medium || 'none'}`, `UTM campaign: ${attribution.utm_campaign || 'none'}`,
  ].join('\n');
  return { Source: from, Destination: { ToAddresses: [to] }, ReplyToAddresses: [email],
    Message: { Subject: { Charset: 'UTF-8', Data: `${subject} | ankur.works` }, Body: { Text: { Charset: 'UTF-8', Data: text } } } };
}

function acknowledgement(inquiry, from) {
  const text = `Hi ${inquiry.name},\n\nI got your note about your project and will read it personally. If talking it through is easier, you can choose a time at https://cal.com/ankur-kmf/30min.\n\nAnkur`;
  return { Source: from, Destination: { ToAddresses: [inquiry.email] },
    Message: { Subject: { Charset: 'UTF-8', Data: 'I got your note | Ankur' }, Body: { Text: { Charset: 'UTF-8', Data: text } } } };
}

async function sesSend(command) {
  const client = new SESClient({ region: process.env.SES_REGION || process.env.AWS_REGION || 'us-east-1' });
  return client.send(new SendEmailCommand(command));
}

export function createInquiryHandler(send = sesSend) {
  return async function handler(req, res) {
    if (req.method !== 'POST') return reply(res, 405, { error: 'Use POST.' });
    if (!sameSiteOrigin(req)) return reply(res, 403, { error: 'This form cannot accept that request.' });
    if (!String(req.headers['content-type'] || '').includes('application/json')) return reply(res, 415, { error: 'Send JSON.' });
    if (Number(req.headers['content-length'] || 0) > 11000) return reply(res, 413, { error: 'That note is too long.' });
    let body;
    try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
    catch { return reply(res, 400, { error: 'Please check the form and try again.' }); }
    const inquiry = validateInquiry(body);
    if (!inquiry) return reply(res, 400, { error: 'Please add your name, a valid email, and a short note.' });
    if (inquiry.honeypot) return reply(res, 200, { ok: true });
    const from = process.env.SES_FROM_EMAIL;
    const to = process.env.LEAD_NOTIFICATION_EMAIL;
    if (!from || !to || !process.env.SES_REGION && !process.env.AWS_REGION)
      return reply(res, 503, { error: 'The form is temporarily unavailable. Please email me using the link below.' });
    if (submissions.has(inquiry.submissionId)) return reply(res, 200, { ok: true, confirmationSent: submissions.get(inquiry.submissionId) });
    if (rateLimited(req)) return reply(res, 429, { error: 'Please wait before sending another note.' });
    try {
      await send(notification(inquiry, from, to));
      let confirmationSent = false;
      if (process.env.LEAD_AUTO_REPLY_ENABLED === '1') {
        try { await send(acknowledgement(inquiry, from)); confirmationSent = true; }
        catch (error) { console.warn('lead_acknowledgement_failed', error instanceof Error ? error.name : 'unknown'); }
      }
      submissions.set(inquiry.submissionId, confirmationSent);
      console.info('offer_inquiry_accepted', JSON.stringify({ offer: inquiry.offer, ...inquiry.attribution }));
      return reply(res, 200, { ok: true, confirmationSent });
    } catch (error) {
      console.warn('offer_inquiry_delivery_failed', error instanceof Error ? error.name : 'unknown');
      return reply(res, 503, { error: 'I could not receive that note just now. Please email me using the link below.' });
    }
  };
}

export default createInquiryHandler();
