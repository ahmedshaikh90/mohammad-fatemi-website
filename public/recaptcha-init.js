(() => {
  const node = document.currentScript;
  const siteKey = node?.dataset?.siteKey?.trim();
  if (!siteKey) return;
  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
  document.head.appendChild(script);
  window.mfRecaptchaToken = async (action = 'submit') => {
    if (!window.grecaptcha) throw new Error('reCAPTCHA is not ready yet.');
    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(siteKey, { action }).then(resolve).catch(reject);
      });
    });
  };
})();
