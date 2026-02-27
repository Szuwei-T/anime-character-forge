export default {
  async fetch(req, env) {
    // Always attach CORS headers, even if a handler returns a raw Response
    // or an unexpected exception happens.
    try {
      const url = new URL(req.url);
      const path = url.pathname;

      if(path.startsWith("/api/rank") || path === "/api/leaderboard"){
        try{ await ensureCoreIndexes(env); }catch(_){ }
      }

      if (req.method === "OPTIONS") return withCors(corsPreflight());

      if (path === "/api/ping") return withCors(json({ ok: true, ts: Date.now() }));

      // Legacy session init used by older frontends
      if (path === "/api/session/init" && req.method === "POST") return withCors(await apiSessionInit(req, env));

      if (path === "/api/assets" && req.method === "GET") return withCors(await assets(req, env));

      if (path === "/api/me/assets" && req.method === "GET") return withCors(await meAssets(req, env));

      if (path === "/api/seed" && req.method === "POST") return withCors(await seed(req, env));

      if (path === "/api/gacha" && req.method === "POST") return withCors(await gacha(req, env));

      if (path === "/api/gacha/pity" && req.method === "GET") return withCors(await gachaPity(req, env));

      if (path === "/api/submit" && req.method === "POST") return withCors(await submit(req, env));
      if (path === "/api/save" && req.method === "POST") return withCors(await save(req, env));
      if (path === "/api/upgrade" && req.method === "POST") return withCors(await upgrade(req, env));

      if (path === "/api/gallery" && req.method === "GET") return withCors(await gallery(req, env));

      if (path === "/api/me/saves" && req.method === "GET") return withCors(await apiMeSaves(req, env));

      // Account (player profile)
      if (path === "/api/me/account" && req.method === "GET") return withCors(await apiMeAccount(req, env));
      if (path === "/api/me/account" && req.method === "POST") return withCors(await apiMeAccountUpsert(req, env));
      if (path === "/api/me/avatar" && req.method === "GET") return withCors(await apiMeAvatarGet(req, env));
      if (path === "/api/me/avatar" && req.method === "POST") return withCors(await apiMeAvatarSet(req, env));

      // Backward-compatible account endpoints (older frontends)
      if ((path === "/api/me" || path === "/api/account" || path === "/api/user") && req.method === "GET") return withCors(await apiMeAccount(req, env));

      // Podium: top 3 by votes for current season (or all seasons)
      if (path === "/api/podium" && req.method === "GET") return withCors(await apiPodium(req, env));


      // Recipes page APIs
      // recipes table: 1 record = 1 image at /assets/[recipeId].png
      if (path === "/api/recipes" && req.method === "GET") return withCors(await apiRecipes(req, env));
      // user_unlocks table: unlocked recipeIds by user
      if ((path === "/api/unlocks" || path === "/api/me/unlocks") && req.method === "GET") return withCors(await apiUnlocks(req, env));
      if (path === "/api/unlock" && req.method === "POST") return withCors(await apiUnlock(req, env));

      if (path === "/api/vote" && req.method === "POST") return withCors(await vote(req, env));

      if (path === "/api/leaderboard" && req.method === "GET") return withCors(await leaderboard(req, env));


      if (path === "/api/rank/favorites" && req.method === "GET") return withCors(await apiRankFavorites(req, env));
      if (path === "/api/rank/newcomers" && req.method === "GET") return withCors(await apiRankNewcomers(req, env));
      if (path === "/api/rank/authors" && req.method === "GET") return withCors(await apiRankAuthors(req, env));


if (path === "/api/season/current" && req.method === "GET") return withCors(await apiSeasonCurrent(req, env));

if (path === "/api/follow" && req.method === "POST") return withCors(await apiFollow(req, env));
if (path === "/api/follow" && req.method === "DELETE") return withCors(await apiUnfollow(req, env));
if (path === "/api/me/following" && req.method === "GET") return withCors(await apiMeFollowing(req, env));

if (path === "/api/favorite" && req.method === "POST") return withCors(await apiFavorite(req, env));
if (path === "/api/favorite" && req.method === "DELETE") return withCors(await apiUnfavorite(req, env));
if (path === "/api/me/favorites" && req.method === "GET") return withCors(await apiMeFavorites(req, env));

      // Recommend: spend 50 GEM to push a showcase into "本期推薦" (max 5 per user per season per showcase)
      if (path === "/api/recommend" && req.method === "POST") return withCors(await apiRecommend(req, env));


      // Comments
      if (path === "/api/comments" && req.method === "GET") return withCors(await apiCommentsGet(req, env));
      if (path === "/api/comments" && req.method === "POST") return withCors(await apiCommentPost(req, env));
      if (path === "/api/comments" && req.method === "DELETE") return withCors(await apiCommentDelete(req, env));

if (path === "/api/user/profile" && req.method === "GET") return withCors(await apiUserProfile(req, env));
if (path === "/api/user/showcases" && req.method === "GET") return withCors(await apiUserShowcases(req, env));


      if (path === "/api/featured" && req.method === "GET") return withCors(await apiFeatured(req, env));

      // Showcase slot (one per user per season)
      if (path === "/api/me/showcase" && req.method === "GET") return withCors(await apiMeShowcase(req, env));
      if (path === "/api/me/showcase" && req.method === "POST") return withCors(await apiMeShowcaseUpsert(req, env));

      if (path === "/api/me/showcases" && req.method === "GET") return withCors(await apiMeShowcases(req, env));
      // Store / Stripe
      if (path === "/api/store/packs" && req.method === "GET") return withCors(await storePacks(req, env));
      if (path === "/api/store/create-checkout-session" && req.method === "POST") return withCors(await storeCreateCheckout(req, env));
      if (path === "/api/store/webhook" && req.method === "POST") return withCors(await storeWebhook(req, env));


      if (path === "/api/share/reward" && req.method === "POST") return withCors(await apiShareReward(req, env));


      return withCors(json({ ok: false, error: "not_found" }, 404));
    } catch (e) {
      // Always CORS, even on crash
      return withCors(json({ ok: false, error: String(e?.message || e), stack: e?.stack || "" }, 500));
    }
  },
};

