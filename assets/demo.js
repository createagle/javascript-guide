// JavaScript Complete Guide · included by every demo page, in <head>, before the stylesheet is applied.
// 1. ?theme=light|dark forces a color theme (otherwise the system setting wins).
// 2. Inside an iframe, the page stops stretching to the frame and reports its natural height to the host:
//    parent.postMessage({ type: 'jsguide:resize', height, path }, '*')
//    The host page can listen for it and set the iframe height (see the repository README).
(function () {
  'use strict';
  var root = document.documentElement;
  var params = new URLSearchParams(location.search);
  var theme = params.get('theme');
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;

  var framed = false;
  try {
    framed = window.self !== window.top;
  } catch (err) {
    framed = true; // cross-origin access to top can throw in some browsers: we are framed
  }
  if (!framed) return;
  root.classList.add('framed');

  var last = 0;
  var queued = false;
  function report() {
    queued = false;
    var body = document.body;
    if (!body) return;
    var height = Math.ceil(Math.max(body.scrollHeight, body.getBoundingClientRect().height));
    if (height === last) return;
    last = height;
    window.parent.postMessage({ type: 'jsguide:resize', height: height, path: location.pathname }, '*');
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(report);
  }
  function start() {
    schedule();
    if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
    window.addEventListener('load', schedule);
  }
  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
