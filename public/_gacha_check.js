
//--- script 0 ---


    // Keep featured video exactly from masterpage bottom to viewport bottom
    function updateMasterHeight(){
      const m = document.getElementById("acfMasterMount");
      const hRaw = m ? m.getBoundingClientRect().height : 0;

      // round to integer px and only update if meaningfully changed (prevents 1px oscillation)
      const h = Math.max(0, Math.round(hRaw));
      const cur = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--masterH")) || 0;
      if(Math.abs(h - cur) >= 2){
        document.documentElement.style.setProperty("--masterH", h + "px");
      }
    }
    window.addEventListener("resize", updateMasterHeight);
    // Run once after masterpage renders
    setTimeout(updateMasterHeight, 0);
    setTimeout(updateMasterHeight, 250);

    // featured video: load from DB season featured table
    
async function loadFeaturedVideo(){
  const v = document.getElementById("featuredVideo");
  const vbg = document.getElementById("featuredVideoBg");
  const img = document.getElementById("featuredFallback");
  const imgbg = document.getElementById("featuredFallbackBg");
  if(!v) return;

  // Ensure autoplay works on mobile
  v.muted = true;
  v.autoplay = true;
  v.loop = true;
  v.playsInline = true;
  v.setAttribute("playsinline", "");
  v.preload = "auto";

  const showFallback = ()=>{
    try{ v.pause(); }catch(_){}
    try{ v.removeAttribute("src"); }catch(_){}
    try{ v.load(); }catch(_){}
    v.style.display = "none";
    if(vbg) vbg.style.display = "none";
    if(img) img.style.display = "";
    if(imgbg) imgbg.style.display = "";
  };

  const normalizeFeaturedList = (data)=>{
    if(!data) return [];
    if(Array.isArray(data)) return data;
    if(Array.isArray(data.featured)) return data.featured;
    if(Array.isArray(data.items)) return data.items;
    if(Array.isArray(data.data)) return data.data;
    return [];
  };

  // Some builds have window.api() that returns JSON (not a fetch Response).
  // This wrapper accepts either style.
  const getJson = async (path)=>{
    if(typeof window.api === "function"){
      const r = await window.api(path, { method: "GET" });
      // If r is already a JSON object, return it.
      if(r && typeof r === "object" && typeof r.json !== "function") return r;
      // If r looks like a Response, parse it.
      if(r && typeof r.json === "function") return await r.json();
    }
    const res = await fetch(path, { cache: "no-store" });
    if(!res.ok) throw new Error(`http_${res.status}`);
    return await res.json();
  };

  try{
    const seasonId = (window.SEASON_ID || "S1");
    const data = await getJson(`/api/featured?seasonId=${encodeURIComponent(seasonId)}`);
    const list = normalizeFeaturedList(data);
    const first = list[0] || null;
    const fid = first && (first.featuredId || first.id || first.assetId || first.featured_id);
    if(!fid) throw new Error("no_featuredId");

    // Prefer explicit videoUrl returned by backend; fallback to /assets/[featuredId].mp4
    let src = "";
    const vurl = first && (first.videoUrl || first.video_url || first.mp4Url || first.mp4_url || first.url);
    if(vurl) src = String(vurl);
    if(!src) src = `/assets/${fid}.mp4`;

    // Always load assets from this page origin (Pages), not the Worker origin.
    if(!/^https?:\/\//i.test(src)){
      if(src.startsWith("assets/")) src = "/" + src;
      if(!src.startsWith("/")) src = "/" + src;
      src = `${location.origin}${src}`;
    }

    v.onerror = showFallback;
    v.src = src;
    v.style.display = "";
    if(img) img.style.display = "none";

    try{ v.load(); }catch(_){}
    v.play().catch(()=>{});
  }catch(e){
    console.warn("featured video load failed", e);
    showFallback();
  }
}
    const overlay = document.getElementById("overlay");
    const grid32El = document.getElementById("grid32");
    const framesLayer = document.getElementById("framesLayer");
    const loadCover = document.getElementById("loadCover");
    const loadTxt = document.getElementById("loadTxt");
    const rollSub = document.getElementById("rollSub");
    const rollingText = document.getElementById("rollingText");
    const confirmBtn = document.getElementById("confirmBtn");
    const actionBar = document.getElementById("actionBar");

    function showLoad(msg){
      if(loadTxt) loadTxt.textContent = msg || "載入中";
      if(loadCover) loadCover.classList.add("show");
      const stage = loadCover && loadCover.closest(".gacha-stage");
      if(stage) stage.classList.add("loading");
    }
    function hideLoad(){
      if(loadCover) loadCover.classList.remove("show");
      const stage = loadCover && loadCover.closest(".gacha-stage");
      if(stage) stage.classList.remove("loading");
    }
    function preloadImages(urls, timeoutMs=8000){
      const uniq = Array.from(new Set((urls||[]).filter(Boolean)));
      if(uniq.length === 0) return Promise.resolve();
      return new Promise((resolve)=>{
        let done = 0;
        const total = uniq.length;
        const finish = ()=>{ done++; if(done>=total) resolve(); };
        setTimeout(()=>resolve(), timeoutMs);
        uniq.forEach(u=>{
          const img = new Image();
          img.onload = finish;
          img.onerror = finish;
          img.src = u;
        });
      });
    }


    const btnNormal1 = document.getElementById("btnNormal1");
    const btnNormal10 = document.getElementById("btnNormal10");
    const btnPremium1 = document.getElementById("btnPremium1");
    const btnPremium10 = document.getElementById("btnPremium10");

    

    const chkSkipAnim = document.getElementById("chkSkipAnim");
    try{
      const v = localStorage.getItem("acf_skip_gacha_anim");
      if(chkSkipAnim) chkSkipAnim.checked = (v === "1");
      if(chkSkipAnim) chkSkipAnim.addEventListener("change", ()=> {
        localStorage.setItem("acf_skip_gacha_anim", chkSkipAnim.checked ? "1" : "0");
      });
    }catch(_e){}
const btnHead1 = document.getElementById("btnHead1");
    const btnHead10 = document.getElementById("btnHead10");
    const btnBody1 = document.getElementById("btnBody1");
    const btnBody10 = document.getElementById("btnBody10");
    const btnBg1 = document.getElementById("btnBg1");
    const btnBg10 = document.getElementById("btnBg10");
    const btnAddon11 = document.getElementById("btnAddon11");
    const btnAddon110 = document.getElementById("btnAddon110");
    const btnAddon21 = document.getElementById("btnAddon21");
    const btnAddon210 = document.getElementById("btnAddon210");

    let animating = false;
    let cachedAssets = null;

    function showOverlay(){ overlay.classList.add("show"); }
    function hideOverlay(){
      overlay.classList.remove("show");
      // reset overlay state
      framesLayer.innerHTML = "";
       hideCinematic();
      grid32El.querySelectorAll(".cell").forEach(c=>c.classList.remove("dim","win","win2","red"));
      if(rollingText) rollingText.style.display = "";
      if(rollSub){ rollSub.style.display = "none"; rollSub.textContent = ""; }
      if(actionBar){ actionBar.classList.add("mode-loading"); actionBar.classList.remove("mode-done"); }
      if(confirmBtn){ confirmBtn.style.opacity="0"; confirmBtn.style.pointerEvents="none"; }
    }

    confirmBtn.addEventListener("click", () => { hideCinematic(); hideOverlay(); });
