// safely ignore recoil warning messages in dev (triggered by HMR)

module.exports = {
  reactStrictMode: true,
  i18n: {
    locales: ["en-US", "fr", "nl-NL"],
    defaultLocale: "en-US",
  },
  images: {
    domains: [
      "tailwindui.com",
      "www.tenforums.com",
      "images.unsplash.com",
      "www.gravatar.com",
    ],
  },
};
