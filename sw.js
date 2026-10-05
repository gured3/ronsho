// 論証カード：オフライン用（保存済みファイルをすぐ表示し、通信できるときに裏で最新版へ更新）
const CACHE='ronsho-cards-v6';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  if(new URL(req.url).origin!==self.location.origin)return;
  const key=req.mode==='navigate'?'./index.html':req;
  const net=fetch(req).then(res=>{if(res&&res.ok){const cp=res.clone();return caches.open(CACHE).then(c=>c.put(key,cp)).then(()=>res,()=>res)}return res}).catch(()=>null);
  e.waitUntil(net);
  e.respondWith(caches.match(key,{ignoreSearch:true}).then(hit=>hit||net.then(r=>r||new Response('オフラインです。一度オンラインで開いてください。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}}))));
});
