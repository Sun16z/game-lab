(function () {
  var key = 'game-lab:theme';
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  var mode = 'system';
  try { var saved = localStorage.getItem(key); if (saved === 'light' || saved === 'dark') mode = saved; } catch (_) {}
  function apply() {
    document.documentElement.dataset.theme = mode === 'system' ? (media.matches ? 'dark' : 'light') : mode;
    document.documentElement.dataset.themeMode = mode;
    window.dispatchEvent(new Event('game-lab:theme-change'));
  }
  window.gameLabTheme = {
    get: function () { return mode; },
    set: function (value) {
      if (value !== 'system' && value !== 'light' && value !== 'dark') return;
      try { if (value === 'system') localStorage.removeItem(key); else localStorage.setItem(key, value); mode = value; }
      catch (_) { mode = 'system'; }
      apply();
    }
  };
  if (media.addEventListener) media.addEventListener('change', function () { if (mode === 'system') apply(); });
  window.addEventListener('storage', function (event) {
    if (event.key === key || event.key === null) {
      try { var v = localStorage.getItem(key); mode = v === 'light' || v === 'dark' ? v : 'system'; } catch (_) { mode = 'system'; }
      apply();
    }
  });
  apply();
})();
