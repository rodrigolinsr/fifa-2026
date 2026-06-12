"use strict";

const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const crypto = require("node:crypto");

const PORT = 8080;
const DATA_DIR = process.env.DATA_DIR || "/data";
const RESULTS_FILE = process.env.RESULTS_FILE || path.join(DATA_DIR, "match-results.json");
const PUBLIC_DIR = path.join(__dirname, "public");
const ADMIN_BASIC_USER = process.env.ADMIN_BASIC_USER || "";
const ADMIN_BASIC_PASS = process.env.ADMIN_BASIC_PASS || "";
const FIFA_ROUNDS_URL = process.env.FIFA_ROUNDS_URL || "https://play.fifa.com/json/fantasy/rounds.json";
const FIFA_RESULT_SYNC_INTERVAL_MS = parsePositiveInteger(process.env.FIFA_RESULT_SYNC_INTERVAL_MS, 60000, 15000);
const FIFA_RESULT_SYNC_ENABLED = process.env.FIFA_RESULT_SYNC_ENABLED !== "false";
const adminAuthConfigured = ADMIN_BASIC_USER !== "" || ADMIN_BASIC_PASS !== "";
const adminAuthEnabled = ADMIN_BASIC_USER !== "" && ADMIN_BASIC_PASS !== "";
const adminAuthMisconfigured = adminAuthConfigured && !adminAuthEnabled;
const FIFA_SOURCE = "fifa";
const MANUAL_SOURCE = "manual";

