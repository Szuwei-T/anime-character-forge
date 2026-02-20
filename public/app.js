const APP = {
  apiBase: "",
  offline: false,
  uid: null,
  name: null,
};


/* === ACF i18n (auto multi language) === */
const I18N = (function(){
  const dict = {
    "en": {
      lang_name: "English",
      guest_name: "Guest",
      guest_sub: "(New register)",
      player_name: "Player",
      login: "Login",
      register: "Register",
      close: "Close",
      connecting: "Connecting",
      online: "Online",
      offline: "Offline",
      lv: "Lv",
      score: "Score",
      auth_required_title: "Login required",
      auth_required_body: "Please login or register to continue.",
    },
    "zh": {
      lang_name: "中文",
      guest_name: "遊客",
      guest_sub: "（新註冊）",
      player_name: "玩家",
      login: "登入",
      register: "註冊",
      close: "關閉",
      connecting: "連線中",
      online: "Online",
      offline: "Offline",
      lv: "Lv",
      score: "Score",
      auth_required_title: "需要登入",
      auth_required_body: "請先登入或註冊後再進行操作。",
    }
  };

  const supported = ["en","zh"];

  function detect(){
    const saved = localStorage.getItem("acf_lang");
    if(saved && supported.includes(saved)) return saved;
    const n = (navigator.language || "").toLowerCase();
    if(n.startsWith("zh")) return "zh";
    return "en";
  }

  let cur = detect();

  function getLang(){ return cur; }

  function setLang(lang){
    const l = supported.includes(lang) ? lang : "en";
    cur = l;
    localStorage.setItem("acf_lang", l);
    try{ document.documentElement.setAttribute("lang", l); }catch(_){}
    try{ window.dispatchEvent(new CustomEvent("acf:lang", { detail:{ lang:l } })); }catch(_){}
    return l;
  }

  function t(key, vars){
    const table = dict[cur] || dict.en;
    let s = table[key] ?? (dict.en[key] ?? key);
    if(vars && typeof s === "string"){
      for(const k of Object.keys(vars)){
        s = s.replaceAll(`{${k}}`, String(vars[k]));
      }
    }
    return s;
  }

  function apply(root=document){
    const nodes = root.querySelectorAll("[data-i18n]");
    for(const n of nodes){
      const key = n.getAttribute("data-i18n");
      if(!key) continue;
      n.textContent = t(key);
    }
  }

  return { t, setLang, getLang, apply, supported, dict };
})();
window.I18N = I18N;
window.t = I18N.t;

const WORKER_BASE =
  (location.hostname === "127.0.0.1" || location.hostname === "localhost")
    ? ""
    : "https://acf-api.dream-league-baseball.workers.dev";

const IS_OFFLINE = WORKER_BASE === "";

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

function syncUidAliases(uid){
  try{
    const id = String(uid || "").trim();
    if(!id) return;
    localStorage.setItem("uid", id);
    localStorage.setItem("userId", id);
    localStorage.setItem("USER_ID", id);
    window.uid = id;
    window.userId = id;
    window.USER_ID = id;
    window.getUid = () => id;
    window.getUserId = () => id;
  }catch(_){}
}

function getOrCreateUid(){
  const primary = "acf_uid";
  let uid = localStorage.getItem(primary);

  if(!uid){
    uid =
      localStorage.getItem("uid") ||
      localStorage.getItem("userId") ||
      localStorage.getItem("USER_ID") ||
      "";
    uid = String(uid || "").trim();
    if(uid) localStorage.setItem(primary, uid);
  }

  if(!uid){
    uid = crypto.randomUUID();
    localStorage.setItem(primary, uid);
  }

  syncUidAliases(uid);
  return uid;
}


function getSessionToken(){
  return localStorage.getItem("acf_token") || localStorage.getItem("acf_session_token") || "";
}
function setSessionToken(tok){
  if(tok) localStorage.setItem("acf_token", String(tok));
}
function isLoggedIn(){
  return !!getSessionToken();
}
function isGuest(){
  return !isLoggedIn();
}


