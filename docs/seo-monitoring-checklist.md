# SEO Monitoring Checklist

Use this checklist after each production deployment to keep search visibility and social previews healthy.

## 1) Validate metadata and sharing

- Inspect page source for `/`, `/about`, `/feedback`, and `/donate`:
  - canonical URL present
  - Open Graph tags present
  - Twitter card tags present
- Validate preview cards:
  - [X Card Validator](https://cards-dev.twitter.com/validator)
  - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
  - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

## 2) Validate structured data

- Run homepage URL in [Google Rich Results Test](https://search.google.com/test/rich-results).
- Confirm no errors for:
  - `Organization`
  - `WebSite`
  - `SoftwareApplication`

## 3) Search console routine (weekly)

- Open Google Search Console for `https://smartstudyplatform.vercel.app`.
- Submit or refresh `https://smartstudyplatform.vercel.app/sitemap.xml`.
- Check:
  - indexing coverage
  - top queries and CTR for homepage and `/about`
  - crawl anomalies

## 4) Content optimization loop (monthly)

- Review Nigeria-focused query terms that gain impressions.
- Update title/description copy for weak CTR pages.
- Improve internal links from homepage to high-value pages.
- Add one new public, indexable page only when it serves a clear user intent.
