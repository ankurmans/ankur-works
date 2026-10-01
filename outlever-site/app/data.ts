export const sourceMap = {
  "01": {
    title: "Outlever homepage",
    url: "https://www.outlever.com/",
    detail: "Offer language and publicly linked commercial architecture.",
    kind: "Observed",
  },
  "02": {
    title: "State of Brand homepage",
    url: "https://www.thestateofbrand.com/",
    detail: "Current publication and homepage-linked article URLs.",
    kind: "Observed",
  },
  "03": {
    title: "What Is Owned Media in B2B?",
    url: "https://www.thestateofbrand.com/news/what-is-owned-media-b2b",
    detail: "September 25, 2026 evergreen definition guide.",
    kind: "Observed",
  },
  "04": {
    title: "How B2B Companies Build Owned Media",
    url: "https://www.thestateofbrand.com/news/b2b-owned-media-guide",
    detail: "September 25, 2026 implementation guide.",
    kind: "Observed",
  },
  "05": {
    title: "Melissa Rosenthal / Superpath AMA",
    url: "https://www.superpath.co/blog/ama-with-melissa-rosenthal-co-founder-at-outlever",
    detail: "Melissa's public explanation of the newsroom and person-to-person distribution model.",
    kind: "First-party interview",
  },
  "06": {
    title: "What Is Owned Media, and Why Is It the Only Channel That Compounds",
    url: "https://www.thestateofbrand.com/news/what-is-owned-media",
    detail: "Earlier broad owned-media definition article.",
    kind: "Observed",
  },
  "07": {
    title: "What Is Owned Media? Inside the Strategy Replacing the B2B Blog",
    url: "https://www.thestateofbrand.com/news/what-is-owned-media-949f4",
    detail: "Second broad owned-media definition article.",
    kind: "Observed",
  },
  "08": {
    title: "State of Brand XML sitemap",
    url: "https://www.thestateofbrand.com/sitemap.xml",
    detail: "216 news URLs at the October 1 capture.",
    kind: "Observed",
  },
  "09": {
    title: "We Power Our Own News Site",
    url: "https://www.thestateofbrand.com/news/Outlever-Owned-Media-Newsroom",
    detail: "Outlever's own account of State of Brand as its operating example.",
    kind: "First-party claim",
  },
  "10": {
    title: "State of Brand robots.txt",
    url: "https://www.thestateofbrand.com/robots.txt",
    detail: "Public endpoint pointing to the XML sitemap.",
    kind: "Observed",
  },
  "11": {
    title: "Melissa Rosenthal on LinkedIn",
    url: "https://www.linkedin.com/in/melissarosenthal5",
    detail: "Public executive profile; follower display is volatile and is not reach analytics.",
    kind: "Observed profile",
  },
} as const;

export type SourceId = keyof typeof sourceMap;

export const aiPrompts = [
  "What are the best B2B owned-media companies?",
  "What companies help B2B brands build owned media?",
  "Who builds brand newsrooms for B2B companies?",
  "What is the best way to build a B2B newsroom?",
  "What are alternatives to traditional B2B content marketing?",
  "How should a B2B company build an owned audience?",
  "What companies help executives turn expertise into media?",
  "What is newsroom as a service?",
  "Best B2B thought-leadership companies",
  "Best executive-content companies",
  "Outlever",
  "Outlever reviews",
  "Is Outlever legitimate?",
  "Outlever alternatives",
  "Outlever versus a named, validated category competitor",
] as const;