function normalizeType(t){
      const x = String(t||"");
      if(x === "bg") return "background";
      if(x === "background") return "background";
      if(x === "addon1") return "addon1";
      if(x === "addon2") return "addon2";
      return x;
    }

    function requestType(t){
      const x = String(t||"");
      if(x === "background") return "bg";
      return x;
    }

    function toThumbIfNeeded(asset){
      if(!asset || !asset.imageUrl) return "";
      const t = String(asset.type || "");
      if(t === "head" || t === "body"){
        if(String(asset.imageUrl).includes("_thumb.")) return asset.imageUrl;
        return String(asset.imageUrl).replace(/\.(png|webp|jpg|jpeg)$/i, "_thumb.$1");
      }
      return asset.imageUrl;
    }

    async function ensureAssetsLoaded(){
      if(cachedAssets) return cachedAssets;
      const data = await api("/api/assets");
      if(data && data.ok && Array.isArray(data.assets)){
        cachedAssets = data.assets;
        return cachedAssets;
      }
      throw new Error("assets_load_failed");
    }
async function onlineGacha(opts = {}) {
  // Use the same routing as the rest of the project:
  // - If app.js provides window.api(), it likely routes to the Worker origin.
  // - Otherwise fall back to same-origin fetch.
  const apiFetch = (url, fetchOpts) => {
    if (typeof window.api === "function") return window.api(url, fetchOpts);
    return fetch(url, fetchOpts);
  };

  const payload = {
    count: Number(opts.count || 1),
    premium: !!opts.premium,
    type: opts.type ? requestType(opts.type) : undefined,
    seasonId: String(opts.seasonId || "S1"),
  };

  const headers = { "content-type": "application/json" };

  // Try to attach uid if we can find it (keeps behavior consistent with other pages)
  const uidCandidates = [
    window.USER_ID,
    window.userId,
    window.uid,
    (typeof window.getUserId === "function" ? window.getUserId() : ""),
    (typeof window.getUid === "function" ? window.getUid() : ""),
    localStorage.getItem("uid"),
    localStorage.getItem("userId"),
    localStorage.getItem("USER_ID"),
          localStorage.getItem("acf_uid"),
    localStorage.getItem("acf_uid"),
        ];
  for (const v of uidCandidates) {
    const s = String(v || "").trim();
    if (s && s !== "null" && s !== "undefined") { headers["x-user-id"] = s; break; }
  }

  // IMPORTANT: do NOT use apiFetch for gacha, because apiFetch returns null on HTTP 4xx/5xx.
  // We must parse JSON even when status is 400 so we can show the real reason (insufficient gold/gem etc.).
  const base = (typeof WORKER_BASE === "string") ? WORKER_BASE : (
    (location.hostname === "127.0.0.1" || location.hostname === "localhost") ? "" : "https://acf-api.dream-league-baseball.workers.dev"
  );
  const res = await fetch(base + "/api/gacha", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  let data = null;
  try{ data = await res.json(); }catch(_){ data = null; }

  // Normalize error for UI
  if (!data || data.ok !== true || !Array.isArray(data.pulled)) {
    const code = data && data.error ? String(data.error) : `gacha_http_${res.status || 0}`;
    const need = data && (data.need ?? data.costGold ?? data.costGem);
    const have = data && (data.have ?? data.userGold ?? data.userGem);
    const msg = (need != null && have != null) ? `${code} (need ${need}, have ${have})` : code;
    throw new Error(msg);
  }

  if (opts.type) {
    const want = String(requestType(opts.type)).toLowerCase();
    data.pulled = data.pulled.filter((a) => String(a?.type || "").toLowerCase() === want);
  }
  return data;


}

function setPityText(el, remaining, label){
  if(!el) return;
  const x = Math.max(1, Number(remaining || 0));
  el.textContent = `再抽${x}次`;
}

function updatePityUI(data){
  if(!data) return;
  const n = data.pityNormalRemaining;
  const p = data.pityPremiumRemaining;
  setPityText(document.getElementById("pityNormal"), n, "SSR");
  setPityText(document.getElementById("pityPremium"), p, "UR");
}

async function loadPityStatus(){
  const apiFetch = (url, fetchOpts) => {
    if (typeof window.api === "function") return window.api(url, fetchOpts);
    return fetch(url, fetchOpts);
  };

  const headers = {};
  const uidCandidates = [
    window.USER_ID,
    window.userId,
    window.uid,
    (typeof window.getUserId === "function" ? window.getUserId() : ""),
    (typeof window.getUid === "function" ? window.getUid() : ""),
    localStorage.getItem("uid"),
    localStorage.getItem("userId"),
    localStorage.getItem("USER_ID"),
          localStorage.getItem("acf_uid"),
  ];
  for (const v of uidCandidates) {
    const s = String(v || "").trim();
    if (s && s !== "null" && s !== "undefined") { headers["x-user-id"] = s; break; }
  }

  try{
    const resp = await apiFetch("/api/gacha/pity", { method:"GET", headers });
    const isResponseLike = resp && typeof resp === "object" && ("ok" in resp) && typeof resp.json === "function";
    const data = isResponseLike ? await resp.json() : resp;
    if(data && data.ok) updatePityUI(data);
  }catch(_){}
}
window.loadPityStatus = loadPityStatus;

    function assetThumb(a){
      if(!a) return "/assets/placeholder.png";
      if(a.thumb) return a.thumb;
      if(a.imageUrl) return toThumbIfNeeded(a);
      if(a.id) return `/assets/${a.id}.png`;
      return "/assets/placeholder.png";
    }

    function assetLabel(a){
      if(!a) return "";
      const id = a.id || a.assetId || "";
      const r = Number(a.rarity || 1);
      return `${id}  R${r}`;
    }

    function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }


    const RARITY_NAME = {1:"C",2:"R",3:"SR",4:"SSR",5:"UR"};

    // Simple WebAudio SFX (no external files)
    let _audioCtx = null;
    function _ctx(){
      try{
        _audioCtx = _audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        return _audioCtx;
      }catch(_){ return null; }
    }
    function playTone(freq, dur=0.12, type="sine", gain=0.06, when=0){
      const ctx = _ctx();
      if(!ctx) return;
      const t0 = ctx.currentTime + (when||0);
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    }
    function sfxByRarity(r){
      const rr = Number(r||1);
      if(rr >= 5){
        // UR: heartbeat + lift
        playTone(70, 0.10, "sine", 0.10, 0.00);
        playTone(70, 0.10, "sine", 0.10, 0.18);
        playTone(220, 0.10, "triangle", 0.10, 0.40);
        playTone(330, 0.14, "triangle", 0.10, 0.52);
        playTone(520, 0.16, "sawtooth", 0.08, 0.66);
        return;
      }
      if(rr === 4){
        playTone(180, 0.10, "triangle", 0.08, 0.00);
        playTone(260, 0.12, "triangle", 0.08, 0.12);
        playTone(420, 0.14, "sawtooth", 0.06, 0.26);
        return;
      }
      if(rr === 3){
        playTone(240, 0.10, "sine", 0.06, 0.00);
        playTone(360, 0.12, "triangle", 0.05, 0.12);
        return;
      }
      if(rr === 2){
        playTone(260, 0.08, "sine", 0.04, 0.00);
        return;
      }
      playTone(220, 0.06, "sine", 0.03, 0.00);
    }

    
    function packHitFx(r){
      const el = document.getElementById("packFlash");
      if(!el) return;
      const rr = Math.max(1, Math.min(5, Number(r||1)));
      // color by rarity
      let bg = "rgba(255,255,255,0.85)";
      if(rr === 1) bg = "rgba(148,163,184,0.55)";
      if(rr === 2) bg = "rgba(34,197,94,0.55)";
      if(rr === 3) bg = "rgba(59,130,246,0.60)";
      if(rr === 4) bg = "rgba(168,85,247,0.65)";
      if(rr === 5) bg = "rgba(245,158,11,0.70)";
      el.style.background = bg;
      el.classList.remove("play");
      void el.offsetWidth;
      el.classList.add("play");

      // shake the panel a bit on SSR/UR
      const p = document.querySelector(".panel");
      if(p && rr >= 4){
        p.classList.remove("packShake");
        void p.offsetWidth;
        p.classList.add("packShake");
      }
    }

