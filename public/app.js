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

function getName(){
  return localStorage.getItem("acf_name") || "Player";
}

function setName(n){
  localStorage.setItem("acf_name", n || "Player");
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

  const headers = Object.assign({}, (options && options.headers) ? options.headers : {});
  if(uid) headers["x-user-id"] = headers["x-user-id"] || headers["X-User-Id"] || headers["X-USER-ID"] || uid;

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

  const data = await apiFetch("/api/session/init", {
    method:"POST",
    body: JSON.stringify({ uid: APP.uid, displayName: APP.name })
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
      "x-user-id": getOrCreateUid()
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
      headers: { "content-type":"application/json", "x-user-id": me }
    });
    const t = await res.text();
    let data = {};
    try{ data = JSON.parse(t||"{}"); }catch(_){ data = { ok:false, error:t }; }
    if(!res.ok || data.ok===false) throw data;
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
    let label = "Connecting";
    let cls = "net-connecting";
    if(s === "online"){
      label = "Online";
      cls = "net-online";
    }else if(s === "offline"){
      label = "Offline";
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
    const desiredLabel = desired === "offline" ? "Offline" : "Online";
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
      box.style.display = "none";
      setBodyOffset();
      return;
    }

    const acc = me.account || {};

    box.style.display = "block";
    nameEl.textContent = String(acc.userName || "Player");
    subEl.textContent = "Lv " + String(Number(acc.level || 1)) + (acc.userRegion ? (" · " + String(acc.userRegion)) : "");

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
    html.push(statCap("gold", acc.userGold));
    html.push(statCap("gem", acc.userGem));
    html.push(statCap("ticket", acc.userVote));
    statsEl.innerHTML = html.join("");

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

      window.__acfForceRefreshMe = async () => {
        try{
          const me2 = await fetchMeAccount();
          renderMaster(me2);
          refreshNetBadge();
        }catch(_e){}
      };

      try{ window.ACF_GUIDE && window.ACF_GUIDE.boot && window.ACF_GUIDE.boot(); }catch(_e){}
      try{ window.ACF_MONTHLY && window.ACF_MONTHLY.boot && window.ACF_MONTHLY.boot(); }catch(_e){}
      try{ window.ACF_ARIA_WIDGET && window.ACF_ARIA_WIDGET.boot && window.ACF_ARIA_WIDGET.boot(); }catch(_e){}
    }catch(_e){
      renderMaster(null);
      refreshNetBadge();
    }

    window.addEventListener("resize", ()=>setBodyOffset(), { passive:true });
  }

  window.ACF_initMasterHeader = initMasterHeader;

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initMasterHeader);
  }else{
    initMasterHeader();
  }
})();








