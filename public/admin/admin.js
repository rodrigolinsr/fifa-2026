"use strict";

const elements = {
  refreshButton: document.querySelector("#refreshButton"),
  syncFifaButton: document.querySelector("#syncFifaButton"),
  fifaStatus: document.querySelector("#fifaStatus"),
  status: document.querySelector("#status"),
  matchesBody: document.querySelector("#matchesBody"),
  updatedAt: document.querySelector("#updatedAt")
};

const state = {
  matches: [],
  results: {},
  updatedAt: null,
  fifaStatus: null
};

init();

function init() {
  elements.refreshButton.addEventListener("click", () => {
    loadData();
  });

  elements.syncFifaButton.addEventListener("click", () => {
    syncFifa();
  });

  elements.matchesBody.addEventListener("click", handleTableClick);

  loadData();
}

async function loadData() {
  setStatus("Loading...");

  try {
    const [matches, payload, fifaStatus] = await Promise.all([loadMatchCatalog(), loadResults(), loadFifaStatus()]);
    state.matches = matches;
    state.results = payload.results || {};
    state.updatedAt = payload.updatedAt || null;
    state.fifaStatus = fifaStatus;

    renderMatchTable();
    renderFifaStatus();
    updateUpdatedAt(state.updatedAt);
    setStatus("Ready.");
  } catch {
    setStatus("Could not load matches or saved results.");
  }
}

async function syncFifa() {
  setStatus("Syncing FIFA results...");
  elements.syncFifaButton.disabled = true;

  try {
    const response = await fetch("/admin/api/fifa/sync", {
      method: "POST",
      cache: "no-store"
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload.ok) {
      const error = payload.error || "Could not sync FIFA results.";
      state.fifaStatus = payload.status || state.fifaStatus;
      renderFifaStatus();
      setStatus(error);
      return;
    }

    state.fifaStatus = payload.status || state.fifaStatus;
    const summary = payload.summary || {};
    setStatus(`FIFA sync complete. Updated ${summary.updatedResults || 0} result(s).`);
    await loadData();
  } catch {
    setStatus("Could not sync FIFA results.");
  } finally {
    elements.syncFifaButton.disabled = false;
  }
}

async function handleTableClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const matchNumber = Number(button.dataset.matchNumber);
  if (!Number.isInteger(matchNumber) || matchNumber <= 0) return;

  if (button.dataset.action === "save") {
    await handleSave(matchNumber);
  }

  if (button.dataset.action === "delete") {
    await handleDelete(matchNumber);
  }
}

async function handleSave(matchNumber) {
  const homeInput = document.querySelector(`[data-score-input][data-match-number="${matchNumber}"][data-side="home"]`);
  const awayInput = document.querySelector(`[data-score-input][data-match-number="${matchNumber}"][data-side="away"]`);

  if (!homeInput || !awayInput) return;

  const homeScore = Number(homeInput.value);
  const awayScore = Number(awayInput.value);

  if (!Number.isInteger(homeScore) || homeScore < 0 || !Number.isInteger(awayScore) || awayScore < 0) {
    setStatus(`Match ${matchNumber}: scores must be non-negative integers.`);
    return;
  }

  setStatus(`Saving match ${matchNumber}...`);

  const response = await fetch(`/admin/api/results/${matchNumber}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ homeScore, awayScore })
  });

  if (!response.ok) {
    setStatus(`Could not save match ${matchNumber}.`);
    return;
  }

  setStatus(`Saved match ${matchNumber}: ${homeScore} x ${awayScore}.`);
  await loadData();
}

async function handleDelete(matchNumber) {
  const confirmed = window.confirm(`Delete saved result for match ${matchNumber}?`);
  if (!confirmed) return;

  setStatus(`Deleting match ${matchNumber}...`);

  const response = await fetch(`/admin/api/results/${matchNumber}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    setStatus(`Could not delete match ${matchNumber}.`);
    return;
  }

  setStatus(`Deleted result for match ${matchNumber}.`);
  await loadData();
}

