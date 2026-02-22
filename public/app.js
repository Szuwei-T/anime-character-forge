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


/* i18n */
const ACF_I18N = (() => {
  const KEY = "acf_lang";

  const STR = {
    "en": {
      login_title: "Anime Character Forge Sign In",
      login_email_signin: "Email Sign In",
      login_email_signup: "Email Sign Up",
      login_google: "Sign in with Google",
      login_microsoft: "Sign in with Microsoft",
      login_apple: "Sign in with Apple",
      common_or: "or",
      login_hint: "Sign in first. After signing in, you will go straight to your gallery.",
      login_provider_hint: "If you use Microsoft or Apple, enable the provider in Firebase Auth first, or it will show an error.",
      status_logged_in: "Signed in",
      status_not_logged_in: "Not signed in",
      btn_logout: "Sign out",

      filter_latest: "Latest",
      filter_topscore: "Top Score",
      common_loading: "Loading",
      common_works: "Works",
      common_close: "Close",
      gallery_podium: "Season Podium",
      gallery_recommended: "Recommended",
      gallery_favorites: "Favorites",
      gallery_newcomers: "Newcomers",
      gallery_authors: "Top Authors",
      gallery_season_all: "All Seasons",
      gallery_recommended_desc: "Recommended 1+ times, sorted by recommendations",
      gallery_favorites_desc: "All seasons, sorted by favorites",
      gallery_newcomers_desc: "Accounts within 1 month, sorted by favorites",
      gallery_authors_desc: "All seasons, sorted by followers",

      gacha_title: "Gacha",
      gacha_drawing: "Drawing",
      gacha_congrats: "Congrats!",
      common_confirm: "Confirm",
      gacha_normal: "Standard",
      gacha_premium: "Premium",
      gacha_one: "1x",
      gacha_ten: "10x",
      gacha_results_10: "10 Draw Results",
      gacha_guarantee: "Guaranteed",
      gacha_or_higher: "or higher",
      gacha_recharge: "Top up",
      gacha_go_shop: "Go to Shop",
      gacha_share: "One click share",
      gacha_copy: "Copy caption",
      gacha_download: "Download image",
      gacha_claim_reward: "Claim reward",
      gacha_want_more: "Want more pulls",
      common_and: "and",
      gacha_draw_char: "Draw Character",
      gacha_draw_outfit: "Draw Outfit",
      gacha_draw_bg: "Draw Background",
      gacha_draw_fx1: "Draw FX 1",
      gacha_draw_fx2: "Draw FX 2",

      recipes_my_builds: "My Builds",
      recipes_my_favs: "My Favorites",
      recipes_gallery: "Gallery",
      common_preview: "Preview",

      studio_title: "Studio",
      studio_head: "Head",
      studio_body: "Body",
      studio_bg: "Background",
      studio_save: "Save",
      studio_random: "Random",
      studio_to_gallery: "Go to Gallery",

      user_title: "Player",
      common_back: "Back",
      btn_follow: "Follow",
      user_preview: "Work Preview",
      user_followers0: "Followers 0",
      user_following0: "Following 0",

      shop_title: "Shop",
      shop_plans: "Top up plans",
      shop_page_title: "DREAM LEAGUE BASEBALL Shop",
      shop_redirect_hint: "If it does not redirect automatically, check whether your browser blocked the redirect.",
      shop_offline_hint: "If you are in offline mode, use the online site or make sure WORKER_BASE is set.",
      shop_webhook_hint: "Balance will not update instantly. It will update after Stripe webhook is received to prevent client-side cheating.",

      net_connecting: "Connecting",
      net_online: "Online",
      net_offline: "Offline",
      label_lv: "Lv",
      label_score: "Score",
      label_player: "Player",
      label_lang: "Language",
      lang_en: "English",
      lang_zh_hant: "繁體中文",
      lang_zh_hans: "简体中文",
      lang_ja: "日本語",
      lang_ko: "한국어",
    },
    "zh-Hant": {
      login_title: "Anime Character Forge 登入",
      login_email_signin: "Email 登入",
      login_email_signup: "Email 註冊",
      login_google: "使用 Google 登入",
      login_microsoft: "使用 Microsoft 登入",
      login_apple: "使用 Apple 登入",
      common_or: "或",
      login_hint: "先登入，登入後會直接進入作品庫",
      login_provider_hint: "如果你用 Microsoft 或 Apple 登入，需要先在 Firebase Auth 裡啟用對應的 Provider，否則會顯示錯誤。",
      status_logged_in: "目前登入",
      status_not_logged_in: "未登入",
      btn_logout: "登出",

      filter_latest: "最新",
      filter_topscore: "最高分",
      common_loading: "讀取中",
      common_works: "作品",
      common_close: "關閉",
      gallery_podium: "🏆 本期頒獎台",
      gallery_recommended: "🔥 本期推薦",
      gallery_favorites: "💖 收藏榜",
      gallery_newcomers: "🆕 新人榜",
      gallery_authors: "👑 熱門作者榜",
      gallery_season_all: "全部 Season",
      gallery_recommended_desc: "推薦次數 ≥ 1 · 依推薦次數排序",
      gallery_favorites_desc: "不限賽季 · 依被收藏數排序",
      gallery_newcomers_desc: "註冊 1 個月內 · 依被收藏數排序",
      gallery_authors_desc: "不限賽季 · 依被關注數排序",

      gacha_title: "抽卡",
      gacha_drawing: "抽卡中",
      gacha_congrats: "恭喜獲得",
      common_confirm: "確認",
      gacha_normal: "普通抽卡",
      gacha_premium: "高級抽卡",
      gacha_one: "1次",
      gacha_ten: "10次",
      gacha_results_10: "10連抽結果",
      gacha_guarantee: "必出",
      gacha_or_higher: "以上",
      gacha_recharge: "補充",
      gacha_go_shop: "去充值",
      gacha_share: "一鍵分享",
      gacha_copy: "複製文案",
      gacha_download: "下載圖片",
      gacha_claim_reward: "領取獎勵",
      gacha_want_more: "想抽更爽",
      common_and: "與",
      gacha_draw_char: "抽角色",
      gacha_draw_outfit: "抽服裝",
      gacha_draw_bg: "抽背景",
      gacha_draw_fx1: "抽特效1",
      gacha_draw_fx2: "抽特效2",

      recipes_my_builds: "我的成品",
      recipes_my_favs: "我的收藏",
      recipes_gallery: "成品庫",
      common_preview: "預覽",

      studio_title: "工作室 - 進階版",
      studio_head: "頭部",
      studio_body: "身體",
      studio_bg: "背景",
      studio_save: "保存",
      studio_random: "隨機搭配",
      studio_to_gallery: "去看成品庫",

      user_title: "玩家",
      common_back: "返回",
      btn_follow: "關注",
      user_preview: "作品預覽",
      user_followers0: "粉絲 0",
      user_following0: "關注 0",

      shop_title: "商城",
      shop_plans: "充值方案",
      shop_page_title: "DREAM LEAGUE BASEBALL 商城",
      shop_redirect_hint: "如果沒有自動跳轉，請確認瀏覽器沒有阻擋重新導向。",
      shop_offline_hint: "若你在本機離線模式，請用線上環境或確認 WORKER_BASE 已設定。",
      shop_webhook_hint: "付款完成後不會立刻入帳。後端收到 Stripe webhook 才入帳，避免前端作弊。",

      net_connecting: "Connecting",
      net_online: "Online",
      net_offline: "Offline",
      label_lv: "Lv",
      label_score: "Score",
      label_player: "Player",
      label_lang: "語言",
      lang_en: "English",
      lang_zh_hant: "繁體中文",
      lang_zh_hans: "简体中文",
      lang_ja: "日本語",
      lang_ko: "한국어",
    },
    "zh-Hans": {
      login_title: "Anime Character Forge 登录",
      login_email_signin: "Email 登录",
      login_email_signup: "Email 注册",
      login_google: "使用 Google 登录",
      login_microsoft: "使用 Microsoft 登录",
      login_apple: "使用 Apple 登录",
      common_or: "或",
      login_hint: "先登录，登录后会直接进入作品库",
      login_provider_hint: "如果你用 Microsoft 或 Apple 登录，需要先在 Firebase Auth 里启用对应的 Provider，否则会显示错误。",
      status_logged_in: "当前已登录",
      status_not_logged_in: "未登录",
      btn_logout: "退出登录",

      filter_latest: "最新",
      filter_topscore: "最高分",
      common_loading: "读取中",
      common_works: "作品",
      common_close: "关闭",
      gallery_podium: "🏆 本期领奖台",
      gallery_recommended: "🔥 本期推荐",
      gallery_favorites: "💖 收藏榜",
      gallery_newcomers: "🆕 新人榜",
      gallery_authors: "👑 热门作者榜",
      gallery_season_all: "全部 Season",
      gallery_recommended_desc: "推荐次数 ≥ 1 · 按推荐次数排序",
      gallery_favorites_desc: "不限赛季 · 按被收藏数排序",
      gallery_newcomers_desc: "注册 1 个月内 · 按被收藏数排序",
      gallery_authors_desc: "不限赛季 · 按被关注数排序",

      gacha_title: "抽卡",
      gacha_drawing: "抽卡中",
      gacha_congrats: "恭喜获得",
      common_confirm: "确认",
      gacha_normal: "普通抽卡",
      gacha_premium: "高级抽卡",
      gacha_one: "1次",
      gacha_ten: "10次",
      gacha_results_10: "10连抽结果",
      gacha_guarantee: "必出",
      gacha_or_higher: "以上",
      gacha_recharge: "补充",
      gacha_go_shop: "去充值",
      gacha_share: "一键分享",
      gacha_copy: "复制文案",
      gacha_download: "下载图片",
      gacha_claim_reward: "领取奖励",
      gacha_want_more: "想抽更爽",
      common_and: "与",
      gacha_draw_char: "抽角色",
      gacha_draw_outfit: "抽服装",
      gacha_draw_bg: "抽背景",
      gacha_draw_fx1: "抽特效1",
      gacha_draw_fx2: "抽特效2",

      recipes_my_builds: "我的成品",
      recipes_my_favs: "我的收藏",
      recipes_gallery: "成品库",
      common_preview: "预览",

      studio_title: "工作室",
      studio_head: "头部",
      studio_body: "身体",
      studio_bg: "背景",
      studio_save: "保存",
      studio_random: "随机搭配",
      studio_to_gallery: "去看成品库",

      user_title: "玩家",
      common_back: "返回",
      btn_follow: "关注",
      user_preview: "作品预览",
      user_followers0: "粉丝 0",
      user_following0: "关注 0",

      shop_title: "商城",
      shop_plans: "充值方案",
      shop_page_title: "DREAM LEAGUE BASEBALL 商城",
      shop_redirect_hint: "如果没有自动跳转，请确认浏览器没有阻止重定向。",
      shop_offline_hint: "如果你在本机离线模式，请使用线上环境或确认 WORKER_BASE 已设置。",
      shop_webhook_hint: "付款完成后不会立刻入账。后端收到 Stripe webhook 才入账，避免前端作弊。",

      net_connecting: "Connecting",
      net_online: "Online",
      net_offline: "Offline",
      label_lv: "Lv",
      label_score: "Score",
      label_player: "Player",
      label_lang: "语言",
      lang_en: "English",
      lang_zh_hant: "繁體中文",
      lang_zh_hans: "简体中文",
      lang_ja: "日本語",
      lang_ko: "한국어",
    },
    "ja": {
      login_title: "Anime Character Forge ログイン",
      login_email_signin: "メールでログイン",
      login_email_signup: "メールで登録",
      login_google: "Google でログイン",
      login_microsoft: "Microsoft でログイン",
      login_apple: "Apple でログイン",
      common_or: "または",
      login_hint: "先にログインしてください。ログイン後はギャラリーへ移動します。",
      login_provider_hint: "Microsoft または Apple を使う場合、Firebase Auth で Provider を有効にしてください。無効だとエラーになります。",
      status_logged_in: "ログイン中",
      status_not_logged_in: "未ログイン",
      btn_logout: "ログアウト",

      filter_latest: "最新",
      filter_topscore: "最高スコア",
      common_loading: "読み込み中",
      common_works: "作品",
      common_close: "閉じる",
      gallery_podium: "🏆 今季の表彰台",
      gallery_recommended: "🔥 おすすめ",
      gallery_favorites: "💖 お気に入り",
      gallery_newcomers: "🆕 新人",
      gallery_authors: "👑 人気作者",
      gallery_season_all: "全シーズン",
      gallery_recommended_desc: "おすすめ 1 回以上 · おすすめ回数順",
      gallery_favorites_desc: "全シーズン · お気に入り数順",
      gallery_newcomers_desc: "登録 1 か月以内 · お気に入り数順",
      gallery_authors_desc: "全シーズン · フォロワー数順",

      gacha_title: "ガチャ",
      gacha_drawing: "抽選中",
      gacha_congrats: "獲得おめでとう",
      common_confirm: "確認",
      gacha_normal: "通常ガチャ",
      gacha_premium: "プレミアムガチャ",
      gacha_one: "1 回",
      gacha_ten: "10 回",
      gacha_results_10: "10 連結果",
      gacha_guarantee: "確定",
      gacha_or_higher: "以上",
      gacha_recharge: "補充",
      gacha_go_shop: "チャージへ",
      gacha_share: "ワンクリック共有",
      gacha_copy: "文言をコピー",
      gacha_download: "画像を保存",
      gacha_claim_reward: "報酬を受け取る",
      gacha_want_more: "もっと引きたい",
      common_and: "と",
      gacha_draw_char: "キャラ",
      gacha_draw_outfit: "衣装",
      gacha_draw_bg: "背景",
      gacha_draw_fx1: "エフェクト 1",
      gacha_draw_fx2: "エフェクト 2",

      recipes_my_builds: "自分の作品",
      recipes_my_favs: "自分のお気に入り",
      recipes_gallery: "ギャラリー",
      common_preview: "プレビュー",

      studio_title: "スタジオ",
      studio_head: "頭",
      studio_body: "体",
      studio_bg: "背景",
      studio_save: "保存",
      studio_random: "ランダム",
      studio_to_gallery: "ギャラリーへ",

      user_title: "プレイヤー",
      common_back: "戻る",
      btn_follow: "フォロー",
      user_preview: "作品プレビュー",
      user_followers0: "フォロワー 0",
      user_following0: "フォロー中 0",

      shop_title: "ショップ",
      shop_plans: "チャージプラン",
      shop_page_title: "DREAM LEAGUE BASEBALL ショップ",
      shop_redirect_hint: "自動で移動しない場合、ブラウザのリダイレクトブロックを確認してください。",
      shop_offline_hint: "オフラインの場合はオンライン環境を使うか、WORKER_BASE を確認してください。",
      shop_webhook_hint: "即時反映されません。Stripe webhook 受信後に反映され、クライアント側の不正を防ぎます。",

      net_connecting: "接続中",
      net_online: "オンライン",
      net_offline: "オフライン",
      label_lv: "Lv",
      label_score: "Score",
      label_player: "Player",
      label_lang: "言語",
      lang_en: "English",
      lang_zh_hant: "繁體中文",
      lang_zh_hans: "简体中文",
      lang_ja: "日本語",
      lang_ko: "한국어",
    },
    "ko": {
      login_title: "Anime Character Forge 로그인",
      login_email_signin: "이메일 로그인",
      login_email_signup: "이메일 가입",
      login_google: "Google로 로그인",
      login_microsoft: "Microsoft로 로그인",
      login_apple: "Apple로 로그인",
      common_or: "또는",
      login_hint: "먼저 로그인하세요. 로그인 후 바로 갤러리로 이동합니다.",
      login_provider_hint: "Microsoft 또는 Apple을 사용한다면 Firebase Auth에서 Provider를 먼저 활성화하세요. 아니면 오류가 납니다.",
      status_logged_in: "로그인됨",
      status_not_logged_in: "로그인 안 됨",
      btn_logout: "로그아웃",

      filter_latest: "최신",
      filter_topscore: "최고 점수",
      common_loading: "불러오는 중",
      common_works: "작품",
      common_close: "닫기",
      gallery_podium: "🏆 시즌 시상대",
      gallery_recommended: "🔥 추천",
      gallery_favorites: "💖 즐겨찾기",
      gallery_newcomers: "🆕 신규",
      gallery_authors: "👑 인기 작가",
      gallery_season_all: "전체 시즌",
      gallery_recommended_desc: "추천 1회 이상 · 추천 수 기준",
      gallery_favorites_desc: "전체 시즌 · 즐겨찾기 수 기준",
      gallery_newcomers_desc: "가입 1개월 이내 · 즐겨찾기 수 기준",
      gallery_authors_desc: "전체 시즌 · 팔로워 수 기준",

      gacha_title: "가챠",
      gacha_drawing: "뽑는 중",
      gacha_congrats: "획득 축하",
      common_confirm: "확인",
      gacha_normal: "일반 가챠",
      gacha_premium: "프리미엄 가챠",
      gacha_one: "1회",
      gacha_ten: "10회",
      gacha_results_10: "10연 결과",
      gacha_guarantee: "확정",
      gacha_or_higher: "이상",
      gacha_recharge: "충전",
      gacha_go_shop: "상점으로",
      gacha_share: "원클릭 공유",
      gacha_copy: "문구 복사",
      gacha_download: "이미지 다운로드",
      gacha_claim_reward: "보상 받기",
      gacha_want_more: "더 뽑고 싶어",
      common_and: "와",
      gacha_draw_char: "캐릭터",
      gacha_draw_outfit: "의상",
      gacha_draw_bg: "배경",
      gacha_draw_fx1: "이펙트1",
      gacha_draw_fx2: "이펙트2",

      recipes_my_builds: "내 작품",
      recipes_my_favs: "내 즐겨찾기",
      recipes_gallery: "갤러리",
      common_preview: "미리보기",

      studio_title: "스튜디오",
      studio_head: "머리",
      studio_body: "몸",
      studio_bg: "배경",
      studio_save: "저장",
      studio_random: "랜덤",
      studio_to_gallery: "갤러리로",

      user_title: "플레이어",
      common_back: "뒤로",
      btn_follow: "팔로우",
      user_preview: "작품 미리보기",
      user_followers0: "팔로워 0",
      user_following0: "팔로잉 0",

      shop_title: "상점",
      shop_plans: "충전 상품",
      shop_page_title: "DREAM LEAGUE BASEBALL 상점",
      shop_redirect_hint: "자동으로 이동하지 않으면 브라우저가 리다이렉트를 차단했는지 확인하세요.",
      shop_offline_hint: "오프라인이라면 온라인 환경을 사용하거나 WORKER_BASE 설정을 확인하세요.",
      shop_webhook_hint: "즉시 반영되지 않습니다. Stripe webhook 수신 후 반영되어 클라이언트 부정을 방지합니다.",

      net_connecting: "연결 중",
      net_online: "온라인",
      net_offline: "오프라인",
      label_lv: "Lv",
      label_score: "Score",
      label_player: "Player",
      label_lang: "언어",
      lang_en: "English",
      lang_zh_hant: "繁體中文",
      lang_zh_hans: "简体中文",
      lang_ja: "日本語",
      lang_ko: "한국어",
    },
  };

  function normalizeLang(raw){
    const s = String(raw || "").trim();
    if(!s) return "en";
    const low = s.toLowerCase();
    if(low.startsWith("zh")){
      if(low.includes("hans") || low.includes("cn") || low.includes("sg")) return "zh-Hans";
      if(low.includes("hant") || low.includes("tw") || low.includes("hk") || low.includes("mo")) return "zh-Hant";
      return "zh-Hant";
    }
    if(low.startsWith("ja")) return "ja";
    if(low.startsWith("ko")) return "ko";
    if(low.startsWith("en")) return "en";
    return "en";
  }

  function getLang(){
    const saved = localStorage.getItem(KEY);
    if(saved) return normalizeLang(saved);
    const nav = (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language;
    return normalizeLang(nav);
  }

  function setLang(lang){
    const n = normalizeLang(lang);
    localStorage.setItem(KEY, n);
    applyI18n(document);
    window.dispatchEvent(new CustomEvent("acf:lang", { detail: { lang: n }}));
  }

  function t(key, fallback){
    const lang = getLang();
    const dict = STR[lang] || STR["en"];
    const en = STR["en"] || {};
    if(dict && key in dict) return dict[key];
    if(en && key in en) return en[key];
    return fallback !== undefined ? fallback : key;
  }

  function applyI18n(root){
    const lang = getLang();
    const nodes = (root || document).querySelectorAll("[data-i18n]");
    nodes.forEach(n => {
      const k = n.getAttribute("data-i18n");
      const v = t(k, n.textContent);
      if(n.tagName === "TITLE"){
        document.title = v;
      }else{
        n.textContent = v;
      }
    });

    const ph = (root || document).querySelectorAll("[data-i18n-placeholder]");
    ph.forEach(n => {
      const k = n.getAttribute("data-i18n-placeholder");
      n.setAttribute("placeholder", t(k, n.getAttribute("placeholder") || ""));
    });

    const tt = (root || document).querySelectorAll("[data-i18n-title]");
    tt.forEach(n => {
      const k = n.getAttribute("data-i18n-title");
      n.setAttribute("title", t(k, n.getAttribute("title") || ""));
    });

    const sel = document.getElementById("acfLangSel");
    if(sel){
      sel.value = lang;
      sel.setAttribute("aria-label", t("label_lang","Language"));
    }
  }

  return { getLang, setLang, t, applyI18n, normalizeLang };
})();

window.ACF_t = ACF_I18N.t;
window.ACF_getLang = ACF_I18N.getLang;
window.ACF_setLang = ACF_I18N.setLang;
window.ACF_applyI18n = ACF_I18N.applyI18n;


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
        gap: 12px;
        min-width: 0;
      }

      .acf-langWrap{
        display:flex;
        align-items:center;
        justify-content:flex-end;
        pointer-events:auto;
      }

      .acf-langSel{
        appearance:none;
        -webkit-appearance:none;
        border-radius: 999px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.3px;
        color: rgba(255,255,255,0.95);
        background: rgba(0,0,0,0.32);
        border: 1px solid rgba(255,255,255,0.18);
        box-shadow: 0 10px 22px rgba(0,0,0,0.25);
        outline: none;
        cursor: pointer;
      }
      .acf-langSel:focus{
        border-color: rgba(255,255,255,0.35);
        box-shadow: 0 0 0 2px rgba(255,255,255,0.12), 0 10px 22px rgba(0,0,0,0.25);
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
    net.textContent = ACF_t("net_connecting","Connecting");

    txt.appendChild(name);
    txt.appendChild(sub);
    txt.appendChild(net);

    left.appendChild(avatar);
    left.appendChild(txt);

    const right = el("div","acf-masterRight");

    const stats = el("div","acf-masterStats");
    stats.id = "acfMasterStats";

    const langWrap = el("div","acf-langWrap");
    const langSel = el("select","acf-langSel");
    langSel.id = "acfLangSel";
    langSel.innerHTML = `
      <option value="en">${ACF_t("lang_en","English")}</option>
      <option value="zh-Hant">${ACF_t("lang_zh_hant","繁體中文")}</option>
      <option value="zh-Hans">${ACF_t("lang_zh_hans","简体中文")}</option>
      <option value="ja">${ACF_t("lang_ja","日本語")}</option>
      <option value="ko">${ACF_t("lang_ko","한국어")}</option>
    `;
    langSel.addEventListener("change", (e)=>{
      ACF_setLang(e.target.value);
      if(window.__acfMe) renderMaster(window.__acfMe);
      refreshNetBadge();
    });
    langWrap.appendChild(langSel);

    right.appendChild(stats);
    right.appendChild(langWrap);

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
    let label = ACF_t("net_connecting","Connecting");
    let cls = "net-connecting";
    if(s === "online"){
      label = ACF_t("net_online","Online");
      cls = "net-online";
    }else if(s === "offline"){
      label = ACF_t("net_offline","Offline");
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
    const desiredLabel = desired === "offline" ? ACF_t("net_offline","Offline") : ACF_t("net_online","Online");
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
    nameEl.textContent = String(acc.userName || ACF_t("label_player","Player"));
    subEl.textContent = ACF_t("label_lv","Lv") + " " + String(Number(acc.level || 1)) + (acc.userRegion ? (" · " + String(acc.userRegion)) : "") + " · " + ACF_t("label_score","Score") + " " + String(Number(acc.accountScore||0));

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
      d.textContent = initials(acc.userName || ACF_t("label_player","Player"));
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
      window.__acfMe = me;
      renderMaster(me);
      refreshNetBadge();
      ACF_applyI18n(document);
    }catch(_e){
      window.__acfMe = null;
      renderMaster(null);
      refreshNetBadge();
      ACF_applyI18n(document);
    }

    window.addEventListener("resize", ()=>setBodyOffset(), { passive:true });
  }

  window.ACF_initMasterHeader = initMasterHeader;

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", ()=>ACF_applyI18n(document));
  }else{
    ACF_applyI18n(document);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initMasterHeader);
  }else{
    initMasterHeader();
  }
})();
