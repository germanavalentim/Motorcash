// MotorCash Service Worker
// Muda esse número toda vez que publicar uma versão nova — o app atualiza automaticamente
const VERSION = 'v1';
const CACHE = 'motorcash-' + VERSION;

// Arquivos para guardar em cache (funciona offline)
const FILES = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instala e guarda cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
  // Força ativação imediata sem esperar fechar abas antigas
  self.skipWaiting();
});

// Ativa e apaga caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );
  // Assume controle de todas as abas abertas imediatamente
  self.clients.claim();
});

// Estratégia: tenta buscar versão nova da rede primeiro
// Se offline, usa cache. Dados (localStorage) nunca são afetados.
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Guarda cópia no cache
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Avisa todas as abas quando há nova versão disponível
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
