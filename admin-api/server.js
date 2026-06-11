"use strict";

const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = process.env.DATA_DIR || "/data";
const RESULTS_FILE = process.env.RESULTS_FILE || path.join(DATA_DIR, "match-results.json");

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const { method } = req;

    if (method === "GET" && url.pathname === "/healthz") {
      return sendJSON(res, 200, { status: "ok" });
    }

    if (method === "GET" && url.pathname === "/results") {
      const payload = await readResults();
      return sendJSON(res, 200, payload);
    }

    const resultMatch = url.pathname.match(/^\/results\/(\d+)$/);
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

    sendJSON(res, 404, { error: "Not found." });
  } catch (error) {
    if (error && error.code === "INVALID_JSON") {
      return sendJSON(res, 400, { error: "Invalid JSON body." });
    }

    sendJSON(res, 500, { error: "Internal server error." });
  }
});

server.listen(PORT, "0.0.0.0", async () => {
  await ensureDataFile();
});

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
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(`${JSON.stringify(payload)}\n`);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 64) {
        reject(new Error("Body too large"));
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
