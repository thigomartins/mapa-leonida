// service worker do Mapa de Leonida (gerado por montar_gta6.py): guarda só os arquivos do próprio site
const CACHE = 'leonida-20261124-192743';
const ARQS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
const BASE = new URL('./', self.location).pathname;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('leonida-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  // outros domínios (api.github.com, tiles, IGN) e outras pastas do mesmo domínio: não intercepta
  if (u.origin !== self.location.origin || !u.pathname.startsWith(BASE)) return;
  const nav = r.mode === 'navigate';
  const nome = u.pathname.slice(BASE.length);
  if (!nav && !ARQS.includes('./' + nome)) return;
  const chave = nav ? './index.html' : './' + nome;
  // rede primeiro; sem rede, a cópia guardada
  e.respondWith(fetch(r).then(resp => {
    if (resp.ok && resp.type === 'basic') { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(chave, cp)); }
    return resp;
  }).catch(() => caches.match(chave).then(m => m || caches.match('./index.html'))));
});