// ===== Main Story Guide (Chapter 0) =====
(function(){
  const MAX_STEP = 7;

  const STEPS = [
    { step:1, title:"Chapter 0 覺醒", body:"你在光之祭壇醒來，聽見靈魂的呼喚。\n\n完成劇情後可領取獎勵：角色素材券 x1 + 服裝素材券 x1", kind:"claim_awaken" },
    { step:2, title:"Chapter 0-2 第一個靈魂 角色素材", body:"使用剛拿到的【角色素材券】抽頭部素材。\n本章必定抽到 head_1_1f", kind:"pull_head_ticket" },
    { step:3, title:"Chapter 0-2 第一個靈魂 服裝素材", body:"使用【服裝素材券】抽身體素材。\n本章必定抽到 body_1_1f", kind:"pull_body_ticket" },
    { step:4, title:"Chapter 0-2 組合靈魂", body:"前往 Studio，裝備 head_1_1f 與 body_1_1f。\n隨便選 1 個背景也可以。\n保存後獲得獎勵：背景素材券 x1", kind:"go_studio" , page:"studio.html" },
    { step:5, title:"Chapter 0-2 抽取背景", body:"你已獲得【背景素材券】。\n使用背景券抽背景。\n本章必定抽到 background_1_1", kind:"pull_bg_ticket" },
    { step:6, title:"Chapter 0-2 完成契約", body:"回到 Studio，裝備 background_1_1，保存。\n將解鎖第 1 個收藏配方：recipe_1_1f", kind:"go_studio_unlock", page:"studio.html" },
    { step:7, title:"Chapter 0-2 完成", body:"已解鎖 recipe_1_1f。\n你已完成覺醒與第一個靈魂。", kind:"done" },
  ];

  function ensureUI(){
    if(document.getElementById("acfStoryOverlay")) return;

    const wrap = document.createElement("div");
    wrap.id = "acfStoryOverlay";
    wrap.className = "acfStoryOverlay hidden";
    wrap.innerHTML = `
      <div class="acfStoryMask"></div>
      <div class="acfStoryCard" role="dialog" aria-modal="true">
        <div class="acfStoryNpc">
          <img class="acfStoryNpcImg" src="/ui/npc/aria_full.webp" alt="ARIA">
        </div>
        <div class="acfStoryMain">
          <div class="acfStoryTitle" id="acfStoryTitle"></div>
          <div class="acfStoryBody" id="acfStoryBody"></div>
          <div class="acfStoryActions">
            <button class="acfBtn acfBtnGhost" id="acfStoryClose" type="button">稍後</button>
            <button class="acfBtn acfBtnPrimary" id="acfStoryGo" type="button">前往</button>
            <button class="acfBtn acfBtnPrimary" id="acfStoryAct" type="button">執行</button>
          </div>
        </div>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .acfStoryOverlay{position:fixed;inset:0;z-index:99998;display:grid;place-items:center}
      .acfStoryOverlay.hidden{display:none}
      .acfStoryMask{position:absolute;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(6px)}
      .acfStoryCard{position:relative;width:min(860px,92vw);border-radius:18px;border:1px solid rgba(255,255,255,.16);background:rgba(10,14,22,.80);box-shadow:0 24px 70px rgba(0,0,0,.55);display:flex;gap:14px;padding:14px}
      .acfStoryNpc{width:190px;flex:0 0 190px;display:grid;place-items:center;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.10)}
      .acfStoryNpcImg{width:170px;height:auto;display:block}
      .acfStoryMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px;padding:6px 6px 6px 2px}
      .acfStoryTitle{font-size:16px;font-weight:900;letter-spacing:.4px}
      .acfStoryBody{font-size:13px;line-height:1.55;opacity:.92;white-space:pre-line}
      .acfStoryActions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:4px}
      .acfBtn{font:inherit;border-radius:12px;padding:10px 12px;border:1px solid rgba(255,255,255,.16);cursor:pointer}
      .acfBtnGhost{background:rgba(255,255,255,.06);color:rgba(255,255,255,.9)}
      .acfBtnPrimary{background:linear-gradient(135deg, rgba(255,205,90,.18), rgba(120,170,255,.14));color:rgba(255,255,255,.94)}
      @media (max-width:720px){ .acfStoryCard{flex-direction:column} .acfStoryNpc{width:100%;flex:0 0 auto} }
    `;
    document.head.appendChild(style);
    document.body.appendChild(wrap);

    wrap.querySelector("#acfStoryClose").addEventListener("click", hide);
    wrap.querySelector(".acfStoryMask").addEventListener("click", hide);
  }

  function hide(){
    const o = document.getElementById("acfStoryOverlay");
    if(o) o.classList.add("hidden");
  }

  function toastSafe(msg){
    try{
      if(window.toast){ window.toast(msg); return; }
    }catch(_e){}
    try{
      // fallback lightweight toast
      let el = document.getElementById("acfTmpToast");
      if(!el){
        el = document.createElement("div");
        el.id = "acfTmpToast";
        el.style.cssText = "position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:100000;background:rgba(10,14,22,.86);border:1px solid rgba(255,255,255,.16);color:rgba(255,255,255,.92);padding:10px 12px;border-radius:12px;backdrop-filter:blur(10px);box-shadow:0 18px 46px rgba(0,0,0,.46);font-weight:800;letter-spacing:.2px";
        document.body.appendChild(el);
      }
      el.textContent = msg;
      el.style.display = "block";
      setTimeout(()=>{ try{ el.style.display = "none"; }catch(_e){} }, 2600);
      return;
    }catch(_e){}
    try{ alert(msg); }catch(_e){}
  }

  let state = { step: 1, loaded:false };

  async function fetchStory(){
    const api = window.requireAppApi ? window.requireAppApi() : null;
    if(!api) return null;
    const data = await api("/api/me/story");
    if(data && data.ok && data.story){
      state.step = Number(data.story.step || 1);
      state.loaded = true;
      return state.step;
    }
    return null;
  }

  function stepInfo(step){
    return STEPS.find(s=>s.step===step) || STEPS[STEPS.length-1];
  }

  async function act(kind){
    try{

    const api = window.requireAppApi ? window.requireAppApi() : null;
    if(!api){ toastSafe("API 尚未就緒（requireAppApi 缺失）"); return; }

    if(kind === "claim_awaken"){
      toastSafe("正在領取獎勵...");
      const res = await api("/api/me/story/claim", { method:"POST", body: JSON.stringify({ rewardId:"ch0_awaken" }) });
      if(res && res.ok){
        toastSafe("已領取 角色券x1 服裝券x1");
      }else{
        toastSafe("領取失敗");
      }
      await fetchStory();
      open(true);
      return;
    }

    if(kind === "pull_head_ticket"){
      const res = await api("/api/gacha", { method:"POST", body: JSON.stringify({ count:1, type:"head", ticketType:"character" }) });
      if(res && res.ok){
        toastSafe("已獲得 head_1_1f");
      }else{
        toastSafe("抽取失敗");
      }
      await fetchStory();
      open(true);
      return;
    }

    if(kind === "pull_body_ticket"){
      const res = await api("/api/gacha", { method:"POST", body: JSON.stringify({ count:1, type:"body", ticketType:"costume" }) });
      if(res && res.ok){
        toastSafe("已獲得 body_1_1f");
      }else{
        toastSafe("抽取失敗");
      }
      await fetchStory();
      open(true);
      return;
    }

    if(kind === "pull_bg_ticket"){
      const res = await api("/api/gacha", { method:"POST", body: JSON.stringify({ count:1, type:"bg", ticketType:"background" }) });
      if(res && res.ok){
        toastSafe("已獲得 background_1_1");
      }else{
        toastSafe("抽取失敗");
      }
      await fetchStory();
      open(true);
      return;
    }

    // go studio or nothing
    hide();    }catch(err){
      console.error("CH0 action failed", kind, err);
      toastSafe("操作失敗 請看Console或Network");
      try{ window.ACF_ARIA_WIDGET && window.ACF_ARIA_WIDGET.setState && window.ACF_ARIA_WIDGET.setState("warning"); }catch(_e){}
    }

  }

  function open(force){
    ensureUI();
    const info = stepInfo(Number(state.step||1));
    const o = document.getElementById("acfStoryOverlay");
    o.classList.remove("hidden");

    document.getElementById("acfStoryTitle").textContent = info.title;
    document.getElementById("acfStoryBody").textContent = info.body;

    const goBtn = document.getElementById("acfStoryGo");
    const actBtn = document.getElementById("acfStoryAct");

    if(info.page){
      goBtn.style.display = "";
      goBtn.textContent = "前往";
      goBtn.onclick = ()=>{ hide(); location.href = info.page; };
    }else{
      goBtn.style.display = "none";
    }

    actBtn.style.display = "";
    actBtn.textContent = (info.kind === "claim_awaken") ? "領取獎勵"
      : (info.kind === "pull_head_ticket") ? "使用角色券抽頭"
      : (info.kind === "pull_body_ticket") ? "使用服裝券抽身體"
      : (info.kind === "pull_bg_ticket") ? "使用背景券抽背景"
      : "好的";

    if(info.kind === "go_studio" || info.kind === "go_studio_unlock"){
      actBtn.textContent = "我知道了";
      actBtn.onclick = ()=>hide();
    }else if(info.kind === "done"){
      actBtn.textContent = "完成";
      actBtn.onclick = ()=>hide();
      goBtn.style.display = "none";
    }else{
      actBtn.onclick = (ev)=>{ try{ ev && ev.preventDefault && ev.preventDefault(); ev && ev.stopPropagation && ev.stopPropagation(); }catch(_e){} act(info.kind); };
    }
  }

  async function boot(){
    await fetchStory();
    try{
      const k = "acf_story_autoshow_" + (new Date().toISOString().slice(0,10));
      if(!sessionStorage.getItem(k) && Number(state.step||1) <= MAX_STEP){
        sessionStorage.setItem(k,"1");
        setTimeout(()=>open(false), 600);
      }
    }catch(_e){}
  }

  window.ACF_GUIDE = { boot, open: ()=>open(true), __state: state, __maxStep: MAX_STEP };
})();