function withCors(resp) {
  // Avoid modifying if already has ACAO
  try {
    const h = new Headers(resp.headers);
    if (!h.has("Access-Control-Allow-Origin")) {
      const ch = corsHeaders();
      for (const [k, v] of Object.entries(ch)) h.set(k, v);
    }
    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: h,
    });
  } catch {
    return resp;
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    // DELETE is required for follow/favorite endpoints.
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "content-type,x-user-id,x-session-token,authorization,x-admin-key,stripe-signature",
    "Access-Control-Max-Age": "86400",
  };
}
function corsPreflight() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders() },
  });
}
async function readJson(req) {
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return {};
  try {
    return await req.json();
  } catch {
    return {};
  }
}
function b64urlEncode(bytes){
  const bin = typeof bytes === "string" ? bytes : String.fromCharCode(...bytes);
  return btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function b64urlDecodeToBytes(s){
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const b64 = (s + pad).replace(/-/g,"+").replace(/_/g,"/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function hmacSha256(secret, msg){
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name:"HMAC", hash:"SHA-256" }, false, ["sign","verify"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return new Uint8Array(sig);
}
function tokenPayload(userId, iat){ return `${userId}.${iat}`; }

async function signSessionToken(env, userId){
  const secret = (env && env.AUTH_SECRET) ? String(env.AUTH_SECRET) : "";
  if(!secret) return "";
  const iat = Date.now();
  const msg = tokenPayload(userId, iat);
  const sigBytes = await hmacSha256(secret, msg);
  const sig = b64urlEncode(sigBytes);
  return `${userId}.${iat}.${sig}`;
}

async function verifySessionToken(env, token){
  const secret = (env && env.AUTH_SECRET) ? String(env.AUTH_SECRET) : "";
  if(!secret) return { ok:false, userId:"" };
  const t = String(token || "").trim();
  const parts = t.split(".");
  if(parts.length !== 3) return { ok:false, userId:"" };
  const [userId, iatStr, sig] = parts;
  const iat = Number(iatStr || 0);
  if(!userId || !Number.isFinite(iat) || iat <= 0) return { ok:false, userId:"" };
  const maxAgeMs = 180 * 86400000;
  if(Date.now() - iat > maxAgeMs) return { ok:false, userId:"" };
  const msg = tokenPayload(userId, iat);
  const sigBytes = b64urlDecodeToBytes(sig);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name:"HMAC", hash:"SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(msg));
  return ok ? { ok:true, userId } : { ok:false, userId:"" };
}

async function getAuthedUserId(req, env){
  const tok = req.headers.get("x-session-token") || req.headers.get("X-Session-Token") || "";
  const v = await verifySessionToken(env, tok);
  return v.ok ? v.userId : "anon";
}

async function getUserId(req, env) {
  // Server authoritative auth: require valid session token for state-changing APIs
  const tok = req.headers.get("x-session-token") || req.headers.get("X-Session-Token") || "";
  const v = await verifySessionToken(env, tok);
  if(v.ok) return v.userId;

  // Allow read-only endpoints to use uid query/header (backward compatibility)
  const h = req.headers.get("x-user-id");
  if (h && h.trim()) return h.trim();
  const url = new URL(req.url);
  const q = url.searchParams.get("uid");
  if (q && q.trim()) return q.trim();
  return "anon";
}
async function ensureRateLimitsTable(env){
  const db = env.DB;
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      k TEXT PRIMARY KEY,
      bucket INTEGER NOT NULL,
      c INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `).run();
  try{ await db.prepare("CREATE INDEX IF NOT EXISTS idx_rate_limits_bucket ON rate_limits(bucket)").run(); }catch(_){}
}

async function rateLimit(env, userId, action, limit, windowMs){
  if(!userId || userId==="anon") return { ok:false, error:"unauthorized" };
  const db = env.DB;
  await ensureRateLimitsTable(env);
  const now = Date.now();
  const bucket = Math.floor(now / Math.max(1000, Number(windowMs||60000)));
  const k = `${String(action||"api")}:${userId}:${bucket}`;
  await db.prepare("INSERT OR IGNORE INTO rate_limits (k,bucket,c,updatedAt) VALUES (?1,?2,0,?3)").bind(k, bucket, now).run();
  const up = await db.prepare("UPDATE rate_limits SET c=c+1, updatedAt=?3 WHERE k=?1 AND c < ?2").bind(k, Number(limit||30), now).run();
  const allowed = (up?.meta?.changes || 0) > 0;
  if(!allowed){
    const row = await db.prepare("SELECT c FROM rate_limits WHERE k=?1").bind(k).first();
    return { ok:false, error:"rate_limited", limit:Number(limit||30), used:Number(row?.c||0) };
  }
  return { ok:true };
}

async function ensureCoreIndexes(env){
  const db = env.DB;
  // These are safe no-op if table missing; wrap each in try/catch.
  try{ await db.prepare("CREATE INDEX IF NOT EXISTS idx_user_saves_user_savedOn ON user_saves(userId, savedOn)").run(); }catch(_){}
  try{ await db.prepare("CREATE INDEX IF NOT EXISTS idx_user_saves_user_score ON user_saves(userId, systemScore)").run(); }catch(_){}
  try{ await db.prepare("CREATE INDEX IF NOT EXISTS idx_showcases_season_created ON showcases(seasonId, createdAt)").run(); }catch(_){}
  try{ await db.prepare("CREATE INDEX IF NOT EXISTS idx_showcases_season_votes ON showcases(seasonId, votes)").run(); }catch(_){}
  try{ await db.prepare("CREATE INDEX IF NOT EXISTS idx_votes_v2_season_show ON votes_v2(seasonId, showcaseId)").run(); }catch(_){}
  try{ await db.prepare("CREATE INDEX IF NOT EXISTS idx_votes_v2_voter ON votes_v2(voterId, createdAt)").run(); }catch(_){}
  try{ await db.prepare("CREATE INDEX IF NOT EXISTS idx_recommends_v1_season_show ON recommends_v1(seasonId, showcaseId)").run(); }catch(_){}
  try{ await db.prepare("CREATE INDEX IF NOT EXISTS idx_recommends_v1_user ON recommends_v1(recommenderId, createdAt)").run(); }catch(_){}
  try{ await db.prepare("CREATE INDEX IF NOT EXISTS idx_recommends_v2_season_show ON recommends_v2(seasonId, showcaseId)").run(); }catch(_){}
  try{ await db.prepare("CREATE INDEX IF NOT EXISTS idx_recommends_v2_user_day ON recommends_v2(recommenderId, dayKey)").run(); }catch(_){}
  try{ await db.prepare("CREATE INDEX IF NOT EXISTS idx_recommends_v2_showcase_day ON recommends_v2(showcaseId, dayKey)").run(); }catch(_){}
  try{ await db.prepare("CREATE INDEX IF NOT EXISTS idx_follows_target ON follows(targetUserId, createdAt)").run(); }catch(_){}
  try{ await db.prepare("CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(userId, createdAt)").run(); }catch(_){}
}


async function assets(req, env) {
  const db = env.DB;
  await ensureAssetsTagsColumn(db);
  const rows = await db.prepare("SELECT assetId, type, rarity, imageUrl, IFNULL(tags,'') AS tags FROM assets ORDER BY type, rarity, assetId").all();
  return json({ ok: true, assets: rows.results || [] });
}

async function meAssets(req, env) {
  const db = env.DB;
  const userId = await getUserId(req, env);
  const rows = await db.prepare("SELECT assetId, count, stars FROM user_assets WHERE userId=?1 ORDER BY assetId").bind(userId).all();
  return json({ ok: true, userId, items: rows.results || [] });
}

// --- Recipes APIs ---
async function getTableColumns(db, tableName) {
  try {
    const r = await db.prepare(`PRAGMA table_info(${tableName})`).all();
    return new Set((r.results || []).map((x) => String(x.name)));
  } catch {
    return new Set();
  }
}

async function ensureAssetsTagsColumn(db){
  const cols = await getTableColumns(db, "assets");
  if(!cols || !cols.size) return;
  if(!cols.has("tags")){
    try{ await db.prepare("ALTER TABLE assets ADD COLUMN tags TEXT DEFAULT ''").run(); }catch(e){}
  }
}

async function ensureUserSavesSystemScoreColumn(db){
  const cols = await getTableColumns(db, "user_saves");
  if(!cols || !cols.size) return;
  if(!cols.has("systemScore")){
    try{ await db.prepare("ALTER TABLE user_saves ADD COLUMN systemScore INTEGER DEFAULT 0").run(); }catch(e){}
  }
}


function pickFirst(set, candidates) {
  for (const c of candidates) if (set.has(c)) return c;
  return "";
}


// --- Featured APIs ---
async function apiFeatured(req, env) {
  const db = env.DB;
  const url = new URL(req.url);
  const seasonId = String(url.searchParams.get("seasonId") || "S1").slice(0, 40);
  const featured = await getFeaturedForSeason(db, seasonId);
  return json({ ok: true, seasonId, featured });
}

async function getFeaturedForSeason(db, seasonId) {
  const cols = await getTableColumns(db, "featured");
  if (!cols || cols.size === 0) return [];

  const seasonCol = pickFirst(cols, ["seasonId", "season_id", "season", "seasonKey", "season_key"]);
  const idCol = pickFirst(cols, ["featuredId", "featured_id", "assetId", "asset_id", "id"]);
  const typeCol = pickFirst(cols, ["type", "assetType", "asset_type"]);
  const orderCol = pickFirst(cols, ["sortOrder", "sort_order", "sort", "position", "pos", "idx", "order"]);

  if (!idCol) return [];

  const selectCols = `${idCol} AS featuredId` + (typeCol ? `, ${typeCol} AS type` : "");
  const orderBy = orderCol ? `ORDER BY ${orderCol}` : `ORDER BY ${idCol}`;

  let rows = null;
  try {
    if (seasonCol) {
      rows = await db.prepare(`SELECT ${selectCols} FROM featured WHERE ${seasonCol}=?1 ${orderBy}`).bind(seasonId).all();
    } else {
      rows = await db.prepare(`SELECT ${selectCols} FROM featured ${orderBy}`).all();
    }
  } catch {
    return [];
  }

  return (rows?.results || []).map((r) => ({
    featuredId: r.featuredId,
    type: r.type || "",
    videoUrl: `/assets/${r.featuredId}.mp4`,
  }));
}

async function getFeaturedIdSet(db, seasonId) {
  const list = await getFeaturedForSeason(db, seasonId);
  const ids = (list || []).map((x) => String(x.featuredId || "").trim()).filter(Boolean);
  return new Set(ids);
}

function inClause(startIndex, n) {
  const parts = [];
  for (let i = 0; i < n; i++) parts.push(`?${startIndex + i}`);
  return parts.join(",");
}

async function pickAssetWithFeaturedBoost(db, whereSql, binds, featuredIds, boost = 3) {
  // whereSql should be something like: "type=?1 AND rarity=?2" (matches binds order)
  const baseSelect = `SELECT assetId, type, rarity, imageUrl, IFNULL(tags,'') AS tags FROM assets WHERE ${whereSql}`;

  if (!featuredIds || featuredIds.length === 0) {
    return await db.prepare(`${baseSelect} ORDER BY RANDOM() LIMIT 1`).bind(...binds).first();
  }

  const start = binds.length + 1;
  const inC = inClause(start, featuredIds.length);
  const bindAll = binds.concat(featuredIds);

  const rf = await db.prepare(`SELECT COUNT(*) AS c FROM assets WHERE ${whereSql} AND assetId IN (${inC})`).bind(...bindAll).first();
  const rt = await db.prepare(`SELECT COUNT(*) AS c FROM assets WHERE ${whereSql}`).bind(...binds).first();

  const nF = Number(rf?.c || 0);
  const nT = Number(rt?.c || 0);
  const nN = Math.max(0, nT - nF);
  if (nT <= 0) return null;

  let chooseFeatured = false;
  if (nF > 0) {
    const totalW = boost * nF + nN;
    chooseFeatured = Math.random() * totalW < boost * nF;
  }

  let asset = null;
  if (chooseFeatured && nF > 0) {
    asset = await db.prepare(`${baseSelect} AND assetId IN (${inC}) ORDER BY RANDOM() LIMIT 1`).bind(...bindAll).first();
  }
  if (!asset && nN > 0) {
    asset = await db.prepare(`${baseSelect} AND assetId NOT IN (${inC}) ORDER BY RANDOM() LIMIT 1`).bind(...bindAll).first();
  }
  if (!asset) {
    asset = await db.prepare(`${baseSelect} ORDER BY RANDOM() LIMIT 1`).bind(...binds).first();
  }
  return asset;
}



async function apiRecipes(req, env) {
  const db = env.DB;
  await ensureAssetsTagsColumn(db);

  const cols = await getTableColumns(db, "recipes");
  const recipeCol = pickFirst(cols, ["recipeId", "recipe_id", "id"]);
  if (!recipeCol) return json({ ok: false, error: "recipes_schema" }, 500);

  // Optional columns (newer schema)
  const headCol = pickFirst(cols, ["headId", "head_id"]);
  const bodyCol = pickFirst(cols, ["bodyId", "body_id"]);
  const bgCol = pickFirst(cols, ["bgId", "bg_id"]);
  const a1Col = pickFirst(cols, ["addon1Id", "addon1_id"]);
  const a2Col = pickFirst(cols, ["addon2Id", "addon2_id"]);
  const rarityCol = pickFirst(cols, ["rarity"]);

  const selectCols = [
    `${recipeCol} AS recipeId`,
    headCol ? `${headCol} AS headId` : `'' AS headId`,
    bodyCol ? `${bodyCol} AS bodyId` : `'' AS bodyId`,
    bgCol ? `${bgCol} AS bgId` : `'' AS bgId`,
    a1Col ? `${a1Col} AS addon1Id` : `'' AS addon1Id`,
    a2Col ? `${a2Col} AS addon2Id` : `'' AS addon2Id`,
    rarityCol ? `${rarityCol} AS rarity` : `'' AS rarity`,
  ].join(", ");

  const rows = await db.prepare(`SELECT ${selectCols} FROM recipes ORDER BY ${recipeCol}`).all();
  const recipes = (rows.results || []).map((r) => ({
    recipeId: r.recipeId,
    headId: r.headId || "",
    bodyId: r.bodyId || "",
    bgId: r.bgId || "",
    addon1Id: r.addon1Id || "",
    addon2Id: r.addon2Id || "",
    rarity: r.rarity || "",
    imageUrl: `/assets/${r.recipeId}.png`,
  }));
  return json({ ok: true, recipes });
}


async function apiUnlocks(req, env) {
  const db = env.DB;
  const userId = await getUserId(req, env);

  const cols = await getTableColumns(db, "user_unlocks");
  const userCol = pickFirst(cols, ["userId", "uid", "user_id"]);
  const recipeCol = pickFirst(cols, ["recipeId", "recipe_id"]);
  if (!userCol || !recipeCol) return json({ ok: false, error: "user_unlocks_schema" }, 500);

  const rows = await db
    .prepare(`SELECT ${recipeCol} AS recipeId FROM user_unlocks WHERE ${userCol}=?1`)
    .bind(userId)
    .all();
  const unlocks = (rows.results || []).map((r) => r.recipeId);
  return json({ ok: true, userId, unlocks });
}


async function apiUnlock(req, env) {
  const db = env.DB;
  const userId = await getUserId(req, env);
  const body = await readJson(req);
  const recipeId = String(body.recipeId || body.recipe_id || "").trim();
  if (!recipeId) return json({ ok: false, error: "missing_recipeId" }, 400);

  if (!userId || userId === "anon") {
    // Still allow, but ensure it's not empty
  }

  await ensureUserUnlocksTable(db);

  try {
    await insertUnlockNoDup(db, userId, recipeId, Date.now());
  } catch (e) {
    return json({ ok: false, error: "unlock_failed", detail: String(e?.message || e) }, 500);
  }

  return json({ ok: true, userId, recipeId });
}

async function seed(req, env) {
  const body = await readJson(req);
  const key = body.adminKey || "";
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) return json({ ok: false, error: "forbidden" }, 403);

  const db = env.DB;
  await ensureAssetsTagsColumn(db);
  await db.prepare("DELETE FROM assets").run();
  await db.prepare("DELETE FROM recipes").run();

  const assets = buildSeedAssets();
  const stmt = db.prepare("INSERT INTO assets (assetId, type, rarity, imageUrl, tags) VALUES (?1, ?2, ?3, ?4, ?5)");
  for (const a of assets) await stmt.bind(a.assetId, a.type, a.rarity, a.imageUrl, a.tags || "").run();

  const recipes = buildSeedRecipes();
  const rstmt = db.prepare("INSERT INTO recipes (recipeId, headId, bodyId, bgId, addon1Id, addon2Id) VALUES (?1, ?2, ?3, ?4, ?5, ?6)");
  for (const r of recipes) await rstmt.bind(r.recipeId, r.headId, r.bodyId, r.bgId, r.addon1Id, r.addon2Id).run();

  return json({ ok: true, assets: assets.length, recipes: recipes.length });
}


async function apiMeSaves(req, env) {
  const db = env.DB;
  await ensureUserSavesSystemScoreColumn(db);
  await ensureAssetsTagsColumn(db);
  const userId = await getUserId(req, env);
  try {
    const rows = await db
      .prepare("SELECT userId, headId, bodyId, bgId, addon1Id, addon2Id, savedOn, IFNULL(systemScore,0) AS systemScore FROM user_saves WHERE userId=?1 ORDER BY savedOn DESC")
      .bind(userId)
      .all();

    const saves = (rows.results || []).map((r) => {
      const headId = r.headId || "";
      const bodyId = r.bodyId || "";
      const bgId = r.bgId || "";
      const addon1Id = r.addon1Id || "";
      const addon2Id = r.addon2Id || "";

      const u = (id) => (id ? `/assets/${id}.png` : "");
      return {
        savedOn: r.savedOn,
        headId,
        bodyId,
        bgId,
        addon1Id,
        addon2Id,
        headUrl: u(headId),
        bodyUrl: u(bodyId),
        bgUrl: u(bgId),
        addon1Url: u(addon1Id),
        addon2Url: u(addon2Id),
      };
    });

    return json({ ok: true, userId, saves });
  } catch (e) {
    return json({ ok: false, error: "failed_to_load_saves", detail: String(e?.message || e) }, 500);
  }
}

function buildSeedAssets() {
  const list = [];
  const add = (assetId, type, rarity, imageUrl) => list.push({ assetId, type, rarity, imageUrl });
  const rarities = [1, 2, 3, 4, 5];

  for (const r of rarities) {
    for (let i = 1; i <= 6; i++) add(`head_${r}_${i}`, "head", r, `/assets/head_${r}_${i}.png`);
    for (let i = 1; i <= 6; i++) add(`body_${r}_${i}`, "body", r, `/assets/body_${r}_${i}.png`);
    for (let i = 1; i <= 6; i++) add(`background_${r}_${i}`, "background", r, `/assets/background_${r}_${i}.png`);
    for (let i = 1; i <= 3; i++) add(`addon1_${r}_${i}`, "addon1", r, `/assets/addon1_${r}_${i}.png`);
    for (let i = 1; i <= 3; i++) add(`addon2_${r}_${i}`, "addon2", r, `/assets/addon2_${r}_${i}.png`);
  }
  return list;
}

function buildSeedRecipes() {
  return [
    { recipeId: "R_NEON_QUEEN", headId: "head_4_2", bodyId: "body_5_1", bgId: "background_1_1", addon1Id: "", addon2Id: "" },
  ];
}

function clampInt(v, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function rollRarity(premium = false) {
  const r = Math.random();
  if (premium) {
    if (r < 0.60) return 2;
    if (r < 0.90) return 3;
    if (r < 0.98) return 4;
    return 5;
  }
  if (r < 0.60) return 1;
  if (r < 0.85) return 2;
  if (r < 0.95) return 3;
  if (r < 0.99) return 4;
  return 5;
}

function rollTypeDb() {
  // DB types
  const r = Math.random();
  if (r < 0.25) return "head";
  if (r < 0.50) return "body";
  if (r < 0.70) return "bg";
  return Math.random() < 0.5 ? "addon1" : "addon2";
}


async function gacha(req, env) {
  const db = env.DB;
  await ensureAssetsTagsColumn(db);
  const userId = await getUserId(req, env);
  if (!userId || userId === "anon") return json({ ok:false, error:"unauthorized" }, 401);

  const body = await readJson(req);

  const count = clampInt(body.count ?? body.rolls ?? 1, 1, 10);
  const premium = !!body.premium;

  const seasonId = String(body.seasonId || "S1").slice(0, 40);
  const featuredSet = await getFeaturedIdSet(db, seasonId);
  const featuredIds = Array.from(featuredSet);
  const FEATURED_BOOST = 3;

  // Optional forced type
  // Normalize incoming type to DB type naming
  let forcedType = String(body.type || "").trim().toLowerCase();

  // Accept UI aliases
  if (forcedType === "background") forcedType = "bg";
  if (forcedType === "accessory" || forcedType === "addon") forcedType = Math.random() < 0.5 ? "addon1" : "addon2";

  const allowed = new Set(["head", "body", "bg", "addon1", "addon2"]);
  if (!allowed.has(forcedType)) forcedType = "";

  // ===== Costs =====
  // Normal (main gacha): 100 gold per roll (10-roll = 1000)
  // Targeted type gacha (left 5 blocks): 150 gold per roll, 10-roll = 1300
  // Premium: 10 gem per roll (10-roll = 100)
  const costGold = premium ? 0 : (forcedType ? (count === 10 ? 1300 : (150 * count)) : (100 * count));
  const costGem  = premium ? (10 * count) : 0;

  await ensureUserAccountsTable(env);
  await ensureGachaPityTable(env);

  // Ensure account + pity rows exist
  await db.prepare("INSERT INTO user_accounts (userId, createdAt) VALUES (?1, ?2) ON CONFLICT(userId) DO NOTHING").bind(userId, Date.now()).run();
  await db.prepare("INSERT INTO gacha_pity (userId, normalCount, premiumCount, updatedAt) VALUES (?1,0,0,?2) ON CONFLICT(userId) DO NOTHING")
    .bind(userId, Date.now()).run();

  // Spend currency atomically
  if (costGold > 0) {
    const acc = await db.prepare("SELECT userGold FROM user_accounts WHERE userId=?1").bind(userId).first();
    const cur = Number(acc?.userGold || 0);
    if (cur < costGold) return json({ ok:false, error:"insufficient_gold", need: costGold, have: cur }, 400);
    const dec = await db.prepare("UPDATE user_accounts SET userGold = userGold - ?2 WHERE userId=?1 AND userGold >= ?2").bind(userId, costGold).run();
    if ((dec?.meta?.changes || 0) <= 0) {
      const acc2 = await db.prepare("SELECT userGold FROM user_accounts WHERE userId=?1").bind(userId).first();
      return json({ ok:false, error:"insufficient_gold", need: costGold, have: Number(acc2?.userGold||0) }, 400);
    }
  }
  if (costGem > 0) {
    const acc = await db.prepare("SELECT userGem FROM user_accounts WHERE userId=?1").bind(userId).first();
    const cur = Number(acc?.userGem || 0);
    if (cur < costGem) return json({ ok:false, error:"insufficient_gem", need: costGem, have: cur }, 400);
    const dec = await db.prepare("UPDATE user_accounts SET userGem = userGem - ?2 WHERE userId=?1 AND userGem >= ?2").bind(userId, costGem).run();
    if ((dec?.meta?.changes || 0) <= 0) {
      const acc2 = await db.prepare("SELECT userGem FROM user_accounts WHERE userId=?1").bind(userId).first();
      return json({ ok:false, error:"insufficient_gem", need: costGem, have: Number(acc2?.userGem||0) }, 400);
    }
  }

  // ===== Pity (200) =====
  // Normal: every 200 draws guarantees SSR (rarity >= 4), resets when SSR+ obtained
  // Premium: every 200 draws guarantees UR (rarity >= 5), resets when UR obtained
  const pityRow = await db.prepare("SELECT normalCount, premiumCount FROM gacha_pity WHERE userId=?1").bind(userId).first();
  let normalCount = Number(pityRow?.normalCount || 0);
  let premiumCount = Number(pityRow?.premiumCount || 0);

  const pulled = [];

  // 10-pull guarantee: only for the main normal/premium gacha (no forced type)
  const useGuarantee = (count === 10 && !forcedType);

  const rollOne = async (opts = {}) => {
    const t = opts.type || rollTypeDb();
    const minRarity = opts.minRarity || 0;

    let rarity = opts.rarity;
    if (!rarity) rarity = rollRarity(premium);

    if (minRarity && rarity < minRarity) rarity = minRarity;

    let asset = null;

    if (minRarity) {
      asset = await pickAssetWithFeaturedBoost(db, "type=?1 AND rarity>=?2", [t, minRarity], featuredIds, FEATURED_BOOST);
      if (!asset) asset = await pickAssetWithFeaturedBoost(db, "rarity>=?1", [minRarity], featuredIds, FEATURED_BOOST);
    } else {
      asset = await pickAssetWithFeaturedBoost(db, "type=?1 AND rarity=?2", [t, rarity], featuredIds, FEATURED_BOOST);
      if (!asset) asset = await pickAssetWithFeaturedBoost(db, "type=?1", [t], featuredIds, FEATURED_BOOST);
    }

    if (!asset) return null;

    const sql =
      "INSERT INTO user_assets (userId, assetId, count, stars) VALUES (?1, ?2, 1, 1) " +
      "ON CONFLICT(userId, assetId) DO UPDATE SET count=count+1";
    const params = [userId, asset.assetId];
    let wr = null;
    let after = null;
    let writeError = null;

    try {
      wr = await db.prepare(sql).bind(userId, asset.assetId).run();
      after = await db.prepare("SELECT count, stars FROM user_assets WHERE userId=?1 AND assetId=?2").bind(userId, asset.assetId).first();
    } catch (e) {
      writeError = String(e?.message || e);
    }

    asset._debug = { sql, params, result: wr, after, error: writeError };
    return asset;
  };

  // helper: update pity counter per roll
  const isTargetHit = (asset) => {
    const r = Number(asset?.rarity || 1);
    if (premium) return r >= 5;
    return r >= 4;
  };

  for (let i = 0; i < count; i++) {
    const t = forcedType || rollTypeDb();

    // base guarantee for 10-pull last card (no forced type)
    let minR = 0;
    if (useGuarantee && i === 9) minR = premium ? 4 : 3; // normal SR+, premium SSR+

    // pity trigger on this roll
    if (premium) {
      const next = premiumCount + 1;
      if ((next % 200) === 0) minR = Math.max(minR, 5);
    } else {
      const next = normalCount + 1;
      if ((next % 200) === 0) minR = Math.max(minR, 4);
    }

    const a = await rollOne({ type: t, minRarity: minR });
    if (!a) return json({ ok:false, error:`no_asset_found | type=${t} | minRarity=${minR}`, type: t }, 500);

    // mark guarantee in response for UI debugging if needed
    if (useGuarantee && i === 9 && minR >= (premium ? 4 : 3)) a._guarantee = true;
    if (minR >= (premium ? 5 : 4)) a._pity = true;

    pulled.push(a);

    // update pity counters
    if (premium) {
      if (isTargetHit(a)) premiumCount = 0;
      else premiumCount += 1;
    } else {
      if (isTargetHit(a)) normalCount = 0;
      else normalCount += 1;
    }
  }

  await db.prepare("UPDATE gacha_pity SET normalCount=?2, premiumCount=?3, updatedAt=?4 WHERE userId=?1")
    .bind(userId, normalCount, premiumCount, Date.now()).run();

  const accAfter = await db.prepare("SELECT userGold, userGem FROM user_accounts WHERE userId=?1").bind(userId).first();

  const pityNormalRemaining = 200 - (normalCount % 200 || 0);
  const pityPremiumRemaining = 200 - (premiumCount % 200 || 0);

  // accountScore: highest systemScore among all saved works
  try{ await ensureUserSavesSystemScoreColumn(db); }catch(_e){}
  let accountScore = 0;
  try{
    const mx = await db.prepare("SELECT MAX(COALESCE(systemScore,0)) as accountScore FROM user_saves WHERE userId=?1").bind(userId).first();
    accountScore = Number(mx?.accountScore || 0) || 0;
  }catch(_e){}
  try{ row.accountScore = accountScore; }catch(_e){}


  return json({
    ok: true,
    userId,
    costGold,
    costGem,
    userGold: Number(accAfter?.userGold||0),
    userGem: Number(accAfter?.userGem||0),
    pityNormalCount: normalCount,
    pityPremiumCount: premiumCount,
    pityNormalRemaining,
    pityPremiumRemaining,
    pulled
  });
}


async function ensureGachaPityTable(env){
  const db = env.DB;
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS gacha_pity (
      userId TEXT PRIMARY KEY,
      normalCount INTEGER DEFAULT 0,
      premiumCount INTEGER DEFAULT 0,
      updatedAt INTEGER DEFAULT 0
    )
  `).run();
}

async function gachaPity(req, env){
  const db = env.DB;
  const userId = await getUserId(req, env);
  if (!userId || userId === "anon") return json({ ok:false, error:"unauthorized" }, 401);

  await ensureUserAccountsTable(env);
  await ensureGachaPityTable(env);

  await db.prepare("INSERT INTO user_accounts (userId, createdAt) VALUES (?1, ?2) ON CONFLICT(userId) DO NOTHING").bind(userId, Date.now()).run();
  await db.prepare("INSERT INTO gacha_pity (userId, normalCount, premiumCount, updatedAt) VALUES (?1,0,0,?2) ON CONFLICT(userId) DO NOTHING")
    .bind(userId, Date.now()).run();

  const acc = await db.prepare("SELECT userGold, userGem FROM user_accounts WHERE userId=?1").bind(userId).first();
  const pity = await db.prepare("SELECT normalCount, premiumCount FROM gacha_pity WHERE userId=?1").bind(userId).first();

  const normalCount = Number(pity?.normalCount || 0);
  const premiumCount = Number(pity?.premiumCount || 0);
  const normalRemaining = 200 - (normalCount % 200 || 0);
  const premiumRemaining = 200 - (premiumCount % 200 || 0);

  return json({
    ok:true,
    userId,
    userGold: Number(acc?.userGold||0),
    userGem: Number(acc?.userGem||0),
    pityNormalCount: normalCount,
    pityPremiumCount: premiumCount,
    pityNormalRemaining: normalRemaining,
    pityPremiumRemaining: premiumRemaining
  });
}

async function save(req, env) {
  const db = env.DB;
  await ensureUserSavesSystemScoreColumn(db);
  await ensureAssetsTagsColumn(db);
  const userId = await getUserId(req, env);
  const body = await readJson(req);

  const headId = String(body.headId || "");
  const bodyId = String(body.bodyId || "");
  const bgId = String(body.bgId || "");
  const addon1Id = String(body.addon1Id || "");
  const addon2Id = String(body.addon2Id || "");

  if (!headId || !bodyId || !bgId) return json({ ok: false, error: "missing_parts" }, 400);

  // Optional ownership check (keeps behavior consistent with submit)
  const okHead = await invHas(db, userId, headId);
  const okBody = await invHas(db, userId, bodyId);
  const okBg = await invHas(db, userId, bgId);
  const okA1 = addon1Id ? await invHas(db, userId, addon1Id) : true;
  const okA2 = addon2Id ? await invHas(db, userId, addon2Id) : true;
  if (!okHead || !okBody || !okBg || !okA1 || !okA2) return json({ ok: false, error: "not_owned" }, 403);

  // 1) Check if this exact combination already exists in user_saves
  //    If yes: do NOT insert again, but still attempt unlock logic and return a friendly flag to the client.
  let existing = null;
  try {
    existing = await db
      .prepare(
        "SELECT savedOn FROM user_saves WHERE userId=?1 AND headId=?2 AND bodyId=?3 AND bgId=?4 AND IFNULL(addon1Id,'')=?5 AND IFNULL(addon2Id,'')=?6 ORDER BY savedOn DESC LIMIT 1"
      )
      .bind(userId, headId, bodyId, bgId, addon1Id, addon2Id)
      .first();
  } catch (e) {
    // If schema differs, fall back to a simpler check (still safe)
    try {
      existing = await db
        .prepare(
          "SELECT savedOn FROM user_saves WHERE userId=?1 AND headId=?2 AND bodyId=?3 AND bgId=?4 ORDER BY savedOn DESC LIMIT 1"
        )
        .bind(userId, headId, bodyId, bgId)
        .first();
    } catch {}
  }

  const alreadySaved = !!existing;
  const savedOn = alreadySaved ? (existing.savedOn ?? null) : Date.now();

  let writeError = null;
  if (!alreadySaved) {
    const sql =
      "INSERT INTO user_saves (userId, headId, bodyId, bgId, addon1Id, addon2Id, savedOn, systemScore) " +
      "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)";
    try {
      await db.prepare(sql).bind(userId, headId, bodyId, bgId, addon1Id, addon2Id, savedOn, Number(body.systemScore || 0)).run();
    } catch (e) {
      writeError = String(e?.message || e);
    }
  }

  // 2) Regardless of whether it was already saved, check recipe match and unlock (write to user_unlocks)
  const unlocked = await tryUnlock(db, userId, { headId, bodyId, bgId, addon1Id, addon2Id });

  // ok: true means the request succeeded (even if alreadySaved); saved: whether we inserted a new row
  if (writeError) return json({ ok: false, error: "save_failed", detail: writeError }, 500);

  // accountScore: highest systemScore among all saved works
  try{ await ensureUserSavesSystemScoreColumn(db); }catch(_e){}
  let accountScore = 0;
  try{
    const mx = await db.prepare("SELECT MAX(COALESCE(systemScore,0)) as accountScore FROM user_saves WHERE userId=?1").bind(userId).first();
    accountScore = Number(mx?.accountScore || 0) || 0;
  }catch(_e){}
  try{ row.accountScore = accountScore; }catch(_e){}


  return json({
    ok: true,
    userId,
    savedOn,
    saved: !alreadySaved,
    alreadySaved,
    unlocked,
  });
}


async function upgrade(req, env) {
  const db = env.DB;
  const userId = await getUserId(req, env);
  const body = await readJson(req);
  const assetId = String(body.assetId || "");

  if (!assetId) return json({ ok: false, error: "missing_assetId" }, 400);

  const before = await db
    .prepare("SELECT count, stars FROM user_assets WHERE userId=?1 AND assetId=?2")
    .bind(userId, assetId)
    .first();

  if (!before) return json({ ok: false, error: "not_owned" }, 404);

  const curCount = clampInt(before.count ?? 0, 0, 1_000_000_000);
  let curStars = clampInt(before.stars ?? 1, 1, 5);

  if (curStars >= 5) return json({ ok: false, error: "max_stars" }, 400);

  const need = curStars * 10;
  if (curCount < need) return json({ ok: false, error: "insufficient_count", need, have: curCount, stars: curStars }, 400);

  // Atomic upgrade: only succeed if stars unchanged and count enough
  const up = await db
    .prepare("UPDATE user_assets SET count=count-?3, stars=stars+1 WHERE userId=?1 AND assetId=?2 AND stars=?4 AND count>=?3")
    .bind(userId, assetId, need, curStars)
    .run();

  const changes = (up?.meta?.changes ?? up?.changes ?? 0);
  if (!changes) {
    const now = await db
      .prepare("SELECT count, stars FROM user_assets WHERE userId=?1 AND assetId=?2")
      .bind(userId, assetId)
      .first();
    return json({ ok: false, error: "upgrade_conflict", before, now }, 409);
  }

  const after = await db
    .prepare("SELECT count, stars FROM user_assets WHERE userId=?1 AND assetId=?2")
    .bind(userId, assetId)
    .first();

  // Provide deploy-safe payload for frontend FX (no extra round-trips needed)
  // baseRarity is the asset's intrinsic rarity (C..UR => 1..5)
  let baseRarity = 0;
  try {
    const a = await db
      .prepare("SELECT rarity FROM assets WHERE assetId=?1")
      .bind(assetId)
      .first();
    baseRarity = clampInt(a?.rarity ?? 0, 0, 5);
  } catch {}

  const oldStars = clampInt(before?.stars ?? 1, 1, 5);
  const newStars = clampInt(after?.stars ?? (oldStars + 1), 1, 5);

  const RARITY_LABEL = { 1: "C", 2: "R", 3: "SR", 4: "SSR", 5: "UR" };
  const oldMax = baseRarity ? Math.min(5, baseRarity + (oldStars - 1)) : 0;
  const newMax = baseRarity ? Math.min(5, baseRarity + (newStars - 1)) : 0;

  const from = RARITY_LABEL[oldMax] || "";
  const to = RARITY_LABEL[newMax] || "";

  // accountScore: highest systemScore among all saved works
  try{ await ensureUserSavesSystemScoreColumn(db); }catch(_e){}
  let accountScore = 0;
  try{
    const mx = await db.prepare("SELECT MAX(COALESCE(systemScore,0)) as accountScore FROM user_saves WHERE userId=?1").bind(userId).first();
    accountScore = Number(mx?.accountScore || 0) || 0;
  }catch(_e){}
  try{ row.accountScore = accountScore; }catch(_e){}


  return json({
    ok: true,
    userId,
    assetId,
    need,
    before,
    after,
    baseRarity,
    oldStars,
    newStars,
    from,
    to,
  });
}



async function submit(req, env) {
  const db = env.DB;
  await ensureAssetsTagsColumn(db);
  const userId = await getUserId(req, env);
  const body = await readJson(req);

  const title = String(body.title || "").slice(0, 60);
  const headId = String(body.headId || "");
  const bodyId = String(body.bodyId || "");
  const bgId = String(body.bgId || "");
  const addon1Id = String(body.addon1Id || "");
  const addon2Id = String(body.addon2Id || "");
  const seasonId = String(body.seasonId || "S1").slice(0, 20);

  if (!headId || !bodyId || !bgId) return json({ ok: false, error: "missing_parts" }, 400);

  const okHead = await invHas(db, userId, headId);
  const okBody = await invHas(db, userId, bodyId);
  const okBg = await invHas(db, userId, bgId);
  const okA1 = addon1Id ? await invHas(db, userId, addon1Id) : true;
  const okA2 = addon2Id ? await invHas(db, userId, addon2Id) : true;
  if (!okHead || !okBody || !okBg || !okA1 || !okA2) return json({ ok: false, error: "not_owned" }, 403);

  const showcaseId = crypto.randomUUID();
  const createdAt = Date.now();

  await db
    .prepare("INSERT INTO showcases (showcaseId, userId, headId, bodyId, bgId, addon1Id, addon2Id, title, createdAt, seasonId) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)")
    .bind(showcaseId, userId, headId, bodyId, bgId, addon1Id, addon2Id, title, createdAt, seasonId)
    .run();

  const unlocked = await tryUnlock(db, userId, { headId, bodyId, bgId, addon1Id, addon2Id });

  return json({ ok: true, showcaseId, unlocked });
}

async function invHas(db, userId, assetId) {
  const row = await db.prepare("SELECT count FROM user_assets WHERE userId=?1 AND assetId=?2").bind(userId, assetId).first();
  return (row?.count || 0) > 0;
}

async function ensureUserUnlocksTable(db) {
  // Create if missing. If it already exists, this is a no-op.
  // We do NOT assume PK/UNIQUE exists because your current schema may not have it.
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS user_unlocks (
      userId TEXT,
      recipeId TEXT,
      unlockedAt INTEGER
    )
  `).run();
}

async function insertUnlockNoDup(db, userId, recipeId, unlockedAt) {
  // Works even if user_unlocks has no UNIQUE/PK.
  // Prevents duplicates via WHERE NOT EXISTS.
  await db.prepare(`
    INSERT INTO user_unlocks (userId, recipeId, unlockedAt)
    SELECT ?1, ?2, ?3
    WHERE NOT EXISTS (
      SELECT 1 FROM user_unlocks
      WHERE userId = ?1 AND recipeId = ?2
    )
  `).bind(userId, recipeId, unlockedAt).run();
}

async function tryUnlock(db, userId, parts) {
  await ensureUserUnlocksTable(db);

  const headId = String(parts.headId || "");
  const bodyId = String(parts.bodyId || "");
  const bgId = String(parts.bgId || "");
  const a1 = String(parts.addon1Id || "");
  const a2 = String(parts.addon2Id || "");
  const hasA1 = !!a1;
  const hasA2 = !!a2;

  if (!userId || !headId || !bodyId || !bgId) return [];

  // Match rules
  // - recipes.addon1Id/addon2Id may be NULL
  // - addon order should NOT matter
  //
  // Branches:
  // 0 addon: both recipe addons empty
  // 1 addon: recipe has it in either addon1Id or addon2Id, and the other addon is empty
  // 2 addon: recipe addons match in either order
  const sql = `
    SELECT recipeId
    FROM recipes
    WHERE headId=?1 AND bodyId=?2 AND bgId=?3
      AND (
        (?4='' AND ?5='' AND IFNULL(addon1Id,'')='' AND IFNULL(addon2Id,'')='')
        OR
        (?4<>'' AND ?5='' AND (
          (IFNULL(addon1Id,'')=?4 AND IFNULL(addon2Id,'')='')
          OR
          (IFNULL(addon2Id,'')=?4 AND IFNULL(addon1Id,'')='')
        ))
        OR
        (?4='' AND ?5<>'' AND (
          (IFNULL(addon1Id,'')=?5 AND IFNULL(addon2Id,'')='')
          OR
          (IFNULL(addon2Id,'')=?5 AND IFNULL(addon1Id,'')='')
        ))
        OR
        (?4<>'' AND ?5<>'' AND (
          (IFNULL(addon1Id,'')=?4 AND IFNULL(addon2Id,'')=?5)
          OR
          (IFNULL(addon1Id,'')=?5 AND IFNULL(addon2Id,'')=?4)
        ))
      )
  `;

  const rows = await db.prepare(sql).bind(headId, bodyId, bgId, a1, a2).all();
  const recipeIds = (rows.results || []).map(r => String(r.recipeId)).filter(Boolean);

  if (!recipeIds.length) return [];

  const now = Date.now();
  for (const rid of recipeIds) {
    await insertUnlockNoDup(db, userId, rid, now);
  }

  return recipeIds;
}


async function apiMeShowcase(req, env) {
  const db = env.DB;
  const userId = await getUserId(req, env);
  const url = new URL(req.url);
  const seasonId = String(url.searchParams.get("seasonId") || "S1").slice(0, 20);

  // latest showcase for this user in this season
  const row = await db
    .prepare(`
      SELECT showcaseId, userId, headId, bodyId, bgId, addon1Id, addon2Id, title, createdAt, seasonId
      FROM showcases
      WHERE userId=?1 AND seasonId=?2
      ORDER BY createdAt DESC
      LIMIT 1
    `)
    .bind(userId, seasonId)
    .first();

  return json({ ok: true, userId, seasonId, showcase: row || null });
}


async function apiMeShowcases(req, env) {
  const db = env.DB;
  const userId = await getUserId(req, env);
  const url = new URL(req.url);
  const seasonId = String(url.searchParams.get("seasonId") || "S1").slice(0, 20);

  const rows = await db
    .prepare(`
      SELECT showcaseId, userId, headId, bodyId, bgId, addon1Id, addon2Id, title, createdAt, seasonId
      FROM showcases
      WHERE userId=?1 AND seasonId=?2
      ORDER BY createdAt DESC
      LIMIT 200
    `)
    .bind(userId, seasonId)
    .all();

  return json({ ok: true, userId, seasonId, showcases: rows?.results || [] });
}


async function apiMeShowcaseUpsert(req, env) {
  const db = env.DB;
  const userId = await getUserId(req, env);
  const body = await readJson(req);

  const title = String(body.title || "").slice(0, 60);
  const headId = String(body.headId || "");
  const bodyId = String(body.bodyId || "");
  const bgId = String(body.bgId || "");
  const addon1Id = String(body.addon1Id || "");
  const addon2Id = String(body.addon2Id || "");
  const seasonId = String(body.seasonId || "S1").slice(0, 20);
  const overwrite = !!body.overwrite;

  if (!headId || !bodyId || !bgId) return json({ ok: false, error: "missing_parts" }, 400);

  // Ownership check like submit()
  const okHead = await invHas(db, userId, headId);
  const okBody = await invHas(db, userId, bodyId);
  const okBg = await invHas(db, userId, bgId);
  const okA1 = addon1Id ? await invHas(db, userId, addon1Id) : true;
  const okA2 = addon2Id ? await invHas(db, userId, addon2Id) : true;
  if (!okHead || !okBody || !okBg || !okA1 || !okA2) return json({ ok: false, error: "not_owned" }, 403);

  const now = Date.now();

  // Check current slot
  const cur = await db
    .prepare(`
      SELECT showcaseId
      FROM showcases
      WHERE userId=?1 AND seasonId=?2
      ORDER BY createdAt DESC
      LIMIT 1
    `)
    .bind(userId, seasonId)
    .first();

  if (cur && !overwrite) {
    return json({ ok: false, error: "already_showing", detail: "This season already has a showcase for this user." }, 409);
  }

  if (cur && overwrite) {
    // Update existing row and reset votes to 0 by deleting vote records
    await db
      .prepare(`
        UPDATE showcases
        SET headId=?2, bodyId=?3, bgId=?4, addon1Id=?5, addon2Id=?6, title=?7, createdAt=?8
        WHERE showcaseId=?1
      `)
      .bind(cur.showcaseId, headId, bodyId, bgId, addon1Id, addon2Id, title, now)
      .run();

    await db.prepare("DELETE FROM votes WHERE showcaseId=?1").bind(cur.showcaseId).run();

    const unlocked = await tryUnlock(db, userId, { headId, bodyId, bgId, addon1Id, addon2Id });

    return json({ ok: true, userId, seasonId, showcaseId: cur.showcaseId, replaced: true, votesReset: true, unlocked });
  }

  // No existing slot: insert new
  const showcaseId = crypto.randomUUID();
  await db
    .prepare("INSERT INTO showcases (showcaseId, userId, headId, bodyId, bgId, addon1Id, addon2Id, title, createdAt, seasonId) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)")
    .bind(showcaseId, userId, headId, bodyId, bgId, addon1Id, addon2Id, title, now, seasonId)
    .run();

  const unlocked = await tryUnlock(db, userId, { headId, bodyId, bgId, addon1Id, addon2Id });

  return json({ ok: true, userId, seasonId, showcaseId, replaced: false, votesReset: false, unlocked });
}

async function gallery(req, env) {
  const db = env.DB;
  const url = new URL(req.url);
  const seasonId = String(url.searchParams.get("seasonId") || "").trim();

  await ensureVotesV2Table(env);
  await ensureFavoritesTable(env);
  await ensureCommentsTable(env);
  await ensureRecommendsTable(env);
  await ensureCommentsTable(env);
  await ensureUserAccountsColumns(env);

  const whereSeason = seasonId ? "WHERE s.seasonId = ?1" : "";
  const bindSeason = seasonId ? [seasonId] : [];

  const sql = `
      SELECT
        s.showcaseId, s.userId, s.title, s.createdAt, s.seasonId,
        s.headId, s.bodyId, s.bgId, s.addon1Id, s.addon2Id,
        (SELECT COUNT(*) FROM votes_v2 v WHERE v.seasonId = s.seasonId AND v.showcaseId = s.showcaseId) as votes,
        (SELECT COUNT(*) FROM favorites f WHERE f.showcaseId = s.showcaseId) as favorites,
        (SELECT COUNT(*) FROM comments_v1 c WHERE c.showcaseId = s.showcaseId) as comments,
        ((SELECT COUNT(*) FROM recommends_v2 r2 WHERE r2.seasonId = s.seasonId AND r2.showcaseId = s.showcaseId) + (SELECT COUNT(*) FROM recommends_v1 r1 WHERE r1.seasonId = s.seasonId AND r1.showcaseId = s.showcaseId)) as recommends,
        ua.userName as authorName,
        ua.level as authorLevel,
        us.headId as authorAvatarHeadId,
        us.bodyId as authorAvatarBodyId,
        us.bgId as authorAvatarBgId,
        us.addon1Id as authorAvatarAddon1Id,
        us.addon2Id as authorAvatarAddon2Id,
        ah.imageUrl as headUrl,
        ab.imageUrl as bodyUrl,
        ag.imageUrl as bgUrl,
        aa1.imageUrl as addon1Url,
        aa2.imageUrl as addon2Url
      FROM showcases s
      LEFT JOIN user_accounts ua ON ua.userId = s.userId
      LEFT JOIN user_saves us ON us.userId = s.userId AND us.savedOn = ua.avatarSaveOn
      LEFT JOIN assets ah ON ah.assetId = s.headId
      LEFT JOIN assets ab ON ab.assetId = s.bodyId
      LEFT JOIN assets ag ON ag.assetId = s.bgId
      LEFT JOIN assets aa1 ON aa1.assetId = s.addon1Id
      LEFT JOIN assets aa2 ON aa2.assetId = s.addon2Id
      ${whereSeason}
      ORDER BY s.createdAt DESC
      LIMIT 120
  `;
  const stmt = db.prepare(sql);
  const rows = bindSeason.length ? await stmt.bind(...bindSeason).all() : await stmt.all();
  return json({ ok:true, items: rows.results || [] });
}

async function apiPodium(req, env) {
  const db = env.DB;
  const url = new URL(req.url);
  const seasonId = String(url.searchParams.get("seasonId") || "").trim();

  await ensureVotesV2Table(env);
  await ensureFavoritesTable(env);
  await ensureCommentsTable(env);

  const whereSeason = seasonId ? "WHERE s.seasonId = ?1" : "";
  const bindSeason = seasonId ? [seasonId] : [];

  const sql = `
    SELECT
      s.showcaseId, s.userId, s.title, s.createdAt, s.seasonId,
      s.headId, s.bodyId, s.bgId, s.addon1Id, s.addon2Id,
      (SELECT COUNT(*) FROM votes_v2 v WHERE v.seasonId = s.seasonId AND v.showcaseId = s.showcaseId) as votes,
      (SELECT COUNT(*) FROM favorites f WHERE f.showcaseId = s.showcaseId) as favorites,
      (SELECT COUNT(*) FROM comments_v1 c WHERE c.showcaseId = s.showcaseId) as comments,
      ah.imageUrl as headUrl,
      ab.imageUrl as bodyUrl,
      ag.imageUrl as bgUrl,
      aa1.imageUrl as addon1Url,
      aa2.imageUrl as addon2Url
    FROM showcases s
    LEFT JOIN assets ah ON ah.assetId = s.headId
    LEFT JOIN assets ab ON ab.assetId = s.bodyId
    LEFT JOIN assets ag ON ag.assetId = s.bgId
    LEFT JOIN assets aa1 ON aa1.assetId = s.addon1Id
    LEFT JOIN assets aa2 ON aa2.assetId = s.addon2Id
    ${whereSeason}
    ORDER BY votes DESC, s.createdAt DESC
    LIMIT 3
  `;
  const stmt = db.prepare(sql);
  const rows = bindSeason.length ? await stmt.bind(...bindSeason).all() : await stmt.all();
  return json({ ok:true, items: rows.results || [] });
}

async function ensureShowcasesVotesColumn(db){
  const cols = await getTableColumns(db, "showcases");
  if (!cols || cols.size === 0) return { votesCol: "" };

  // Prefer an existing votes column (support common variants)
  let votesCol = pickFirst(cols, ["votes", "voteCount", "vote_count", "voteTotal", "vote_total"]);
  if (votesCol) return { votesCol };

  // If missing, try to add a canonical votes column
  try{
    await db.prepare("ALTER TABLE showcases ADD COLUMN votes INTEGER DEFAULT 0").run();
    votesCol = "votes";
  }catch(_){}

  return { votesCol: votesCol || "" };
}

async function vote(req, env) {
  const db = env.DB;
  const userId = await getUserId(req, env);
  if (!userId || userId === "anon") return json({ ok:false, error:"unauthorized" }, 401);

  const body = await readJson(req);
  const showcaseId = String(body.showcaseId || "").trim();
  if (!showcaseId) return json({ ok:false, error:"missing_showcaseId" }, 400);

  await ensureUserAccountsColumns(env);
  await ensureVotesV2Table(env);

  const show = await db.prepare("SELECT seasonId, userId FROM showcases WHERE showcaseId=?1").bind(showcaseId).first();
  const seasonId = String(show?.seasonId || getCurrentSeasonInfo(Date.now()).seasonId);
  const authorId = String(show?.userId || "");

  await db.prepare("INSERT INTO user_accounts (userId, createdAt) VALUES (?1, ?2) ON CONFLICT(userId) DO NOTHING").bind(userId, Date.now()).run();

  const usedRow = await db.prepare("SELECT COUNT(*) AS c FROM votes_v2 WHERE seasonId=?1 AND showcaseId=?2 AND voterId=?3")
    .bind(seasonId, showcaseId, userId).first();
  const used = Number(usedRow?.c || 0);
  if (used >= 5) {
    const accX = await db.prepare("SELECT userVote FROM user_accounts WHERE userId=?1").bind(userId).first();
    return json({ ok:false, error:"max_per_showcase_reached", max:5, used, userVote:Number(accX?.userVote||0), seasonId }, 400);
  }

  const acc = await db.prepare("SELECT userVote FROM user_accounts WHERE userId=?1").bind(userId).first();
  const curVote = Number(acc?.userVote || 0);
  if (curVote <= 0) return json({ ok:false, error:"no_vote", userVote:0, seasonId }, 400);

  const dec = await db.prepare("UPDATE user_accounts SET userVote = userVote - 1 WHERE userId=?1 AND userVote > 0").bind(userId).run();
  if ((dec?.meta?.changes || 0) <= 0) return json({ ok:false, error:"no_vote", userVote:0, seasonId }, 400);

  try{
    await db.prepare("INSERT INTO votes_v2 (seasonId, showcaseId, voterId, createdAt) VALUES (?1,?2,?3,?4)")
      .bind(seasonId, showcaseId, userId, Date.now()).run();
  }catch(e){
    // refund vote if insert fails
    try{ await db.prepare("UPDATE user_accounts SET userVote = userVote + 1 WHERE userId=?1").bind(userId).run(); }catch(_){}
    return json({ ok:false, error:"vote_failed" }, 500);
  }

  const vc = await db.prepare("SELECT COUNT(*) AS c FROM votes_v2 WHERE seasonId=?1 AND showcaseId=?2").bind(seasonId, showcaseId).first();
  const voteCount = Number(vc?.c || 0);

  try{
    const { votesCol } = await ensureShowcasesVotesColumn(db);
    if (votesCol) await db.prepare(`UPDATE showcases SET ${votesCol}=?2 WHERE showcaseId=?1`).bind(showcaseId, voteCount).run();
  }catch(_){}

  await addExp(env, userId, 2);
  try{
    const s = await db.prepare("SELECT userId FROM showcases WHERE showcaseId=?1").bind(showcaseId).first();
    const authorId = String(s?.userId||"");
    if(authorId) await addExp(env, authorId, 1);
  }catch(_){}

  const acc2 = await db.prepare("SELECT userVote FROM user_accounts WHERE userId=?1").bind(userId).first();
  return json({ ok:true, seasonId, voteCount, votes:voteCount, userVote:Number(acc2?.userVote||0), maxPerShowcase:5, used: used + 1 });
}

async function apiRecommend(req, env){
  const db = env.DB;
  const userId = await getUserId(req, env);
  if (!userId || userId === "anon") return json({ ok:false, error:"unauthorized" }, 401);

  const body = await readJson(req);
  const showcaseId = String(body.showcaseId || "").trim();
  if (!showcaseId) return json({ ok:false, error:"missing_showcaseId" }, 400);

  await ensureUserAccountsColumns(env);
  await ensureRecommendsTable(env);

  const show = await db.prepare("SELECT seasonId, userId FROM showcases WHERE showcaseId=?1").bind(showcaseId).first();
  const seasonId = String(show?.seasonId || getCurrentSeasonInfo(Date.now()).seasonId);

  // daily key (UTC)
  const dayKey = new Date().toISOString().slice(0,10);

  // per-user per-showcase per-day cap
  const usedRow = await db.prepare("SELECT COUNT(*) AS c FROM recommends_v2 WHERE dayKey=?1 AND seasonId=?2 AND showcaseId=?3 AND recommenderId=?4")
    .bind(dayKey, seasonId, showcaseId, userId).first();
  const used = Number(usedRow?.c || 0);
  if (used >= 5) {
    const accX = await db.prepare("SELECT userGem FROM user_accounts WHERE userId=?1").bind(userId).first();
    return json({ ok:false, error:"max_per_showcase_reached", max:5, used, costGem:50, userGem:Number(accX?.userGem||0), seasonId, dayKey }, 400);
  }

  // ensure account exists
  await db.prepare("INSERT INTO user_accounts (userId, createdAt) VALUES (?1, ?2) ON CONFLICT(userId) DO NOTHING").bind(userId, Date.now()).run();

  // first recommend of the day is free; after that costs 50 GEM each time
  const dailyRow = await db.prepare("SELECT COUNT(*) AS c FROM recommends_v2 WHERE dayKey=?1 AND recommenderId=?2")
    .bind(dayKey, userId).first();
  const dailyUsed = Number(dailyRow?.c || 0);
  const costGem = (dailyUsed >= 1) ? 50 : 0;

  if (costGem > 0) {
    const acc = await db.prepare("SELECT userGem FROM user_accounts WHERE userId=?1").bind(userId).first();
    const curGem = Number(acc?.userGem || 0);
    if (curGem < costGem) return json({ ok:false, error:"insufficient_gem", costGem, userGem:curGem, seasonId, dayKey }, 400);

    // atomic spend
    const dec = await db.prepare("UPDATE user_accounts SET userGem = userGem - ?2 WHERE userId=?1 AND userGem >= ?2").bind(userId, costGem).run();
    if ((dec?.meta?.changes || 0) <= 0) {
      const acc2 = await db.prepare("SELECT userGem FROM user_accounts WHERE userId=?1").bind(userId).first();
      return json({ ok:false, error:"insufficient_gem", costGem, userGem:Number(acc2?.userGem||0), seasonId, dayKey }, 400);
    }
  }

  try{
    await db.prepare("INSERT INTO recommends_v2 (seasonId, showcaseId, recommenderId, createdAt, dayKey) VALUES (?1,?2,?3,?4,?5)")
      .bind(seasonId, showcaseId, userId, Date.now(), dayKey).run();
  }catch(e){
    // refund gem if insert fails
    if(costGem > 0){
      try{ await db.prepare("UPDATE user_accounts SET userGem = userGem + ?2 WHERE userId=?1").bind(userId, costGem).run(); }catch(_){}
    }
    return json({ ok:false, error:"recommend_failed" }, 500);
  }

  // total recommends: v2 + legacy v1
  const rc2 = await db.prepare("SELECT COUNT(*) AS c FROM recommends_v2 WHERE seasonId=?1 AND showcaseId=?2").bind(seasonId, showcaseId).first();
  const rc1 = await db.prepare("SELECT COUNT(*) AS c FROM recommends_v1 WHERE seasonId=?1 AND showcaseId=?2").bind(seasonId, showcaseId).first().catch(()=>({c:0}));
  const recommendCount = Number(rc2?.c || 0) + Number(rc1?.c || 0);

  await addExp(env, userId, 2);
  try{
    const authorId = String(show?.userId || "");
    if(authorId) await addExp(env, authorId, 1);
  }catch(_){ }

  const acc3 = await db.prepare("SELECT userGem FROM user_accounts WHERE userId=?1").bind(userId).first();
  return json({
    ok:true,
    seasonId,
    dayKey,
    recommends: recommendCount,
    recommendCount,
    used: used + 1,
    maxPerShowcasePerDay: 5,
    dailyUsed: dailyUsed + 1,
    dailyFreeUsed: dailyUsed >= 1,
    costGem,
    userGem: Number(acc3?.userGem||0)
  });
}


async function leaderboard(req, env) {
  const db = env.DB;
  const url = new URL(req.url);
  const seasonId = String(url.searchParams.get("seasonId") || "").trim();

  await ensureVotesV2Table(env);
  await ensureFavoritesTable(env);
  await ensureCommentsTable(env);

  const info = getCurrentSeasonInfo(Date.now());
  const sid = seasonId || info.seasonId;

  const rows = await db.prepare(`
      SELECT
        s.showcaseId, s.userId, s.title, s.createdAt, s.seasonId,
        (SELECT COUNT(*) FROM votes_v2 v WHERE v.seasonId = s.seasonId AND v.showcaseId = s.showcaseId) as votes,
        (SELECT COUNT(*) FROM favorites f WHERE f.showcaseId = s.showcaseId) as favorites
      FROM showcases s
      WHERE s.seasonId = ?1
      ORDER BY votes DESC, s.createdAt DESC
      LIMIT 50
  `).bind(sid).all();

  return json({ ok:true, seasonId:sid, startAt:info.startAt, endAt:info.endAt, items: rows.results || [] });
}


// --- Store / Payments (Stripe Checkout) ---
// Design:
// - Frontend authenticates via x-user-id (same as other pages)
// - Credits happen ONLY from webhook (prevents client-side cheating)
// - Idempotent by store_orders.processedAt

const STORE_PACKS = {
  "pack_199":  { packId: "pack_199",  priceCents: 199,  coins: 1000000,  gems: 300,  bonusGems: 200 },
  "pack_499":  { packId: "pack_499",  priceCents: 499,  coins: 3000000,  gems: 900,  bonusGems: 600 },
  "pack_999":  { packId: "pack_999",  priceCents: 999,  coins: 6000000,  gems: 1800, bonusGems: 1200 },
  "pack_1999": { packId: "pack_1999", priceCents: 1999, coins: 12000000, gems: 3600, bonusGems: 2400 },
  "pack_4999": { packId: "pack_4999", priceCents: 4999, coins: 30000000, gems: 9000, bonusGems: 6000 }
};

async function ensureStoreOrdersTable(env){
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS store_orders (
      sessionId TEXT PRIMARY KEY,
      userId TEXT,
      packId TEXT,
      amountCents INTEGER,
      status TEXT,
      createdAt INTEGER,
      processedAt INTEGER
    )
  `).run();
}

