(() => {
  const node = document.currentScript;
  const partnerId = node?.dataset?.partnerId?.trim();
  if (!partnerId || !/^\d+$/.test(partnerId)) return;
  window._linkedin_partner_id = partnerId;
  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push(partnerId);
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
  const first = document.getElementsByTagName('script')[0];
  first.parentNode.insertBefore(s, first);
})();
