const APP = {
  apiBase: "",
  offline: false,
  uid: null,
  name: null,
};

const WORKER_BASE =
  (location.hostname === "127.0.0.1" || location.hostname === "localhost")
    ? ""
    : "https://acf-api.dream-league-baseball.workers.dev";

APP.apiBase = WORKER_BASE;

function q(sel, root=document){ return root.querySelector(sel); }
function qa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

function toast(msg){
  let el = q("#toast");
  if(!el){
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast hidden";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.add("hidden"), 2400);
}

function getOrCreateUid(){
  const k = "acf_uid";
  let uid = localStorage.getItem(k);
  if(!uid){
    uid = crypto.randomUUID();
    localStorage.setItem(k, uid);
  }
  return uid;
}

function getName(){
  return localStorage.getItem("acf_name") || "Player";
}

function setName(n){
  localStorage.setItem("acf_name", n || "Player");
}

function offlineDb(){
  const key = "acf_offline_db_v2";
  const raw = localStorage.getItem(key);
  if(raw){
    try{ return JSON.parse(raw); }catch(e){}
  }
  const seed = {
    users: {},
    assets: seedAssets(),
    userAssets: {},
    builds: [],
    ratings: {},
    unlocks: {},
    recipes: seedRecipes(),
    seasonId: "S1",
  };
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;

  function seedAssets(){
    const items = [];
    const types = ["head","body","accessory","background"];
    const rarities = [1,2,3,4,5];
    let idc = 1;
    for(const t of types){
      for(const r of rarities){
        const n = t === "accessory" ? 6 : 4;
        for(let i=1;i<=n;i++){
          const id = `A${String(idc).padStart(3,"0")}`;
          idc++;
          items.push({
            assetId: id,
            type: t,
            rarity: r,
            name: `${t} ${r}.${i}`,
            imageUrl: `assets/${t}_${r}_${i}.png`,
          });
        }
      }
    }
    return items;
  }

  function seedRecipes(){
    return [
      {
        recipeId:"R001",
        name:"Sky Duelist",
        headId:"A001",
        bodyId:"A101",
        bgId:"A301",
        accessoryIds:["A201","A202"],
        rarity:4,
        previewUrl:"assets/recipe_1.png",
      },
    ];
  }
}

function saveOfflineDb(db){
  localStorage.setItem("acf_offline_db_v2", JSON.stringify(db));
}

async function api(path, options={}){
  if(!APP.apiBase){
    APP.offline = true;
    throw new Error("offline_no_api_base");
  }
  const url = APP.apiBase + path;
  const headers = Object.assign(
    { "content-type":"application/json", "x-user-id": getOrCreateUid() },
    options.headers || {}
  );
  const opts = Object.assign({}, options, { headers });
  const res = await fetch(url, opts);
  if(!res.ok){
    const t = await res.text().catch(()=> "");
    throw new Error(`HTTP ${res.status} ${t}`);
  }
  APP.offline = false;
  return await res.json();
}

async function syncAssetsCacheOnline(){
  try{
    const data = await api("/api/assets", { method:"GET" });
    if(data && data.ok && Array.isArray(data.assets)){
      localStorage.setItem("acf_assets_cache_v1", JSON.stringify(data.assets));
      return data.assets;
    }
  }catch(e){}
  return null;
}

function getAssetsCached(){
  const raw = localStorage.getItem("acf_assets_cache_v1");
  if(!raw) return null;
  try{ return JSON.parse(raw); }catch(e){ return null; }
}

async function syncInventoryOnline(){
  const db = offlineDb();
  try{
    const data = await api("/api/me/assets", { method:"GET" });
    if(!data || !data.ok) return false;

    const uid = getOrCreateUid();
    for(const row of (data.items || [])){
      const k = `${uid}:${row.assetId}`;
      db.userAssets[k] = row.count;
    }
    saveOfflineDb(db);
    return true;
  }catch(e){
    return false;
  }
}

async function initSession(){
  APP.uid = getOrCreateUid();
  APP.name = getName();

  if(!APP.apiBase){
    APP.offline = true;
    const db = offlineDb();
    if(!db.users[APP.uid]){
      db.users[APP.uid] = { uid: APP.uid, displayName: APP.name, createdAt: Date.now() };
      saveOfflineDb(db);
    }
    return { ok:true, offline:true };
  }

  try{
    await api("/api/ping", { method:"GET" });
    await syncAssetsCacheOnline();
    await syncInventoryOnline();
    return { ok:true, offline:false };
  }catch(e){
    APP.offline = true;
    const db = offlineDb();
    if(!db.users[APP.uid]){
      db.users[APP.uid] = { uid: APP.uid, displayName: APP.name, createdAt: Date.now() };
      saveOfflineDb(db);
    }
    return { ok:true, offline:true };
  }
}

function rarityPill(r){
  return `<span class="pill">⭐ ${r}</span>`;
}

function normalizeAccessoryIds(ids){
  return Array.from(new Set((ids||[]).filter(Boolean))).sort();
}

window.APP = APP;