const fifaResultSyncState = {
  enabled: FIFA_RESULT_SYNC_ENABLED,
  syncing: false,
  lastSyncAt: null,
  lastSuccessAt: null,
  lastError: null,
  lastSummary: null,
  liveMatches: []
};

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = url.pathname;
    const { method } = req;

    if (requiresAdminAuth(pathname, method) && adminAuthMisconfigured) {
      return sendJSON(res, 503, { error: "Admin auth misconfigured. Set both ADMIN_BASIC_USER and ADMIN_BASIC_PASS." });
    }

    if (requiresAdminAuth(pathname, method) && !isAuthorized(req)) {
      return sendUnauthorized(res);
    }

    if (pathname === "/healthz") {
      return sendText(res, 200, "ok\n", "text/plain; charset=utf-8", "no-store");
    }

    if (pathname.startsWith("/admin/api")) {
      return handleAdminApi(req, res, pathname, method);
    }

    if (method !== "GET" && method !== "HEAD") {
      return sendJSON(res, 405, { error: "Method not allowed." });
    }

    return handleStatic(res, pathname, method === "HEAD");
  } catch (error) {
    console.error("[request-error]", error && error.stack ? error.stack : error);
    if (error && error.code === "INVALID_JSON") {
      return sendJSON(res, 400, { error: "Invalid JSON body." });
    }

    if (error && error.code === "BODY_TOO_LARGE") {
      return sendJSON(res, 413, { error: "Request body too large." });
    }

    sendJSON(res, 500, { error: "Internal server error." });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[startup] Server listening on 0.0.0.0:${PORT} (env PORT=${process.env.PORT || "unset"}, LISTEN_PORT=${process.env.LISTEN_PORT || "unset"})`);
  if (adminAuthEnabled) {
    console.log("[startup] Admin Basic Auth enabled for /admin routes");
  } else if (adminAuthMisconfigured) {
    console.error("[startup] Admin auth misconfigured: set both ADMIN_BASIC_USER and ADMIN_BASIC_PASS");
  }
  ensureDataFile().catch((error) => {
    console.error("[startup] Could not prepare data file:", error && error.stack ? error.stack : error);
  });
  startFifaResultSync();
});

async function handleAdminApi(req, res, pathname, method) {
  const apiPath = pathname.replace(/^\/admin\/api/, "") || "/";

  if (method === "GET" && apiPath === "/healthz") {
    return sendJSON(res, 200, { status: "ok" });
  }

  if (method === "GET" && apiPath === "/results") {
    const payload = await readResults();
    return sendJSON(res, 200, payload);
  }

  if (method === "GET" && apiPath === "/fifa/status") {
    const payload = await buildFifaResultSyncStatus();
    return sendJSON(res, 200, payload);
  }

  if (method === "POST" && apiPath === "/fifa/sync") {
    const payload = await syncFifaResults({ triggeredBy: "admin" });
    const status = payload.ok ? 200 : 503;
    return sendJSON(res, status, payload);
  }

  const resultMatch = apiPath.match(/^\/results\/(\d+)$/);
  if (resultMatch && method === "PUT") {
    const matchNumber = Number(resultMatch[1]);
    const body = await readBody(req);
    const homeScore = toScore(body.homeScore);
    const awayScore = toScore(body.awayScore);

    if (!Number.isInteger(matchNumber) || matchNumber <= 0) {
      return sendJSON(res, 400, { error: "Invalid match number." });
    }

    if (homeScore === null || awayScore === null) {
      return sendJSON(res, 400, { error: "Scores must be non-negative integers." });
    }

    const payload = await readResults();
    payload.results[String(matchNumber)] = {
      home: homeScore,
      away: awayScore,
      source: MANUAL_SOURCE,
      updatedAt: new Date().toISOString()
    };
    payload.updatedAt = new Date().toISOString();

    await writeResults(payload);
    return sendJSON(res, 200, { ok: true, result: payload.results[String(matchNumber)] });
  }

  if (resultMatch && method === "DELETE") {
    const matchNumber = Number(resultMatch[1]);
    if (!Number.isInteger(matchNumber) || matchNumber <= 0) {
      return sendJSON(res, 400, { error: "Invalid match number." });
    }

    const payload = await readResults();
    delete payload.results[String(matchNumber)];
    payload.updatedAt = new Date().toISOString();

    await writeResults(payload);
    return sendJSON(res, 200, { ok: true });
  }

  return sendJSON(res, 404, { error: "Not found." });
}

async function handleStatic(res, pathname, isHead) {
  let relativePath = pathname;
  if (pathname === "/") {
    relativePath = "/index.html";
  } else if (pathname === "/admin") {
    relativePath = "/admin/index.html";
  } else if (pathname === "/admin/") {
    relativePath = "/admin/index.html";
  }

  const requestedPath = safePublicPath(relativePath);
  const existsRequested = requestedPath ? await pathExists(requestedPath) : false;

  let filePath = existsRequested ? requestedPath : null;
  if (!filePath) {
    filePath = pathname.startsWith("/admin/") ? path.join(PUBLIC_DIR, "admin", "index.html") : path.join(PUBLIC_DIR, "index.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext] || "application/octet-stream";
  const cacheControl = /\.(html|css|js)$/i.test(filePath)
    ? "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    : "public, max-age=604800";

  try {
    const content = await fs.readFile(filePath);
    res.statusCode = 200;
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", cacheControl);
    if (isHead) {
      return res.end();
    }
    return res.end(content);
  } catch {
    return sendText(res, 404, "Not found\n", "text/plain; charset=utf-8", "no-store");
  }
}

function safePublicPath(relativePath) {
  const normalized = path.normalize(relativePath)
    .replace(/^(\.\.(\/|\\|$))+/, "")
    .replace(/^[/\\]+/, "");
  const absolutePath = path.join(PUBLIC_DIR, normalized);
  if (!absolutePath.startsWith(PUBLIC_DIR)) {
    return null;
  }
  return absolutePath;
}

async function pathExists(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

async function ensureDataFile() {
  await fs.mkdir(path.dirname(RESULTS_FILE), { recursive: true });

  try {
    await fs.access(RESULTS_FILE);
  } catch {
    await writeResults({
      updatedAt: new Date().toISOString(),
      results: {}
    });
  }
}

async function readResults() {
  await ensureDataFile();
  const raw = await fs.readFile(RESULTS_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || typeof parsed.results !== "object" || parsed.results === null) {
      throw new Error("Invalid schema");
    }

    return {
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
      results: parsed.results
    };
  } catch {
    return {
      updatedAt: null,
      results: {}
    };
  }
}

async function writeResults(payload) {
  const tempPath = `${RESULTS_FILE}.tmp`;
  const data = `${JSON.stringify(payload, null, 2)}\n`;

  await fs.writeFile(tempPath, data, "utf8");
  await fs.rename(tempPath, RESULTS_FILE);
}

function startFifaResultSync() {
  if (!FIFA_RESULT_SYNC_ENABLED) {
    console.log("[startup] FIFA result sync disabled by FIFA_RESULT_SYNC_ENABLED=false");
    return;
  }

  console.log(`[startup] FIFA result sync enabled from ${FIFA_ROUNDS_URL}`);
  syncFifaResults({ triggeredBy: "startup" }).catch((error) => {
    console.error("[fifa-sync] Startup sync failed:", error && error.stack ? error.stack : error);
  });
  setInterval(() => {
    syncFifaResults({ triggeredBy: "interval" }).catch((error) => {
      console.error("[fifa-sync] Interval sync failed:", error && error.stack ? error.stack : error);
    });
  }, FIFA_RESULT_SYNC_INTERVAL_MS);
}

async function buildFifaResultSyncStatus() {
  return {
    enabled: fifaResultSyncState.enabled,
    syncing: fifaResultSyncState.syncing,
    url: FIFA_ROUNDS_URL,
    intervalMs: FIFA_RESULT_SYNC_INTERVAL_MS,
    lastSyncAt: fifaResultSyncState.lastSyncAt,
    lastSuccessAt: fifaResultSyncState.lastSuccessAt,
    lastError: fifaResultSyncState.lastError,
    lastSummary: fifaResultSyncState.lastSummary,
    liveMatches: fifaResultSyncState.liveMatches
  };
}

async function syncFifaResults({ triggeredBy } = {}) {
  if (fifaResultSyncState.syncing) {
    return {
      ok: false,
      error: "FIFA result sync is already running.",
      status: await buildFifaResultSyncStatus()
    };
  }

  fifaResultSyncState.syncing = true;
  fifaResultSyncState.lastSyncAt = new Date().toISOString();
  fifaResultSyncState.lastError = null;
  console.log(`[fifa-sync] Running sync triggered by ${triggeredBy || "unknown"}`);

  try {
    const [rounds, resultsPayload] = await Promise.all([
      fetchFifaRounds(),
      readResults()
    ]);
    const allMatches = flattenFifaRoundMatches(rounds);
    const summary = applyFifaResults(resultsPayload, allMatches, triggeredBy || "unknown");
    const latestSyncedMatch = getLatestSyncedFifaMatch(allMatches);
    const now = new Date().toISOString();

    if (summary.updatedResults > 0) {
      resultsPayload.updatedAt = now;
      await writeResults(resultsPayload);
    }

    fifaResultSyncState.liveMatches = allMatches
      .filter((match) => match.status === "playing")
      .map(normalizeFifaLiveMatch);
    fifaResultSyncState.lastSuccessAt = now;
    fifaResultSyncState.lastSummary = {
      ...summary,
      latestSyncedMatch
    };
    fifaResultSyncState.syncing = false;
    console.log(`[fifa-sync] Complete: updated=${summary.updatedResults}, unchanged=${summary.unchangedResults}, playing=${summary.playingMatches}, complete=${summary.completedMatches}, latest=${formatFifaSyncLogMatch(latestSyncedMatch)}`);

    return {
      ok: true,
      summary: fifaResultSyncState.lastSummary,
      status: await buildFifaResultSyncStatus()
    };
  } catch (error) {
    const message = error && error.message ? error.message : "FIFA result sync failed.";
    fifaResultSyncState.lastError = message;
    fifaResultSyncState.syncing = false;
    return {
      ok: false,
      error: message,
      status: await buildFifaResultSyncStatus()
    };
  } finally {
    fifaResultSyncState.syncing = false;
  }
}

async function fetchFifaRounds() {
  const response = await fetch(FIFA_ROUNDS_URL, {
    headers: {
      "Accept": "application/json,text/plain,*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error(`FIFA rounds endpoint returned HTTP ${response.status}.`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error("FIFA rounds endpoint did not return an array.");
  }

  return payload;
}

function flattenFifaRoundMatches(rounds) {
  return rounds.flatMap((round) =>
    (Array.isArray(round.tournaments) ? round.tournaments : []).map((match) => ({
      ...match,
      roundId: round.id,
      stage: round.stage || null
    }))
  );
}

function applyFifaResults(resultsPayload, matches, triggeredBy) {
  const summary = {
    triggeredBy,
    checkedAt: new Date().toISOString(),
    totalMatches: matches.length,
    completedMatches: 0,
    playingMatches: 0,
    scheduledMatches: 0,
    updatedResults: 0,
    unchangedResults: 0,
    skippedInvalid: 0
  };

  matches.forEach((match) => {
    if (match.status === "playing") {
      summary.playingMatches += 1;
    } else if (match.status === "scheduled") {
      summary.scheduledMatches += 1;
      return;
    } else if (match.status === "complete") {
      summary.completedMatches += 1;
    } else {
      return;
    }

    const normalized = normalizeFifaScoredResult(match);
    if (!normalized) {
      summary.skippedInvalid += 1;
      return;
    }

    const next = {
      home: normalized.home,
      away: normalized.away,
      source: FIFA_SOURCE,
      winnerSide: normalized.winnerSide,
      fifaStatus: match.status,
      fifaPeriod: match.period || null,
      fifaMinutes: Number.isFinite(Number(match.minutes)) ? Number(match.minutes) : null,
      fifaExtraMinutes: Number.isFinite(Number(match.extraMinutes)) ? Number(match.extraMinutes) : null,
      updatedAt: new Date().toISOString()
    };

    const current = resultsPayload.results[String(normalized.matchNumber)];
    if (current && isSameFifaResult(current, next)) {
      summary.unchangedResults += 1;
      return;
    }

    resultsPayload.results[String(normalized.matchNumber)] = next;
    summary.updatedResults += 1;
  });

  return summary;
}

function getLatestSyncedFifaMatch(matches) {
  return matches
    .filter((match) => match.status === "playing" || match.status === "complete")
    .map((match) => ({
      matchNumber: Number(match.id),
      status: match.status,
      date: match.date || null,
      timestamp: Number.isNaN(new Date(match.date || "").getTime()) ? 0 : new Date(match.date).getTime(),
      homeName: match.homeSquadName || "Home",
      awayName: match.awaySquadName || "Away",
      homeAbbr: match.homeSquadAbbr || null,
      awayAbbr: match.awaySquadAbbr || null,
      homeScore: Number.isInteger(Number(match.homeScore)) ? Number(match.homeScore) : null,
      awayScore: Number.isInteger(Number(match.awayScore)) ? Number(match.awayScore) : null
    }))
    .filter((match) => Number.isInteger(match.matchNumber) && match.homeScore !== null && match.awayScore !== null)
    .sort((a, b) => b.timestamp - a.timestamp || b.matchNumber - a.matchNumber)[0] || null;
}

function formatFifaSyncLogMatch(match) {
  if (!match) return "none";
  const home = match.homeAbbr || match.homeName;
  const away = match.awayAbbr || match.awayName;
  return `Match ${match.matchNumber} ${home} ${match.homeScore}-${match.awayScore} ${away} (${match.status})`;
}

function normalizeFifaScoredResult(match) {
  const matchNumber = Number(match.id);
  const home = Number(match.homeScore);
  const away = Number(match.awayScore);
  if (!Number.isInteger(matchNumber) || matchNumber <= 0) return null;
  if (!Number.isInteger(home) || home < 0) return null;
  if (!Number.isInteger(away) || away < 0) return null;

  return {
    matchNumber,
    home,
    away,
    winnerSide: getScoreWinnerSide(home, away)
  };
}

function normalizeFifaLiveMatch(match) {
  return {
    matchNumber: Number(match.id),
    period: match.period || null,
    minutes: Number.isFinite(Number(match.minutes)) ? Number(match.minutes) : null,
    extraMinutes: Number.isFinite(Number(match.extraMinutes)) ? Number(match.extraMinutes) : null,
    homeName: match.homeSquadName || null,
    awayName: match.awaySquadName || null,
    homeAbbr: match.homeSquadAbbr || null,
    awayAbbr: match.awaySquadAbbr || null,
    homeScore: Number.isInteger(Number(match.homeScore)) ? Number(match.homeScore) : null,
    awayScore: Number.isInteger(Number(match.awayScore)) ? Number(match.awayScore) : null,
    venueName: match.venueName || null,
    venueCity: match.venueCity || null,
    date: match.date || null
  };
}

function getScoreWinnerSide(home, away) {
  if (home > away) return "home";
  if (away > home) return "away";
  return null;
}

function isSameFifaResult(current, next) {
  return current.source === FIFA_SOURCE &&
    current.home === next.home &&
    current.away === next.away &&
    (current.winnerSide || null) === (next.winnerSide || null) &&
    (current.fifaStatus || null) === (next.fifaStatus || null) &&
    (current.fifaPeriod || null) === (next.fifaPeriod || null) &&
    (current.fifaMinutes ?? null) === (next.fifaMinutes ?? null) &&
    (current.fifaExtraMinutes ?? null) === (next.fifaExtraMinutes ?? null);
}

function sendJSON(res, status, payload) {
  sendText(res, status, `${JSON.stringify(payload)}\n`, "application/json; charset=utf-8", "no-store");
}

function sendText(res, status, body, contentType, cacheControl) {
  res.statusCode = status;
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", cacheControl);
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 64) {
        const error = new Error("Body too large");
        error.code = "BODY_TOO_LARGE";
        reject(error);
      }
    });

    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        const error = new Error("Invalid JSON");
        error.code = "INVALID_JSON";
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function toScore(value) {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  return null;
}

function parsePositiveInteger(value, fallback, minimum) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum) return fallback;
  return parsed;
}

function requiresAdminAuth(pathname, method) {
  if (pathname === "/admin/api/results" && (method === "GET" || method === "HEAD")) {
    return false;
  }

  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isAuthorized(req) {
  if (!adminAuthEnabled) return true;

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Basic ")) return false;

  let decoded;
  try {
    decoded = Buffer.from(header.slice(6).trim(), "base64").toString("utf8");
  } catch {
    return false;
  }

  const splitAt = decoded.indexOf(":");
  if (splitAt < 0) return false;

  const user = decoded.slice(0, splitAt);
  const pass = decoded.slice(splitAt + 1);
  return timingSafeEqualString(user, ADMIN_BASIC_USER) && timingSafeEqualString(pass, ADMIN_BASIC_PASS);
}

function timingSafeEqualString(a, b) {
  const aBuffer = Buffer.from(String(a));
  const bBuffer = Buffer.from(String(b));
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function sendUnauthorized(res) {
  res.statusCode = 401;
  res.setHeader("WWW-Authenticate", 'Basic realm="Admin"');
  res.setHeader("Cache-Control", "no-store");
  res.end("Unauthorized\n");
}