async function loadResults() {
  const response = await fetch("/admin/api/results", {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Could not load results");
  }

  return response.json();
}

async function loadFifaStatus() {
  const response = await fetch("/admin/api/fifa/status", {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Could not load FIFA sync status");
  }

  return response.json();
}

async function loadMatchCatalog() {
  const response = await fetch("/app.js", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Could not load app catalog");
  }

  const script = await response.text();
  const matchesCsv = extractCSVConstant(script, "MATCHES_CSV");
  const teamsCsv = extractCSVConstant(script, "TEAMS_CSV");
  const teamsById = new Map(
    parseCSV(teamsCsv).map((team) => [Number(team.id), team.team_name])
  );

  return parseCSV(matchesCsv)
    .map((row) => {
      const fixture = resolveFixture(row, teamsById);
      return {
        number: Number(row.match_number),
        label: row.match_label,
        kickoff: parseKickoff(row.kickoff_at),
        homeTeamId: row.home_team_id ? Number(row.home_team_id) : null,
        awayTeamId: row.away_team_id ? Number(row.away_team_id) : null,
        fixture: fixture.full,
        homeName: fixture.home,
        awayName: fixture.away
      };
    })
    .filter((match) => Number.isInteger(match.number) && match.number > 0)
    .sort((a, b) => a.number - b.number);
}

function renderMatchTable() {
  if (!state.matches.length) {
    elements.matchesBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty">No matches available.</td>
      </tr>
    `;
    return;
  }

  elements.matchesBody.innerHTML = state.matches
    .map((match) => {
      const saved = state.results[String(match.number)] || {};
      const home = saved.home ?? "";
      const away = saved.away ?? "";
      const updatedAt = saved.updatedAt ? formatDateTime(saved.updatedAt) : "--";
      const source = getResultSource(saved);

      return `
      <tr>
        <td>
          <div class="match-cell">
            <strong>Match ${match.number}</strong>
            <span class="fixture">${escapeHTML(match.fixture)}</span>
            <span>${escapeHTML(match.label)}</span>
          </div>
        </td>
        <td>${escapeHTML(formatKickoff(match.kickoff))}</td>
        <td>
          <div class="score-inputs">
            <span class="team-near home">${escapeHTML(match.homeName)}</span>
            <input type="number" min="0" inputmode="numeric" data-score-input data-side="home" data-match-number="${match.number}" value="${escapeHTML(home)}" aria-label="Home score match ${match.number} (${escapeHTML(match.homeName)})">
            <span class="versus">x</span>
            <input type="number" min="0" inputmode="numeric" data-score-input data-side="away" data-match-number="${match.number}" value="${escapeHTML(away)}" aria-label="Away score match ${match.number} (${escapeHTML(match.awayName)})">
            <span class="team-near away">${escapeHTML(match.awayName)}</span>
          </div>
          <small class="updated">Updated: ${escapeHTML(updatedAt)} · ${source}</small>
        </td>
        <td>
          <div class="row-actions">
            <button type="button" data-action="save" data-match-number="${match.number}">Save</button>
            <button type="button" class="secondary" data-action="delete" data-match-number="${match.number}">Delete</button>
          </div>
        </td>
      </tr>
      `;
    })
    .join("");
}

function renderFifaStatus() {
  const status = state.fifaStatus;
  if (!status) {
    elements.fifaStatus.innerHTML = renderStatusCard("Status", "Unavailable");
    return;
  }

  const enabled = status.enabled ? (status.syncing ? "Syncing" : "Enabled") : "Background disabled";
  const summary = status.lastSummary || {};
  const lastError = status.lastError || "None";
  const liveMatches = Array.isArray(status.liveMatches) ? status.liveMatches : [];

  elements.syncFifaButton.disabled = status.syncing;
  elements.fifaStatus.innerHTML = [
    renderStatusCard("Sync", enabled),
    renderStatusCard("Last success", formatDateTime(status.lastSuccessAt)),
    renderStatusCard("Completed", `${summary.completedMatches || 0} match(es)`),
    renderStatusCard("Live", `${liveMatches.length} match(es)`),
    renderStatusCard("Updated", `${summary.updatedResults || 0} result(s)`),
    liveMatches.length ? renderStatusCard("Live now", formatLiveMatches(liveMatches), "wide") : "",
    renderStatusCard("Last error", lastError, lastError === "None" ? "" : "wide")
  ].join("");
}

function formatLiveMatches(liveMatches) {
  return liveMatches.map((match) => {
    const minute = Number.isInteger(match.minutes) ? `${match.minutes}'` : "Live";
    const home = match.homeAbbr || match.homeName || "Home";
    const away = match.awayAbbr || match.awayName || "Away";
    const homeScore = Number.isInteger(match.homeScore) ? match.homeScore : "-";
    const awayScore = Number.isInteger(match.awayScore) ? match.awayScore : "-";
    return `Match ${match.matchNumber} · ${home} ${homeScore}-${awayScore} ${away} · ${minute}`;
  }).join(" | ");
}

function renderStatusCard(label, value, modifier = "") {
  return `
    <div class="sync-card ${modifier}">
      <span>${escapeHTML(label)}</span>
      <strong>${escapeHTML(value || "--")}</strong>
    </div>
  `;
}

function getResultSource(saved) {
  if (saved.source === "fifa") return "FIFA";
  if (saved.source && saved.source !== "manual") return "Legacy automated";
  if (saved.home !== undefined || saved.away !== undefined) return "Manual";
  return "No result";
}

function updateUpdatedAt(value) {
  const label = value ? formatDateTime(value) : "--";
  elements.updatedAt.textContent = `Last update: ${label}`;
}

function formatDateTime(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function setStatus(message) {
  elements.status.textContent = message;
}

function extractCSVConstant(script, constantName) {
  const escapedName = constantName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = "const " + escapedName + " = `([\\s\\S]*?)`;";
  const match = script.match(new RegExp(pattern));
  if (!match) {
    throw new Error(`Could not find ${constantName}`);
  }

  return match[1];
}

function resolveFixture(row, teamsById) {
  const homeTeam = teamsById.get(Number(row.home_team_id));
  const awayTeam = teamsById.get(Number(row.away_team_id));
  if (homeTeam && awayTeam) {
    return {
      home: homeTeam,
      away: awayTeam,
      full: `${homeTeam} vs ${awayTeam}`
    };
  }

  const fromLabel = row.match_label.split(" vs ");
  if (fromLabel.length === 2) {
    return {
      home: fromLabel[0],
      away: fromLabel[1],
      full: `${fromLabel[0]} vs ${fromLabel[1]}`
    };
  }

  return {
    home: "Home",
    away: "Away",
    full: row.match_label
  };
}

function parseCSV(csv) {
  const rows = csv.trim().split(/\r?\n/).map(parseCSVLine);
  const headers = rows.shift();
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
}

function parseCSVLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

function parseKickoff(value) {
  const normalized = value.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00");
  return new Date(normalized);
}

function formatKickoff(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
