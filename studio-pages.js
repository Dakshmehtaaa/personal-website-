/* Small page-layer enhancement. The gallery remains visible if this script is unavailable. */
(function () {
  'use strict';

  const gallery = document.querySelector('.hobbies-page .spread-cards');
  if (!gallery) return;

  const photos = Array.from(gallery.querySelectorAll('.spread-photo'));
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  photos.forEach((photo, index) => {
    photo.style.setProperty('--studio-photo-delay', `${Math.min(index, 5) * 55}ms`);
  });

  const reveal = () => gallery.classList.add('studio-gallery-ready');
  if (motion.matches) reveal();
  else window.requestAnimationFrame(reveal);

  const motionChanged = event => {
    if (event.matches) {
      gallery.classList.add('studio-gallery-ready');
      photos.forEach(photo => { photo.style.animation = 'none'; });
    }
  };
  if (motion.addEventListener) motion.addEventListener('change', motionChanged);
  else if (motion.addListener) motion.addListener(motionChanged);
})();