function getName(){
  return localStorage.getItem("acf_name") || I18N.t("player_name");
}

function setName(n){
  localStorage.setItem("acf_name", n || I18N.t("player_name"));
}

function offlineDb(){
  const key = "acf_offline_db_v1";
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
      {
        recipeId:"R002",
        name:"Neon Mage",
        headId:"A010",
        bodyId:"A120",
        bgId:"A320",
        accessoryIds:["A240"],
        rarity:5,
        previewUrl:"assets/recipe_2.png",
      },
      {
        recipeId:"R003",
        name:"Crimson Knight",
        headId:"A020",
        bodyId:"A130",
        bgId:"A330",
        accessoryIds:["A260","A261","A262"],
        rarity:5,
        previewUrl:"assets/recipe_3.png",
      },
    ];
  }
}

function saveOfflineDb(db){
  localStorage.setItem("acf_offline_db_v1", JSON.stringify(db));
}

async function apiFetch(path, options={}){
  const url = (WORKER_BASE || "") + path;

  const uid = getOrCreateUid();

  const method = String((options && options.method) || "GET").toUpperCase();
  const isMutation = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
  const allowGuest = ["/api/session/init","/api/auth/login","/api/auth/register"].some(p => String(path||"").startsWith(p));
  if(isMutation && isGuest() && !allowGuest){
    ACF_showAuthOverlay();
    throw new Error("auth_required");
  }


  const headers = Object.assign({}, (options && options.headers) ? options.headers : {});
  if(uid) headers["x-user-id"] = headers["x-user-id"] || headers["X-User-Id"] || headers["X-USER-ID"] || uid;
  const token = getSessionToken();
  if(token) headers["x-session-token"] = headers["x-session-token"] || headers["X-Session-Token"] || token;

  const hasBody = options && options.body !== undefined && options.body !== null;

  let body = hasBody ? options.body : undefined;
  const ct = String(headers["content-type"] || headers["Content-Type"] || "");
  const wantsJson = ct.includes("application/json") || (!ct && typeof body === "object" && !(body instanceof FormData));

  if(hasBody && wantsJson){
    headers["content-type"] = "application/json";
    if(typeof body !== "string") body = JSON.stringify(body);
  }

  const opts = Object.assign({}, options, { headers, body });

  try{
    const res = await fetch(url, opts);
    const text = await res.text();
    let data = null;
    try{ data = text ? JSON.parse(text) : null; }catch(_){ data = { ok:false, error:text || `HTTP ${res.status}` }; }
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    APP.offline = false;
    return data;
  }catch(e){
    APP.offline = true;
    return null;
  }
}

async function initSession(){
  APP.uid = getOrCreateUid();
  syncUidAliases(APP.uid);
  APP.name = getName();

  if(isGuest()){
    const db = offlineDb();
    if(!db.users[APP.uid]){
      db.users[APP.uid] = { uid: APP.uid, displayName: APP.name, createdAt: Date.now() };
      saveOfflineDb(db);
    }
    return { ok:true, guest:true };
  }

  const data = await apiFetch("/api/session/init", {
    method:"POST",
    body: { uid: APP.uid, displayName: APP.name }
  });
  if(!data){
    const db = offlineDb();
    if(!db.users[APP.uid]){
      db.users[APP.uid] = { uid: APP.uid, displayName: APP.name, createdAt: Date.now() };
      saveOfflineDb(db);
    }
    return { ok:true, offline:true };
  }
  return data;
}

function rarityPill(r){
  return `<span class="pill">⭐ ${r}</span>`;
}

function byRarityDesc(a,b){ return (b.rarity||0)-(a.rarity||0); }

function pickWeightedRarity(){
  const r = Math.random();
  if(r < 0.01) return 5;
  if(r < 0.07) return 4;
  if(r < 0.25) return 3;
  if(r < 0.55) return 2;
  return 1;
}

function randPick(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}

