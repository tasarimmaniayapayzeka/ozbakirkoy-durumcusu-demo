// Öz Bakırköy · Yön G · Kurdele: menü, kategori izleyici, galeri, form ve kaydırma hareketleri.
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

  // Giriş: başlık satırları yükselir, usta yerine oturur, sticker açılır, kurdele serilir.
  if ($('.hero .baslik')) {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero .baslik > span', { y: 0, opacity: 1, duration: 1, stagger: .12 }, .1)
      .to('.hero .giris', { opacity: 1, duration: .8 }, .55)
      .to('.hero .dugmeler', { opacity: 1, duration: .8 }, .7)
      .to('.hero .usta', { y: 0, rotation: 0, scale: 1, opacity: 1, duration: 1.3, ease: 'back.out(1.3)' }, .25)
      .to('.hero .rozet', { scale: 1, rotation: 9, opacity: 1, duration: 1, ease: 'back.out(1.6)' }, .8)
      .fromTo('.kurdele-kap', { scaleX: .55, opacity: 0, transformOrigin: '50% 50%' }, { scaleX: 1, opacity: 1, duration: 1, ease: 'power3.out' }, .6);
    tl.add(function () { gsap.to('.hero .usta', { y: -9, duration: 3.2, ease: 'sine.inOut', repeat: -1, yoyo: true }); });
  }

  // Çerçeveli fotoğraflar eğik gelip yerine oturur.
  gsap.utils.toArray('[data-pop]').forEach(function (f) {
    gsap.from(f, { y: 50, opacity: 0, scale: .92, rotation: '-=5', duration: 1, ease: 'back.out(1.2)', scrollTrigger: { trigger: f, start: 'top 88%', once: true } });
  });

  // Kurdele başlıklar açılır; diğer başlıklar ve metinler yükselir.
  gsap.utils.toArray('.kurdele-baslik').forEach(function (b) {
    gsap.fromTo(b, { clipPath: 'inset(0 50% 0 50%)' }, { clipPath: 'inset(0 0% 0 0%)', duration: .9, ease: 'power3.out', scrollTrigger: { trigger: b, start: 'top 90%', once: true } });
  });
  gsap.utils.toArray('[data-yuksel]:not(.kurdele-baslik)').forEach(function (el) {
    gsap.from(el, { y: 36, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  var satirlar = gsap.utils.toArray('.menu-grup li, .hizmet, .bento-kampanya, .hizmet-hucre, .yemek, .kart, .komsu-liste li, .yil-kartlari li, .adim, .g');
  if (satirlar.length) {
    gsap.set(satirlar, { y: 24, opacity: 0 });
    ScrollTrigger.batch(satirlar, { start: 'top 92%', once: true, onEnter: function (grup) { gsap.to(grup, { y: 0, opacity: 1, duration: .7, stagger: .06, ease: 'power3.out' }); } });
  }
  if ($('.yil')) {
    gsap.from('.yil', { yPercent: 18, opacity: 0, duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: '.yil', start: 'top 88%', once: true } });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
