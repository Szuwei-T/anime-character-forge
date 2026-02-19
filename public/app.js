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
    try{ window.ACF_GUIDE && window.ACF_GUIDE.afterApi && window.ACF_GUIDE.afterApi(path, data); }catch(_e){}
    try{ window.ACF_MONTHLY && window.ACF_MONTHLY.afterApi && window.ACF_MONTHLY.afterApi(path, data); }catch(_e){}
    return data;
  }catch(e){
    APP.offline = true;
    return null;
  }
}



// ===== Guide NPC + Main Story (client) =====
(function(){
  const MAX_STEP = 6;

  const STEPS = [
    { step:1, title:"主線 1 抽到你的第一張素材卡", body:"去【抽卡】抽 1 次普通抽卡，拿到你的第一批素材。", page:"gacha.html", completeBy:"/api/gacha" },
    { step:2, title:"主線 2 進入工作室組合角色", body:"去【Studio】把頭 身體 背景 以及特效組合成 1 個角色。", page:"studio.html", completeBy:"/api/submit" },
    { step:3, title:"主線 3 保存你的第一個作品", body:"在工作室按【保存】把作品存進你的收藏。", page:"studio.html", completeBy:"/api/save" },
    { step:4, title:"主線 4 設定頭像或展示", body:"去【我的收藏】選 1 個作品按【設為頭像】或【展示】。", page:"recipes.html", completeBy:"/api/me/avatar" },
    { step:5, title:"主線 5 去 Gallery 投票", body:"去【Gallery】對別人的作品投 1 票，獲得投票與互動成就感。", page:"gallery.html", completeBy:"/api/vote" },
    { step:6, title:"主線 6 推薦 1 次上榜", body:"在 Gallery 對你喜歡的作品按【推薦】一次，推進社群熱度。", page:"gallery.html", completeBy:"/api/recommend" },
  ];

  function curPage(){
    const p = (location.pathname || "").split("/").pop() || "";
    return p || "index.html";
  }

  function ensureGuideButton(){
    if(document.getElementById("acfGuideBtn")) return;
    const btn = document.createElement("button");
    btn.id = "acfGuideBtn";
    btn.type = "button";
    btn.textContent = "主線任務";
    btn.setAttribute("aria-label","主線任務");
    btn.style.cssText = "position:fixed;right:14px;bottom:14px;z-index:99999;border-radius:999px;padding:10px 14px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.35);color:rgba(255,255,255,.92);font-weight:800;letter-spacing:.4px;backdrop-filter:blur(10px);cursor:pointer";
    btn.addEventListener("click", ()=>openGuide(true));
    document.body.appendChild(btn);
  }

  function ensureOverlay(){
    if(document.getElementById("acfGuideOverlay")) return;
    const wrap = document.createElement("div");
    wrap.id = "acfGuideOverlay";
    wrap.className = "acfGuideOverlay hidden";
    wrap.setAttribute("role","dialog");
    wrap.setAttribute("aria-modal","true");
    wrap.innerHTML = `
      <div class="acfGuideMask"></div>
      <div class="acfGuideCard" role="document">
        <div class="acfGuideNpc">
          <img class="acfGuideNpcImg" src="/ui/npc/aria.webp" alt="ARIA">
        </div>
        <div class="acfGuideMain">
          <div class="acfGuideTitle" id="acfGuideTitle"></div>
          <div class="acfGuideBody" id="acfGuideBody"></div>
          <div class="acfGuideActions">
            <button class="acfBtn acfBtnGhost" id="acfGuideClose" type="button">稍後</button>
            <button class="acfBtn acfBtnPrimary" id="acfGuideGo" type="button">前往</button>
            <button class="acfBtn acfBtnPrimary" id="acfGuideDone" type="button">完成</button>
          </div>
        </div>
      </div>
    `;
    const style = document.createElement("style");
    style.textContent = `
      .acfGuideOverlay{position:fixed;inset:0;z-index:99998;display:grid;place-items:center}
      .acfGuideOverlay.hidden{display:none}
      .acfGuideMask{position:absolute;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(6px)}
      .acfGuideCard{position:relative;width:min(820px,92vw);border-radius:18px;border:1px solid rgba(255,255,255,.16);background:rgba(10,14,22,.78);box-shadow:0 24px 70px rgba(0,0,0,.55);display:flex;gap:14px;padding:14px}
      .acfGuideNpc{width:170px;flex:0 0 170px;display:grid;place-items:center;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.10)}
      .acfGuideNpcImg{width:150px;height:auto;display:block;image-rendering:auto}
      .acfGuideMain{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px;padding:6px 6px 6px 2px}
      .acfGuideTitle{font-size:16px;font-weight:900;letter-spacing:.4px}
      .acfGuideBody{font-size:13px;line-height:1.55;opacity:.92;white-space:pre-line}
      .acfGuideActions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:4px}
      .acfBtn{font:inherit;border-radius:12px;padding:10px 12px;border:1px solid rgba(255,255,255,.16);cursor:pointer}
      .acfBtnGhost{background:rgba(255,255,255,.06);color:rgba(255,255,255,.9)}
      .acfBtnPrimary{background:linear-gradient(135deg, rgba(255,205,90,.18), rgba(120,170,255,.14));color:rgba(255,255,255,.94)}
      @media (max-width:720px){
        .acfGuideCard{flex-direction:column}
        .acfGuideNpc{width:100%;flex:0 0 auto}
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(wrap);

    const close = wrap.querySelector("#acfGuideClose");
    const mask = wrap.querySelector(".acfGuideMask");
    close.addEventListener("click", hideGuide);
    mask.addEventListener("click", hideGuide);

    wrap.querySelector("#acfGuideGo").addEventListener("click", ()=>onGo());
    wrap.querySelector("#acfGuideDone").addEventListener("click", ()=>onDone());
  }

  let state = { step:1, loaded:false };

  async function fetchStory(){
    const api = window.requireAppApi ? window.requireAppApi() : null;
    if(!api) return null;
    const data = await api("/api/me/story");
    if(data && data.ok && data.story){
      state.step = Number(data.story.step||1);
      state.loaded = true;
      return state.step;
    }
    return null;
  }

  function stepInfo(step){
    return STEPS.find(s=>s.step===step) || null;
  }

  function hideGuide(){
    const o = document.getElementById("acfGuideOverlay");
    if(o) o.classList.add("hidden");
  }

  function openGuide(force=false){
    ensureOverlay();
    const step = Math.max(1, Math.min(MAX_STEP+1, Number(state.step||1)));
    const info = stepInfo(step);
    if(!info){
      toast("主線已完成");
      return;
    }
    const o = document.getElementById("acfGuideOverlay");
    o.classList.remove("hidden");
    document.getElementById("acfGuideTitle").textContent = info.title;
    document.getElementById("acfGuideBody").textContent = info.body;

    const goBtn = document.getElementById("acfGuideGo");
    const doneBtn = document.getElementById("acfGuideDone");

    const onRightPage = curPage() === info.page;
    goBtn.style.display = onRightPage ? "none" : "";
    doneBtn.style.display = onRightPage ? "" : "none";

    goBtn.onclick = () => {
      hideGuide();
      location.href = info.page;
    };
    doneBtn.onclick = async () => {
      await advanceStep(step + 1);
      hideGuide();
      toast("主線進度已更新");
      // open next step if still on same page and user wants to continue
      setTimeout(()=>openGuide(true), 350);
    };
  }

  async function advanceStep(setTo){
    const api = window.requireAppApi ? window.requireAppApi() : null;
    if(!api) return;
    const data = await api("/api/me/story/advance", { method:"POST", body: JSON.stringify({ setTo }) });
    if(data && data.ok && data.story){
      state.step = Number(data.story.step||state.step);
    }
  }

  function afterApi(path, data){
    if(!data || data.ok === false) return;
    const step = Number(state.step||1);
    const info = stepInfo(step);
    if(!info) return;
    if(String(path).startsWith(info.completeBy)){
      advanceStep(step + 1);
      // gentle prompt
      setTimeout(()=>{
        toast("主線已推進 你可以點右下角主線任務繼續");
      }, 200);
    }
  }

  async function boot(){
    ensureGuideButton();
    ensureOverlay();
    await fetchStory();
    // auto open on first time each session if not completed
    try{
      const k = "acf_story_autoshow_" + (new Date().toISOString().slice(0,10));
      if(!sessionStorage.getItem(k) && Number(state.step||1) <= MAX_STEP){
        sessionStorage.setItem(k,"1");
        setTimeout(()=>openGuide(false), 500);
      }
    }catch(_){}
  }

  window.ACF_GUIDE = { boot, afterApi, open: ()=>openGuide(true) };
})();

// ===== Monthly Login Rewards (client) =====
(function(){
  let cache = null;

  function ensureOverlay(){
    if(document.getElementById("acfLoginOverlay")) return;
    const wrap = document.createElement("div");
    wrap.id = "acfLoginOverlay";
    wrap.className = "acfLoginOverlay hidden";
    wrap.setAttribute("role","dialog");
    wrap.setAttribute("aria-modal","true");
    wrap.innerHTML = `
      <div class="acfLoginMask"></div>
      <div class="acfLoginCard" role="document">
        <div class="acfLoginHead">
          <div class="acfLoginTitle">本月登入獎勵</div>
          <button class="acfLoginClose" type="button" aria-label="Close">✕</button>
        </div>
        <div class="acfLoginMeta" id="acfLoginMeta"></div>
        <div class="acfLoginGrid" id="acfLoginGrid"></div>
        <div class="acfLoginActions">
          <button class="acfBtn acfBtnGhost" id="acfLoginLater" type="button">稍後</button>
          <button class="acfBtn acfBtnPrimary" id="acfLoginClaim" type="button">領取</button>
        </div>
      </div>
    `;
    const style = document.createElement("style");
    style.textContent = `
      .acfLoginOverlay{position:fixed;inset:0;z-index:99997;display:grid;place-items:center}
      .acfLoginOverlay.hidden{display:none}
      .acfLoginMask{position:absolute;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(6px)}
      .acfLoginCard{position:relative;width:min(980px,94vw);border-radius:18px;border:1px solid rgba(255,255,255,.16);background:rgba(10,14,22,.82);box-shadow:0 24px 70px rgba(0,0,0,.55);padding:14px;display:flex;flex-direction:column;gap:10px}
      .acfLoginHead{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .acfLoginTitle{font-size:16px;font-weight:900;letter-spacing:.4px}
      .acfLoginClose{font:inherit;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:rgba(255,255,255,.9);border-radius:12px;padding:6px 10px;cursor:pointer}
      .acfLoginMeta{font-size:12px;opacity:.82}
      .acfLoginGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
      .acfDay{border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);padding:10px;min-height:58px;display:flex;flex-direction:column;gap:4px}
      .acfDay .d{font-size:11px;opacity:.75;font-weight:800}
      .acfDay .r{font-size:12px;opacity:.92;font-weight:800;line-height:1.1}
      .acfDay.lock{opacity:.45}
      .acfDay.claimed{border-color:rgba(52,211,153,.35);background:rgba(52,211,153,.08)}
      .acfDay.next{border-color:rgba(255,205,90,.45);background:rgba(255,205,90,.10)}
      .acfLoginActions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;margin-top:4px}
      @media (max-width:720px){ .acfLoginGrid{grid-template-columns:repeat(3,1fr)} }
    `;
    document.head.appendChild(style);
    document.body.appendChild(wrap);

    const close = wrap.querySelector(".acfLoginClose");
    const mask = wrap.querySelector(".acfLoginMask");
    const later = wrap.querySelector("#acfLoginLater");
    close.addEventListener("click", hide);
    mask.addEventListener("click", hide);
    later.addEventListener("click", hide);
  }

  function hide(){
    const o = document.getElementById("acfLoginOverlay");
    if(o) o.classList.add("hidden");
  }

  function open(){
    ensureOverlay();
    render();
    document.getElementById("acfLoginOverlay").classList.remove("hidden");
  }

  function fmtReward(r){
    if(!r) return "";
    if(r.gold) return `Gold ${r.gold}`;
    if(r.gem) return `Gem ${r.gem}`;
    if(r.ticket) return `普通券 x${r.ticket}`;
    if(r.premiumTicket) return `高級券 x${r.premiumTicket}`;
    if(r.randomAssetRarity){
      const map = { 3:"SR", 4:"SSR", 5:"UR" };
      let t = `${map[r.randomAssetRarity]||"素材"} x${r.count||1}`;
      if(r.bonusRandomAssetRarity){
        t += ` + ${(map[r.bonusRandomAssetRarity]||"素材")} x${r.bonusCount||1}`;
      }
      return t;
    }
    return "獎勵";
  }

  function render(){
    if(!cache) return;
    const meta = document.getElementById("acfLoginMeta");
    meta.textContent = `${cache.monthKey} 已登入 ${cache.loginDays} 天 已領 ${cache.claimedDays}/25`;

    const grid = document.getElementById("acfLoginGrid");
    grid.innerHTML = "";
    for(const it of (cache.rewards||[])){
      const d = document.createElement("div");
      d.className = "acfDay";
      if(it.day <= cache.claimedDays) d.classList.add("claimed");
      else if(cache.nextClaimDay === it.day && cache.canClaim) d.classList.add("next");
      else if(it.day > cache.loginDays) d.classList.add("lock");

      d.innerHTML = `<div class="d">Day ${it.day}</div><div class="r">${fmtReward(it)}</div>`;
      grid.appendChild(d);
    }

    const claimBtn = document.getElementById("acfLoginClaim");
    claimBtn.disabled = !cache.canClaim;
    claimBtn.textContent = cache.canClaim ? `領取 Day ${cache.nextClaimDay}` : "尚未可領取";
    claimBtn.onclick = async ()=>{
      await claim();
    };
  }

  async function fetchStatus(){
    const api = window.requireAppApi ? window.requireAppApi() : null;
    if(!api) return null;
    const data = await api("/api/me/monthly-login");
    if(data && data.ok){
      cache = data;
      return data;
    }
    return null;
  }

  async function claim(){
    const api = window.requireAppApi ? window.requireAppApi() : null;
    if(!api) return;
    const data = await api("/api/me/monthly-login/claim", { method:"POST", body: JSON.stringify({}) });
    if(data && data.ok){
      toast(`已領取 Day ${data.claimedDay}`);
      // refresh balances in master header
      try{ window.__acfForceRefreshMe && window.__acfForceRefreshMe(); }catch(_){}
      await fetchStatus();
      render();
    }else{
      toast("領取失敗");
    }
  }

  async function boot(){
    ensureOverlay();
    const data = await fetchStatus();
    if(!data) return;
    try{
      const k = "acf_login_autoshow_" + data.monthKey + "_" + data.loginDays + "_" + data.claimedDays;
      if(!sessionStorage.getItem(k) && data.canClaim){
        sessionStorage.setItem(k,"1");
        setTimeout(open, 700);
      }
    }catch(_){}
  }

  window.ACF_MONTHLY = { boot, open, afterApi: ()=>{} };
})();
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
    html.push(statCap("ticket", (acc.userTicket||0)));
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
      try{ window.ACF_GUIDE && window.ACF_GUIDE.boot && window.ACF_GUIDE.boot(); }catch(_e){}
      try{ window.ACF_MONTHLY && window.ACF_MONTHLY.boot && window.ACF_MONTHLY.boot(); }catch(_e){}
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
