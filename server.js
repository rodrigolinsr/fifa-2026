"use strict";

const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");

const PORT = 8080;
const DATA_DIR = process.env.DATA_DIR || "/data";
const RESULTS_FILE = process.env.RESULTS_FILE || path.join(DATA_DIR, "match-results.json");
const PUBLIC_DIR = path.join(__dirname, "public");

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
  ensureDataFile().catch((error) => {
    console.error("[startup] Could not prepare data file:", error && error.stack ? error.stack : error);
  });
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
