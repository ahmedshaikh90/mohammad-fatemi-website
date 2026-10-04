# Deploy mohfatemi.com to SiteGround

This project is configured for the production URL **https://mohfatemi.com**.

## Architecture

- Domain: `mohfatemi.com`
- Hosting: SiteGround
- Source control: GitHub (private repository recommended)
- Blog editor: Pages CMS
- Production build: Astro static build
- Automatic publishing: GitHub Actions -> SiteGround over SSH
- SSL: SiteGround Let's Encrypt / Let's Encrypt Wildcard

## 1. Prepare SiteGround

In SiteGround Client Area open **Websites -> Site Tools** for `mohfatemi.com`.

1. **Security -> SSL Manager**: make sure a Let's Encrypt certificate is Active. A wildcard certificate is convenient if you also use subdomains.
2. **Security -> HTTPS Enforce**: turn HTTPS Enforce ON.
3. **Devs -> SSH Keys Manager**: create/import a deployment SSH key and authorize it for the site.
4. Note the SSH host, SSH username, SSH port, and the website document-root path shown by SiteGround.

Do not place an SSL private key or a SiteGround password in this repository.

## 2. Create GitHub repository

Create a new **Private** repository, for example `mohammad-fatemi-website`, and upload this project's contents to the repository root.

The repository root must contain `package.json`, `astro.config.mjs`, `.pages.yml`, `src/`, `public/`, `scripts/`, and `.github/`.

## 3. Add GitHub deployment secrets

Repository -> **Settings -> Secrets and variables -> Actions -> New repository secret**.

Create:

- `SITEGROUND_SSH_HOST`
- `SITEGROUND_SSH_PORT`
- `SITEGROUND_SSH_USER`
- `SITEGROUND_SSH_PRIVATE_KEY`
- `SITEGROUND_DEPLOY_PATH`

`SITEGROUND_DEPLOY_PATH` is the server folder that serves `mohfatemi.com`, normally the site's `public_html` directory. Copy the exact path shown in SiteGround instead of guessing it.

The private-key secret must contain the complete private key including its BEGIN/END lines. Never paste the private key into a normal repository file.

## 4. Publish

Every push to the `main` branch triggers `.github/workflows/deploy-siteground.yml`.

The workflow:

1. installs dependencies;
2. runs the SEO checker;
3. builds the Astro/static site into `dist/`;
4. securely synchronizes `dist/` to SiteGround using SSH/rsync.

Pages CMS saves blog edits into GitHub, so a saved article automatically triggers the same deployment.

## 5. Pages CMS

Connect the GitHub repository to Pages CMS. The included `.pages.yml` exposes:

- Blog Posts
- Featured Image
- Featured Image Alt Text
- SEO title
- Meta description
- Canonical URL
- Social title
- Social description
- Social Share Image
- Draft/noindex controls
- Site & SEO Settings
- Google Tag Manager / GA4 / Google Ads
- Meta Pixel and Facebook verification
- LinkedIn Insight Tag
- YouTube / Google Maps embed settings
- reCAPTCHA v3 Site Key

For posts, the social image priority is:

1. Social Share Image, when supplied;
2. otherwise Featured Image;
3. otherwise the default website social image.

## 6. Canonical hostname

The package uses `https://mohfatemi.com` as the canonical URL. The included `.htaccess` redirects `www.mohfatemi.com` to the non-www version and applies security headers.

## 7. Google Tag Manager and sitemap

The project is preconfigured with GTM container `GTM-K33TZDCG`. After the first production deployment, use Google Tag Manager Preview / Tag Assistant against `https://mohfatemi.com` to confirm the container is detected.

The deployment build automatically regenerates `https://mohfatemi.com/sitemap.xml` and `https://mohfatemi.com/robots.txt`; no manual sitemap upload is required for new blog posts.
