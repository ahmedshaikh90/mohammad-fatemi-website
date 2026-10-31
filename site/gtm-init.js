(() => {
  const node = document.currentScript;
  const id = node?.dataset?.gtmId?.trim();
  if (!id || !/^GTM-[A-Z0-9]+$/i.test(id)) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const first = document.getElementsByTagName('script')[0];
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  first.parentNode.insertBefore(script, first);
})();