function assetFullUrl(a){
      if(!a) return "/assets/placeholder.png";
      if(a.imageUrl) return String(a.imageUrl);
      const id = a.id || a.assetId || "";
      if(id) return `/assets/${id}.png`;
      return "/assets/placeholder.png";
    }

    
    async function playCinematicForPack(winners, isTen){
      const cinematic = document.getElementById("cinematic");
      const cineRarity = document.getElementById("cineRarity");
      const cineSub = document.getElementById("cineSub");
      const cineImg = document.getElementById("cineImg");
      const cineTen = document.getElementById("cineTen");
      const cineTenGrid = document.getElementById("cineTenGrid");
      const cineOk = document.getElementById("cineOk");
      const cineCta = document.getElementById("cineCta");
      const sharePanel = document.getElementById("sharePanel");
      const shareCanvas = document.getElementById("shareCanvas");
      const sharePreview = document.getElementById("sharePreview");
      const shareDownload = document.getElementById("shareDownload");
      const shareCopy = document.getElementById("shareCopy");
      const shareShare = document.getElementById("shareShare");
      const shareReddit = document.getElementById("shareReddit");
      const shareClaim = document.getElementById("shareClaim");
      const shareHint = document.getElementById("shareHint");

      let _shareState = { ready:false, blob:null, dataUrl:"", caption:"", shareId:"", rarity:0, assetId:"" };

      function buildUidHeaders(){
        const headers = { "content-type": "application/json" };
        const uidCandidates = [
          window.USER_ID,
          window.userId,
          window.uid,
          (typeof window.getUserId === "function" ? window.getUserId() : ""),
          (typeof window.getUid === "function" ? window.getUid() : ""),
          localStorage.getItem("uid"),
          localStorage.getItem("userId"),
          localStorage.getItem("USER_ID"),
          localStorage.getItem("acf_uid"),
        ];
        for (const v of uidCandidates) {
          const s = String(v || "").trim();
          if (s && s !== "null" && s !== "undefined") { headers["x-user-id"] = s; break; }
        }
        return headers;
      }

      async function getMyAccount(){
        try{
          const apiFetch = (url, fetchOpts) => {
            if (typeof window.api === "function") return window.api(url, fetchOpts);
            return fetch(url, fetchOpts);
          };
          const res = await apiFetch("/api/me/account", { method:"GET", headers: buildUidHeaders() });
          if(res && typeof res.json === "function"){
            if(!res.ok) return null;
            return await res.json();
          }
          if(res && typeof res === "object") return res;
        }catch(_){}
        return null;
      }

      function initialsFromName(name){
        const s = String(name || "").trim();
        if(!s) return "P";
        const parts = s.split(/\s+/).filter(Boolean);
        if(parts.length === 1) return parts[0].slice(0,2).toUpperCase();
        return (parts[0].slice(0,1) + parts[parts.length-1].slice(0,1)).toUpperCase();
      }

      function rarityBg(ctx, r){
        if(r === 5){
          const g = ctx.createLinearGradient(0,0,1080,1080);
          g.addColorStop(0, "rgba(255,60,60,1)");
          g.addColorStop(1, "rgba(120,20,20,1)");
          return g;
        }
        if(r === 4){
          const g = ctx.createLinearGradient(0,0,1080,1080);
          g.addColorStop(0, "rgba(255,185,95,1)");
          g.addColorStop(1, "rgba(155,82,20,1)");
          return g;
        }
        const g = ctx.createLinearGradient(0,0,1080,1080);
        g.addColorStop(0, "rgba(70,80,120,1)");
        g.addColorStop(1, "rgba(20,25,40,1)");
        return g;
      }

      async function loadImage(url){
        return await new Promise((resolve, reject)=>{
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = ()=>resolve(img);
          img.onerror = ()=>reject(new Error("img_load_failed"));
          img.src = url;
        });
      }

      function drawRoundRect(ctx, x,y,w,h,r){
        const rr = Math.max(0, Math.min(r, Math.min(w,h)/2));
        ctx.beginPath();
        ctx.moveTo(x+rr, y);
        ctx.arcTo(x+w, y, x+w, y+h, rr);
        ctx.arcTo(x+w, y+h, x, y+h, rr);
        ctx.arcTo(x, y+h, x, y, rr);
        ctx.arcTo(x, y, x+w, y, rr);
        ctx.closePath();
      }

      async function buildShareCardImage(opts){
        if(!shareCanvas) throw new Error("no_canvas");
        const c = shareCanvas;
        const ctx = c.getContext("2d");
        if(!ctx) throw new Error("no_ctx");

        const r = Number(opts.rarity || 1);
        const rName = RARITY_NAME[r] || ("R" + r);
        const assetId = String(opts.assetId || "");
        const gameName = String(opts.gameName || "Player");
        const avatarText = initialsFromName(gameName);

        ctx.clearRect(0,0,c.width,c.height);

        ctx.fillStyle = rarityBg(ctx, r);
        ctx.fillRect(0,0,c.width,c.height);

        // soft vignette
        const vg = ctx.createRadialGradient(540, 420, 60, 540, 540, 700);
        vg.addColorStop(0, "rgba(255,255,255,0.10)");
        vg.addColorStop(1, "rgba(0,0,0,0.55)");
        ctx.fillStyle = vg;
        ctx.fillRect(0,0,c.width,c.height);

        // title
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.font = "900 54px system-ui, -apple-system, Segoe UI, Roboto, Arial";
        ctx.textAlign = "left";
        ctx.fillText("Gacha Pull", 64, 98);

        // rarity badge
        const badgeW = 210, badgeH = 78;
        const bx = 64, by = 126;
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        drawRoundRect(ctx, bx, by, badgeW, badgeH, 22);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.20)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.96)";
        ctx.font = "1000 40px system-ui, -apple-system, Segoe UI, Roboto, Arial";
        ctx.fillText(rName, bx + 24, by + 54);

        // player badge
        const px = 64, py = 224;
        ctx.fillStyle = "rgba(0,0,0,0.32)";
        drawRoundRect(ctx, px, py, 520, 90, 26);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.16)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // avatar circle
        ctx.fillStyle = "rgba(255,255,255,0.14)";
        ctx.beginPath();
        ctx.arc(px + 52, py + 45, 30, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.font = "900 26px system-ui, -apple-system, Segoe UI, Roboto, Arial";
        ctx.textAlign = "center";
        ctx.fillText(avatarText, px + 52, py + 54);

        ctx.textAlign = "left";
        ctx.font = "900 30px system-ui, -apple-system, Segoe UI, Roboto, Arial";
        ctx.fillText(gameName, px + 98, py + 57);

        ctx.font = "700 22px system-ui, -apple-system, Segoe UI, Roboto, Arial";
        ctx.fillStyle = "rgba(255,255,255,0.78)";
        ctx.fillText(assetId, px + 98, py + 84);

        // card image
        const img = await loadImage(opts.cardUrl);
        const cardX = 170, cardY = 330, cardW = 740, cardH = 740;

        // card shadow
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = "rgba(0,0,0,1)";
        drawRoundRect(ctx, cardX + 18, cardY + 22, cardW, cardH, 44);
        ctx.fill();
        ctx.restore();

        // card frame
        ctx.fillStyle = "rgba(0,0,0,0.24)";
        drawRoundRect(ctx, cardX, cardY, cardW, cardH, 44);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.lineWidth = 3;
        ctx.stroke();

        // draw image inside
        const pad = 22;
        const ix = cardX + pad, iy = cardY + pad, iw = cardW - pad*2, ih = cardH - pad*2;

        // contain
        const s = Math.min(iw / img.width, ih / img.height);
        const dw = img.width * s;
        const dh = img.height * s;
        const dx = ix + (iw - dw)/2;
        const dy = iy + (ih - dh)/2;

        ctx.save();
        drawRoundRect(ctx, ix, iy, iw, ih, 34);
        ctx.clip();
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();

        // footer
        ctx.fillStyle = "rgba(255,255,255,0.78)";
        ctx.font = "700 20px system-ui, -apple-system, Segoe UI, Roboto, Arial";
        ctx.textAlign = "left";
        const urlText = String(location.origin || "");
        ctx.fillText(urlText, 64, 1036);

        return await new Promise((resolve)=>{
          c.toBlob((blob)=>{
            if(!blob) return resolve({ blob:null, dataUrl:"" });
            const fr = new FileReader();
            fr.onload = ()=>resolve({ blob, dataUrl: String(fr.result||"") });
            fr.readAsDataURL(blob);
          }, "image/png", 0.95);
        });
      }

      function setShareHint(msg){
        if(shareHint) shareHint.textContent = msg;
      }

      if(!cinematic || !cineImg || !cineOk) return;

      const arr = Array.isArray(winners) ? winners.filter(Boolean) : [];
      if(arr.length === 0) return;

      // pick focus: best rarity, tie -> later item wins (feels like "最後一張更重要")
      let focus = arr[0];
      for(const w of arr){
        const rw = Number(w?.rarity||1);
        const rf = Number(focus?.rarity||1);
        if(rw > rf) focus = w;
        else if(rw === rf) focus = w;
      }

      const r = Math.max(1, Math.min(5, Number(focus?.rarity || 1)));
      const rName = RARITY_NAME[r] || `R${r}`;

      // Share panel only for SSR/UR
      if(sharePanel) sharePanel.style.display = (r >= 4 ? "" : "none");
      _shareState = { ready:false, blob:null, dataUrl:"", caption:"", shareId: crypto.randomUUID(), rarity:r, assetId: String(focus?.assetId || focus?.id || "") };

      if(r >= 4){
        try{
          const acc = await getMyAccount();
          const gameName = (acc && (acc.account?.userName || acc.userName || acc.account?.name)) ? String(acc.account?.userName || acc.userName || acc.account?.name) : "Player";
          const cardUrl = String(focus?.imageUrl || focus?.thumb || "");
          const { blob, dataUrl } = await buildShareCardImage({ rarity:r, assetId:_shareState.assetId, gameName, cardUrl });
          _shareState.blob = blob;
          _shareState.dataUrl = dataUrl;
          _shareState.ready = !!blob;
          _shareState.caption = `我在 ${gameName} 抽到了 ${rName} ${_shareState.assetId} \n${location.origin}`;
          if(sharePreview && dataUrl) sharePreview.src = dataUrl;
          setShareHint("點一鍵分享即可，系統會自動發放獎勵（每天最多 5 次）");
        }catch(e){
          console.warn("share build failed", e);
          setShareHint("分享圖生成失敗，仍可繼續抽卡");
          if(sharePanel) sharePanel.style.display = "none";
        }
      }

      cinematic.className = `cinematic show r${r}`;
      cinematic.setAttribute("aria-hidden","false");
      cinematic.classList.add("black");
      cinematic.classList.remove("flash","shake","float","cta");

      // Hide underlying confirm (we use cinematic confirm)
      if(confirmBtn){
        confirmBtn.style.opacity = "0.0";
        confirmBtn.style.pointerEvents = "none";
      }

      
      // Ten-pull thumbnails (SSR/UR on top)
      if(cineTen && cineTenGrid){
        cineTenGrid.innerHTML = "";
        if(cineTenGuarantee) cineTenGuarantee.innerHTML = "";
        if(isTen){
          cineTen.classList.add("show");

          // featured: all SSR/UR (rarity >= 4), keep original order
          const featured = arr.filter(w => Number(w?.rarity||1) >= 4);
          const rest = arr.filter(w => Number(w?.rarity||1) < 4);

          const addItem = (w, container, best=false) => {
            const rr = Math.max(1, Math.min(5, Number(w?.rarity || 1)));
            const t = String(w?.type || "").toLowerCase();
            const isHB = (t === "head" || t === "body");
            const item = document.createElement("div");
            item.className = `cine-ten-item r${rr}` + (best ? " best" : "") + (isHB ? " thumb" : " full");
            const img = document.createElement("img");
            // head/body: thumb only; others: use full card art
            img.src = isHB ? assetThumb(w) : assetFullUrl(w);
            img.alt = String(w?.id || w?.assetId || "");
            // If not thumb (non head/body), show rarity badge
            if(!isHB){
              const tag = document.createElement("div");
              tag.className = "tag";
              tag.textContent = RARITY_NAME[rr] || `R${rr}`;
              item.appendChild(img);
              item.appendChild(tag);
            }else{
              item.appendChild(img);
            }
            container.appendChild(item);
          };

          // top row: SSR/UR (if any). reuse cineTenGuarantee as the top container
          if(cineTenGuarantee){
            if(featured.length){
              for(const w of featured){
                addItem(w, cineTenGuarantee, (w === focus));
              }
            }else{
              // if no SSR/UR, show the best card on top for a bit of drama
              addItem(focus, cineTenGuarantee, true);
            }
          }

          // bottom grid: all remaining cards
          for(const w of rest){
            // avoid duplicating focus if it was used as fallback top card
            if(!featured.length && w === focus) continue;
            addItem(w, cineTenGrid, (w === focus));
          }
        }else{
          cineTen.classList.remove("show");
        }
      }

      // Show big card only for single pull

      const cineCardWrap = cineImg ? cineImg.closest(".cine-card") : null;
      if(cineCardWrap){
        cineCardWrap.style.display = isTen ? "none" : "";
      }

      // Text
      cineRarity.textContent = rName;
      const id = String(focus?.assetId || focus?.id || "").trim();
      cineSub.textContent = isTen ? (id ? `10連抽 最稀有：${id}` : "10連抽 結果") : (id ? `恭喜獲得 ${id}` : "恭喜獲得");
      if(cineCta) cineCta.textContent = "點擊確認繼續";

      // Image: final display
      // head/body: always use thumb (avoid heavy full image)
      // others: show thumb first, then upgrade to full when loaded
      const thumbSrc = assetThumb(focus);
      cineImg.src = thumbSrc;

      const tFocus = String(focus?.type || "");
      const allowFull = !(tFocus === "head" || tFocus === "body");
      const fullSrc = allowFull ? assetFullUrl(focus) : "";
      if(allowFull && fullSrc && fullSrc !== thumbSrc){
        const test = new Image();
        test.onload = ()=>{ cineImg.src = fullSrc; };
        test.onerror = ()=>{};
        test.src = fullSrc;
      }


      // Share actions
      const downloadShare = ()=>{
        if(!_shareState.ready || !_shareState.dataUrl) return setShareHint("分享圖還沒準備好");
        const a = document.createElement("a");
        a.href = _shareState.dataUrl;
        a.download = `gacha_${(_shareState.assetId||"card")}_${RARITY_NAME[_shareState.rarity]||_shareState.rarity}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setShareHint("已下載圖片，分享到 Discord Reddit 朋友圈後點領取獎勵");
      };
      const copyCaption = async ()=>{
        try{
          await navigator.clipboard.writeText(_shareState.caption || "");
          setShareHint("已複製文案，貼到 Discord Reddit 朋友圈後點領取獎勵");
        }catch(_){
          setShareHint("複製失敗，你可以直接截圖或下載圖片分享");
        }
      };
      const systemShare = async ()=>{
        try{
          if(!_shareState.ready || !_shareState.blob) return setShareHint("分享圖還沒準備好");
          const file = new File([_shareState.blob], "gacha.png", { type:"image/png" });
          if(navigator.share){
            const data = { title:"Gacha Pull", text:_shareState.caption || "", files:[file] };
            await navigator.share(data);
            setShareHint("分享完成，獎勵發放中...");
            return;
          }
          downloadShare();
        }catch(e){
          console.warn("share failed", e);
          downloadShare();
        }
      };
      const openReddit = ()=>{
        const title = encodeURIComponent((_shareState.caption || "Gacha Pull").split("\n")[0]);
        const url = encodeURIComponent(String(location.origin || ""));
        const link = `https://www.reddit.com/submit?title=${title}&url=${url}`;
        window.open(link, "_blank", "noopener,noreferrer");
        setShareHint("Reddit 已開啟，貼上圖片後點領取獎勵");
      };
      const claimReward = async ()=>{
        try{
          if(!_shareState.ready) return setShareHint("分享圖還沒準備好");
          const apiFetch = (url, fetchOpts) => {
            if (typeof window.api === "function") return window.api(url, fetchOpts);
            return fetch(url, fetchOpts);
          };
          const res = await apiFetch("/api/share/reward", {
            method:"POST",
            headers: buildUidHeaders(),
            body: JSON.stringify({ shareId:_shareState.shareId, rarity:_shareState.rarity, assetId:_shareState.assetId }),
          });
          const data = (res && typeof res.json === "function") ? await res.json() : res;
          if(!data || !data.ok){
            const err = (data && (data.error || data.message)) ? String(data.error || data.message) : "claim_failed";
            if(err === "daily_limit") return setShareHint(`今天已領取 ${data.used || 0} 次，最多 ${data.maxPerDay || 5} 次`);
            if(err === "duplicate") return setShareHint("這張分享圖已領過獎勵");
            return setShareHint("領取失敗");
          }
          if(data.already){
            setShareHint("這張分享圖已領過獎勵");
          }else{
            const g = Number(data.reward?.gem || 0);
            const v = Number(data.reward?.vote || 0);
            setShareHint(`已領取獎勵 +${g} GEM +${v} 票 目前 GEM ${data.balances?.userGem ?? ""} 票 ${data.balances?.userVote ?? ""}`);
          }
        }catch(e){
          console.warn("claim failed", e);
          setShareHint("領取失敗");
        }
      };

            // One-click share:
      // - On mobile: uses native share sheet (Facebook/IG/Discord/Reddit/等，如果已安裝 app)
      // - On desktop: falls back to auto-download + copy caption (平台限制無法自動發文上傳圖片)
      const oneClickShare = async ()=>{
        try{ await copyCaption(); }catch(_){}
        try{ await systemShare(); }catch(_){}
        // We can't reliably verify posting success across platforms, so reward is granted per-shareId with daily cap.
        await claimReward();
      };

      // Hide advanced buttons (keep DOM ids for backward compatibility)
      if(shareDownload) shareDownload.style.display = "none";
      if(shareCopy) shareCopy.style.display = "none";
      if(shareReddit) shareReddit.style.display = "none";
      if(shareClaim) shareClaim.style.display = "none";

      if(shareShare) shareShare.onclick = oneClickShare;



      // Close behavior
      const close = () => {
        hideCinematic();
        try{ hideOverlay(); }catch(_){}
      };
      cineOk.onclick = close;
      const bg = cinematic.querySelector(".cine-bg");
      if(bg) bg.onclick = close;

      // suspense & FX
      await sleep(180);
      cinematic.classList.remove("black");
      sfxByRarity(r);

      if(r >= 4){
        await sleep(140);
        cinematic.classList.add("shake");
        cinematic.classList.add("flash");
      }else if(r === 3){
        await sleep(120);
        cinematic.classList.add("flash");
      }else{
        await sleep(90);
        cinematic.classList.add("flash");
      }

      await sleep(520);
      if(r >= 4) cinematic.classList.add("float");

      // stay on screen until user confirms
    }

    function hideCinematic(){
      const cinematic = document.getElementById("cinematic");
      if(!cinematic) return;
      cinematic.className = "cinematic";
      cinematic.setAttribute("aria-hidden","true");
      const cineImg = document.getElementById("cineImg");
      if(cineImg) cineImg.removeAttribute("src");
      const cineTenGrid = document.getElementById("cineTenGrid");
      if(cineTenGrid) cineTenGrid.innerHTML = "";
      const cineTen = document.getElementById("cineTen");
      if(cineTen) cineTen.classList.remove("show");
      // restore underlying confirm for non-cinematic paths
      if(typeof confirmBtn !== "undefined" && confirmBtn){
        confirmBtn.style.opacity = "1";
        confirmBtn.style.pointerEvents = "auto";
      }
    }



    function pickUniqueIndices(n, k){
      const out = [];
      const used = new Set();
      while(out.length < k && used.size < n){
        const x = Math.floor(Math.random()*n);
        if(used.has(x)) continue;
        used.add(x);
        out.push(x);
      }
      // fallback deterministic fill
      for(let i=0; out.length<k && i<n; i++){
        if(!used.has(i)){ used.add(i); out.push(i); }
      }
      return out;
    }

    
    const GRID_ROWS = 3;
    const GRID_COLS = 10;
    const GRID_COUNT = GRID_ROWS * GRID_COLS; // 30