function packList(){
  return Object.values(STORE_PACKS).map(p=>({
    packId: p.packId,
    priceCents: p.priceCents,
    coins: p.coins,
    gems: p.gems,
    bonusGems: p.bonusGems
  }));
}

async function storePacks(req, env){
  return json({ ok:true, packs: packList() });
}

function formEncode(obj){
  const sp = new URLSearchParams();
  for(const [k,v] of Object.entries(obj)){
    if(v === undefined || v === null) continue;
    sp.append(k, String(v));
  }
  return sp.toString();
}

async function stripeRequest(env, path, method, bodyParams){
  const key = env.STRIPE_SECRET_KEY || env.STRIPE_KEY || "";
  if(!key) throw new Error("missing_stripe_secret_key");
  const res = await fetch("https://api.stripe.com" + path, {
    method,
    headers: {
      "authorization": "Bearer " + key,
      "content-type": "application/x-www-form-urlencoded"
    },
    body: bodyParams ? formEncode(bodyParams) : undefined
  });
  const data = await res.json().catch(()=> ({}));
  if(!res.ok){
    const msg = (data && (data.error?.message || data.error)) ? (data.error.message || data.error) : `stripe_http_${res.status}`;
    const e = new Error(msg);
    e._stripe = data;
    throw e;
  }
  return data;
}

