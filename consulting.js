(function () {
  'use strict';

  var root = document.documentElement;
  var languageButtons = document.querySelectorAll('[data-language]');
  var translatable = document.querySelectorAll('[data-en][data-fr]');

  function applyLanguage(language) {
    root.lang = language;
    translatable.forEach(function (element) {
      element.textContent = element.getAttribute('data-' + language);
    });
    languageButtons.forEach(function (button) {
      var active = button.getAttribute('data-language') === language;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    try { localStorage.setItem('mis-language', language); } catch (_) {}
  }

  languageButtons.forEach(function (button) {
    button.addEventListener('click', function () { applyLanguage(button.getAttribute('data-language')); });
  });
  applyLanguage(root.lang === 'fr' ? 'fr' : 'en');

  var themeSwitch = document.querySelector('.theme-switch');
  if (themeSwitch) {
    themeSwitch.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('mis-theme', next); } catch (_) {}
    });
  }

  var menuButton = document.querySelector('.menu-button');
  var nav = document.getElementById('nav-links');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var revealItems = document.querySelectorAll('.service-card, .steps li, .proof-grid article');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    revealItems.forEach(function (item) { observer.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('revealed'); });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
