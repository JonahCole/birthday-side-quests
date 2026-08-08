const CACHE='jonah-side-quests-v1';
const CORE=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{if(e.request.method==='GET'&&new URL(e.request.url).origin===location.origin){const clone=res.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}return res;}))));
