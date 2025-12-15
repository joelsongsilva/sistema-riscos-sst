const CACHE_NAME = 'riscos-sst-v1.5.6-fullheight';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia de cache: Network First (sempre tenta buscar da rede primeiro)
self.addEventListener('fetch', (event) => {
  // Não cachear requisições de CDN externo (deixar que o navegador gerencie)
  if (event.request.url.includes('cdn.') || 
      event.request.url.includes('unpkg.') ||
      event.request.url.includes('cdnjs.')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a requisição foi bem-sucedida, clona e adiciona ao cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Se falhar (offline), busca do cache
        return caches.match(event.request);
      })
  );
});