function renderGridDecoys(list){
      grid32El.innerHTML = "";
      const frag = document.createDocumentFragment();
      for(let i=0;i<GRID_COUNT;i++){
        const a = list[i] || {id:"unknown", rarity:1, thumb:"/assets/placeholder.png"};
        const cell = document.createElement("div");
        cell.className = "cell";
        const wrap = document.createElement("div");
        wrap.className = "thumbWrap";
        const img = document.createElement("img");
        img.loading = "eager";
        img.decoding = "async";
        img.src = assetThumb(a);
        const lab = document.createElement("div");
        lab.className = "label";
        lab.textContent = assetLabel(a);
        wrap.appendChild(img);
        cell.appendChild(wrap);
        cell.appendChild(lab);
        frag.appendChild(cell);
      }
      grid32El.appendChild(frag);
      // clear states
      grid32El.querySelectorAll(".cell").forEach(c=>c.classList.remove("win","win2","red","dim"));
    }

    function getGridCellRects(){
      const cells = Array.from(grid32El.querySelectorAll(".cell"));
      // reset winner visuals
      cells.forEach(c=>c.classList.remove("win","win2","red"));
      const stageRect = framesLayer.getBoundingClientRect();
      return cells.map(c=>{
        // 框只對齊到圖片區域，不包含文字 label
        const target = c.querySelector(".thumbWrap") || c;
        const r = target.getBoundingClientRect();
        return {
          left: r.left - stageRect.left,
          top: r.top - stageRect.top,
          width: r.width,
          height: r.height
        };
      });
    }
    function placeFrame(frame, rect){
      frame.style.left = rect.left + "px";
      frame.style.top = rect.top + "px";
      frame.style.width = rect.width + "px";
      frame.style.height = rect.height + "px";
    }

    
    function instantRevealToSlots(winnerSlots, winners, isTen){
      let rects = getGridCellRects();
      framesLayer.innerHTML = "";
      hideCinematic();

      const cells = Array.from(grid32El.querySelectorAll(".cell"));
      cells.forEach(c=>c.classList.remove("win","win2","red","focus"));
      cells.forEach(c=>c.classList.add("dim"));

      const finalSlotsAll = Array.isArray(winnerSlots) ? winnerSlots.slice() : [];
      const framesCount = isTen ? 10 : 1;
      const finalSlots = finalSlotsAll.slice(0, framesCount);
      while(finalSlots.length < framesCount) finalSlots.push(0);

      const frame = document.createElement("div");
      frame.className = "jump-frame gold";
      framesLayer.appendChild(frame);

      const lastSlot = finalSlots[framesCount-1] || 0;
      placeFrame(frame, rects[lastSlot]);

      const winSet = new Set(finalSlots);
      for(let i=0;i<framesCount;i++){
        const slot = finalSlots[i];
        const cell = cells[slot];
        if(!cell) continue;

        cell.classList.remove("dim");
        cell.classList.add("win","win2");
        if(isTen && i === framesCount-1) cell.classList.add("red");

        const w = Array.isArray(winners) ? winners[i] : null;
        const rr = Math.max(1, Math.min(5, Number(w?.rarity || 1)));
        ["r1","r2","r3","r4","r5"].forEach(x=>cell.classList.remove(x));
        cell.classList.add(`r${rr}`);
      }

      cells.forEach((c, idx)=>{
        if(winSet.has(idx)) c.classList.remove("dim");
        else c.classList.add("dim");
      });
    }

