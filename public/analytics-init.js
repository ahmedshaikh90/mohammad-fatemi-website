(() => {
  const s = document.currentScript;
  const id = s && s.dataset ? s.dataset.gaId : '';
  if (!id) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', id, { anonymize_ip: true });
})();