async function storeCreateCheckout(req, env){
  const userId = await getUserId(req, env);
  if(!userId || userId === "anon") return json({ ok:false, error:"unauthorized" }, 401);

  const body = await readJson(req);
  const packId = String(body.packId || body.id || "");
  const pack = STORE_PACKS[packId];
  if(!pack) return json({ ok:false, error:"invalid_pack" }, 400);

  await ensureStoreOrdersTable(env);

  // Determine where to redirect after payment (Pages site)
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  const base = (env.SHOP_ORIGIN || (origin ? new URL(origin).origin : "") || "").replace(/\/+$/g,"");
  const successUrl = (env.SHOP_SUCCESS_URL || (base ? `${base}/shop-success.html` : "")).replace(/\/+$/g,"") + "?session_id={CHECKOUT_SESSION_ID}";
  const cancelUrl  = (env.SHOP_CANCEL_URL  || (base ? `${base}/shop-cancel.html`  : ""));

  if(!successUrl || !cancelUrl){
    return json({ ok:false, error:"missing_success_cancel_url" }, 500);
  }

  const session = await stripeRequest(env, "/v1/checkout/sessions", "POST", {
    mode: "payment",
    "payment_method_types[0]": "card",
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    "metadata[packId]": packId,
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][product_data][name]": `ACF ${packId}`,
    "line_items[0][price_data][unit_amount]": pack.priceCents,
    "line_items[0][quantity]": 1
  });

  const createdAt = Date.now();
  try{
    await env.DB.prepare(
      "INSERT INTO store_orders (sessionId, userId, packId, amountCents, status, createdAt, processedAt) VALUES (?1, ?2, ?3, ?4, ?5, ?6, NULL)"
    ).bind(session.id, userId, packId, pack.priceCents, "created", createdAt).run();
  }catch(e){
    // if duplicate, ignore
  }

  return json({ ok:true, sessionId: session.id, url: session.url });
}

