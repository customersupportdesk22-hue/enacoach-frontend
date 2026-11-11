(function () {
  var BASE = document.currentScript.src.replace(/\/enhance\.js.*$/, '');

  /* ---------- 1. LIVE CHAT ---------- */
  try {
    var u = JSON.parse(localStorage.getItem('enaUser') || 'null');
    if (u && u.name && !localStorage.getItem('enc_n')) {
      localStorage.setItem('enc_n', u.name);
      localStorage.setItem('enc_ph', u.phone || '');
    }
  } catch (e) {}
  var cs = document.createElement('style');
  cs.textContent = '#enc-btn{bottom:165px!important}#enc-box{bottom:80px!important}';
  document.head.appendChild(cs);
  var ws = document.createElement('script');
  ws.src = BASE + '/chat-widget.js';
  ws.onload = function () {
    var c = document.querySelector('#screen-help .why-card');
    if (c) { c.style.cursor = 'pointer'; c.onclick = function () { if (window.ENAChat) window.ENAChat.open(); }; }
  };
  document.head.appendChild(ws);

  /* ---------- 2. BUS SLIDESHOW ---------- */
  var IMGS = [
    { u: 'https://res.cloudinary.com/yvzp2mhd/image/upload/v1794348774/images_12.jpg', c: 'Travel in comfort with ENA Coach' },
    { u: 'https://res.cloudinary.com/yvzp2mhd/image/upload/v1794348774/images_10.jpg', c: 'Safe and reliable journeys' },
    { u: 'https://res.cloudinary.com/yvzp2mhd/image/upload/v1794348773/images_17.jpg', c: 'East Africa\u2019s largest bus network' },
    { u: 'https://res.cloudinary.com/yvzp2mhd/image/upload/v1794348773/images_9.jpg',  c: 'Book your seat in minutes' },
    { u: 'https://res.cloudinary.com/yvzp2mhd/image/upload/v1794348773/images_14.jpg', c: 'Modern, clean coaches' },
    { u: 'https://res.cloudinary.com/yvzp2mhd/image/upload/v1794348773/images_16.jpg', c: 'Daily departures, every route' },
    { u: 'https://res.cloudinary.com/yvzp2mhd/image/upload/v1794348773/images_13.jpg', c: 'Your journey starts here' },
    { u: 'https://res.cloudinary.com/yvzp2mhd/image/upload/v1794348773/images_15.jpg', c: 'Travel with ENA Coach' }
  ];
  var N = IMGS.length, DELAY = 4500;
  function opt(x) { return x.replace('/upload/', '/upload/f_auto,q_auto,w_900,h_506,c_fill,g_auto/'); }

  var pc = document.createElement('link');
  pc.rel = 'preconnect'; pc.href = 'https://res.cloudinary.com'; document.head.appendChild(pc);

  var st = document.createElement('style');
  st.textContent =
    '.es-sec{padding:0 16px 28px}' +
    '.es-sec h3{font-size:26px;font-weight:800;margin-bottom:12px}' +
    '.es-wrap{position:relative;overflow:hidden;border-radius:18px;aspect-ratio:16/9;background:linear-gradient(135deg,#FF5E00,#FF8C42);box-shadow:0 8px 25px rgba(0,0,0,.15);touch-action:pan-y}' +
    '.es-s{position:absolute;inset:0;opacity:0;transition:opacity .8s ease}' +
    '.es-s.on{opacity:1}' +
    '.es-s img{width:100%;height:100%;object-fit:cover;display:block;transform:scale(1.06);transition:transform 6s ease-out}' +
    '.es-s.on img{transform:scale(1)}' +
    '.es-s span{position:absolute;left:0;right:0;bottom:0;padding:44px 16px 26px;color:#fff;font-weight:800;font-size:15px;background:linear-gradient(transparent,rgba(0,0,0,.7))}' +
    '.es-a{position:absolute;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:50%;border:0;background:rgba(255,255,255,.85);color:#1A1A1A;font-size:20px;font-weight:700;line-height:1;z-index:3}' +
    '.es-p{left:8px}.es-n{right:8px}' +
    '.es-d{position:absolute;bottom:12px;right:14px;display:flex;gap:5px;z-index:3}' +
    '.es-d i{width:6px;height:6px;border-radius:3px;background:rgba(255,255,255,.55);transition:all .3s}' +
    '.es-d i.on{background:#FF5E00;width:18px}' +
    '.es-bar{position:absolute;left:0;bottom:0;height:3px;background:#FF5E00;width:0;z-index:3}' +
    '@keyframes esbar{from{width:0}to{width:100%}}';
  document.head.appendChild(st);

  var home = document.getElementById('screen-home');
  if (!home) return;
  var sec = document.createElement('div');
  sec.className = 'es-sec';
  sec.innerHTML = '<h3>Our Buses</h3><div class="es-wrap">' +
    IMGS.map(function (p, k) {
      return '<div class="es-s"><img alt="ENA Coach bus" decoding="async"' +
        (k === 0 ? ' fetchpriority="high" src="' + opt(p.u) + '"' : '') + '><span>' + p.c + '</span></div>';
    }).join('') +
    '<button class="es-a es-p" aria-label="Previous">\u2039</button><button class="es-a es-n" aria-label="Next">\u203A</button>' +
    '<div class="es-d">' + IMGS.map(function () { return '<i></i>'; }).join('') + '</div><div class="es-bar"></div></div>';
  var routesAnchor = home.querySelector('.routes-card');
  if (routesAnchor) home.insertBefore(sec, routesAnchor); else home.appendChild(sec);

  var wrap = sec.querySelector('.es-wrap'), bar = sec.querySelector('.es-bar');
  var slides = sec.querySelectorAll('.es-s'), imgs = sec.querySelectorAll('.es-s img'), dots = sec.querySelectorAll('.es-d i');
  var cur = 0, timer, x0 = null;

  function load(k) { k = (k + N) % N; if (!imgs[k].getAttribute('src')) imgs[k].src = opt(IMGS[k].u); }
  function runBar() { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = 'esbar ' + DELAY + 'ms linear forwards'; }
  function go(n) {
    cur = (n + N) % N;
    for (var k = 0; k < N; k++) { slides[k].classList.toggle('on', k === cur); dots[k].className = k === cur ? 'on' : ''; }
    load(cur); load(cur + 1); runBar();
  }
  function play() { clearInterval(timer); runBar(); timer = setInterval(function () { go(cur + 1); }, DELAY); }
  function pause() { clearInterval(timer); bar.style.animation = 'none'; }

  sec.querySelector('.es-p').onclick = function () { go(cur - 1); play(); };
  sec.querySelector('.es-n').onclick = function () { go(cur + 1); play(); };
  wrap.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; pause(); }, { passive: true });
  wrap.addEventListener('touchend', function (e) {
    if (x0 !== null) { var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(dx < 0 ? cur + 1 : cur - 1); }
    x0 = null; play();
  });
  wrap.addEventListener('mouseenter', pause);
  wrap.addEventListener('mouseleave', play);
  document.addEventListener('visibilitychange', function () { document.hidden ? pause() : play(); });

  go(0); play();
  window.addEventListener('load', function () { for (var k = 2; k < N; k++) setTimeout(load.bind(null, k), 500 * k); });
})();
    
