const DEFAULT_API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", async () => {
  const apiUrlInput = document.getElementById("apiUrlInput");
  const statusBadge = document.getElementById("statusBadge");
  const statusText = document.getElementById("statusText");
  const statTotal = document.getElementById("statTotal");
  const statInterview = document.getElementById("statInterview");
  const btnSaveApi = document.getElementById("btnSaveApi");
  const btnOpenDashboard = document.getElementById("btnOpenDashboard");
  const btnTriggerSync = document.getElementById("btnTriggerSync");
  const syncBtnText = document.getElementById("syncBtnText");
  const syncStatusDesc = document.getElementById("syncStatusDesc");

  // Load saved API URL
  const stored = await chrome.storage.local.get(["jobtracer_api_url", "jobtracer_last_check", "jobtracer_last_summary"]);
  const apiUrl = stored.jobtracer_api_url || DEFAULT_API_URL;
  apiUrlInput.value = apiUrl;

  if (stored.jobtracer_last_check && syncStatusDesc) {
    const timeStr = new Date(stored.jobtracer_last_check).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const summary = stored.jobtracer_last_summary;
    if (summary) {
      syncStatusDesc.textContent = `Terakhir dicek: ${timeStr} (${summary.totalChecked} dicek, ${summary.updatedCount} terupdate).`;
    } else {
      syncStatusDesc.textContent = `Terakhir dicek: ${timeStr}.`;
    }
  }

  // Check connection & fetch stats
  async function checkConnection(url) {
    statusBadge.className = "badge badge-offline";
    statusText.textContent = "Menghubungkan...";
    try {
      const res = await fetch(`${url}/api/applications`, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        statusBadge.className = "badge badge-online";
        statusText.textContent = "Online";

        const apps = data.applications || [];
        statTotal.textContent = apps.length;
        const interviews = apps.filter((a) => a.status === "interview").length;
        statInterview.textContent = interviews;
        return true;
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      statusBadge.className = "badge badge-offline";
      statusText.textContent = "Offline";
      statTotal.textContent = "-";
      statInterview.textContent = "-";
      return false;
    }
  }

  await checkConnection(apiUrl);

  // Trigger background check
  btnTriggerSync.addEventListener("click", async () => {
    btnTriggerSync.disabled = true;
    syncBtnText.textContent = "⏳ Sedang Memeriksa KarirHub...";
    syncStatusDesc.textContent = "Mengambil status terkini di background...";

    chrome.runtime.sendMessage({ type: "CHECK_NOW" }, async (response) => {
      btnTriggerSync.disabled = false;
      syncBtnText.textContent = "🔄 Cek Status Semua Lowongan Sekarang";

      if (response && response.success) {
        syncStatusDesc.textContent = `✓ ${response.message}`;
        await checkConnection(apiUrl);
      } else {
        syncStatusDesc.textContent = `⚠️ ${response?.message || response?.error || "Gagal memeriksa."}`;
      }
    });
  });

  btnSaveApi.addEventListener("click", async () => {
    let url = apiUrlInput.value.trim();
    if (!url) url = DEFAULT_API_URL;
    url = url.replace(/\/+$/, ""); // remove trailing slashes
    apiUrlInput.value = url;
    await chrome.storage.local.set({ jobtracer_api_url: url });
    await checkConnection(url);
  });

  btnOpenDashboard.addEventListener("click", () => {
    const url = apiUrlInput.value.trim() || DEFAULT_API_URL;
    chrome.tabs.create({ url });
  });
});