// Stripe webhook verification (optional but strongly recommended).
async function verifyStripeWebhook(req, env, rawBody){
  const secret = env.STRIPE_WEBHOOK_SECRET || env.STRIPE_ENDPOINT_SECRET || "";
  if(!secret) return { ok:true, skipped:true };

  const sig = req.headers.get("stripe-signature") || "";
  if(!sig) return { ok:false, error:"missing_signature" };

  // Stripe signature header format: t=...,v1=...
  const parts = sig.split(",").map(s=>s.trim());
  const tPart = parts.find(p=>p.startsWith("t="));
  const v1Part = parts.find(p=>p.startsWith("v1="));
  if(!tPart || !v1Part) return { ok:false, error:"bad_signature_header" };
  const ts = tPart.slice(2);
  const v1 = v1Part.slice(3);

  const signedPayload = `${ts}.${rawBody}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name:"HMAC", hash:"SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const hex = Array.from(new Uint8Array(mac)).map(b=>b.toString(16).padStart(2,"0")).join("");

  // Stripe uses hex in docs sometimes; in practice v1 is hex string.
  const ok = timingSafeEqual(hex, v1);
  return ok ? { ok:true } : { ok:false, error:"signature_mismatch" };
}

function timingSafeEqual(a,b){
  if(typeof a !== "string" || typeof b !== "string") return false;
  if(a.length !== b.length) return false;
  let out = 0;
  for(let i=0;i<a.length;i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function storeWebhook(req, env){
  // Need raw body for signature verification
  const raw = await req.text();

  const v = await verifyStripeWebhook(req, env, raw);
  if(!v.ok){
    return json({ ok:false, error:v.error || "webhook_verify_failed" }, 400);
  }

  let event = null;
  try{ event = JSON.parse(raw); }catch{ return json({ ok:false, error:"bad_json" }, 400); }

  // Only handle the happy path that credits currency
  if(event?.type !== "checkout.session.completed"){
    return json({ ok:true, ignored:true, type: event?.type || "" });
  }

  const session = event?.data?.object || {};
  const sessionId = String(session.id || "");
  const userId = String(session.client_reference_id || session.metadata?.userId || "");
  const packId = String(session.metadata?.packId || "");

  if(!sessionId || !userId || !packId) return json({ ok:false, error:"missing_session_fields" }, 400);

  const pack = STORE_PACKS[packId];
  if(!pack) return json({ ok:false, error:"invalid_pack" }, 400);

  await ensureStoreOrdersTable(env);
  await ensureUserAccountsTable(env);

  // idempotency
  const existing = await env.DB.prepare("SELECT processedAt FROM store_orders WHERE sessionId=?1").bind(sessionId).first();
  if(existing?.processedAt){
    return json({ ok:true, alreadyProcessed:true });
  }

  // Upsert account row if missing
  await env.DB.prepare(`
    INSERT INTO user_accounts (userId, userName, userGold, userGem, userVote, userRegion, createdAt)
    SELECT ?1, COALESCE((SELECT userName FROM user_accounts WHERE userId=?1), "Player"), 0, 0, 0, "", ?2
    WHERE NOT EXISTS (SELECT 1 FROM user_accounts WHERE userId=?1)
  `).bind(userId, Date.now()).run();

  const addGold = Number(pack.coins || 0);
  const addGem = Number((pack.gems || 0) + (pack.bonusGems || 0));

  await env.DB.prepare("UPDATE user_accounts SET userGold = COALESCE(userGold,0)+?2, userGem = COALESCE(userGem,0)+?3 WHERE userId=?1")
    .bind(userId, addGold, addGem).run();

  const now = Date.now();
  await env.DB.prepare("UPDATE store_orders SET status=?2, processedAt=?3 WHERE sessionId=?1")
    .bind(sessionId, "paid", now).run();

  return json({ ok:true, credited:true, userId, addGold, addGem, packId });
}

// --- Season (2 weeks, Sunday 00:00 Toronto approx) ---
// Simple UTC-based season anchor to avoid Intl crashes.
// Anchor at 2026-01-04 05:00Z (Sunday 00:00 Toronto when offset is -5).
const SEASON_THEMES = ["dark","school","fantasy","cyber","angel","demon","summer","winter","idol","mecha"]; 
const SEASON_ANCHOR_UTC = Date.UTC(2026, 0, 4, 5, 0, 0);
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function getCurrentSeasonInfo(nowMs){
  const weeksSince = Math.floor((nowMs - SEASON_ANCHOR_UTC) / WEEK_MS);
  const bi = Math.floor(weeksSince / 2);
  const startAt = SEASON_ANCHOR_UTC + bi * TWO_WEEKS_MS;
  const endAt = startAt + TWO_WEEKS_MS;
  const seasonId = "S" + String(bi + 1);
  const themeTag = SEASON_THEMES[(bi % SEASON_THEMES.length + SEASON_THEMES.length) % SEASON_THEMES.length];
  return { seasonId, startAt, endAt, themeTag };
}


// --- All-time rankings (not limited by season) ---
async function apiRankFavorites(req, env){
  const db = env.DB;
  const url = new URL(req.url);
  const limit = clampInt(url.searchParams.get("limit") || 24, 3, 60);

  await ensureVotesV2Table(env);
  await ensureFavoritesTable(env);
  await ensureCommentsTable(env);
  await ensureRecommendsTable(env);
  await ensureUserAccountsColumns(env);

  const sql = `
    SELECT
      s.showcaseId, s.userId, s.title, s.createdAt, s.seasonId,
      s.headId, s.bodyId, s.bgId, s.addon1Id, s.addon2Id,
      (SELECT COUNT(*) FROM votes_v2 v WHERE v.seasonId = s.seasonId AND v.showcaseId = s.showcaseId) as votes,
      (SELECT COUNT(*) FROM favorites f WHERE f.showcaseId = s.showcaseId) as favorites,
      (SELECT COUNT(*) FROM comments_v1 c WHERE c.showcaseId = s.showcaseId) as comments,
      ((SELECT COUNT(*) FROM recommends_v2 r2 WHERE r2.seasonId = s.seasonId AND r2.showcaseId = s.showcaseId) + (SELECT COUNT(*) FROM recommends_v1 r1 WHERE r1.seasonId = s.seasonId AND r1.showcaseId = s.showcaseId)) as recommends,
      ua.userName as authorName,
      ua.level as authorLevel,
      us.headId as authorAvatarHeadId,
      us.bodyId as authorAvatarBodyId,
      us.bgId as authorAvatarBgId,
      us.addon1Id as authorAvatarAddon1Id,
      us.addon2Id as authorAvatarAddon2Id,
      ah.imageUrl as headUrl,
      ab.imageUrl as bodyUrl,
      ag.imageUrl as bgUrl,
      aa1.imageUrl as addon1Url,
      aa2.imageUrl as addon2Url
    FROM showcases s
    LEFT JOIN user_accounts ua ON ua.userId = s.userId
    LEFT JOIN user_saves us ON us.userId = s.userId AND us.savedOn = ua.avatarSaveOn
    LEFT JOIN assets ah ON ah.assetId = s.headId
    LEFT JOIN assets ab ON ab.assetId = s.bodyId
    LEFT JOIN assets ag ON ag.assetId = s.bgId
    LEFT JOIN assets aa1 ON aa1.assetId = s.addon1Id
    LEFT JOIN assets aa2 ON aa2.assetId = s.addon2Id
    ORDER BY favorites DESC, votes DESC, s.createdAt DESC
    LIMIT ${limit}
  `;
  const rows = await db.prepare(sql).all();
  return json({ ok:true, items: rows.results || [] });
}


async function apiRankNewcomers(req, env){
  const db = env.DB;
  const url = new URL(req.url);
  const limit = clampInt(url.searchParams.get("limit") || 24, 3, 60);
  const now = Date.now();
  const cutoff = now - (30 * 24 * 60 * 60 * 1000);

  await ensureUserAccountsTable(env);
  await ensureUserSavesSystemScoreColumn(db);

  // Newbie score leaderboard: accounts created within 30 days, ranked by accountScore (max systemScore)
  const sql = `
    SELECT
      ua.userId,
      COALESCE(ua.userName, "Player") as userName,
      COALESCE(ua.level, 1) as level,
      COALESCE(ua.userRegion, "") as userRegion,
      COALESCE(ua.createdAt, 0) as createdAt,
      COALESCE(MAX(COALESCE(us2.systemScore,0)), 0) as accountScore,
      av.headId as authorAvatarHeadId,
      av.bodyId as authorAvatarBodyId,
      av.bgId as authorAvatarBgId,
      av.addon1Id as authorAvatarAddon1Id,
      av.addon2Id as authorAvatarAddon2Id
    FROM user_accounts ua
    LEFT JOIN user_saves us2 ON us2.userId = ua.userId
    LEFT JOIN user_saves av ON av.userId = ua.userId AND av.savedOn = ua.avatarSaveOn
    WHERE COALESCE(ua.createdAt,0) >= ?1 AND COALESCE(ua.createdAt,0) > 0
    GROUP BY ua.userId
    ORDER BY accountScore DESC, createdAt DESC
    LIMIT ${limit}
  `;
  const rows = await db.prepare(sql).bind(cutoff).all();
  return json({ ok:true, items: rows.results || [] , cutoff });
}


async function apiRankAuthors(req, env){
  const db = env.DB;
  const url = new URL(req.url);
  const limit = clampInt(url.searchParams.get("limit") || 30, 3, 80);

  await ensureFollowsTable(env);
  await ensureUserAccountsTable(env);

  const sql = `
    SELECT
      ua.userId,
      COALESCE(ua.userName, "Player") as userName,
      COALESCE(ua.level, 1) as level,
      ua.avatarSaveOn as avatarSaveOn,
      COALESCE(ua.createdAt,0) as createdAt,
      (SELECT COUNT(*) FROM follows f WHERE f.targetUserId = ua.userId) as followers,
      us.headId as authorAvatarHeadId,
      us.bodyId as authorAvatarBodyId,
      us.bgId as authorAvatarBgId,
      us.addon1Id as authorAvatarAddon1Id,
      us.addon2Id as authorAvatarAddon2Id
    FROM user_accounts ua
    LEFT JOIN user_saves us ON us.userId = ua.userId AND us.savedOn = ua.avatarSaveOn
    ORDER BY followers DESC, level DESC, createdAt DESC
    LIMIT ${limit}
  `;
  const rows = await db.prepare(sql).all();
  return json({ ok:true, items: rows.results || [] });
}

async function apiSeasonCurrent(req, env){
  const now = Date.now();
  return json({ ok:true, ...getCurrentSeasonInfo(now), now });
}

async function ensureVotesV2Table(env){
  const db = env.DB;
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS votes_v2 (
      seasonId TEXT NOT NULL,
      showcaseId TEXT NOT NULL,
      voterId TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    )
  `).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_votes_v2_season_showcase ON votes_v2 (seasonId, showcaseId)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_votes_v2_voter ON votes_v2 (voterId)`).run();
}

async function ensureRecommendsTable(env){
  const db = env.DB;

  // legacy table (kept for backward compatibility)
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS recommends_v1 (
      seasonId TEXT NOT NULL,
      showcaseId TEXT NOT NULL,
      recommenderId TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    )
  `).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_recommends_v1_season_showcase ON recommends_v1 (seasonId, showcaseId)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_recommends_v1_user ON recommends_v1 (recommenderId)`).run();

  // v2: supports daily free + per-day caps
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS recommends_v2 (
      seasonId TEXT NOT NULL,
      showcaseId TEXT NOT NULL,
      recommenderId TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      dayKey TEXT NOT NULL
    )
  `).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_recommends_v2_season_showcase ON recommends_v2 (seasonId, showcaseId)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_recommends_v2_user_day ON recommends_v2 (recommenderId, dayKey)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_recommends_v2_showcase_day ON recommends_v2 (showcaseId, dayKey)`).run();
}


async function ensureCommentsTable(env){
  const db = env.DB;
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS comments_v1 (
      commentId TEXT PRIMARY KEY,
      showcaseId TEXT NOT NULL,
      userId TEXT NOT NULL,
      userName TEXT,
      content TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    )
  `).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_comments_v1_showcase_time ON comments_v1 (showcaseId, createdAt)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_comments_v1_user_time ON comments_v1 (userId, createdAt)`).run();
}

function makeId(prefix="c"){
  const s = (crypto && crypto.randomUUID) ? crypto.randomUUID() : (String(Date.now()) + "_" + Math.random().toString(16).slice(2));
  return prefix + "_" + s.replace(/[^a-zA-Z0-9_]/g, "");
}

function clampStr(s, maxLen){
  const t = String(s || "").trim();
  if(!t) return "";
  return t.length > maxLen ? t.slice(0, maxLen) : t;
}

async function apiCommentsGet(req, env){
  const db = env.DB;
  const url = new URL(req.url);
  const showcaseId = String(url.searchParams.get("showcaseId") || "").trim();
  if(!showcaseId) return json({ ok:false, error:"missing_showcaseId" }, 400);

  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 50)));
  const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));

  await ensureCommentsTable(env);

  const rows = await db.prepare(`
    SELECT commentId, showcaseId, userId, userName, content, createdAt
    FROM comments_v1
    WHERE showcaseId=?1
    ORDER BY createdAt DESC
    LIMIT ?2 OFFSET ?3
  `).bind(showcaseId, limit, offset).all();

  const totalRow = await db.prepare("SELECT COUNT(*) AS c FROM comments_v1 WHERE showcaseId=?1").bind(showcaseId).first();
  const total = Number(totalRow?.c || 0);

  return json({ ok:true, showcaseId, total, items: rows.results || [] });
}

async function apiCommentPost(req, env){
  const db = env.DB;
  const userId = await getUserId(req, env);
  if (!userId || userId === "anon") return json({ ok:false, error:"unauthorized" }, 401);

  const body = await readJson(req);
  const showcaseId = String(body.showcaseId || "").trim();
  const content = clampStr(body.content, 200);
  if(!showcaseId) return json({ ok:false, error:"missing_showcaseId" }, 400);
  if(!content) return json({ ok:false, error:"missing_content" }, 400);

  if(content.length < 2) return json({ ok:false, error:"content_too_short", min:2 }, 400);
  const lc = content.toLowerCase();
  if(lc.includes("http://") || lc.includes("https://") || lc.includes("www.")) return json({ ok:false, error:"links_not_allowed" }, 400);

  await ensureCommentsTable(env);
  await ensureUserAccountsTable(env);

  // soft anti-spam: max 20 comments per day per user (across all showcases)
  const dayKey = new Date().toISOString().slice(0,10);
  const start = Date.parse(dayKey + "T00:00:00.000Z");
  const end = start + 86400000;

  const cntRow = await db.prepare("SELECT COUNT(*) AS c FROM comments_v1 WHERE userId=?1 AND createdAt>=?2 AND createdAt<?3")
    .bind(userId, start, end).first();
  const used = Number(cntRow?.c || 0);
  if(used >= 20) return json({ ok:false, error:"rate_limited", maxPerDay:20 }, 429);

  // per-showcase cap: max 5 comments per day per user per showcase
  const sCntRow = await db.prepare("SELECT COUNT(*) AS c FROM comments_v1 WHERE userId=?1 AND showcaseId=?2 AND createdAt>=?3 AND createdAt<?4")
    .bind(userId, showcaseId, start, end).first();
  const showcaseUsed = Number(sCntRow?.c || 0);
  if(showcaseUsed >= 5) return json({ ok:false, error:"rate_limited_showcase", maxPerShowcasePerDay:5 }, 429);

  // attach latest userName (optional)
  const acc = await db.prepare("SELECT userName FROM user_accounts WHERE userId=?1").bind(userId).first().catch(()=>null);
  const userName = clampStr(acc?.userName || body.userName, 40);

  const commentId = makeId("cm");
  const createdAt = Date.now();

  try{
    await db.prepare("INSERT INTO comments_v1 (commentId, showcaseId, userId, userName, content, createdAt) VALUES (?1,?2,?3,?4,?5,?6)")
      .bind(commentId, showcaseId, userId, userName, content, createdAt).run();
  }catch(e){
    return json({ ok:false, error:"comment_failed" }, 500);
  }

  return json({ ok:true, commentId, showcaseId, userId, userName, content, createdAt });

async function apiCommentDelete(req, env){
  const db = env.DB;

  // Admin override via header
  const adminKey = (req.headers.get("x-admin-key") || req.headers.get("X-Admin-Key") || "").trim();
  const envAdmin = (env && env.ADMIN_KEY) ? String(env.ADMIN_KEY) : "";
  const isAdmin = !!adminKey && !!envAdmin && adminKey === envAdmin;

  const userId = await getUserId(req, env);
  if ((!userId || userId === "anon") && !isAdmin) return json({ ok:false, error:"unauthorized" }, 401);

  const url = new URL(req.url);
  const body = await readJson(req);
  const commentId = String(url.searchParams.get("commentId") || body.commentId || "").trim();
  if(!commentId) return json({ ok:false, error:"missing_commentId" }, 400);

  await ensureCommentsTable(env);

  const c = await db.prepare("SELECT commentId, showcaseId, userId FROM comments_v1 WHERE commentId=?1").bind(commentId).first();
  if(!c) return json({ ok:false, error:"not_found" }, 404);

  // Determine showcase author
  let authorId = "";
  try{
    const s = await db.prepare("SELECT userId FROM showcases WHERE showcaseId=?1").bind(c.showcaseId).first();
    authorId = String(s?.userId || "");
  }catch(_){}

  const canDelete = isAdmin || (userId && (userId === String(c.userId) || (authorId && userId === authorId)));
  if(!canDelete) return json({ ok:false, error:"forbidden" }, 403);

  await db.prepare("DELETE FROM comments_v1 WHERE commentId=?1").bind(commentId).run();
  return json({ ok:true, commentId });
}

}

async function ensureFavoritesTable(env){
  const db = env.DB;
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS favorites (
      userId TEXT NOT NULL,
      showcaseId TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      PRIMARY KEY (userId, showcaseId)
    )
  `).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_favorites_showcase ON favorites (showcaseId)`).run();
}

async function ensureFollowsTable(env){
  const db = env.DB;
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS follows (
      followerId TEXT NOT NULL,
      targetUserId TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      PRIMARY KEY (followerId, targetUserId)
    )
  `).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_follows_target ON follows (targetUserId)`).run();
}

async function ensureUserAccountsColumns(env){
  const db = env.DB;
  await ensureUserAccountsTable(env);
  const cols = await getTableColumns(db, "user_accounts");
  if (!cols || cols.size === 0) return;
  if (!cols.has("exp")){ try{ await db.prepare("ALTER TABLE user_accounts ADD COLUMN exp INTEGER DEFAULT 0").run(); }catch(_){} }
  if (!cols.has("level")){ try{ await db.prepare("ALTER TABLE user_accounts ADD COLUMN level INTEGER DEFAULT 1").run(); }catch(_){} }
}

function levelNeedExp(level){ return 50 * Math.max(1, Number(level||1)); }

async function addExp(env, userId, delta){
  if(!userId || userId==="anon") return null;
  const db = env.DB;
  await ensureUserAccountsColumns(env);
  await db.prepare("INSERT INTO user_accounts (userId, createdAt) VALUES (?1, ?2) ON CONFLICT(userId) DO NOTHING").bind(userId, Date.now()).run();
  await db.prepare("UPDATE user_accounts SET exp = COALESCE(exp,0) + ?2 WHERE userId=?1").bind(userId, Number(delta||0)).run();

  const row = await db.prepare("SELECT exp, level FROM user_accounts WHERE userId=?1").bind(userId).first();
  let exp = Number(row?.exp||0);
  let level = Math.max(1, Number(row?.level||1));
  let need = levelNeedExp(level);
  while(exp >= need){
    exp -= need;
    level += 1;
    need = levelNeedExp(level);
  }
  await db.prepare("UPDATE user_accounts SET exp=?2, level=?3 WHERE userId=?1").bind(userId, exp, level).run();
  return { exp, level, need };
}

// --- Social APIs ---
async function apiFollow(req, env){
  const userId = await getUserId(req, env);
  if(!userId || userId==="anon") return json({ ok:false, error:"unauthorized" }, 401);
  const rl = await rateLimit(env, userId, "follow", 30, 60000);
  if(!rl.ok) return json({ ok:false, error: rl.error, limit: rl.limit, used: rl.used }, 429);

  const body = await readJson(req);
  const targetUserId = String(body.targetUserId || "").trim();
  if(!targetUserId) return json({ ok:false, error:"missing_targetUserId" }, 400);
  if(targetUserId === userId) return json({ ok:false, error:"cannot_follow_self" }, 400);

  await ensureFollowsTable(env);
  const db = env.DB;
  await db.prepare("INSERT OR IGNORE INTO follows (followerId, targetUserId, createdAt) VALUES (?1,?2,?3)")
    .bind(userId, targetUserId, Date.now()).run();
  await addExp(env, userId, 1);
  return json({ ok:true, followed:true });
}

async function apiUnfollow(req, env){
  const userId = await getUserId(req, env);
  if(!userId || userId==="anon") return json({ ok:false, error:"unauthorized" }, 401);
  const rl = await rateLimit(env, userId, "unfollow", 30, 60000);
  if(!rl.ok) return json({ ok:false, error: rl.error, limit: rl.limit, used: rl.used }, 429);

  const body = await readJson(req);
  const targetUserId = String(body.targetUserId || "").trim();
  if(!targetUserId) return json({ ok:false, error:"missing_targetUserId" }, 400);

  await ensureFollowsTable(env);
  await env.DB.prepare("DELETE FROM follows WHERE followerId=?1 AND targetUserId=?2").bind(userId, targetUserId).run();
  return json({ ok:true, followed:false });
}

async function apiMeFollowing(req, env){
  const userId = await getUserId(req, env);
  if(!userId || userId==="anon") return json({ ok:false, error:"unauthorized" }, 401);

  await ensureFollowsTable(env);
  const rows = await env.DB.prepare("SELECT targetUserId, createdAt FROM follows WHERE followerId=?1 ORDER BY createdAt DESC").bind(userId).all();
  return json({ ok:true, items: rows.results || [] });
}

async function apiFavorite(req, env){
  const userId = await getUserId(req, env);
  if(!userId || userId==="anon") return json({ ok:false, error:"unauthorized" }, 401);
  const rl = await rateLimit(env, userId, "favorite", 30, 60000);
  if(!rl.ok) return json({ ok:false, error: rl.error, limit: rl.limit, used: rl.used }, 429);

  const body = await readJson(req);
  const showcaseId = String(body.showcaseId || "").trim();
  if(!showcaseId) return json({ ok:false, error:"missing_showcaseId" }, 400);

  await ensureFavoritesTable(env);
  await env.DB.prepare("INSERT OR IGNORE INTO favorites (userId, showcaseId, createdAt) VALUES (?1,?2,?3)")
    .bind(userId, showcaseId, Date.now()).run();

  await addExp(env, userId, 1);
  try{
    const s = await env.DB.prepare("SELECT userId FROM showcases WHERE showcaseId=?1").bind(showcaseId).first();
    const authorId = String(s?.userId||"");
    if(authorId) await addExp(env, authorId, 1);
  }catch(_){}

  return json({ ok:true, favorited:true });
}

async function apiUnfavorite(req, env){
  const userId = await getUserId(req, env);
  if(!userId || userId==="anon") return json({ ok:false, error:"unauthorized" }, 401);
  const rl = await rateLimit(env, userId, "unfavorite", 30, 60000);
  if(!rl.ok) return json({ ok:false, error: rl.error, limit: rl.limit, used: rl.used }, 429);

  const body = await readJson(req);
  const showcaseId = String(body.showcaseId || "").trim();
  if(!showcaseId) return json({ ok:false, error:"missing_showcaseId" }, 400);

  await ensureFavoritesTable(env);
  await env.DB.prepare("DELETE FROM favorites WHERE userId=?1 AND showcaseId=?2").bind(userId, showcaseId).run();
  return json({ ok:true, favorited:false });
}

async function apiMeFavorites(req, env){
  const userId = await getUserId(req, env);
  if(!userId || userId==="anon") return json({ ok:false, error:"unauthorized" }, 401);

  await ensureFavoritesTable(env);
  const rows = await env.DB.prepare("SELECT showcaseId, createdAt FROM favorites WHERE userId=?1 ORDER BY createdAt DESC").bind(userId).all();
  return json({ ok:true, items: rows.results || [] });
}

async function apiUserProfile(req, env){
  const url = new URL(req.url);
  const uid = String(url.searchParams.get("uid") || "").trim();
  if(!uid) return json({ ok:false, error:"missing_uid" }, 400);

  await ensureUserAccountsColumns(env);
  await ensureFollowsTable(env);

  const db = env.DB;
  const prof = await db.prepare("SELECT userId, userName, userRegion, userGold, userGem, userVote, exp, level FROM user_accounts WHERE userId=?1").bind(uid).first();

  const followers = await db.prepare("SELECT COUNT(*) AS c FROM follows WHERE targetUserId=?1").bind(uid).first();
  const following = await db.prepare("SELECT COUNT(*) AS c FROM follows WHERE followerId=?1").bind(uid).first();

  return json({ ok:true, profile: prof || { userId:uid, userName:"", userRegion:"", userGold:0, userGem:0, userVote:0, exp:0, level:1 }, followers: Number(followers?.c||0), following: Number(following?.c||0) });
}

async function apiUserShowcases(req, env){
  const url = new URL(req.url);
  const uid = String(url.searchParams.get("uid") || "").trim();
  if(!uid) return json({ ok:false, error:"missing_uid" }, 400);

  await ensureVotesV2Table(env);
  await ensureFavoritesTable(env);

  const db = env.DB;
  const rows = await db.prepare(`
    SELECT
      s.showcaseId, s.userId, s.title, s.createdAt, s.seasonId,
      s.headId, s.bodyId, s.bgId, s.addon1Id, s.addon2Id,
      (SELECT COUNT(*) FROM votes_v2 v WHERE v.seasonId = s.seasonId AND v.showcaseId = s.showcaseId) as votes,
      (SELECT COUNT(*) FROM favorites f WHERE f.showcaseId = s.showcaseId) as favorites,
      ah.imageUrl as headUrl,
      ab.imageUrl as bodyUrl,
      ag.imageUrl as bgUrl,
      aa1.imageUrl as addon1Url,
      aa2.imageUrl as addon2Url
    FROM showcases s
    LEFT JOIN assets ah ON ah.assetId = s.headId
    LEFT JOIN assets ab ON ab.assetId = s.bodyId
    LEFT JOIN assets ag ON ag.assetId = s.bgId
    LEFT JOIN assets aa1 ON aa1.assetId = s.addon1Id
    LEFT JOIN assets aa2 ON aa2.assetId = s.addon2Id
    WHERE s.userId = ?1
    ORDER BY s.createdAt DESC
    LIMIT 200
  `).bind(uid).all();

  return json({ ok:true, items: rows.results || [] });
}

async function ensureUserAccountsTable(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS user_accounts (
      userId TEXT PRIMARY KEY,
      userName TEXT,
      userGold INTEGER DEFAULT 0,
      userGem INTEGER DEFAULT 0,
      userVote INTEGER DEFAULT 0,
      userRegion TEXT DEFAULT "",
      exp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      avatarSaveOn INTEGER DEFAULT NULL,
      nameChangeCount INTEGER DEFAULT 0,
      createdAt INTEGER DEFAULT 0
    )
  `).run();

  // lightweight migrations (in case table existed before new columns)
  const cols = await env.DB.prepare("PRAGMA table_info(user_accounts)").all();
  const names = new Set((cols.results || []).map((c) => c.name));
  if (!names.has("avatarSaveOn")) await env.DB.prepare("ALTER TABLE user_accounts ADD COLUMN avatarSaveOn INTEGER").run();
  if (!names.has("nameChangeCount")) await env.DB.prepare("ALTER TABLE user_accounts ADD COLUMN nameChangeCount INTEGER DEFAULT 0").run();
  if (!names.has("createdAt")) await env.DB.prepare("ALTER TABLE user_accounts ADD COLUMN createdAt INTEGER DEFAULT 0").run();
}


