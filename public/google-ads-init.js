(() => {
  const node = document.currentScript;
  const adsId = node?.dataset?.googleAdsId?.trim();
  const whatsappLabel = node?.dataset?.whatsappLabel?.trim();
  if (!adsId || !/^AW-[0-9]+$/i.test(adsId)) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', adsId);

  window.mfTrackGoogleAdsConversion = (label = whatsappLabel) => {
    if (!label) return;
    window.gtag('event', 'conversion', { send_to: `${adsId}/${label}` });
  };

  if (whatsappLabel) {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
      if (!link) return;
      window.mfTrackGoogleAdsConversion(whatsappLabel);
    }, { passive: true });
  }
})();
