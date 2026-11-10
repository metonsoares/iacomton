/* IA com Ton: aviso de cookies + Pixel da Meta (e Google, se configurado).
   Nada de rastreio carrega antes do "Aceitar". A escolha fica no navegador (localStorage "iacomton_cookies").
   Para ligar: preencher PIXEL_META (e, se um dia houver, GA4). Eventos: window.iacomtonEvento("Lead", {...}). */
(function () {
  var PIXEL_META = "4655882121404152";   // ID do conjunto de dados (Pixel) da Meta, só números
  var GA4 = "";          // ex.: "G-XXXXXXX" (vazio = desligado)
  var CHAVE = "iacomton_cookies";
  var fila = [];
  var ligado = false;

  function ler() { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } }
  function gravar(v) { try { localStorage.setItem(CHAVE, v); } catch (e) {} }

  // Guarda a primeira origem da visita (utm_*, fbclid, gclid) só na sessão, para a página saber de onde a pessoa veio.
  try {
    var p = new URLSearchParams(location.search);
    var o = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"].forEach(function (k) {
      var v = p.get(k); if (v) o[k] = v.slice(0, 100);
    });
    if (Object.keys(o).length && !sessionStorage.getItem("iacomton_origem")) sessionStorage.setItem("iacomton_origem", JSON.stringify(o));
  } catch (e) {}

  function ligar() {
    if (ligado) return; ligado = true;
    if (/^\d{10,20}$/.test(PIXEL_META)) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", PIXEL_META);
      window.fbq("track", "PageView");
    }
    if (/^G-[A-Z0-9]{4,}$/.test(GA4)) {
      var g = document.createElement("script"); g.async = true; g.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4;
      document.head.appendChild(g);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date()); window.gtag("config", GA4);
    }
    fila.forEach(function (ev) { enviar(ev[0], ev[1]); }); fila = [];
  }

  function enviar(nome, dados) {
    if (window.fbq) window.fbq("track", nome, dados || {});
    if (window.gtag) window.gtag("event", nome, dados || {});
  }

  window.iacomtonEvento = function (nome, dados) {
    if (ligado) enviar(nome, dados); else if (ler() !== "nao") fila.push([nome, dados]);
  };

  function aviso() {
    if (document.getElementById("iacomton-cookies")) return;
    var d = document.createElement("div");
    d.id = "iacomton-cookies";
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-label", "Aviso de cookies");
    d.innerHTML =
      '<p>Usamos cookies para medir as visitas e mostrar conteúdos e anúncios do IA com Ton no Instagram e no Facebook (Pixel da Meta). ' +
      'Você escolhe. <a href="/privacidade.html#cookies">Saiba mais</a></p>' +
      '<div><button type="button" data-v="nao">Recusar</button><button type="button" data-v="sim">Aceitar</button></div>';
    var css = document.createElement("style");
    css.textContent =
      "#iacomton-cookies{position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:640px;margin:0 auto;background:#0A1430;color:#fff;" +
      "border-radius:14px;padding:14px 16px;box-shadow:0 12px 40px rgba(0,0,0,.35);font:14px/1.45 'Segoe UI',Roboto,Arial,sans-serif;" +
      "display:flex;gap:12px;align-items:center;flex-wrap:wrap}#iacomton-cookies p{margin:0;flex:1 1 260px}" +
      "#iacomton-cookies a{color:#5CC8FF}#iacomton-cookies div{display:flex;gap:8px;margin-left:auto}" +
      "#iacomton-cookies button{all:unset;cursor:pointer;padding:9px 16px;border-radius:10px;font-weight:700;border:1.5px solid #5CC8FF}" +
      "#iacomton-cookies button[data-v=sim]{background:#1E6BFF;border-color:#1E6BFF}" +
      "#iacomton-cookies button:focus-visible{outline:2px solid #fff;outline-offset:2px}";
    document.head.appendChild(css);
    d.addEventListener("click", function (e) {
      var v = e.target && e.target.getAttribute && e.target.getAttribute("data-v");
      if (!v) return;
      gravar(v); d.remove();
      if (v === "sim") ligar(); else fila = [];
    });
    document.body.appendChild(d);
  }

  // Link "Preferências de cookies" em qualquer página: <a href="#" data-cookies>.
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("[data-cookies]");
    if (!a) return;
    e.preventDefault();
    try { localStorage.removeItem(CHAVE); } catch (x) {}
    if (ligado) { location.reload(); return; }
    aviso();
  });

  function iniciar() { var v = ler(); if (v === "sim") ligar(); else if (v !== "nao") aviso(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