async function apiMeAccount(req, env) {
  const db = env.DB;
  const userId = await getUserId(req, env);
  if (!userId || userId === "anon") return json({ ok: false, error: "no_user" }, 401);

  await ensureUserAccountsTable(env);

  // create row if missing
  await db.prepare(`
    INSERT INTO user_accounts (userId, userName, userGold, userGem, userVote, userRegion, exp, level, avatarSaveOn, nameChangeCount, createdAt)
    SELECT ?1, COALESCE((SELECT userName FROM user_accounts WHERE userId=?1), "Player"), 0, 0, 0, "", 0, 1, NULL, 0, ?2
    WHERE NOT EXISTS (SELECT 1 FROM user_accounts WHERE userId=?1)
  `).bind(userId, Date.now()).run();

  const row = await db
    .prepare("SELECT userId, userName, userGold, userGem, userVote, userRegion, exp, level, avatarSaveOn, nameChangeCount, createdAt FROM user_accounts WHERE userId=?1")
    .bind(userId)
    .first();

  // counts
  const savesCountRow = await db.prepare("SELECT COUNT(1) AS c FROM user_saves WHERE userId=?1").bind(userId).first();
  const savesCount = Number(savesCountRow?.c || 0);

  await ensureFollowsTable(env);

  const followersRow = await db.prepare("SELECT COUNT(1) AS c FROM follows WHERE targetUserId=?1").bind(userId).first();
  const followersCount = Number(followersRow?.c || 0);

  const followingRow = await db.prepare("SELECT COUNT(1) AS c FROM follows WHERE followerId=?1").bind(userId).first();
  const followingCount = Number(followingRow?.c || 0);

  const likesRow = await db.prepare("SELECT COUNT(1) AS c FROM likes WHERE userId=?1").bind(userId).first().catch(() => ({ c: 0 }));
  const likesCount = Number(likesRow?.c || 0);

  const collectionsRow = await db.prepare("SELECT COUNT(1) AS c FROM user_unlocks WHERE userId=?1").bind(userId).first().catch(() => ({ c: 0 }));
  const collectionsUnlocked = Number(collectionsRow?.c || 0);

  // avatar save
  let avatarSave = null;
  const avatarSaveOn = Number(row?.avatarSaveOn || 0);
  if (avatarSaveOn) {
    const srow = await db
      .prepare("SELECT userId, headId, bodyId, bgId, addon1Id, addon2Id, savedOn, IFNULL(systemScore,0) AS systemScore FROM user_saves WHERE userId=?1 AND savedOn=?2")
      .bind(userId, avatarSaveOn)
      .first();
    if (srow) avatarSave = srow;
  }

  // accountScore: highest systemScore among all saved works
  try{ await ensureUserSavesSystemScoreColumn(db); }catch(_e){}
  let accountScore = 0;
  try{
    const mx = await db.prepare("SELECT MAX(COALESCE(systemScore,0)) as accountScore FROM user_saves WHERE userId=?1").bind(userId).first();
    accountScore = Number(mx?.accountScore || 0) || 0;
  }catch(_e){}
  try{ row.accountScore = accountScore; }catch(_e){}


  return json({
    ok: true,
    account: row,
    stats: {
      saves: savesCount,
      followers: followersCount,
      following: followingCount,
      likes: likesCount,
      collectionsUnlocked,
    },
    avatarSave,
  });
}

