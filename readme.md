# Shapehaven Innovations

Source for [shapehaveninnovations.com](https://shapehaveninnovations.com), the site of a small software studio building iOS apps, SaaS products, and developer tools.

Static site: plain HTML, CSS, and vanilla JS. No build step. Hosted on GitHub Pages.

## Run locally

```bash
git clone https://github.com/shapehaveninnovations/shapehaveninnovations.github.io.git
cd shapehaveninnovations.github.io
python3 -m http.server 8000
```

Open <http://localhost:8000>.

## Layout

- `index.html`, `support.html`, `privacy.html`, `returniq-*.html`: pages
- `blog/`: posts and index
- `style.css`, `script.js`, `transitions.js`, `*-hero.js`: styling and behavior
- `config.js`: site domain and contact email
- `feed.xml`, `sitemap.xml`, `llms.txt`, `llms-full.txt`: feeds and crawler metadata
- `images/`: assets

## Keeping content in sync

Some content is duplicated across files and must be updated together:

- **Blog post:** link it from `blog/index.html`, add it to `feed.xml` and `sitemap.xml`, and mention it in `llms.txt` / `llms-full.txt`.
- **Product or service change:** update `index.html`, `llms.txt`, and `llms-full.txt`.
- **Domain or email:** change `config.js`, then check `CNAME`, `sitemap.xml`, `robots.txt`, `feed.xml`, and `llms*.txt` for hardcoded copies.
- **Page added or removed:** update `sitemap.xml` and the nav and footer links on every page.

## License

MIT, unless noted. Third-party icons and fonts keep their own licenses.
