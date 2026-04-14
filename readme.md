# Shapehaven Innovations · Public Website

<https://shapehaveninnovations.com>  
<https://shapehaveninnovations.github.io>

Welcome to the **Shapehaven Innovations** website repository. We craft next-generation iOS apps, SDKs, and developer tools focused on sleek UI, high performance, and enterprise-grade security—all showcased here on our public, **static** site hosted with GitHub Pages.

> **Heads-up 🔒**  
> This README purposefully stays high-level. No production credentials, build pipelines, or sensitive directory paths are exposed in the repo.

---

## ✨ What you’ll find

| Section            | Purpose                                                                          |
| ------------------ | -------------------------------------------------------------------------------- |
| `index.html`       | Landing page highlighting our flagship SDKs and components.                      |
| `images/`          | Optimised PNG/SVG assets used by the site.                                       |
| `CNAME`            | Binds the custom domain **shapehaveninnovations.com** to this GitHub Pages site. |
| `docs/` (optional) | Long-form documentation & release notes (added as needed).                       |

Everything is plain **HTML + CSS** (no server-side code), so you can clone and view locally without additional tooling.

---

## 🛠️ Local preview

```bash
git clone https://github.com/shapehaveninnovations/shapehaveninnovations.github.io.git
cd shapehaveninnovations.github.io
# Option A: open index.html directly in your browser
# Option B (recommended): use any “Live Server” extension or Python http.server
python -m http.server 8000
```

Then navigate to <http://localhost:8000>.

## 🚀 Deployment flow

1. **Push** to the **`main`** branch.
2. GitHub Pages automatically rebuilds and publishes to **shapehaveninnovations.github.io**.
3. DNS for **shapehaveninnovations.com** points at GitHub’s Pages IPs, so the latest commit is live within minutes.

> _No CI/CD secrets are stored in this repository; all sensitive operations happen elsewhere._

---

## 🤝 Contributing

We welcome issues and pull requests that:

- Fix typos or broken links
- Improve accessibility or performance (e.g., image compression, semantic HTML)
- Add new static content approved by the Shapehaven team

To keep the surface area secure, **please avoid**:

- Adding third-party scripts or external CDNs without discussion
- Committing build artifacts or credentials

---

## 📄 License

Site content is released under the **MIT License** unless noted otherwise.
Third-party icons and fonts retain their respective licenses.

---

## Connect

For questions about our SDKs or partnership opportunities:

- **Email:** [info@shapehaveninnovations.com](mailto:info@shapehaveninnovations.com)

Thanks for stopping by — and happy shipping!
