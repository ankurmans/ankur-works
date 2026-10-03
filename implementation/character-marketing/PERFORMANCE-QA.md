# Performance QA

Local checks on 2026-10-03:

- Offer route build: 23.34 KB HTML (6.43 KB gzip); CSS 103.75 KB (21.77 KB gzip); page-specific JavaScript 1.37 KB (0.66 KB gzip), plus shared inquiry/intent bundles.
- The full-body Pepys SVG is 21.8 KB, Quincy is 2.3 KB, and the Pepys badge is 3.5 KB. Pepys proof WebPs total 35.7 KB. The 1.00 MB, 25-second H.264/AAC film has `preload="none"`, a 305 KB poster and no autoplay. The social image is metadata-only.
- Hero image elements declare dimensions and the remaining proof images lazy load. Image and video containers reserve visual space. The short walk-bys use one IntersectionObserver and play once. Reduced-motion visitors see static characters.
- Browser viewport measurements for 320, 390, 768 and 1440 CSS pixels showed `scrollWidth === innerWidth` on the offer page. No horizontal overflow at these sizes. The 390-pixel homepage also had no overflow.
- Existing build warning: a shared 628 KB minified JavaScript chunk (165 KB gzip) exceeds Vite's 500 KB advisory. This chunk predates the new service route and was not altered here.

No production Lighthouse/Core Web Vitals measurement was performed. Recheck field data after deployment. The sitewide floating AI Twin overlaps part of the bottom of the first mobile viewport; this is an existing shared widget behavior, not caused by the new page.