function normalizeAccessoryIds(ids){
  return Array.from(new Set((ids||[]).filter(Boolean))).sort();
}

function sameSet(a,b){
  if(a.length !== b.length) return false;
  for(let i=0;i<a.length;i++) if(a[i]!==b[i]) return false;
  return true;
}

async function api(path, opts){
  if(IS_OFFLINE){
    throw new Error("offline_mode_no_worker");
  }
  const res = await fetch(WORKER_BASE + path, {
    ...opts,
    headers: {
      ...(opts?.headers || {}),
      "content-type": "application/json",
      "x-user-id": getOrCreateUid(),
      ...(getSessionToken() ? { "x-session-token": getSessionToken() } : {})
    }
  });
  return await res.json();
}

window.APP = APP;
window.q = q;
window.qa = qa;
window.toast = toast;
window.initSession = initSession;
window.apiFetch = apiFetch;
window.offlineDb = offlineDb;
window.saveOfflineDb = saveOfflineDb;
window.rarityPill = rarityPill;
window.byRarityDesc = byRarityDesc;
window.pickWeightedRarity = pickWeightedRarity;
window.randPick = randPick;
window.normalizeAccessoryIds = normalizeAccessoryIds;
window.sameSet = sameSet;
window.setName = setName;
window.getName = getName;