async function apiMeAccountUpsert(req, env) {
  const db = env.DB;
  const userId = await getUserId(req, env);
  if (!userId || userId === "anon") return json({ ok: false, error: "no_user" }, 401);
  const rl = await rateLimit(env, userId, "me_upsert", 10, 60000);
  if(!rl.ok) return json({ ok:false, error: rl.error, limit: rl.limit, used: rl.used }, 429);


  await ensureUserAccountsTable(env);
  const body = await readJson(req);

  // ensure row exists
  await db.prepare(`
    INSERT INTO user_accounts (userId, userName, userGold, userGem, userVote, userRegion, exp, level, avatarSaveOn, nameChangeCount, createdAt)
    SELECT ?1, COALESCE((SELECT userName FROM user_accounts WHERE userId=?1), "Player"), 0, 0, 0, "", 0, 1, NULL, 0, ?2
    WHERE NOT EXISTS (SELECT 1 FROM user_accounts WHERE userId=?1)
  `).bind(userId, Date.now()).run();

  const existing = await db
    .prepare("SELECT userId, userName, userGold, userGem, userVote, userRegion, exp, level, avatarSaveOn, nameChangeCount, createdAt FROM user_accounts WHERE userId=?1")
    .bind(userId)
    .first();

  const newName = (body?.userName || "").toString().trim();
  if (newName && newName !== (existing?.userName || "Player")) {
    const cnt = Number(existing?.nameChangeCount || 0);
    const costGem = cnt >= 1 ? 10 : 0;
    const curGem = Number(existing?.userGem || 0);
    if (costGem > 0 && curGem < costGem) {
      return json({ ok: false, error: "not_enough_gem", need: costGem, have: curGem }, 400);
    }
    if (costGem > 0) {
      await db.prepare("UPDATE user_accounts SET userGem=userGem-?2 WHERE userId=?1").bind(userId, costGem).run();
    }
    await db.prepare("UPDATE user_accounts SET userName=?2, nameChangeCount=nameChangeCount+1 WHERE userId=?1").bind(userId, newName).run();
  }

  return json({ ok: true });
}