// ===== Persistent ARIA NPC Widget (commercial-grade) =====
(function(){
  const IMAGES = {
    default: "/ui/npc/aria_default.webp",
    success: "/ui/npc/aria_success.webp",
    warning: "/ui/npc/aria_warning.webp",
    discover: "/ui/npc/aria_discover.webp",
    guide: "/ui/npc/aria_guide.webp",
    full: "/ui/npc/aria_full.webp"
  };

  const STYLE_ID = "acfAriaWidgetStyle";

  let lastHintKey = "";
  let currentState = "default";

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
      @keyframes acfAriaFloat{
        0%{ transform: translateY(0) }
        50%{ transform: translateY(-8px) }
        100%{ transform: translateY(0) }
      }
      @keyframes acfAriaPulse{
        0%{ box-shadow: 0 0 0 0 rgba(255,205,90,.18) }
        70%{ box-shadow: 0 0 0 14px rgba(255,205,90,0) }
        100%{ box-shadow: 0 0 0 0 rgba(255,205,90,0) }
      }
      #acfAriaWidget{
        position: fixed;
        right: 12px;
        bottom: 86px;
        z-index: 99999;
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      #acfAriaWidget .acfAriaWrap{
        position: relative;
        animation: acfAriaFloat 3.2s ease-in-out infinite;
      }
      #acfAriaWidgetImg{
        width: 120px;
        height: auto;
        display: block;
        filter: drop-shadow(0 12px 28px rgba(0,0,0,.52));
        transition: transform .18s ease, filter .18s ease, opacity .18s ease;
      }
      #acfAriaWidget:hover #acfAriaWidgetImg{
        transform: scale(1.08);
        filter: drop-shadow(0 18px 34px rgba(0,0,0,.68));
      }
      #acfAriaBadge{
        position:absolute;
        right: 6px;
        top: 10px;
        width: 12px;
        height: 12px;
        border-radius: 999px;
        background: rgba(255,205,90,.95);
        border: 1px solid rgba(0,0,0,.45);
        display:none;
        animation: acfAriaPulse 1.4s ease-out infinite;
      }
      #acfAriaBubble{
        position:absolute;
        right: 126px;
        bottom: 28px;
        max-width: 260px;
        padding: 10px 12px;
        border-radius: 14px;
        background: rgba(10,14,22,.84);
        border: 1px solid rgba(255,255,255,.16);
        color: rgba(255,255,255,.92);
        font-size: 12px;
        line-height: 1.45;
        backdrop-filter: blur(10px);
        box-shadow: 0 18px 46px rgba(0,0,0,.46);
        display:none;
      }
      #acfAriaBubble:after{
        content:"";
        position:absolute;
        right: -6px;
        bottom: 14px;
        width: 10px;
        height: 10px;
        background: rgba(10,14,22,.84);
        border-right: 1px solid rgba(255,255,255,.16);
        border-bottom: 1px solid rgba(255,255,255,.16);
        transform: rotate(-45deg);
      }
      @media (max-width: 720px){
        #acfAriaWidgetImg{ width: 102px }
        #acfAriaBubble{ right: 110px; max-width: 220px }
      }
    `;
    document.head.appendChild(s);
  }

  function ensureWidget(){
    if(document.getElementById("acfAriaWidget")) return;
    ensureStyle();

    const root = document.createElement("div");
    root.id = "acfAriaWidget";

    const wrap = document.createElement("div");
    wrap.className = "acfAriaWrap";

    const img = document.createElement("img");
    img.id = "acfAriaWidgetImg";
    img.alt = "ARIA";
    img.src = IMAGES.default;

    const badge = document.createElement("div");
    badge.id = "acfAriaBadge";

    const bubble = document.createElement("div");
    bubble.id = "acfAriaBubble";

    wrap.appendChild(img);
    wrap.appendChild(badge);
    wrap.appendChild(bubble);
    root.appendChild(wrap);

    root.addEventListener("click", ()=>{
      hideBubble();
      try{
        if(window.ACF_GUIDE && window.ACF_GUIDE.open){
          window.ACF_GUIDE.open();
        }
      }catch(_e){}
    });

    root.addEventListener("mouseenter", ()=>{
      if(bubble.textContent) bubble.style.display = "block";
    });

    root.addEventListener("mouseleave", ()=>{
      bubble.style.display = "none";
    });

    document.body.appendChild(root);
  }

  function setState(next){
    ensureWidget();
    const img = document.getElementById("acfAriaWidgetImg");
    if(!img) return;
    currentState = IMAGES[next] ? next : "default";
    img.style.opacity = "0.0";
    setTimeout(()=>{
      img.src = IMAGES[currentState] || IMAGES.default;
      img.style.opacity = "1";
    }, 90);
  }

  function setBadge(on){
    const b = document.getElementById("acfAriaBadge");
    if(!b) return;
    b.style.display = on ? "block" : "none";
  }

  function showBubble(text, key){
    const bubble = document.getElementById("acfAriaBubble");
    if(!bubble) return;
    if(key && key === lastHintKey) return;
    lastHintKey = key || "";
    bubble.textContent = text || "";
    if(!text) return;
    bubble.style.display = "block";
    setTimeout(()=>{ try{ bubble.style.display = "none"; }catch(_e){} }, 4200);
  }

  function hideBubble(){
    const bubble = document.getElementById("acfAriaBubble");
    if(bubble) bubble.style.display = "none";
  }

  function computeState(){
    let want = "default";
    let badge = false
    try{
      const hasMonthly = window.ACF_MONTHLY && window.ACF_MONTHLY.__cache && window.ACF_MONTHLY.__cache.canClaim;
      const storyStep = window.ACF_GUIDE && window.ACF_GUIDE.__state && Number(window.ACF_GUIDE.__state.step||1);
      const storyMax = window.ACF_GUIDE && window.ACF_GUIDE.__maxStep || 6;

      if(hasMonthly){
        want = "discover";
        badge = true
      }else if(storyStep && storyStep <= storyMax){
        want = "guide";
        badge = true
      }else if(storyStep && storyStep > storyMax){
        want = "success";
        badge = false
      }else{
        want = "default";
        badge = false
      }
    }catch(_e){
      want = "default";
      badge = false
    }
    return { want, badge };
  }

  function boot(){
    ensureWidget();
    // initial state
    const s = computeState();
    setState(s.want);
    setBadge(s.badge);

    // gentle hints
    try{
      const hasMonthly = window.ACF_MONTHLY && window.ACF_MONTHLY.__cache && window.ACF_MONTHLY.__cache.canClaim;
      if(hasMonthly){
        showBubble("今天有登入獎勵可以領  點我打開", "monthly");
      }else{
        const step = window.ACF_GUIDE && window.ACF_GUIDE.__state && Number(window.ACF_GUIDE.__state.step||1);
        const max = window.ACF_GUIDE && window.ACF_GUIDE.__maxStep || 6;
        if(step && step <= max){
          showBubble("主線任務可以繼續  點我打開", "story");
        }
      }
    }catch(_e){}

    // keep syncing to use all ARIA assets
    setInterval(()=>{
      const s2 = computeState();
      if(s2.want !== currentState){
        setState(s2.want);
      }
      setBadge(s2.badge);
    }, 1200);
  }

  window.ACF_ARIA_WIDGET = { boot, setState, showBubble };
})();
