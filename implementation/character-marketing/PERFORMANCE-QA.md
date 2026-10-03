# Performance QA

Local checks on 2026-10-03:

- Offer route build: 22.40 KB HTML (6.38 KB gzip); CSS 98.37 KB (20.66 KB gzip); page-specific JavaScript 1.01 KB (0.50 KB gzip), plus shared inquiry/intent bundles.
- WebP proof assets total 278.3 KB loaded as used; the 1.75 MB, 32.17-second H.264/AAC film has `preload="none"`, a 29.4 KB poster and no autoplay. The social image is metadata-only.
- Hero image elements declare dimensions and the remaining proof images lazy load. Image and video containers reserve visual space. Reduced-motion CSS removes hero tilts/transitions where requested.
- Browser viewport measurements for 320, 390, 768 and 1440 CSS pixels showed `scrollWidth === innerWidth` on the offer page. No horizontal overflow at these sizes. The 390-pixel homepage also had no overflow.
- Existing build warning: a shared 628 KB minified JavaScript chunk (165 KB gzip) exceeds Vite's 500 KB advisory. This chunk predates the new service route and was not altered here.

No production Lighthouse/Core Web Vitals measurement was performed. Recheck field data after deployment. The sitewide floating AI Twin overlaps part of the bottom of the first mobile viewport; this is an existing shared widget behavior, not caused by the new page.
