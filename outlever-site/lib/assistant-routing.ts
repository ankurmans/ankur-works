// Prospect research stays on its evidence route. General Ankur and service-fit
// questions use the standalone AI Twin, with no Outlever claims added to its corpus.
export function isGeneralAnkurQuestion(question: string, continuingTwin = false): boolean {
  const q = question.trim();
  if (/\b(?:outlever|state of brand|melissa|sitemap|owned.media|audit|pilot|buyer page|capture layer|cannibali[sz]|gsc|ga4)\b/i.test(q)) return false;
  if (continuingTwin && q.split(/\s+/).length <= 12) return true;
  return /\b(?:who are you|who is ankur|about ankur|your background|what have you built|what has ankur built|your projects|your products|your services|your offers|which service|what do you do|can you help|could you help|can you build|could you build|what (?:kind of )?(?:products?|apps?|websites?) can you build|help (?:me|us)|work with you|hire you|book a call|schedule a call|build (?:my|our|for me|for us)|product development|full.stack|improve (?:my|our) (?:seo|search)|need (?:an? )?(?:app|product|website|seo))\b/i.test(q)
    || /\b(?:pepys|whooshly|quotesweep|twinsona|linnet|tough trucks|amped rides)\b/i.test(q);
}
