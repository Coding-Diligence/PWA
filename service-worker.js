const CACHE_NAME = "note-cache-v2";
const urlsToCache = [
"/",
"/index.html",
"/assets/css/styles.css",
"/assets/js/app.js",
"/assets/js/api.js",
"/assets/icons/icon-192x192.png",
"/assets/icons/icon-512x512.png",
"/assets/icons/favicon.png",
"/manifest.json"
];

self.addEventListener('install', (event) => {
event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => cache.addAll(urlsToCache))
    .catch(err => console.error('Cache installation failed:', err))
);
});

self.addEventListener('fetch', (event) => {
if (event.request.url.includes('/api/') || event.request.url.includes('/ws')) {
    return fetch(event.request);
}

event.respondWith(
    caches.match(event.request)
    .then(response => response || fetch(event.request))
    .catch(() => {
        if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
        }
    })
);
});

self.addEventListener('push', (event) => {
const data = event.data?.json() || {
    title: 'Nouveau message',
    body: 'Vous avez un nouveau message',
    icon: '/assets/icons/icon-192x192.png'
};

event.waitUntil(
    self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    vibrate: [200, 100, 200],
    data: { url: '/' }
    })
);
});

self.addEventListener('notificationclick', (event) => {
event.notification.close();
event.waitUntil(
    clients.openWindow(event.notification.data.url)
);
});

self.addEventListener('activate', (event) => {
event.waitUntil(
    caches.keys().then(cacheNames => {
    return Promise.all(
        cacheNames.map(cacheName => {
        if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
        }
        })
    );
    })
);
});