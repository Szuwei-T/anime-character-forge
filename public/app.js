// app.js - shared helpers for Anime Character Forge (Pages + Workers)
//
// Goal: always call the Worker API when online (avoid /api on Pages).
// You can override Worker base via localStorage key "acf_worker_base".

(function(){
  // ---------- config ----------
  const DEFAULT_WORKER_BASE = "https://acf-api.dream-league-baseball.workers.dev";
  const IS_LOCALHOST = ["localhost","127.0.0.1"].includes(location.hostname);

  // Using var to avoid any temporal-dead-zone issues if other scripts reference early.
  var WORKER_BASE = (function(){
    try { return localStorage.getItem("acf_worker_base") || DEFAULT_WORKER_BASE; }
    catch(e){ return DEFAULT_WORKER_BASE; }
  })();

  // Global APP bag (var so it exists immediately)
  var APP = window.APP || (window.APP = {});
  APP.workerBase = WORKER_BASE;
  APP.apiBase = IS_LOCALHOST ? "" : WORKER_BASE; // IMPORTANT: Pages must call Worker
  APP.offline = IS_LOCALHOST && (new URLSearchParams(location.search).get("offline")==="1");

  // ---------- tiny DOM helpers ----------
  window.q  = window.q  || ((sel, root=document)=>root.querySelector(sel));
  window.qa = window.qa || ((sel, root=document)=>Array.from(root.querySelectorAll(sel)));

  // ---------- uid ----------
  function uuidv4(){
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    const a = crypto.getRandomValues(new Uint8Array(16));
    a[6] = (a[6] & 0x0f) | 0x40;
    a[8] = (a[8] & 0x3f) | 0x80;
    const h = [...a].map(b=>b.toString(16).padStart(2,"0")).join("");
    return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
  }

  function getOrCreateUid(){
    try{
      const k = "acf_uid";
      let uid = localStorage.getItem(k);
      if(!uid){ uid = uuidv4(); localStorage.setItem(k, uid); }
      return uid;
    }catch(e){
      return uuidv4();
    }
  }

  // ---------- fetch wrapper ----------
  async function apiFetch(path, options={}){
    const base = (APP.offline ? "" : (APP.apiBase || APP.workerBase || ""));
    const url = (base ? base.replace(/\/$/,"") : "") + path;

    const headers = new Headers(options.headers || {});
    if(!headers.has("Content-Type") && options.body) headers.set("Content-Type","application/json");
    if(APP.uid && !headers.has("x-user-id")) headers.set("x-user-id", APP.uid);

    const res = await fetch(url, { ...options, headers });
    if(!res.ok){
      let t = "";
      try{ t = await res.text(); }catch(e){}
      console.error("apiFetch fail", res.status, url, t);
      return { ok:false, error:`http_${res.status}`, detail:t };
    }
    const ct = res.headers.get("content-type") || "";
    if(ct.includes("application/json")) return await res.json();
    return await res.text();
  }

  async function apiGet(path){ return apiFetch(path, { method:"GET" }); }
  async function apiPost(path, body){ return apiFetch(path, { method:"POST", body: JSON.stringify(body||{}) }); }

  // ---------- assets cache ----------
  function normalizeAsset(a){
    if(!a) return null;
    const assetId = a.assetId || a.id || a.key || a.name;
    const imageUrl = a.imageUrl || a.url || (a.image ? a.image.url : "");
    const type = a.type || a.category;
    const rarity = Number(a.rarity || a.star || 1);
    return { ...a, assetId, imageUrl, type, rarity };
  }

  async function fetchAssetsOnline(){
    const data = await apiGet("/api/assets");
    if(!data || data.ok===false) return null;
    const list = (data.assets || data.items || data.data || []);
    return list.map(normalizeAsset).filter(Boolean);
  }

  async function getAssetsCached(force=false){
    const key = "acf_assets_cache_v1";
    if(!force){
      try{
        const raw = localStorage.getItem(key);
        if(raw){
          const parsed = JSON.parse(raw);
          if(Array.isArray(parsed) && parsed.length){
            return parsed.map(normalizeAsset).filter(Boolean);
          }
        }
      }catch(e){}
    }
    const list = await fetchAssetsOnline();
    if(list){
      try{ localStorage.setItem(key, JSON.stringify(list)); }catch(e){}
      return list;
    }
    return [];
  }

  function toThumb(imageUrl){
    if(!imageUrl) return "";
    if(/_thumb\.(png|jpg|jpeg|webp)$/i.test(imageUrl)) return imageUrl;
    const m = imageUrl.match(/^([^?#]+)([?#].*)?$/);
    const base = (m && m[1]) ? m[1] : imageUrl;
    const suffix = (m && m[2]) ? m[2] : "";
    const ext = base.match(/\.(png|jpg|jpeg|webp)$/i);
    if(!ext) return imageUrl;
    return base.replace(ext[0], `_thumb${ext[0]}`) + suffix;
  }

  // ---------- session ----------
  async function initSession(){
    APP.uid = APP.uid || getOrCreateUid();
    if(APP.offline) return { ok:true, uid: APP.uid, offline:true };

    const data = await apiPost("/api/session/init", { uid: APP.uid });
    if(data && data.ok){
      APP.userId = data.userId || data.uid || APP.uid;
      return data;
    }
    APP.offline = true;
    return { ok:false, uid: APP.uid, offline:true, error: data?.error || "init_failed" };
  }

  // ---------- small UI helpers ----------
  function toast(msg){
    try{
      let el = document.getElementById("toast");
      if(!el){
        el = document.createElement("div");
        el.id = "toast";
        el.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);padding:10px 14px;border-radius:12px;background:rgba(0,0,0,.65);color:#fff;font-size:14px;z-index:9999;opacity:0;transition:.2s;";
        document.body.appendChild(el);
      }
      el.textContent = msg;
      el.style.opacity = "1";
      clearTimeout(el._t);
      el._t = setTimeout(()=>{ el.style.opacity="0"; }, 1200);
    }catch(e){}
  }

  function rarityPill(r){
    const n = Number(r||1);
    const star = "★".repeat(Math.max(1, Math.min(5, n)));
    return `<span class="pill">${star} ${n}</span>`;
  }

  function randPick(arr){
    if(!arr || !arr.length) return null;
    return arr[Math.floor(Math.random()*arr.length)];
  }

  window.WORKER_BASE = WORKER_BASE;
  window.APP = APP;
  window.apiFetch = apiFetch;
  window.apiGet = apiGet;
  window.apiPost = apiPost;
  window.getOrCreateUid = getOrCreateUid;
  window.initSession = initSession;
  window.getAssetsCached = getAssetsCached;
  window.toThumb = toThumb;
  window.toast = window.toast || toast;
  window.rarityPill = window.rarityPill || rarityPill;
  window.randPick = window.randPick || randPick;
})();
