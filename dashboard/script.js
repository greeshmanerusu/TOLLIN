let table = document.getElementById("logTable");
let search = document.getElementById("search");

let logs = [];

function renderLogs() {
  search = document.getElementById("search");
  table = document.getElementById("logTable");
  if (!table) return;
  if (search) search.oninput = renderLogs;
  const query = search ? search.value.toLowerCase() : ""; 
  table.replaceChildren();

  const filtered = logs.filter(log =>
    `${log.time} ${log.level} ${log.message}`
      .toLowerCase()
      .includes(query)
  );

  filtered.forEach(log => {
    const row = document.createElement("tr");

    [log.time, log.level, log.message].forEach((value, index) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      if (index === 1) {
        cell.className = String(log.level).toLowerCase();
      }
      row.appendChild(cell);
    });

    table.appendChild(row);
  });
}

async function loadLogs() {
  try {
    const response = await fetch("logs.json?t=" + Date.now());
    if (!response.ok) throw new Error("HTTP " + response.status);

    logs = await response.json();
    renderLogs();
  } catch (error) {
    table.innerHTML =
      '<tr><td colspan="3">Unable to load logs.json. Please refresh.</td></tr>';
    console.error("Log loading failed:", error);
  }
}

search.addEventListener("input", renderLogs);
loadLogs();

// SentinelAI sidebar navigation
function showSection(section) {
  const titles = {
    overview: "Log Monitoring Dashboard",
    logs: "Recent Application Logs",
    analytics: "Error Analytics",
    alerts: "Alerts",
    aws: "AWS Services"
  };

  const main = document.querySelector("main");
  const heading = main ? main.querySelector("h1") : null;

  if (!main || !heading) {
    console.error("Dashboard main section was not found.");
    return;
  }

  // Remember the original dashboard content once.
  if (!window.sentinelOriginalContent) {
    window.sentinelOriginalContent = main.innerHTML;
  }

  if (section === "overview") {
    main.innerHTML = window.sentinelOriginalContent;
    if (typeof loadLogs === "function") loadLogs();
  } else if (section === "logs") {
    main.innerHTML = `
      <h1>Recent Application Logs</h1>
      <input id="search" placeholder="Search logs..." />
      <table>
        <thead><tr><th>Time</th><th>Level</th><th>Message</th></tr></thead>
        <tbody id="logTable"></tbody>
      </table>`;
    loadLogs();

  } else if (section === "analytics") {
    main.innerHTML = `
      <h1>Error Analytics</h1>
      <p>Total log entries: <strong id="totalLogs">Loading...</strong></p>
      <p>Errors: <strong id="errorCount">-</strong></p>
      <p>Warnings: <strong id="warningCount">-</strong></p>`;
    loadLogs().then(() => {
      const total = document.getElementById("totalLogs");
      const errors = document.getElementById("errorCount");
      const warnings = document.getElementById("warningCount");
      if (!total || !errors || !warnings) return;
      total.textContent = logs.length;
      errors.textContent = logs.filter(
        x => String(x.level).toUpperCase() === "ERROR"
      ).length;
      warnings.textContent = logs.filter(
        x => ["WARN", "WARNING"].includes(String(x.level).toUpperCase())
      ).length;
    });

  } else if (section === "alerts") {
    main.innerHTML = `
      <h1>Alerts</h1>
      <p>Log-based warnings and errors</p>
      <div id="alertList">Loading alerts...</div>`;
    loadLogs().then(() => {
      const list = document.getElementById("alertList");
      if (!list) return;
      list.replaceChildren();
      const alerts = logs.filter(x =>
        ["ERROR", "WARN", "WARNING"].includes(String(x.level).toUpperCase())
      );
      if (!alerts.length) {
        list.textContent = "No warning or error entries found in the available logs.";
        return;
      }
      alerts.forEach(x => {
        const item = document.createElement("p");
        item.textContent = String(x.time || "") + " — " +
          String(x.level || "") + ": " + String(x.message || "");
        list.appendChild(item);
      });
    });

  } else if (section === "aws") {
    main.innerHTML = `
      <h1>AWS Services</h1>
      <h2>Amazon S3</h2>
      <p>Dashboard hosting, if configured.</p>
      <h2>Amazon CloudWatch</h2>
      <p>Log monitoring and alarms, if configured.</p>
      <h2>AWS CloudShell</h2>
      <p>Project administration environment.</p>
      <p>Live service status requires an AWS connection.</p>`;
  } else {
    main.innerHTML = `<h1>${titles[section] || "SentinelAI"}</h1>`;
  }

  document.querySelectorAll(".sidebar p").forEach(item => {
    item.classList.toggle("active",
      item.textContent.trim().toLowerCase() ===
      (section === "logs" ? "log explorer" :
       section === "analytics" ? "error analytics" :
       section === "aws" ? "aws services" : section));
  });
}