async function apiSessionInit(req, env) {
  const db = env.DB;
  await ensureUserAccountsTable(env);

  let userId = await getUserId(req, env);
  if (!userId || userId === "anon") userId = crypto.randomUUID();

  await db.prepare(`
    INSERT INTO user_accounts (userId, userName, userGold, userGem, userVote, userRegion, exp, level, avatarSaveOn, nameChangeCount, createdAt)
    SELECT ?1, COALESCE((SELECT userName FROM user_accounts WHERE userId=?1), "Player"), 0, 0, 0, "", 0, 1, NULL, 0, ?2
    WHERE NOT EXISTS (SELECT 1 FROM user_accounts WHERE userId=?1)
  `).bind(userId, Date.now()).run();

  const token = await signSessionToken(env, userId);
  return json({ ok: true, userId, token });
}


async function apiMeAvatarGet(req, env){
  const userId = await getUserId(req, env);
  if(!userId || userId === "anon") return json({ ok:false, error:"unauthorized" }, 401);

  await ensureUserAccountsTable(env);
  const row = await env.DB.prepare("SELECT avatarSaveOn FROM user_accounts WHERE userId=?1").bind(userId).first();
  return json({ ok:true, userId, savedOn: Number(row?.avatarSaveOn || 0) });
}

async function apiMeAvatarSet(req, env) {
  const db = env.DB;
  const userId = await getUserId(req, env);
  if (!userId || userId === "anon") return json({ ok: false, error: "no_user" }, 401);
  const rl = await rateLimit(env, userId, "avatar", 10, 60000);
  if(!rl.ok) return json({ ok:false, error: rl.error, limit: rl.limit, used: rl.used }, 429);


  await ensureUserAccountsTable(env);
  const body = await readJson(req);
  const savedOn = Number(body?.savedOn);

  if (!savedOn) return json({ ok: false, error: "missing_savedOn" }, 400);

  const row = await db.prepare("SELECT savedOn FROM user_saves WHERE userId=?1 AND savedOn=?2").bind(userId, savedOn).first();
  if (!row) return json({ ok: false, error: "save_not_found" }, 404);

  await db.prepare("UPDATE user_accounts SET avatarSaveOn=?2 WHERE userId=?1").bind(userId, savedOn).run();
  return json({ ok: true, avatarSaveOn: savedOn });
}


// --- Share Reward (SSR/UR one-click share) ---
// Notes:
// - Browser cannot auto-post to FB/IG/XHS without user + platform auth. Reward is granted per shareId with daily cap.
// - Frontend sends: { shareId, rarity, assetId }
// - Server enforces: rarity >= 4, unique shareId, per-user per-day max 5
async function ensureShareRewardsTable(env){
  const db = env.DB;
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS share_rewards (
      shareId TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      day INTEGER NOT NULL,
      rarity INTEGER NOT NULL,
      assetId TEXT,
      rewardGem INTEGER NOT NULL,
      rewardVote INTEGER NOT NULL,
      createdAt INTEGER NOT NULL
    )
  `).run();
  try{ await db.prepare("CREATE INDEX IF NOT EXISTS idx_share_rewards_user_day ON share_rewards(userId, day)").run(); }catch(_){}
}

function dayBucket(ts){
  return Math.floor(Number(ts || Date.now()) / 86400000);
}

async function apiShareReward(req, env){
  const userId = await getUserId(req, env);
  if(!userId || userId === "anon") return json({ ok:false, error:"unauthorized" }, 401);
  const rl = await rateLimit(env, userId, "share_reward", 10, 60000);
  if(!rl.ok) return json({ ok:false, error: rl.error, limit: rl.limit, used: rl.used }, 429);


  const body = await readJson(req);
  const shareId = String(body?.shareId || "").trim();
  const rarity = Math.max(1, Math.min(5, Number(body?.rarity || 0)));
  const assetId = String(body?.assetId || "").trim();

  if(!shareId) return json({ ok:false, error:"missing_shareId" }, 400);
  if(rarity < 4) return json({ ok:false, error:"not_eligible" }, 400);

  await ensureUserAccountsColumns(env);
  await ensureShareRewardsTable(env);

  const db = env.DB;
  const now = Date.now();
  const day = dayBucket(now);

  // duplicate shareId
  const dup = await db.prepare("SELECT shareId FROM share_rewards WHERE shareId=?1").bind(shareId).first();
  if(dup) return json({ ok:true, already:true });

  // daily cap
  const usedRow = await db.prepare("SELECT COUNT(*) AS c FROM share_rewards WHERE userId=?1 AND day=?2")
    .bind(userId, day).first();
  const used = Number(usedRow?.c || 0);
  const maxPerDay = 5;
  if(used >= maxPerDay){
    return json({ ok:false, error:"daily_limit", used, maxPerDay }, 400);
  }

  // reward amounts
  const reward = (rarity >= 5)
    ? { gem: 40, vote: 2 } // UR
    : { gem: 20, vote: 1 }; // SSR

  // ensure account exists
  await db.prepare("INSERT INTO user_accounts (userId, createdAt) VALUES (?1, ?2) ON CONFLICT(userId) DO NOTHING").bind(userId, Date.now()).run();

  // atomic credit
  await db.prepare("UPDATE user_accounts SET userGem = COALESCE(userGem,0) + ?2, userVote = COALESCE(userVote,0) + ?3 WHERE userId=?1")
    .bind(userId, reward.gem, reward.vote).run();

  // log
  await db.prepare("INSERT INTO share_rewards (shareId, userId, day, rarity, assetId, rewardGem, rewardVote, createdAt) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)")
    .bind(shareId, userId, day, rarity, assetId, reward.gem, reward.vote, now).run();

  const acc = await db.prepare("SELECT userGem, userVote FROM user_accounts WHERE userId=?1").bind(userId).first();
  return json({
    ok:true,
    reward,
    used: used + 1,
    maxPerDay,
    balances: { userGem: Number(acc?.userGem||0), userVote: Number(acc?.userVote||0) }
  });
}