async function animateJumpGridToSlots(winnerSlots, winners, isTen){
      let rects = getGridCellRects();

      framesLayer.innerHTML = "";
      hideCinematic();

      const cells = Array.from(grid32El.querySelectorAll(".cell"));
      // start: all dark
      cells.forEach(c=>c.classList.remove("win","win2","red","focus"));
      cells.forEach(c=>c.classList.add("dim"));

      const finalSlotsAll = Array.isArray(winnerSlots) ? winnerSlots.slice() : [];
      const framesCount = isTen ? 10 : 1;
      const finalSlots = finalSlotsAll.slice(0, framesCount);
      while(finalSlots.length < framesCount) finalSlots.push(0);

      // one visible frame for ten-pull (clearer), single frame for single-pull
      const frame = document.createElement("div");
      frame.className = "jump-frame gold";
      framesLayer.appendChild(frame);

      // start position
      let slotNow = pickUniqueIndices(GRID_COUNT, 1)[0] || 0;
      placeFrame(frame, rects[slotNow]);
      frame.classList.remove("jump");
      void frame.offsetWidth;
      frame.classList.add("jump");

      // helper: run a mini spin then land on target slot
      async function spinAndLand(targetSlot, idx, total){
        // spin
        const steps = isTen ? 18 : 30;
        let interval = 34;
        for(let s=0;s<steps;s++){
          await sleep(interval);
          rects = getGridCellRects();
          slotNow = pickUniqueIndices(GRID_COUNT, 1)[0] || slotNow;
          placeFrame(frame, rects[slotNow]);
          frame.classList.remove("jump");
          void frame.offsetWidth;
          frame.classList.add("jump");
          if(s > steps*0.55) interval = Math.min(190, Math.round(interval*1.10 + 3));
        }

        // land
        await sleep(90);
        rects = getGridCellRects();
        slotNow = targetSlot;
        placeFrame(frame, rects[slotNow]);
        frame.classList.remove("jump");
        void frame.offsetWidth;
        frame.classList.add("jump");

        // frame style: last one red
        if(isTen && idx === total - 1){
          frame.classList.remove("gold");
          frame.classList.add("red");
        }else{
          frame.classList.remove("red");
          frame.classList.add("gold");
        }

        const cell = cells[slotNow];
        if(cell){
          cell.classList.remove("dim");
          cell.classList.add("win","focus");
          if(isTen && idx === total - 1) cell.classList.add("red");
          setTimeout(()=>cell.classList.add("win2"), 30);
          setTimeout(()=>cell.classList.remove("focus"), 280);
        }

        const w = Array.isArray(winners) ? winners[idx] : null;
        const rr = Math.max(1, Math.min(5, Number(w?.rarity || 1)));

        // apply rarity class to landed cell for stronger visual difference
        if(cell){
          ["r1","r2","r3","r4","r5"].forEach(x=>cell.classList.remove(x));
          cell.classList.add(`r${rr}`);
        }

        sfxByRarity(rr);
        packHitFx(rr);

        await sleep(isTen ? 260 : 0);
      }

      if(isTen){
        // stop one by one, each stop lights up that card
        for(let i=0;i<framesCount;i++){
          await spinAndLand(finalSlots[i], i, framesCount);
        }
      }else{
        // single pull: one landing
        await spinAndLand(finalSlots[0], 0, 1);
      }

      // keep non-winners dark, winners already lit
      const winSet = new Set(finalSlots);
      cells.forEach((c, idx)=>{
        if(winSet.has(idx)) c.classList.remove("dim");
        else c.classList.add("dim");
      });

      // keep frame on last landed card
      frame.classList.remove("fade");
    }

    async function buildGridWithPulled(pulled, opts={}){
      const assets = await ensureAssetsLoaded();
      const wantType = opts && opts.type ? normalizeType(opts.type) : null;

      // Decoy pool (never grants items): use /api/assets list filtered by type if requested
      let pool = Array.isArray(assets) ? assets.slice() : [];
      if(wantType){
        pool = pool.filter(a => normalizeType(a && a.type) === wantType);
      }

      // Winners: what the backend actually granted (1 or 10)
      const winners = Array.isArray(pulled) ? pulled.slice() : [];
      const winnersCount = (Number(opts.count||1) === 10) ? 10 : 1;

      // Normalize winners length
      const finalWinners = winners.slice(0, winnersCount);
      while(finalWinners.length < winnersCount && winners[finalWinners.length]) finalWinners.push(winners[finalWinners.length]);

      // Build 20/29 decoys
      const decoyCount = GRID_COUNT - winnersCount;
      const decoys = [];
      if(pool.length > 0){
        for(let i=0;i<decoyCount;i++){
          decoys.push(pool[Math.floor(Math.random()*pool.length)]);
        }
      }else{
        for(let i=0;i<decoyCount;i++) decoys.push({id:"unknown", rarity:1, thumb:"/assets/placeholder.png"});
      }

      // Place winners into random slots within the 30-grid
      const winnerSlots = pickUniqueIndices(GRID_COUNT, winnersCount);
      const grid = new Array(GRID_COUNT).fill(null);

      // fill winners
      for(let i=0;i<winnersCount;i++){
        grid[winnerSlots[i]] = finalWinners[i] || {id:"unknown", rarity:1, thumb:"/assets/placeholder.png"};
      }
      // fill remaining with decoys
      let di=0;
      for(let i=0;i<GRID_COUNT;i++){
        if(grid[i]) continue;
        grid[i] = decoys[di++] || {id:"unknown", rarity:1, thumb:"/assets/placeholder.png"};
      }

      // Preload thumbs before showing new 30 cards so previous pack never flashes
      try{
        const urls = grid.map(a=>assetThumb(a));
        await preloadImages(urls, 8000);
      }catch(_){}

      renderGridDecoys(grid);
      hideLoad();

      // Clear any dim/frames state before animation
      const cells = Array.from(grid32El.querySelectorAll(".cell"));
      cells.forEach(c=>c.classList.remove("win","win2","red","dim"));

      // let browser paint
      overlay.offsetHeight;
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));

      return { winnerSlots, winners: finalWinners };
    }

    async function prepareGridStage(opts={}){
      // Backward-compatible wrapper (not used by the new flow)
      const data = await onlineGacha(opts);
      return buildGridWithPulled(data.pulled, opts);
    }

    async function startGacha(opts={}){
      if(animating) return;
      animating = true;

      try{
        if(actionBar){ actionBar.classList.add("mode-loading"); actionBar.classList.remove("mode-done"); }
        confirmBtn.style.opacity = "0";
        confirmBtn.style.pointerEvents = "none";
        showOverlay();
        // Cover previous 30 cards until the new 30 cards are fully loaded
        showLoad("載入中");

        // 1) Get the real awarded cards first (backend decides)
        if(rollingText) rollingText.style.display = "";
        if(rollSub) rollSub.style.display = "none";
        if(rollSub) rollSub.textContent = "";
        
        const data = await onlineGacha(opts);
        const pulled = data && Array.isArray(data.pulled) ? data.pulled : [];
        if(!pulled || pulled.length === 0) throw new Error("empty");
        try{ updatePityUI(data); }catch(_){ }

        // 2) Build the 30-card grid BEFORE animation:
        //    30 cards include the 1/10 real rewards, plus decoys (from /api/assets) for visuals only
        // still showing rollingText below cards while preparing

        const isTen = Number(opts.count||1) === 10;
        const skipAnim = (chkSkipAnim && chkSkipAnim.checked);

        if(skipAnim){
          // Skip ALL pack-grid visuals and jump straight to the cinematic result page
          hideLoad();
          if(rollingText) rollingText.style.display = "none";
          if(rollSub){ rollSub.style.display = ""; rollSub.textContent = ""; }

          try{
            await playCinematicForPack(pulled, isTen);
          }catch(_){ /* ignore cinematic errors */ }
        }else{
          const pack = await buildGridWithPulled(pulled, opts);

          // 3) Run animation but DO NOT change grid content; only land frames onto the pre-decided winners
          if(rollingText) rollingText.style.display = "";
          if(rollSub) rollSub.style.display = "none";
          if(rollSub) rollSub.textContent = "";

          await animateJumpGridToSlots(pack.winnerSlots, pack.winners, isTen);

          try{
            const winners = Array.isArray(pack.winners) ? pack.winners : [];
            await playCinematicForPack(winners, isTen);
          }catch(_){ /* ignore cinematic errors */ }
        }

        if(rollingText) rollingText.style.display = "none";
        if(rollSub){ rollSub.style.display = ""; rollSub.textContent = isTen ? "" : ""; }
        if(actionBar){ actionBar.classList.add("mode-done"); actionBar.classList.remove("mode-loading"); }
        confirmBtn.style.opacity = "1";
        confirmBtn.style.pointerEvents = "auto";
        animating = false;
      }catch(e){
        console.error(e);
        hideLoad();
        if(rollingText) rollingText.style.display = "none";
        const raw = String(e?.message || e || "");
        const nice = (function(msg){
          // backend errors: insufficient_gold / insufficient_gem / unauthorized
          if(msg.includes("insufficient_gold")) return "Gold 不足";
          if(msg.includes("insufficient_gem")) return "Gem 不足";
          if(msg.includes("unauthorized")) return "尚未登入，請重新整理";
          if(msg.includes("not_found")) return "API 不存在，請檢查 worker";
          // keep short
          if(msg.startsWith("gacha_http_")) return "抽卡失敗";
          return msg ? `抽卡失敗：${msg}` : "抽卡失敗";
        })(raw);
        if(rollSub){ rollSub.style.display = ""; rollSub.textContent = nice; }
        toast(nice);
        if(actionBar){ actionBar.classList.add("mode-done"); actionBar.classList.remove("mode-loading"); }
        confirmBtn.style.opacity = "1";
        confirmBtn.style.pointerEvents = "auto";
        animating = false;
      }
    }
    loadFeaturedVideo();
    loadPityStatus();

    btnNormal1.addEventListener("click", () => startGacha({ count: 1, premium: false }));
    btnNormal10.addEventListener("click", () => startGacha({ count: 10, premium: false }));
    btnPremium1.addEventListener("click", () => startGacha({ count: 1, premium: true }));
    btnPremium10.addEventListener("click", () => startGacha({ count: 10, premium: true }));

    // 右側 5 個分類區塊 (普通抽卡 但強制 type)
    btnHead1.addEventListener("click", () => startGacha({ count: 1, premium: false, type: "head" }));
    btnHead10.addEventListener("click", () => startGacha({ count: 10, premium: false, type: "head" }));

    btnBody1.addEventListener("click", () => startGacha({ count: 1, premium: false, type: "body" }));
    btnBody10.addEventListener("click", () => startGacha({ count: 10, premium: false, type: "body" }));

    btnBg1.addEventListener("click", () => startGacha({ count: 1, premium: false, type: "background" }));
    btnBg10.addEventListener("click", () => startGacha({ count: 10, premium: false, type: "background" }));

    btnAddon11.addEventListener("click", () => startGacha({ count: 1, premium: false, type: "addon1" }));
    btnAddon110.addEventListener("click", () => startGacha({ count: 10, premium: false, type: "addon1" }));

    btnAddon21.addEventListener("click", () => startGacha({ count: 1, premium: false, type: "addon2" }));
    btnAddon210.addEventListener("click", () => startGacha({ count: 10, premium: false, type: "addon2" }));
  

