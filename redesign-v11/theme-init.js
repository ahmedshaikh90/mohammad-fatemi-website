/* Runs before the page paints so the saved theme is applied without a flash. Dark is the default. */
(function () {
  var theme = 'dark';
  try { if (localStorage.getItem('mf-theme') === 'light') theme = 'light'; } catch (e) {}
  document.documentElement.setAttribute('data-theme', theme);
})();
