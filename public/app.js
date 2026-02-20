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

/* === ACF i18n (auto language + in-game switch) === */
(function(){
  const LANG_KEY = "acf_lang";
  const SUPPORTED = ["en","zh-Hant","zh-Hans","ja","ko"];

  const STR = {
    "en": {
      "lang.name": "English",
      "net.connecting": "Connecting",
      "net.online": "Online",
      "net.offline": "Offline",
      "master.lv": "Lv",
      "master.score": "Score",
      "master.player": "Player",
      "lang.label": "Language",

      "gallery.sort.new": "Newest",
      "gallery.sort.top": "Top Score",
      "gallery.season.all": "All Seasons",
      "gallery.loading": "Loading",
      "gallery.podium": "🏆 Season Podium",
      "gallery.recommended": "🔥 Recommended",
      "gallery.recommended.sub": "Recommendations ≥ 1 · Sorted by recommendations",
      "gallery.favRank": "💖 Favorites",
      "gallery.favRank.sub": "All seasons · Sorted by favorites",
      "gallery.newcomerRank": "🆕 Newcomers",
      "gallery.newcomerRank.sub": "Accounts within 30 days · Sorted by favorites",
      "gallery.authorRank": "👑 Popular Creators",
      "gallery.authorRank.sub": "All seasons · Sorted by followers",

      "recipes.tab.saves": "My Works",
      "recipes.tab.recipes": "My Collection",
      "recipes.preview": "Preview",
      "recipes.close": "Close",

      "shop.buyNow": "Buy Now",
      "shop.bonus": "Bonus {n} Gems",
      "shop.created": "Checkout created. Redirecting",
      "shop.noWorker": "Worker API Base is empty (offline or WORKER_BASE not set)."
    },
    "zh-Hant": {
      "lang.name": "繁體中文",
      "net.connecting": "連線中",
      "net.online": "線上",
      "net.offline": "離線",
      "master.lv": "Lv",
      "master.score": "評分",
      "master.player": "玩家",
      "lang.label": "語言",

      "gallery.sort.new": "最新",
      "gallery.sort.top": "最高分",
      "gallery.season.all": "全部 Season",
      "gallery.loading": "讀取中",
      "gallery.podium": "🏆 本期頒獎台",
      "gallery.recommended": "🔥 本期推薦",
      "gallery.recommended.sub": "推薦次數 ≥ 1 · 依推薦次數排序",
      "gallery.favRank": "💖 收藏榜",
      "gallery.favRank.sub": "不限賽季 · 依被收藏數排序",
      "gallery.newcomerRank": "🆕 新手衝分榜",
      "gallery.newcomerRank.sub": "註冊 30 天內 · 依帳號評分排序",
      "gallery.authorRank": "👑 熱門作者榜",
      "gallery.authorRank.sub": "不限賽季 · 依被關注數排序",

      "recipes.tab.saves": "我的成品",
      "recipes.tab.recipes": "我的收藏",
      "recipes.preview": "預覽",
      "recipes.close": "關閉",

      "shop.buyNow": "立即購買",
      "shop.bonus": "加送 {n} Gem",
      "shop.created": "已建立 Stripe Checkout，轉跳中",
      "shop.noWorker": "Worker API Base 為空（看起來你在本機離線模式，或 app.js 的 WORKER_BASE 沒設定）。"
    },
    "zh-Hans": {
      "lang.name": "简体中文",
      "net.connecting": "连接中",
      "net.online": "在线",
      "net.offline": "离线",
      "master.lv": "Lv",
      "master.score": "评分",
      "master.player": "玩家",
      "lang.label": "语言",

      "gallery.sort.new": "最新",
      "gallery.sort.top": "最高分",
      "gallery.season.all": "全部 赛季",
      "gallery.loading": "读取中",
      "gallery.podium": "🏆 本期领奖台",
      "gallery.recommended": "🔥 本期推荐",
      "gallery.recommended.sub": "推荐次数 ≥ 1 · 按推荐次数排序",
      "gallery.favRank": "💖 收藏榜",
      "gallery.favRank.sub": "不限赛季 · 按被收藏数排序",
      "gallery.newcomerRank": "🆕 新手冲分榜",
      "gallery.newcomerRank.sub": "注册 30 天内 · 按账号评分排序",
      "gallery.authorRank": "👑 热门作者榜",
      "gallery.authorRank.sub": "不限赛季 · 按被关注数排序",

      "recipes.tab.saves": "我的作品",
      "recipes.tab.recipes": "我的收藏",
      "recipes.preview": "预览",
      "recipes.close": "关闭",

      "shop.buyNow": "立即购买",
      "shop.bonus": "加送 {n} 宝石",
      "shop.created": "已创建结账页面，正在跳转",
      "shop.noWorker": "Worker API Base 为空（可能是离线模式，或未设置 WORKER_BASE）。"
    },
    "ja": {
      "lang.name": "日本語",
      "net.connecting": "接続中",
      "net.online": "オンライン",
      "net.offline": "オフライン",
      "master.lv": "Lv",
      "master.score": "スコア",
      "master.player": "プレイヤー",
      "lang.label": "言語",

      "gallery.sort.new": "新着",
      "gallery.sort.top": "最高スコア",
      "gallery.season.all": "全シーズン",
      "gallery.loading": "読み込み中",
      "gallery.podium": "🏆 シーズン表彰台",
      "gallery.recommended": "🔥 おすすめ",
      "gallery.recommended.sub": "おすすめ回数 ≥ 1 · おすすめ順",
      "gallery.favRank": "💖 お気に入り",
      "gallery.favRank.sub": "全シーズン · お気に入り数順",
      "gallery.newcomerRank": "🆕 新規ランキング",
      "gallery.newcomerRank.sub": "30日以内 · アカウントスコア順",
      "gallery.authorRank": "👑 人気クリエイター",
      "gallery.authorRank.sub": "全シーズン · フォロー数順",

      "recipes.tab.saves": "作品",
      "recipes.tab.recipes": "コレクション",
      "recipes.preview": "プレビュー",
      "recipes.close": "閉じる",

      "shop.buyNow": "購入",
      "shop.bonus": "ボーナス {n} ジェム",
      "shop.created": "チェックアウト作成済み。移動中",
      "shop.noWorker": "Worker API Base が空です（オフライン、または WORKER_BASE 未設定）。"
    },
    "ko": {
      "lang.name": "한국어",
      "net.connecting": "연결 중",
      "net.online": "온라인",
      "net.offline": "오프라인",
      "master.lv": "Lv",
      "master.score": "점수",
      "master.player": "플레이어",
      "lang.label": "언어",

      "gallery.sort.new": "최신",
      "gallery.sort.top": "최고 점수",
      "gallery.season.all": "전체 시즌",
      "gallery.loading": "불러오는 중",
      "gallery.podium": "🏆 시즌 시상대",
      "gallery.recommended": "🔥 추천",
      "gallery.recommended.sub": "추천 ≥ 1 · 추천순",
      "gallery.favRank": "💖 즐겨찾기",
      "gallery.favRank.sub": "전체 시즌 · 즐겨찾기 수",
      "gallery.newcomerRank": "🆕 신규 랭킹",
      "gallery.newcomerRank.sub": "30일 이내 · 계정 점수",
      "gallery.authorRank": "👑 인기 제작자",
      "gallery.authorRank.sub": "전체 시즌 · 팔로우 수",

      "recipes.tab.saves": "내 작품",
      "recipes.tab.recipes": "내 컬렉션",
      "recipes.preview": "미리보기",
      "recipes.close": "닫기",

      "shop.buyNow": "구매",
      "shop.bonus": "보너스 {n} 젬",
      "shop.created": "결제 생성됨. 이동 중",
      "shop.noWorker": "Worker API Base가 비어 있습니다(오프라인 또는 WORKER_BASE 미설정)."
    }
  };

  function normLang(raw){
    const s = String(raw||"").trim();
    if(!s) return "";
    const low = s.toLowerCase();
    if(low.startsWith("zh-tw") || low.startsWith("zh-hk") || low.startsWith("zh-mo") || low.includes("hant")) return "zh-Hant";
    if(low.startsWith("zh")) return "zh-Hans";
    if(low.startsWith("ja")) return "ja";
    if(low.startsWith("ko")) return "ko";
    return "en";
  }

  function getLang(){
    const saved = localStorage.getItem(LANG_KEY);
    if(saved && SUPPORTED.includes(saved)) return saved;
    const detected = normLang(navigator.language || navigator.userLanguage || "en");
    return SUPPORTED.includes(detected) ? detected : "en";
  }

  function setLang(lang){
    const l = SUPPORTED.includes(lang) ? lang : "en";
    localStorage.setItem(LANG_KEY, l);
    applyLang(l);
  }

  function fmt(s, vars){
    let out = String(s||"");
    const v = vars || {};
    out = out.replace(/\{(\w+)\}/g, (_,k)=> (v[k]!==undefined ? String(v[k]) : `{${k}}`));
    return out;
  }

  function t(key, fallback, vars){
    const lang = getLang();
    const dict = STR[lang] || STR["en"] || {};
    const base = (dict[key] !== undefined) ? dict[key] : ((STR["en"]||{})[key]);
    const val = (base !== undefined) ? base : (fallback !== undefined ? fallback : key);
    return fmt(val, vars);
  }

  function applyI18nAttrs(root){
    const r = root || document;
    r.querySelectorAll("[data-i18n]").forEach(el=>{
      const key = el.getAttribute("data-i18n");
      const fb = el.getAttribute("data-i18n-fallback") || el.textContent;
      el.textContent = t(key, fb);
    });
    r.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
      const key = el.getAttribute("data-i18n-placeholder");
      const fb = el.getAttribute("placeholder") || "";
      el.setAttribute("placeholder", t(key, fb));
    });
    r.querySelectorAll("[data-i18n-title]").forEach(el=>{
      const key = el.getAttribute("data-i18n-title");
      const fb = el.getAttribute("title") || "";
      el.setAttribute("title", t(key, fb));
    });
  }

  function applyLang(lang){
    try{ document.documentElement.setAttribute("lang", lang); }catch(_){}

    // Master header bits
    try{
      const net = document.getElementById("acfMasterNet");
      if(net){
        const s = net.textContent || "";
        if(s.toLowerCase().includes("connect")) net.textContent = t("net.connecting", s);
        if(s.toLowerCase() === "online") net.textContent = t("net.online", s);
        if(s.toLowerCase() === "offline") net.textContent = t("net.offline", s);
      }
    }catch(_){}

    // Gallery page (id-based)
    const p = (location.pathname || "").toLowerCase();
    if(p.includes("gallery")){
      try{
        const sortSel = document.getElementById("sortSel");
        if(sortSel){
          const optNew = sortSel.querySelector("option[value='new']");
          const optTop = sortSel.querySelector("option[value='top']");
          if(optNew) optNew.textContent = t("gallery.sort.new", optNew.textContent);
          if(optTop) optTop.textContent = t("gallery.sort.top", optTop.textContent);
        }
        const seasonSel = document.getElementById("seasonSel");
        if(seasonSel){
          const optAll = seasonSel.querySelector("option[value='']");
          if(optAll) optAll.textContent = t("gallery.season.all", optAll.textContent);
        }
        const statusLine = document.getElementById("statusLine");
        if(statusLine && /讀取中|loading/i.test(statusLine.textContent||"")) statusLine.textContent = t("gallery.loading", statusLine.textContent);

        const podiumTitle = document.getElementById("podiumTitle");
        if(podiumTitle) podiumTitle.textContent = t("gallery.podium", podiumTitle.textContent);

        const recWrap = document.getElementById("recWrap");
        if(recWrap){
          const h = recWrap.querySelector(".recTitle .h");
          const sub = document.getElementById("recSub") || recWrap.querySelector(".recTitle .sub");
          if(h) h.textContent = t("gallery.recommended", h.textContent);
          if(sub) sub.textContent = t("gallery.recommended.sub", sub.textContent);
        }
        const favRankWrap = document.getElementById("favRankWrap");
        if(favRankWrap){
          const h = favRankWrap.querySelector(".recTitle .h");
          const sub = favRankWrap.querySelector(".recTitle .sub");
          if(h) h.textContent = t("gallery.favRank", h.textContent);
          if(sub) sub.textContent = t("gallery.favRank.sub", sub.textContent);
        }
        const newRankWrap = document.getElementById("newRankWrap");
        if(newRankWrap){
          const h = newRankWrap.querySelector(".recTitle .h");
          const sub = newRankWrap.querySelector(".recTitle .sub");
          if(h) h.textContent = t("gallery.newcomerRank", h.textContent);
          if(sub) sub.textContent = t("gallery.newcomerRank.sub", sub.textContent);
        }
        const authorRankWrap = document.getElementById("authorRankWrap");
        if(authorRankWrap){
          const h = authorRankWrap.querySelector(".recTitle .h");
          const sub = authorRankWrap.querySelector(".recTitle .sub");
          if(h) h.textContent = t("gallery.authorRank", h.textContent);
          if(sub) sub.textContent = t("gallery.authorRank.sub", sub.textContent);
        }
      }catch(_){}
    }

    // Recipes page
    if(p.includes("recipes")){
      try{
        const tabSaves = document.getElementById("tabSaves");
        const tabRecipes = document.getElementById("tabRecipes");
        if(tabSaves) tabSaves.textContent = t("recipes.tab.saves", tabSaves.textContent);
        if(tabRecipes) tabRecipes.textContent = t("recipes.tab.recipes", tabRecipes.textContent);
        const modalTitle = document.getElementById("modalTitle");
        if(modalTitle) modalTitle.textContent = t("recipes.preview", modalTitle.textContent);
        const modalClose = document.getElementById("modalClose");
        if(modalClose) modalClose.textContent = t("recipes.close", modalClose.textContent);
        const statusLine = document.getElementById("statusLine");
        if(statusLine && /讀取中|loading/i.test(statusLine.textContent||"")) statusLine.textContent = t("gallery.loading", statusLine.textContent);
      }catch(_){}
    }

    // Apply attributes everywhere (optional)
    applyI18nAttrs(document);
  }

  function init(){
    const l = getLang();
    applyLang(l);
  }

  window.ACF_getLang = getLang;
  window.ACF_setLang = setLang;
  window.ACF_t = t;
  window.ACF_applyLang = applyLang;

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init, { once:true });
  }else{
    init();
  }
})();

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
       .acf-masterRight{
         display:flex;
         align-items:center;
         justify-content:flex-end;
         gap: 10px;
         min-width: 0;
         pointer-events: auto;
       }
       .acf-langSel{
         pointer-events:auto;
         height: 36px;
         padding: 0 10px;
         border-radius: 12px;
         border: 1px solid rgba(255,214,102,0.55);
         background: rgba(12,14,18,0.45);
         color: rgba(255,245,220,0.92);
         font-weight: 800;
         letter-spacing: 0.2px;
         outline: none;
         backdrop-filter: blur(8px);
       }
       .acf-langSel option{ color: #0b0d12; }


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
    net.textContent = (window.ACF_t ? window.ACF_t("net.connecting","Connecting") : "Connecting");

    txt.appendChild(name);
    txt.appendChild(sub);
    txt.appendChild(net);

    left.appendChild(avatar);
    left.appendChild(txt);

    const stats = el("div","acf-masterStats");
    stats.id = "acfMasterStats";

    const right = el("div","acf-masterRight");

// language select
const langSel = el("select","acf-langSel");
langSel.id = "acfLangSel";
langSel.innerHTML = `
  <option value="en">EN</option>
  <option value="zh-Hant">繁</option>
  <option value="zh-Hans">简</option>
  <option value="ja">JP</option>
  <option value="ko">KR</option>
`;
// init + bind
try{
  if(typeof window.ACF_getLang === "function") langSel.value = window.ACF_getLang();
}catch(_){}
langSel.addEventListener("change", ()=>{
  try{
    if(typeof window.ACF_setLang === "function") window.ACF_setLang(langSel.value);
  }catch(_){}
});

right.appendChild(stats);
right.appendChild(langSel);

bar.appendChild(left);
bar.appendChild(right);
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
    let label = (window.ACF_t ? window.ACF_t("net.connecting","Connecting") : "Connecting");
    let cls = "net-connecting";
    if(s === "online"){
      label = (window.ACF_t ? window.ACF_t("net.online","Online") : "Online");
      cls = "net-online";
    }else if(s === "offline"){
      label = (window.ACF_t ? window.ACF_t("net.offline","Offline") : "Offline");
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
    nameEl.textContent = String(acc.userName || (window.ACF_t ? window.ACF_t("master.player","Player") : "Player"));
    subEl.textContent = (window.ACF_t ? (window.ACF_t("master.lv","Lv") + " ") : "Lv ") + String(Number(acc.level || 1)) + (acc.userRegion ? (" · " + String(acc.userRegion)) : "") + " · " + (window.ACF_t ? window.ACF_t("master.score","Score") : "Score") + " " + String(Number(acc.accountScore||0));

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