//--- script 1 ---

(function(){
  function liftOverlays(){
    try{
      const cine = document.getElementById('cinematic');
      const ov = document.getElementById('overlay');
      if(cine && cine.parentElement !== document.body){
        document.body.appendChild(cine);
      }
      if(ov && ov.parentElement !== document.body){
        document.body.appendChild(ov);
      }
    }catch(e){}
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', liftOverlays, {once:true});
  }else{
    liftOverlays();
  }
  // run again after masterpage finishes rendering
  setTimeout(liftOverlays, 50);
  setTimeout(liftOverlays, 300);
})();


//--- script 2 ---

(async function(){
  const T = window.ACF_t || ((k)=>k);
  const lang = (window.ACF_getLang ? window.ACF_getLang() : (localStorage.getItem("acf_lang")||"en"));

  const box = document.getElementById("acfAriaBox");
  const imgEl = document.getElementById("acfAriaImg");
  const textEl = document.getElementById("acfAriaText");
  const btnNext = document.getElementById("acfAriaNext");
  const mask = document.getElementById("acfTutorMask");

  function setImg(key){
    const map = {
      "default": "/ui/npc/aria_default.webp",
      "guide": "/ui/npc/aria_guide.webp",
      "discover": "/ui/npc/aria_discover.webp",
      "success": "/ui/npc/aria_success.webp",
      "warning": "/ui/npc/aria_warning.webp",
      "full": "/ui/npc/aria_full.webp"
    };
    imgEl.src = map[key] || map["default"];
    imgEl.onerror = ()=>{ imgEl.onerror=null; imgEl.src = map["default"]; };
  }

  function show(msgKey, imgKey){
    setImg(imgKey || "default");
    textEl.textContent = T(msgKey, msgKey);
    box.style.display = "block";
    mask.style.display = "block";
  }
  function hide(){
    box.style.display = "none";
    mask.style.display = "none";
    unpulseAll();
  }
  function pulse(el){
    if(!el) return;
    el.classList.add("acfTutorPulse");
    el.scrollIntoView({ block:"center", inline:"center", behavior:"smooth" });
  }
  function unpulseAll(){
    document.querySelectorAll(".acfTutorPulse").forEach(n=>n.classList.remove("acfTutorPulse"));
  }

  const btnNormal1 = document.getElementById("btnNormal1");
  const btnNormal10 = document.getElementById("btnNormal10");
  const btnPremium1 = document.getElementById("btnPremium1");
  const btnPremium10 = document.getElementById("btnPremium10");
  const confirmBtn = document.getElementById("confirmBtn");

  function lockOther(){
    [btnNormal10, btnPremium1, btnPremium10].forEach(b=>{ if(b){ b.style.pointerEvents="none"; b.style.opacity="0.35"; }});
  }
  function warnFollow(){
    show("aria_ch1_warn_follow","warning");
    unpulseAll();
    pulse(btnNormal1);
  }

  async function getStatus(){
    try{
      const r = await apiFetch(`/api/tutorial/status`, { method:"GET" });
      return await r.json();
    }catch(e){
      return null;
    }
  }

  let st = await getStatus();
  if(!st || !st.ok || st.done) return;

  lockOther();

  btnNext.onclick = ()=>hide();

  async function render(){
    st = await getStatus();
    if(!st || !st.ok) return;

    if(st.done){
      hide();
      [btnNormal10, btnPremium1, btnPremium10].forEach(b=>{ if(b){ b.style.pointerEvents=""; b.style.opacity=""; }});
      return;
    }

    const step = st.step|0;
    if(step <= 1){
      show("aria_ch1_step1","default");
      unpulseAll(); pulse(btnNormal1);
    }else if(step === 2){
      show("aria_ch1_step2","guide");
      unpulseAll(); pulse(btnNormal1);
    }else if(step >= 3){
      show("aria_ch1_toStudio","success");
      unpulseAll();
      btnNext.onclick = ()=>{
        hide();
        location.href = "/studio";
      };
    }
  }

  // first message includes welcome then instruction
  show("aria_ch1_welcome","full");
  setTimeout(()=>{ render(); }, 700);

  // prevent other draw buttons
  [btnNormal10, btnPremium1, btnPremium10].forEach(b=> b && b.addEventListener("click", (e)=>{ e.preventDefault(); e.stopPropagation(); warnFollow(); }, true));

  // after confirm, refresh step
  if(confirmBtn){
    confirmBtn.addEventListener("click", ()=>{ setTimeout(render, 200); }, true);
  }

  // language switch refresh
  window.addEventListener("acf:lang", ()=>{ if(box.style.display==="block"){ render(); }});
})();

