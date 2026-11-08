// Öz Bakırköy · Yön E · Kor: menü, mobil çubuk, kategori izleyici, galeri, form ve kaydırma hareketleri.
(function () {
  var hareket = !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !!window.gsap;
  function $(s, k) { return (k || document).querySelector(s); }
  function $$(s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); }

  // Üst menü: ilk 40 piksel geçilince zemin alır (gözcü ile, scroll dinleyicisi yok).
  var nav = $('.nav');
  var gozcu = document.createElement('div');
  gozcu.style.cssText = 'position:absolute;top:40px;left:0;width:1px;height:1px;';
  document.body.prepend(gozcu);
  new IntersectionObserver(function (e) { nav.classList.toggle('is-solid', !e[0].isIntersecting); }).observe(gozcu);

  // Mobil alt çubuk: ilk bölüm ekrandan çıkınca belirir.
  var altbar = $('.altbar');
  var ilk = $('[data-ilk]');
  if (altbar && ilk) {
    new IntersectionObserver(function (e) { altbar.classList.toggle('is-on', !e[0].isIntersecting); }, { threshold: 0 }).observe(ilk);
  }

  // Mobil tam ekran menü
  var sheet = document.getElementById('sheet');
  var acDugme = $('.nav .menu-toggle');
  function sheetAc(ac) {
    sheet.classList.toggle('is-open', ac);
    sheet.setAttribute('aria-hidden', String(!ac));
    acDugme.setAttribute('aria-expanded', String(ac));
    document.body.style.overflow = ac ? 'hidden' : '';
  }
  acDugme.addEventListener('click', function () { sheetAc(true); });
  $('[data-close]', sheet).addEventListener('click', function () { sheetAc(false); });
  $$('nav a[href]', sheet).forEach(function (a) { a.addEventListener('click', function () { sheetAc(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet.classList.contains('is-open')) sheetAc(false); });

  // Menü sayfası: görünen kategorinin düğmesi işaretlenir (yalnız sayfa içi çapalar).
  var katLinks = $$('.kat-nav a[href^="#"]');
  if (katLinks.length) {
    var harita = {};
    katLinks.forEach(function (a) { harita[a.getAttribute('href').slice(1)] = a; });
    var izle = new IntersectionObserver(function (girisler) {
      girisler.forEach(function (g) {
        if (!g.isIntersecting) return;
        katLinks.forEach(function (a) { a.classList.remove('is-active'); });
        var a = harita[g.target.id];
        if (a) {
          a.classList.add('is-active');
          a.parentElement.scrollTo({ left: a.offsetLeft - 16, behavior: hareket ? 'smooth' : 'auto' });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(harita).forEach(function (id) { var el = document.getElementById(id); if (el) izle.observe(el); });
  }
  // Kategori sayfası: seçili kategori düğmesi görünür alana kaydırılır.
  var secili = $('.kat-nav a[aria-current="page"]');
  if (secili) secili.parentElement.scrollLeft = Math.max(0, secili.offsetLeft - 16);

  // Galeri: büyük görünüm (yerel dialog).
  var isik = $('.isik');
  if (isik && typeof isik.showModal === 'function') {
    var kartlar = $$('.g-ac');
    var buyuk = $('img', isik);
    var yazi = $('figcaption', isik);
    var sira = 0;
    var goster = function (i) {
      sira = (i + kartlar.length) % kartlar.length;
      var k = kartlar[sira];
      var im = $('img', k);
      buyuk.src = im.currentSrc || im.src;
      buyuk.alt = im.alt;
      yazi.textContent = $('.g-yazi', k.parentElement).textContent;
    };
    kartlar.forEach(function (k, i) { k.addEventListener('click', function () { goster(i); isik.showModal(); }); });
    $('.isik-kapat', isik).addEventListener('click', function () { isik.close(); });
    $('.isik-geri', isik).addEventListener('click', function () { goster(sira - 1); });
    $('.isik-ileri', isik).addEventListener('click', function () { goster(sira + 1); });
    isik.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') goster(sira - 1);
      if (e.key === 'ArrowRight') goster(sira + 1);
    });
    isik.addEventListener('click', function (e) { if (e.target === isik) isik.close(); });
  }

  // İletişim formu: e-posta uygulamasında taslak açar (WordPress'te sunucu tarafı formla değişir).
  var form = $('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var durum = $('.form-durum', form);
      var eksik = null;
      $$('[required]', form).forEach(function (a) {
        var deger = a.value.trim();
        var hatali = !deger || (a.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(deger));
        a.setAttribute('aria-invalid', hatali ? 'true' : 'false');
        if (hatali && !eksik) eksik = a;
      });
      if (eksik) { durum.textContent = 'Lütfen işaretli alanları doldurun.'; eksik.focus(); return; }
      var v = function (n) { return form.elements[n].value.trim(); };
      var govde = v('mesaj') + '\n\n' + v('ad') + ' (' + v('eposta') + ')';
      durum.textContent = 'E-posta uygulamanız açılıyor.';
      window.location.href = 'mailto:' + form.getAttribute('data-eposta') + '?subject=' + encodeURIComponent(v('konu')) + '&body=' + encodeURIComponent(govde);
    });
  }

  if (!hareket) return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero: fotoğraf yakından yerine oturur, başlık satırları yükselir.
  if ($('.hero')) {
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo('.hero-img', { scale: 1.14 }, { scale: 1, duration: 2.4, ease: 'power2.out' }, 0)
      .to('.hero-baslik .satir > span', { y: 0, duration: 1.2, stagger: .12 }, .2);
    if ($('.hero-alt')) tl.to('.hero-alt', { opacity: 1, duration: .9 }, .8);
    if ($('.hero-cta')) tl.to('.hero-cta', { opacity: 1, duration: .9 }, .95);
    gsap.to('.hero-img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  // İmza başlığı kaydırdıkça büyüyerek yerine oturur; adımlar sırayla gelir.
  if ($('.imza-baslik')) {
    gsap.fromTo('.imza-baslik', { scale: .84, opacity: .25, transformOrigin: '0% 60%' },
      { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.imza', start: 'top 88%', end: 'top 28%', scrub: .6 } });
    gsap.from('.imza .adim', { y: 40, opacity: 0, duration: .9, stagger: .15, ease: 'power3.out', scrollTrigger: { trigger: '.imza .adimlar', start: 'top 86%', once: true } });
  }

  // Görseller perde gibi açılır.
  gsap.utils.toArray('[data-perde]').forEach(function (f) {
    gsap.fromTo(f, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power3.inOut', scrollTrigger: { trigger: f, start: 'top 86%', once: true } });
    var im = $('img', f);
    if (im) gsap.fromTo(im, { scale: 1.16 }, { scale: 1, duration: 1.9, ease: 'power3.out', scrollTrigger: { trigger: f, start: 'top 86%', once: true } });
  });

  // Başlıklar ve satırlar görününce yükselir.
  gsap.utils.toArray('[data-yuksel]').forEach(function (el) {
    gsap.from(el, { y: 36, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  var satirlar = gsap.utils.toArray('.menu-grup li, .hizmet, .yemek, .kart, .hizmet-hucre, .komsu-liste li, .yil-kartlari li, .g');
  if (satirlar.length) {
    gsap.set(satirlar, { y: 24, opacity: 0 });
    ScrollTrigger.batch(satirlar, { start: 'top 92%', once: true, onEnter: function (grup) { gsap.to(grup, { y: 0, opacity: 1, duration: .7, stagger: .05, ease: 'power3.out' }); } });
  }

  if ($('.yil')) {
    gsap.from('.yil', { yPercent: 24, opacity: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.yil', start: 'top 88%', once: true } });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
