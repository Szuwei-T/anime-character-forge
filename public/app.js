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
  const headers = Object.assign({ "Content-Type":"application/json" }, options.headers || {});
  const opts = Object.assign({}, options, { headers });
  try{
    const res = await fetch(url, opts);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    APP.offline = false;
    return data;
  }catch(e){
    APP.offline = true;
    return null;
  }
}

async function initSession(){
  APP.uid = getOrCreateUid();
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

function getOrCreateUid(){
  let uid = localStorage.getItem("acf_uid");
  if(!uid){
    uid = crypto.randomUUID();
    localStorage.setItem("acf_uid", uid);
  }
  return uid;
}


/* ===== Master Account Bar (shared) ===== */
function shouldShowMasterAccountBar(){
  const p = (location.pathname || "").toLowerCase();
  if(p.endsWith("/index.html") || p === "/" || p.endsWith("/")) return false;
  if((document.title || "").includes("登入")) return false;
  return true;
}

function ensureMasterAccountMount(){
  let mount = document.getElementById("masterAccount");
  if(mount) return mount;

  // Reuse existing panel if present
  const existing = document.querySelector(".accountPanel[data-master='1']");
  if(existing) return existing;

  const host = document.querySelector(".page-wrap") || document.querySelector(".wrap") || document.querySelector(".container") || document.body;
  mount = document.createElement("div");
  mount.id = "masterAccount";

  // Put right under topbar if exists
  const topbar = host.querySelector ? host.querySelector(".topbar") : null;
  if(topbar && topbar.parentNode){
    topbar.insertAdjacentElement("afterend", mount);
  }else{
    host.insertAdjacentElement("afterbegin", mount);
  }
  return mount;
}

function injectMasterAccountStyles(){
  if(document.getElementById("masterAccountStyles")) return;
  const s = document.createElement("style");
  s.id = "masterAccountStyles";
  s.textContent = `
  .masterAccountCard{
    margin: 12px 0 14px 0;
    padding: 14px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,.10);
    background: rgba(0,0,0,.25);
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }
  .maLeft{display:flex;gap:12px;align-items:center;flex: 1 1 auto;min-width: 240px;}
  .maAvatar{
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.12);
    overflow: hidden;
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight: 900;
    color: rgba(255,255,255,.85);
    flex: 0 0 auto;
  }
  .maAvatar img{width:100%;height:100%;object-fit:contain;display:block;background:rgba(0,0,0,.12)}
  .maNameRow{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .maName{
    font-weight: 950;
    letter-spacing: 0.2px;
    font-size: 15px;
  }
  .maLv{
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.16);
    background: rgba(0,0,0,.14);
    font-weight: 900;
    font-size: 13px;
    opacity: .95;
  }
  .maBtns{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .maBtn{
    cursor:pointer;
    user-select:none;
    padding: 8px 10px;
    border-radius: 999px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.12);
    font-size: 13px;
    font-weight: 900;
    color: inherit;
  }
  .maBtn:hover{background: rgba(255,255,255,.10)}
  .maBtn:disabled{opacity:.55;cursor:not-allowed}
  .maStats{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .maPill{
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.14);
    font-size: 12px;
    font-weight: 900;
    opacity: .95;
    white-space: nowrap;
  }

  .maModal{position:fixed;inset:0;z-index:99999;display:none}
  .maModal.show{display:block}
  .maBack{position:absolute;inset:0;background:rgba(0,0,0,.68);backdrop-filter: blur(10px)}
  .maCard{
    position:relative;
    width:min(520px, 94vw);
    margin: 12vh auto 0;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(15,20,30,.92);
    box-shadow: 0 30px 110px rgba(0,0,0,.65);
    padding: 14px;
  }
  .maCard .top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
  .maCard .title{font-weight: 950}
  .maCard .x{cursor:pointer;padding:8px 10px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.10);font-size:12px}
  .maCard label{display:block;font-size:12px;opacity:.8;margin:10px 0 6px}
  .maCard input{
    width:100%;
    padding: 12px 12px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,.12);
    background: rgba(0,0,0,.25);
    color:#fff;
    outline:none;
    box-sizing:border-box;
  }
  .maHint{font-size:12px;opacity:.75;margin-top:8px;line-height:1.4}
  .maCard .row{display:flex;gap:10px;align-items:center;justify-content:flex-end;margin-top:12px;flex-wrap:wrap}
  `;
  document.head.appendChild(s);
}

function fmtInt(n){
  const x = Number(n || 0);
  if(!Number.isFinite(x)) return "0";
  return String(Math.floor(x));
}

async function mountMasterAccountBar(){
  try{
    if(!shouldShowMasterAccountBar()) return;
    injectMasterAccountStyles();
    const mount = ensureMasterAccountMount();
    if(!mount) return;

    // Prevent duplicate re-render storms
    if(mount.dataset.rendering === "1") return;
    mount.dataset.rendering = "1";

    const offline = IS_OFFLINE || APP.offline;
    if(offline){
      mount.innerHTML = `<div class="masterAccountCard"><div style="opacity:.85;font-weight:900">Offline 模式 無法載入帳號資料</div></div>`;
      mount.dataset.rendering = "0";
      return;
    }

    const data = await api("/api/me/account", { method: "GET" });
    if(!data || !data.ok){
      mount.innerHTML = `<div class="masterAccountCard"><div style="opacity:.85;font-weight:900">帳號載入失敗</div></div>`;
      mount.dataset.rendering = "0";
      return;
    }

    const a = data.account || {};
    const s = data.stats || {};
    const avatarUrl = data.avatarUrl || "";
    const name = (a.userName || APP.name || "Player");
    const lv = fmtInt(a.level || 1);
    const gold = fmtInt(a.userGold || 0);
    const gem = fmtInt(a.userGem || 0);
    const vote = fmtInt(a.userVote || 0);

    const worksCount = fmtInt(s.worksCount || 0);
    const followers = fmtInt(s.followers || 0);
    const likesReceived = fmtInt(s.likesReceived || 0);
    const collectionsUnlocked = fmtInt(s.collectionsUnlocked || 0);

    const nameChangeCount = Number(a.nameChangeCount || 0);
    const renameCost = nameChangeCount >= 1 ? 50 : 0;

    mount.innerHTML = `
      <div class="masterAccountCard" data-master="1">
        <div class="maLeft">
          <div class="maAvatar" title="到成品庫選擇頭像">
            ${avatarUrl ? `<img src="${avatarUrl}" alt="avatar" />` : `<span>${(name || "P").slice(0,1).toUpperCase()}</span>`}
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;min-width: 220px">
            <div class="maNameRow">
              <div class="maName">${escapeHtml(name)}</div>
              <div class="maLv">Lv.${lv}</div>
            </div>
            <div class="maBtns">
              <button class="maBtn" id="maGoRecipes">選頭像</button>
              <button class="maBtn" id="maRename">改名</button>
              <span style="font-size:12px;opacity:.75;font-weight:900">${renameCost === 0 ? "第 1 次改名免費" : `改名費用 ${renameCost} Gem`}</span>
            </div>
          </div>
        </div>

        <div class="maStats">
          <div class="maPill">Gold ${gold}</div>
          <div class="maPill">Gem ${gem}</div>
          <div class="maPill">票 ${vote}</div>
          <div class="maPill">成品 ${collectionsUnlocked}</div>
          <div class="maPill">作品 ${worksCount}</div>
          <div class="maPill">粉絲 ${followers}</div>
          <div class="maPill">Like ${likesReceived}</div>
        </div>
      </div>

      <div class="maModal" id="maModal">
        <div class="maBack"></div>
        <div class="maCard">
          <div class="top">
            <div class="title">修改遊戲名</div>
            <div class="x" id="maClose">關閉</div>
          </div>
          <div style="font-size:12px;opacity:.75;line-height:1.4;font-weight:900">
            規則 第 1 次免費 之後每次 50 Gem
          </div>
          <label>新遊戲名</label>
          <input id="maNameInput" maxlength="20" value="${escapeAttr(name)}" />
          <div class="maHint" id="maCostHint">${renameCost === 0 ? "本次費用 0 Gem" : `本次費用 ${renameCost} Gem 目前 Gem ${gem}`}</div>
          <div class="row">
            <button class="maBtn" id="maSubmit">確認修改</button>
          </div>
        </div>
      </div>
    `;

    const avatarEl = mount.querySelector(".maAvatar");
    if(avatarEl){
      avatarEl.addEventListener("click", ()=>{ location.href = "recipes.html"; });
    }
    const goBtn = mount.querySelector("#maGoRecipes");
    if(goBtn) goBtn.onclick = ()=>{ location.href = "recipes.html"; };

    const modal = mount.querySelector("#maModal");
    const open = mount.querySelector("#maRename");
    const close = mount.querySelector("#maClose");
    const back = mount.querySelector(".maBack");
    const submit = mount.querySelector("#maSubmit");
    const input = mount.querySelector("#maNameInput");

    function showModal(){ if(modal) modal.classList.add("show"); if(input) input.focus(); }
    function hideModal(){ if(modal) modal.classList.remove("show"); }

    if(open) open.onclick = showModal;
    if(close) close.onclick = hideModal;
    if(back) back.onclick = hideModal;

    if(submit){
      submit.onclick = async ()=>{
        const newName = String(input?.value || "").trim();
        if(!newName){ toast("遊戲名不能為空"); return; }
        submit.disabled = true;
        try{
          const r = await api("/api/me/name", { method:"POST", body: JSON.stringify({ userName: newName }) });
          if(!r || !r.ok){
            if(r && r.error === "insufficient_gem"){
              toast(`Gem 不足 需要 ${fmtInt(r.need)} 目前 ${fmtInt(r.have)}`);
            }else{
              toast("修改失敗");
            }
            return;
          }
          // Update local cache
          setName(newName);
          APP.name = newName;
          hideModal();
          toast(r.cost ? `已修改 扣除 ${fmtInt(r.cost)} Gem` : "已修改");
          // Re-render to refresh values
          mount.dataset.rendering = "0";
          await mountMasterAccountBar();
        }catch(e){
          toast("修改失敗");
        }finally{
          submit.disabled = false;
        }
      };
    }

    mount.dataset.rendering = "0";
  }catch(e){
    // silent
  }
}

function escapeHtml(str){
  return String(str || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}
function escapeAttr(str){ return escapeHtml(str).replaceAll("\n"," ").replaceAll("\r"," "); }
/* ===== End Master Account Bar ===== */

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

window.mountMasterAccountBar = mountMasterAccountBar;
