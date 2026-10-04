# Analytics, social and Google integrations

All IDs are edited in **Pages CMS -> Site & SEO Settings -> Analytics, Ads & Embeds**. Saving the settings commits the change to GitHub and triggers the normal SiteGround deployment workflow.

## Google Tag Manager

Current container: **GTM-K33TZDCG**.

The project intentionally uses a small locally hosted loader (`/gtm-init.js`) instead of an inline JavaScript block. This preserves a stricter Content Security Policy while performing the same GTM container load. A standard GTM noscript iframe is still rendered immediately after the opening `<body>` tag.

## Google Analytics 4

Enter a Measurement ID such as `G-XXXXXXXXXX`. Leave it empty when GA4 is configured in GTM.

## Google Ads conversions

Enter the Google Ads ID such as `AW-123456789` and, optionally, the WhatsApp conversion label. When both are entered, clicks to WhatsApp links fire the configured conversion event. Leave these fields empty when conversions are managed in GTM.

## Meta / Facebook

You can enter Facebook domain verification and a Meta Pixel ID. The pixel is loaded only when an ID is configured. Leave the Pixel field blank when it is managed through GTM.

## LinkedIn Insight Tag

Enter the numeric LinkedIn Partner ID. The Insight Tag is loaded globally and includes the standard noscript tracking pixel.

## Google reCAPTCHA v3

Enter the public Site Key to load reCAPTCHA v3 and expose `window.mfRecaptchaToken(action)`. A client-side token alone is not full form protection: any real form endpoint must also verify the token server-side with Google's secret key. The current WhatsApp handoff form does not need a server-side form endpoint.

## YouTube

Enter a YouTube video ID to automatically add a responsive privacy-enhanced (`youtube-nocookie.com`) Featured Video section to the homepage.

## Google Maps

Paste the iframe `src` URL from Google Maps' **Share -> Embed a map** option. A responsive map card is added next to the YouTube card when configured.

## Social icons

Brand SVGs are locally hosted in `public/assets/icons/` and rendered using CSS masks so they automatically use the site's silver/gold theme. No social-icon CDN or external icon library is required at runtime.
