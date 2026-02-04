// Shared app utilities for Anime Character Forge

const APP = {
  offline: false,
  uid: null,
  name: null,
};

// When running on localhost we treat as offline (no Worker)
const WORKER_BASE =
  (location.hostname === "127.0.0.1" || location.hostname === "localhost")
    ? ""
    : "https://acf-api.dream-league-baseball.workers.dev";

const IS_OFFLINE = WORKER_BASE === "";

function q(sel, root = document) {
  return root.querySelector(sel);
}
function qa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.bottom = "22px";
    el.style.transform = "translateX(-50%)";
    el.style.padding = "10px 14px";
    el.style.borderRadius = "999px";
    el.style.background = "rgba(0,0,0,0.6)";
    el.style.color = "#fff";
    el.style.fontSize = "14px";
    el.style.zIndex = "9999";
    el.style.backdropFilter = "blur(8px)";
    el.style.border = "1px solid rgba(255,255,255,0.15)";
    el.style.maxWidth = "80vw";
    el.style.textAlign = "center";
    el.style.pointerEvents = "none";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = "1";
  clearTimeout(el._t);
  el._t = setTimeout(() => (el.style.opacity = "0"), 1400);
}

function getOrCreateUid() {
  const k = "acf_uid";
  let uid = localStorage.getItem(k);
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem(k, uid);
  }
  return uid;
}
function getOrCreateName() {
  const k = "acf_name";
  let name = localStorage.getItem(k);
  if (!name) {
    name = "Player";
    localStorage.setItem(k, name);
  }
  return name;
}
function setName(name) {
  localStorage.setItem("acf_name", name);
  APP.name = name;
}

// --- Cloudflare Worker API helper ---
async function apiFetch(path, options = {}) {
  if (IS_OFFLINE) throw new Error("offline");
  const url = `${WORKER_BASE}${path}`;
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  headers.set("x-user-id", APP.uid || getOrCreateUid());
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) return data || { ok: false, error: `http_${res.status}` };
  return data;
}

// --- Session init ---
// IMPORTANT: we no longer call /api/session/init (it doesn't exist). Session is client-side only.
async function initSession() {
  APP.uid = getOrCreateUid();
  APP.name = getOrCreateName();
  APP.offline = IS_OFFLINE;
  return { ok: true, uid: APP.uid, name: APP.name, offline: APP.offline };
}

// --- Assets caching (fix: gacha.html expects getAssetsCached) ---
async function getAssetsCached(force = false) {
  const key = "acf_assets_cache_v1";
  if (!force) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && Array.isArray(obj.assets)) return obj.assets;
      }
    } catch {}
  }
  if (IS_OFFLINE) {
    const db = offlineDb();
    localStorage.setItem(key, JSON.stringify({ assets: db.assets }));
    return db.assets;
  }
  const data = await apiFetch("/api/assets");
  const assets = data?.assets || data?.items || data || [];
  localStorage.setItem(key, JSON.stringify({ assets }));
  return assets;
}

// Build a thumbnail URL for an asset imageUrl.
// Strategy used by studio:
// - primary: same folder: foo.png -> foo_thumb.png
// - fallback via onerror: /assets/thumbs/<foo>_thumb.png, then original
function toThumbUrlSameDir(imageUrl) {
  if (!imageUrl) return "";
  const u = String(imageUrl);
  const noQuery = u.split("?")[0];
  if (!noQuery.endsWith(".png")) return u;
  const base = noQuery.slice(0, -4);
  return `${base}_thumb.png`;
}
function toThumbUrlAssetsThumbs(imageUrl) {
  if (!imageUrl) return "";
  const u = String(imageUrl);
  const noQuery = u.split("?")[0];
  const parts = noQuery.split("/");
  const file = parts.pop() || "";
  if (!file.endsWith(".png")) return u;
  const base = file.slice(0, -4);
  // keep /assets root, append /thumbs/
  const idx = parts.lastIndexOf("assets");
  if (idx >= 0) {
    const dir = parts.slice(0, idx + 1).join("/");
    return `${dir}/thumbs/${base}_thumb.png`;
  }
  return `/assets/thumbs/${base}_thumb.png`;
}

// --- Offline DB for local testing (kept for backward compatibility) ---
function offlineDb() {
  const k = "acf_offline_db_v1";
  let db;
  try {
    db = JSON.parse(localStorage.getItem(k) || "null");
  } catch {
    db = null;
  }
  if (!db) {
    db = { assets: [], recipes: [], userAssets: {}, unlocks: {}, showcases: [], votes: {} };
  }
  return db;
}
function saveOfflineDb(db) {
  const k = "acf_offline_db_v1";
  localStorage.setItem(k, JSON.stringify(db));
}

// weighted rarity picker (1..5)
function pickWeightedRarity() {
  const r = Math.random();
  if (r < 0.65) return 1;
  if (r < 0.88) return 2;
  if (r < 0.96) return 3;
  if (r < 0.995) return 4;
  return 5;
}
function randPick(arrOrLen) {
  if (Array.isArray(arrOrLen)) return arrOrLen[Math.floor(Math.random() * arrOrLen.length)];
  const len = Number(arrOrLen) || 0;
  return Math.floor(Math.random() * Math.max(1, len));
}
function rarityPill(r) {
  const m = { 1: "C", 2: "B", 3: "A", 4: "S", 5: "SS" };
  return m[r] || String(r);
}

// expose for inline scripts
window.APP = APP;
window.q = q;
window.qa = qa;
window.toast = toast;
window.initSession = initSession;
window.apiFetch = apiFetch;
window.getAssetsCached = getAssetsCached;
window.toThumbUrlSameDir = toThumbUrlSameDir;
window.toThumbUrlAssetsThumbs = toThumbUrlAssetsThumbs;
window.offlineDb = offlineDb;
window.saveOfflineDb = saveOfflineDb;
window.pickWeightedRarity = pickWeightedRarity;
window.randPick = randPick;
window.rarityPill = rarityPill;