/* === ACF auth overlay (guest guard) === */
(function(){
  function ensureAuthStyles(){
    if(document.getElementById("acfAuthStyle")) return;
    const s = document.createElement("style");
    s.id = "acfAuthStyle";
    s.textContent = `
      .acf-authOverlay{
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: none;
        background: rgba(0,0,0,0.72);
        backdrop-filter: blur(6px);
      }
      .acf-authOverlay.show{ display: block; }
      .acf-authModal{
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: min(920px, calc(100vw - 32px));
        height: min(640px, calc(100vh - 32px));
        border-radius: 18px;
        overflow: hidden;
        border: 1px solid rgba(255,215,128,0.35);
        box-shadow: 0 22px 80px rgba(0,0,0,0.65);
        background: rgba(18,18,18,0.92);
      }
      .acf-authTop{
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 14px;
        color: rgba(255,255,255,0.92);
        font-weight: 900;
        letter-spacing: 0.2px;
        background: linear-gradient(to bottom, rgba(255,215,128,0.22), rgba(0,0,0,0));
      }
      .acf-authBtns{
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .acf-authBtn{
        appearance: none;
        border: 1px solid rgba(255,215,128,0.45);
        background: rgba(255,215,128,0.12);
        color: rgba(255,255,255,0.96);
        font-weight: 900;
        border-radius: 12px;
        padding: 8px 12px;
        cursor: pointer;
      }
      .acf-authBtn:hover{ background: rgba(255,215,128,0.18); }
      .acf-authClose{
        appearance: none;
        border: 0;
        background: rgba(255,255,255,0.10);
        color: rgba(255,255,255,0.92);
        font-weight: 900;
        border-radius: 12px;
        padding: 8px 12px;
        cursor: pointer;
      }
      .acf-authClose:hover{ background: rgba(255,255,255,0.16); }
      .acf-authFrame{
        width: 100%;
        height: calc(100% - 50px);
        border: 0;
        background: transparent;
      }
      .acf-authHint{
        padding: 16px;
        color: rgba(255,255,255,0.86);
        font-size: 14px;
      }
    `;
    document.head.appendChild(s);
  }

  function build(){
    ensureAuthStyles();
    let ov = document.getElementById("acfAuthOverlay");
    if(ov) return ov;

    ov = document.createElement("div");
    ov.id = "acfAuthOverlay";
    ov.className = "acf-authOverlay";
    ov.innerHTML = `
      <div class="acf-authModal" role="dialog" aria-modal="true">
        <div class="acf-authTop">
          <div id="acfAuthTitle">${I18N.t("auth_required_title")}</div>
          <div class="acf-authBtns">
            <button class="acf-authBtn" id="acfAuthLoginBtn">${I18N.t("login")}</button>
            <button class="acf-authBtn" id="acfAuthRegBtn">${I18N.t("register")}</button>
            <button class="acf-authClose" id="acfAuthCloseBtn">${I18N.t("close")}</button>
          </div>
        </div>
        <iframe class="acf-authFrame" id="acfAuthFrame" src=""></iframe>
      </div>
    `;
    document.body.appendChild(ov);

    const close = () => ACF_hideAuthOverlay();

    ov.addEventListener("click", (e)=>{ if(e.target === ov) close(); });
    ov.querySelector("#acfAuthCloseBtn").addEventListener("click", close);

    const openLogin = ()=>ACF_openAuthPage("login");
    const openReg = ()=>ACF_openAuthPage("register");
    ov.querySelector("#acfAuthLoginBtn").addEventListener("click", openLogin);
    ov.querySelector("#acfAuthRegBtn").addEventListener("click", openReg);

    return ov;
  }

  function open(mode){
    const ov = build();
    ov.classList.add("show");
    ACF_openAuthPage(mode || "login");
    ACF_watchAuthChange();
  }

  function hide(){
    const ov = document.getElementById("acfAuthOverlay");
    if(ov) ov.classList.remove("show");
  }

  function openPage(mode){
    const frame = document.getElementById("acfAuthFrame");
    if(!frame) return;
    // use site root index page as auth page
    const u = new URL(location.origin + "/");
    u.searchParams.set("auth", "1");
    u.searchParams.set("mode", mode || "login");
    frame.src = u.toString();
  }

  let _watchT = null;
  function watch(){
    clearInterval(_watchT);
    const before = getSessionToken();
    _watchT = setInterval(()=>{
      const now = getSessionToken();
      if(now && now !== before){
        clearInterval(_watchT);
        try{ window.dispatchEvent(new Event("acf:login")); }catch(_){}
        ACF_hideAuthOverlay();
        // refresh header + page state
        try{ if(window.ACF_initMasterHeader) window.ACF_initMasterHeader(); }catch(_){}
        try{ location.reload(); }catch(_){}
      }
    }, 500);
    setTimeout(()=>clearInterval(_watchT), 600000);
  }

  window.ACF_showAuthOverlay = open;
  window.ACF_hideAuthOverlay = hide;
  window.ACF_openAuthPage = openPage;
  window.ACF_watchAuthChange = watch;

  window.ACF_requireAuth = async function(){
    if(isLoggedIn()) return true;
    ACF_showAuthOverlay();
    throw new Error("auth_required");
  };

  // Intercept direct fetch calls to worker for guest
  const _fetch = window.fetch.bind(window);
  window.fetch = async function(input, init){
    try{
      const url = typeof input === "string" ? input : (input && input.url) ? input.url : "";
      const method = String((init && init.method) || (input && input.method) || "GET").toUpperCase();
      const isMutation = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
      const isWorkerCall = url.includes(".workers.dev") && url.includes("/api/");
      const allowGuest = url.includes("/api/session/init") || url.includes("/api/auth/login") || url.includes("/api/auth/register");
      if(isWorkerCall && isMutation && isGuest() && !allowGuest){
        ACF_showAuthOverlay();
        return Promise.reject(new Error("auth_required"));
      }
    }catch(_){}
    return _fetch(input, init);
  };
})();


/* === ACF MASTER HEADER (top_bar.webp + icon stats) === */

