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


/* =========================
   i18n (auto + in-game switch)
========================= */
const ACF_I18N = (function(){
  const STR = {
    "en": {
      net_connecting:"Connecting",
      net_online:"Online",
      net_offline:"Offline",
      player_default:"Player",
      lv:"Lv",
      score:"Score",
      region_na:"NA",
      lang_label:"Language",
      studio_unselectable:"Unavailable",
      studio_not_enough_assets:"Not enough assets",
      recipes_total_builds:"Total {n} builds",
      recipes_total_recipes:"Total {n} recipes",
      recipes_set_avatar:"Set as Avatar",
      recipes_current_avatar:"Current Avatar",
      recipes_showcase:"Showcase",
      recipes_showcasing:"Showcasing",
      recipes_locked:"Locked",
      loading:"Loading",
      gallery_follow:"Follow",
      gallery_followed:"Following",
      gallery_favorite:"Favorite",
      gallery_favorited:"Favorited",
      gallery_recommend:"Recommend",
      gallery_recommended:"Recommended",
      gallery_vote:"Vote",
      gallery_voted:"Voted",
      gacha_topup_msg:"Top up Gold and Gems to enhance your pulls",
      gacha_go_shop:"Go to Shop",
      gacha_drop_rate:"Drop Rate",
      gacha_pity:"Guaranteed in {n} pulls",
      gacha_guaranteed:"Guaranteed",
      gacha_or_above:"or above",
      shop_bonus:"Bonus",
      shop_buy_now:"Buy Now",
      shop_checkout:"Stripe Checkout",
      shop_balance_note:"Balance will not update instantly. It will update after Stripe webhook is received to prevent client-side cheating."
    },
    "zh-Hant": {
      net_connecting:"連線中",
      net_online:"Online",
      net_offline:"Offline",
      player_default:"Player",
      lv:"Lv",
      score:"Score",
      region_na:"NA",
      lang_label:"語言",
      studio_unselectable:"不可選",
      studio_not_enough_assets:"素材不足",
      recipes_total_builds:"共 {n} 個成品",
      recipes_total_recipes:"共 {n} 張 Recipes",
      recipes_set_avatar:"設為頭像",
      recipes_current_avatar:"當前頭像",
      recipes_showcase:"展示",
      recipes_showcasing:"展示中",
      recipes_locked:"未解鎖",
      loading:"讀取中",
      gallery_follow:"關注",
      gallery_followed:"已關注",
      gallery_favorite:"收藏",
      gallery_favorited:"已收藏",
      gallery_recommend:"推薦",
      gallery_recommended:"已推薦",
      gallery_vote:"投票",
      gallery_voted:"已投票",
      gacha_topup_msg:"補充 Gold 與 Gem 立刻提升抽卡體驗",
      gacha_go_shop:"前往 Shop",
      gacha_drop_rate:"素材獲得機率",
      gacha_pity:"再抽 {n} 次必出",
      gacha_guaranteed:"必出",
      gacha_or_above:"以上",
      shop_bonus:"加送",
      shop_buy_now:"立即購買",
      shop_checkout:"Stripe Checkout",
      shop_balance_note:"餘額不會立即更新，需等待 Stripe webhook 回寫以防止前端作弊。"
    },
    "zh-Hans": {
      net_connecting:"连接中",
      net_online:"在线",
      net_offline:"离线",
      player_default:"玩家",
      lv:"等级",
      score:"评分",
      region_na:"北美",
      lang_label:"语言",
      studio_unselectable:"不可选",
      studio_not_enough_assets:"素材不足",
      recipes_total_builds:"共 {n} 个成品",
      recipes_total_recipes:"共 {n} 张 Recipes",
      recipes_set_avatar:"设为头像",
      recipes_current_avatar:"当前头像",
      recipes_showcase:"展示",
      recipes_showcasing:"展示中",
      recipes_locked:"未解锁",
      loading:"读取中",
      gallery_follow:"关注",
      gallery_followed:"已关注",
      gallery_favorite:"收藏",
      gallery_favorited:"已收藏",
      gallery_recommend:"推荐",
      gallery_recommended:"已推荐",
      gallery_vote:"投票",
      gallery_voted:"已投票",
      gacha_topup_msg:"补充 Gold 与 Gem 立刻提升抽卡体验",
      gacha_go_shop:"前往 Shop",
      gacha_drop_rate:"素材获得概率",
      gacha_pity:"再抽 {n} 次必出",
      gacha_guaranteed:"必出",
      gacha_or_above:"以上",
      shop_bonus:"加送",
      shop_buy_now:"立即购买",
      shop_checkout:"Stripe Checkout",
      shop_balance_note:"余额不会立即更新，需要等待 Stripe webhook 回写以防前端作弊。"
    },
    "ja": {
      net_connecting:"接続中",
      net_online:"オンライン",
      net_offline:"オフライン",
      player_default:"Player",
      lv:"Lv",
      score:"Score",
      region_na:"NA",
      lang_label:"言語",
      studio_unselectable:"選択不可",
      studio_not_enough_assets:"素材不足",
      recipes_total_builds:"成品 {n} 件",
      recipes_total_recipes:"Recipes {n} 枚",
      recipes_set_avatar:"アバターに設定",
      recipes_current_avatar:"現在のアバター",
      recipes_showcase:"展示",
      recipes_showcasing:"展示中",
      recipes_locked:"未解放",
      loading:"読み込み中",
      gallery_follow:"フォロー",
      gallery_followed:"フォロー中",
      gallery_favorite:"お気に入り",
      gallery_favorited:"お気に入り済み",
      gallery_recommend:"おすすめ",
      gallery_recommended:"おすすめ済み",
      gallery_vote:"投票",
      gallery_voted:"投票済み",
      gacha_topup_msg:"Gold と Gem を補充してガチャ体験を向上",
      gacha_go_shop:"ショップへ",
      gacha_drop_rate:"ドロップ率",
      gacha_pity:"保証まであと {n} 回",
      gacha_guaranteed:"保証",
      gacha_or_above:"以上",
      shop_bonus:"ボーナス",
      shop_buy_now:"購入",
      shop_checkout:"Stripe Checkout",
      shop_balance_note:"残高はすぐに更新されません。Stripe webhook 反映後に更新されます。"
    },
    "ko": {
      net_connecting:"연결 중",
      net_online:"온라인",
      net_offline:"오프라인",
      player_default:"Player",
      lv:"Lv",
      score:"Score",
      region_na:"NA",
      lang_label:"언어",
      studio_unselectable:"선택 불가",
      studio_not_enough_assets:"소재 부족",
      recipes_total_builds:"성품 {n}개",
      recipes_total_recipes:"Recipes {n}장",
      recipes_set_avatar:"아바타 설정",
      recipes_current_avatar:"현재 아바타",
      recipes_showcase:"전시",
      recipes_showcasing:"전시 중",
      recipes_locked:"잠김",
      loading:"로딩 중",
      gallery_follow:"팔로우",
      gallery_followed:"팔로잉",
      gallery_favorite:"즐겨찾기",
      gallery_favorited:"즐겨찾기됨",
      gallery_recommend:"추천",
      gallery_recommended:"추천됨",
      gallery_vote:"투표",
      gallery_voted:"투표됨",
      gacha_topup_msg:"Gold와 Gem을 충전하여 가챠 경험 향상",
      gacha_go_shop:"상점으로",
      gacha_drop_rate:"드롭 확률",
      gacha_pity:"보장까지 {n}회",
      gacha_guaranteed:"보장",
      gacha_or_above:"이상",
      shop_bonus:"보너스",
      shop_buy_now:"구매",
      shop_checkout:"Stripe Checkout",
      shop_balance_note:"잔액은 즉시 업데이트되지 않으며 Stripe webhook 반영 후 업데이트됩니다."
    }
  };

  const LANGS = [
    { code:"en", label:"English" },
    { code:"zh-Hant", label:"繁體中文" },
    { code:"zh-Hans", label:"简体中文" },
    { code:"ja", label:"日本語" },
    { code:"ko", label:"한국어" }
  ];

  function normalizeLang(code){
    const c = String(code||"").toLowerCase();
    if(c.startsWith("zh-hans")||c.startsWith("zh-cn")||c.startsWith("zh-sg")) return "zh-Hans";
    if(c.startsWith("zh-hant")||c.startsWith("zh-tw")||c.startsWith("zh-hk")||c.startsWith("zh-mo")) return "zh-Hant";
    if(c.startsWith("zh")) return "zh-Hant";
    if(c.startsWith("ja")) return "ja";
    if(c.startsWith("ko")) return "ko";
    return "en";
  }

  function getLang(){
    return normalizeLang(localStorage.getItem("acf_lang") || navigator.language || "en");
  }

  function setLang(code){
    const lang = normalizeLang(code);
    localStorage.setItem("acf_lang", lang);
    location.reload();
  }

  function t(key, vars){
    const lang = getLang();
    let s = (STR[lang] && STR[lang][key]) ? STR[lang][key] : ((STR.en && STR.en[key]) ? STR.en[key] : key);
    if(vars){
      for(const k in vars){
        s = s.split("{"+k+"}").join(String(vars[k]));
      }
    }
    return s;
  }

  function apply(root=document){
    const nodes = root.querySelectorAll("[data-i18n]");
    nodes.forEach(n=>{
      const k = n.getAttribute("data-i18n");
      if(!k) return;
      n.textContent = t(k);
    });
    const ph = root.querySelectorAll("[data-i18n-placeholder]");
    ph.forEach(n=>{
      const k = n.getAttribute("data-i18n-placeholder");
      if(!k) return;
      n.setAttribute("placeholder", t(k));
    });
    const tt = root.querySelectorAll("[data-i18n-title]");
    tt.forEach(n=>{
      const k = n.getAttribute("data-i18n-title");
      if(!k) return;
      n.setAttribute("title", t(k));
    });
  }

  function makeLangSelect(){
    const wrap = el("div","acf-langWrap");
    const sel = el("select","acf-langSel");
    sel.id = "acfLangSel";
    LANGS.forEach(o=>{
      const opt = document.createElement("option");
      opt.value = o.code;
      opt.textContent = o.label;
      sel.appendChild(opt);
    });
    sel.value = getLang();
    sel.addEventListener("change", ()=>setLang(sel.value));
    wrap.appendChild(sel);
    return wrap;
  }

  return { t, apply, getLang, setLang, makeLangSelect };
})();

window.ACF_t = ACF_I18N.t;
window.ACF_applyI18n = ACF_I18N.apply;
window.ACF_getLang = ACF_I18N.getLang;
window.ACF_setLang = ACF_I18N.setLang;
/* ========================= */

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
    net.textContent = ACF_t("net_connecting");

    txt.appendChild(name);
    txt.appendChild(sub);
    txt.appendChild(net);

    left.appendChild(avatar);
    left.appendChild(txt);

    const stats = el("div","acf-masterStats");
    stats.id = "acfMasterStats";

    bar.appendChild(left);
    const langSel = ACF_I18N.makeLangSelect();
    bar.appendChild(langSel);
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
    let label = ACF_t("net_connecting");
    let cls = "net-connecting";
    if(s === "online"){
      label = ACF_t("net_online");
      cls = "net-online";
    }else if(s === "offline"){
      label = ACF_t("net_offline");
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
    nameEl.textContent = String(acc.userName || ACF_t("player_default"));
    subEl.textContent = ACF_t("lv") + " " + String(Number(acc.level || 1)) + (acc.userRegion ? (" · " + String(acc.userRegion)) : "") + " · " + ACF_t("score") + " " + String(Number(acc.accountScore||0));

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