(function(){
  function el(tag, cls){
    const e = document.createElement(tag);
    if(cls) e.className = cls;
    return e;
  }

  function ensureMasterStyles(){
    if(document.getElementById("acfMasterStyle")) return;
    const s = document.createElement("style");
    s.id = "acfMasterStyle";
    s.textContent = `
      :root{ --acf-master-h: 0px; }

      .acf-master-fixed{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 9999;
        pointer-events: none;
      }

      .acf-masterShell{
        pointer-events: auto;
        width: 100%;
        height: 110px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 28px;
        box-sizing: border-box;
        background-image: url("/effect/top_light.webp"), url("/ui/frame/account_top_frame.webp");
        background-repeat: no-repeat, no-repeat;
        background-position: center top, center center;
        background-size: 100% 100%, 100% 100%;
      }

      .acf-master-fixed, .acf-master-fixed *{ box-sizing: border-box; }
      .acf-masterStats img{
        position: static !important;
        inset: auto !important;
        transform: none !important;
      }
      .acf-cap, .acf-cap span{ position: relative; }

      .acf-masterStats{
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        flex-wrap: nowrap;
        min-width: 0;
      }

      /* divider: single centered, no repeat, no cut, no thin border line */
      .acf-masterDivider{
         display: none !important;
        pointer-events: none;
        width: 100%;
        height: 24px;
        margin: 0;
        padding: 0;
        border: 0;
        outline: 0;
        box-shadow: none;
        background-image: url("/ui/frame/top_bar_divider.webp");
        background-position: center center;
        background-repeat: no-repeat;
                 background-position: center center;
background-size: contain;
        overflow: visible;
        line-height: 0;
      }

      .acf-masterLeft{
        display: flex;
        align-items: center;
        gap: 14px;
        min-width: 260px;
      }

      .acf-masterAvatar{
        width: 64px;
        height: 64px;
        border-radius: 999px;
        overflow: hidden;
        position: relative;
        flex: 0 0 auto;
        box-shadow: 0 8px 18px rgba(0,0,0,0.45);
        border: 2px solid rgba(255,215,128,0.75);
        background: rgba(255,255,255,0.06);
      }

      .acf-layer{
        position: relative;
        width: 100%;
        height: 100%;
      }

      .acf-layer img{
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        pointer-events: none;
        user-select: none;
      }

      .acf-initials{
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
        font-weight: 900;
        color: white;
        background: rgba(255,255,255,0.08);
      }

      .acf-masterTxt{
        display: flex;
        flex-direction: column;
        line-height: 1.12;
        min-width: 150px;
      }

      .acf-masterName{
        font-size: 18px;
        font-weight: 900;
        color: rgba(255,255,255,0.98);
        text-shadow: 0 2px 10px rgba(0,0,0,0.45);
      }

      .acf-masterSub{
        margin-top: 3px;
        font-size: 12px;
        color: rgba(255,255,255,0.72);
      }

      .acf-masterNet{
        margin-top: 3px;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.2px;
        opacity: 0.95;
        color: rgba(148,163,184,0.95);
      }
      .acf-masterNet.net-connecting{ color: rgba(148,163,184,0.95); }
      .acf-masterNet.net-online{ color: rgba(34,197,94,0.98); text-shadow: 0 0 12px rgba(34,197,94,0.25); }
      .acf-masterNet.net-offline{ color: rgba(239,68,68,0.98); text-shadow: 0 0 12px rgba(239,68,68,0.20); }

      /* caps: smaller again */
      .acf-cap{
        width: 150px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 0 14px;
        box-sizing: border-box;
        color: rgba(255,255,255,0.98);
        font-weight: 900;
        font-size: 12px;
        letter-spacing: 0.2px;
        text-shadow: 0 2px 10px rgba(0,0,0,0.55);
        background-size: 100% 100%;
        background-repeat: no-repeat;
                 background-position: center center;
white-space: nowrap;
         overflow: hidden;
      }

      .acf-capGold{ background-image: url("/ui/frame/account_gold.webp"); }
      .acf-capGem{ background-image: url("/ui/frame/account_gem.webp"); }
      .acf-capTicket{ background-image: url("/ui/frame/account_ticket.webp"); background-size: contain; background-position: left center; padding-right: 10px; justify-content: right; width: 80px; }
      .acf-capGeneric{
        background-image: url("/ui/frame/account_capsule.webp");
        justify-content: space-between;
        padding: 0 16px;
        gap: 10px;
      }

      .acf-capIcon{
        width: 22px;
        height: 22px;
        display: block;
        opacity: 0.96;
        filter: drop-shadow(0 2px 6px rgba(0,0,0,0.45));
      }

      @media (max-width: 1100px){
        .acf-cap{ width: 150px; height: 40px; font-size: 12px; }
        .acf-masterDivider{
         display: none !important; height: 22px; }
      }

      @media (max-width: 920px){
        .acf-masterShell{ height: 96px; padding: 0 16px; }
        .acf-masterAvatar{ width: 56px; height: 56px; }
        .acf-masterName{ font-size: 16px; }
        .acf-cap{ width: 140px; height: 38px; font-size: 11px; }
        .acf-masterStats{ gap: 10px; }
        .acf-masterDivider{
         display: none !important; height: 20px; }
      }

      @media (max-width: 760px){
        .acf-masterSub, .acf-masterNet{ display: none; }
        .acf-capGeneric{ display: none; }
        .acf-cap{ width: 132px; height: 36px; font-size: 11px; }
        .acf-masterDivider{
         display: none !important; height: 18px; }
      }

      @media (max-width: 560px){
        .acf-capTicket{ display: none; }
        .acf-cap{ width: 124px; height: 34px; font-size: 10px; }
        .acf-masterLeft{ min-width: 0; }
        .acf-masterDivider{
         display: none !important; height: 16px; }
      }
`;
    document.head.appendChild(s);
  }

  function initials(name){
    const s = String(name||"").trim();
    if(!s) return "?";
    const parts = s.split(/\s+/).filter(Boolean);
    const a = (parts[0] && parts[0][0]) ? parts[0][0] : (s[0] || "?");
    const b = (parts.length>1 ? parts[parts.length-1][0] : (s.length>1 ? s[1] : "")) || "";
    return (a+b).toUpperCase();
  }

  function makeStackThumb(container, layers){
    container.innerHTML = "";
    const wrap = el("div","acf-layer");
    for(const l of (layers||[])){
      if(!l || !l.url) continue;
      const img = new Image();
      img.src = l.url;
      img.style.zIndex = String(l.z || 0);
      wrap.appendChild(img);
    }
    container.appendChild(wrap);
  }

  async function fetchMeAccount(){
    if(typeof apiFetch === "function"){
      return await apiFetch("/api/me/account", { method:"GET" });
    }
    const DEFAULT_WORKER = "https://acf-api.dream-league-baseball.workers.dev";
    const WORKER = window.WORKER_BASE || localStorage.getItem("acf_worker_base") || DEFAULT_WORKER;
    const me = localStorage.getItem("acf_uid") || "";
    const res = await fetch(WORKER + "/api/me/account", {
      method:"GET",
      headers: { "content-type":"application/json", "x-user-id": me, ...(getSessionToken() ? { "x-session-token": getSessionToken() } : {}) }
    });
    const t = await res.text();
    let data = {};
    try{ data = JSON.parse(t||"{}"); }catch(_){ data = { ok:false, error:t }; }
    if(!res.ok || data.ok===false) return null;
    return data;
  }

  function buildHeaderDom(){
    ensureMasterStyles();

    const fixed = el("div","acf-master-fixed");
    fixed.id = "acfMasterHeader";

    const bar = el("div","acf-masterShell");
    const left = el("div","acf-masterLeft");

    const avatar = el("div","acf-masterAvatar");
    avatar.id = "acfMasterAvatar";

    const txt = el("div","acf-masterTxt");

    const name = el("div","acf-masterName");
    name.id = "acfMasterName";

    const sub = el("div","acf-masterSub");
    sub.id = "acfMasterSub";

    const net = el("div","acf-masterNet");
    net.id = "acfMasterNet";
    net.textContent = "Connecting";

    txt.appendChild(name);
    txt.appendChild(sub);
    txt.appendChild(net);

    left.appendChild(avatar);
    left.appendChild(txt);

    const stats = el("div","acf-masterStats");
    stats.id = "acfMasterStats";

    const langSel = el("select","acf-langSelect");
    langSel.id = "acfLangSelect";
    langSel.innerHTML = I18N.supported.map(l=>`<option value="${l}">${I18N.dict[l].lang_name || l}</option>`).join("");
    langSel.value = I18N.getLang();
    langSel.addEventListener("change", ()=>{ I18N.setLang(langSel.value); I18N.apply(document); try{ if(window.ACF_initMasterHeader) window.ACF_initMasterHeader(); }catch(_){} });


    stats.appendChild(langSel);

    bar.appendChild(left);
    bar.appendChild(stats);
    fixed.appendChild(bar);

    const div = el("div","acf-masterDivider");
    fixed.appendChild(div);

    return fixed;
  }

  function setBodyOffset(){
    const fixed = document.getElementById("acfMasterHeader");
    if(!fixed) return;
    const h = fixed.getBoundingClientRect().height || 0;
    document.documentElement.style.setProperty("--acf-master-h", h + "px");
    const cur = parseFloat(getComputedStyle(document.body).paddingTop || "0") || 0;
    if(cur < h) document.body.style.paddingTop = h + "px";
  }

  let _lastNetState = null;

  function injectMasterNetStyles(){
    if(document.getElementById("acfMasterNetStyle")) return;
    const s = document.createElement("style");
    s.id = "acfMasterNetStyle";
    s.textContent = `
      .acf-masterNet{
        margin-top: 2px;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.2px;
        opacity: 0.92;
        color: rgba(148,163,184,0.95);
      }
      .acf-masterNet.net-connecting{ color: rgba(148,163,184,0.95); }
      .acf-masterNet.net-online{ color: rgba(34,197,94,0.98); text-shadow: 0 0 10px rgba(34,197,94,0.25); }
      .acf-masterNet.net-offline{ color: rgba(239,68,68,0.98); text-shadow: 0 0 10px rgba(239,68,68,0.18); }
    `;
    document.head.appendChild(s);
  }

  function setNetBadge(state){
    const n = document.getElementById("acfMasterNet");
    if(!n) return;
    injectMasterNetStyles();
    const s = String(state || "").toLowerCase();
    let label = I18N.t("connecting");
    let cls = "net-connecting";
    if(s === "online"){
      label = I18N.t("online");
      cls = "net-online";
    }else if(s === "offline"){
      label = I18N.t("offline");
      cls = "net-offline";
    }
    n.textContent = label;
    n.classList.remove("net-connecting","net-online","net-offline");
    n.classList.add(cls);
    _lastNetState = label;
  }

  function refreshNetBadge(){
    if(!window.APP) { setNetBadge("connecting"); return; }
    const desired = window.APP.offline ? "offline" : "online";
    const desiredLabel = desired === "offline" ? I18N.t("offline") : I18N.t("online");
    if(_lastNetState !== desiredLabel){
      setNetBadge(desired);
    }
  }

  function statCap(kind, value, iconPath){
    const v = Number(value || 0);
    if(kind === "gold") return `<div class="acf-cap acf-capGold">${v}</div>`;
    if(kind === "gem") return `<div class="acf-cap acf-capGem">${v}</div>`;
    if(kind === "ticket") return `<div class="acf-cap acf-capTicket">${v}</div>`;
    const icon = iconPath ? `<img class="acf-capIcon" src="${iconPath}" alt="">` : "";
    return `<div class="acf-cap acf-capGeneric">${icon}<span>${v}</span></div>`;
  }

  function renderMaster(me){
    const box = document.getElementById("acfMasterHeader");
    if(!box) return;

    const nameEl = document.getElementById("acfMasterName");
    const subEl = document.getElementById("acfMasterSub");
    const avEl = document.getElementById("acfMasterAvatar");
    const statsEl = document.getElementById("acfMasterStats");

    if(!me || !me.account){
      // guest mode
      me = { account: { userName: I18N.t("guest_name"), level: 1, userRegion: "", accountScore: 0, rankTier: "D", userGold: 0, userGem: 0, userVote: 0 }, avatarSave: null };
    }

    const acc = me.account || {};

    const guest = isGuest();

    box.style.display = "block";
    nameEl.textContent = String(acc.userName || I18N.t("player_name"));
    subEl.textContent = I18N.t("lv") + " " + String(Number(acc.level || 1)) + (acc.userRegion ? (" · " + String(acc.userRegion)) : "") + " · Rank " + String(acc.rankTier || "D") + " · " + I18N.t("score") + " " + String(Number(acc.accountScore||0)) + (guest ? (" " + I18N.t("guest_sub")) : "");

    avEl.innerHTML = "";
    if(me.avatarSave){
      makeStackThumb(avEl, [
        { url: me.avatarSave.bgId ? ("/assets/" + me.avatarSave.bgId + ".png") : "", z:10 },
        { url: me.avatarSave.addon2Id ? ("/assets/" + me.avatarSave.addon2Id + ".png") : "", z:20 },
        { url: me.avatarSave.headId ? ("/assets/" + me.avatarSave.headId + ".png") : "", z:30 },
        { url: me.avatarSave.bodyId ? ("/assets/" + me.avatarSave.bodyId + ".png") : "", z:40 },
        { url: me.avatarSave.addon1Id ? ("/assets/" + me.avatarSave.addon1Id + ".png") : "", z:50 },
      ]);
    }else{
      const d = el("div","acf-initials");
      d.textContent = initials(acc.userName || "Player");
      avEl.appendChild(d);
    }

    const html = [];
    if(guest){
      html.push(`<div class="acf-authMini">
        <button class="acf-miniBtn" id="acfBtnLogin" type="button">${I18N.t("login")}</button>
        <button class="acf-miniBtn" id="acfBtnRegister" type="button">${I18N.t("register")}</button>
      </div>`);
      statsEl.innerHTML = html.join("");
      const b1 = document.getElementById("acfBtnLogin");
      const b2 = document.getElementById("acfBtnRegister");
      if(b1) b1.addEventListener("click", ()=>ACF_showAuthOverlay("login"));
      if(b2) b2.addEventListener("click", ()=>ACF_showAuthOverlay("register"));
    }else{
      html.push(statCap("gold", acc.userGold));
      html.push(statCap("gem", acc.userGem));
      html.push(statCap("ticket", acc.userVote));
      statsEl.innerHTML = html.join("");
    }

    const sel = document.getElementById("acfLangSelect");
    if(sel) sel.value = I18N.getLang();

    setBodyOffset();
  }

  async function initMasterHeader(){
    if(window.ACF_DISABLE_MASTER) return;
    if(document.getElementById("acfMasterHeader")) return;

    const legacy = document.getElementById("masterBox");
    if(legacy) legacy.style.display = "none";

    let mount = document.getElementById("acfMasterMount");
    if(!mount){
      mount = el("div");
      mount.id = "acfMasterMount";
      document.body.insertBefore(mount, document.body.firstChild);
    }

    const dom = buildHeaderDom();
    mount.appendChild(dom);
    setBodyOffset();

    setNetBadge("connecting");
    clearInterval(window.__acfNetPoll);
    window.__acfNetPoll = setInterval(refreshNetBadge, 800);
    window.addEventListener("online", refreshNetBadge, { passive:true });
    window.addEventListener("offline", refreshNetBadge, { passive:true });

    try{
      const me = await fetchMeAccount();
      renderMaster(me);
      refreshNetBadge();
    }catch(_e){
      renderMaster(null);
      refreshNetBadge();
    }

    // keep texts in sync with language
    window.addEventListener("acf:lang", ()=>{ try{ const me = null; renderMaster(me); }catch(_){} }, { passive:true });

    window.addEventListener("resize", ()=>setBodyOffset(), { passive:true });
  }

  window.ACF_initMasterHeader = initMasterHeader;

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initMasterHeader);
  }else{
    initMasterHeader();
  }
})();


document.addEventListener("DOMContentLoaded", ()=>{ try{ I18N.apply(document); }catch(_){} });
