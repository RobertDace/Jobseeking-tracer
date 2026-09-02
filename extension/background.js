// JobTracer - Background Service Worker (Manifest V3)
// Performs automated background checks on KarirHub applications without opening tabs.

const DEFAULT_API_URL = "http://localhost:3000";
let isChecking = false;

// Get configured API URL from local storage
async function getApiUrl() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["jobtracer_api_url"], (res) => {
      resolve((res && res.jobtracer_api_url) ? res.jobtracer_api_url.replace(/\/+$/, "") : DEFAULT_API_URL);
    });
  });
}

// Setup 15-minute background periodic alarm
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("jobtracer_periodic_check", {
    periodInMinutes: 15,
    delayInMinutes: 1
  });
  console.log("[JobTracer Background] Periodic check alarm initialized (every 15 min).");
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "jobtracer_periodic_check") {
    console.log("[JobTracer Background] Periodic alarm triggered, checking applications...");
    checkAllPendingApplications();
  }
});

// Helper to parse status from KarirHub Vacancy HTML
function parseKarirHubStatus(html) {
  if (!html) return null;
  const lower = html.toLowerCase();
  const marker = "status lamaran";
  const idx = lower.indexOf(marker);

  if (idx !== -1) {
    // Look at surrounding 600 characters around "status lamaran"
    const snippet = lower.slice(idx, idx + 600);
    if (/wawancara|interview|psikotes|tahap\s+selanjutnya|jadwal/i.test(snippet)) {
      return { status: "interview", rawText: "Panggilan Wawancara / Interview" };
    }
    if (/tidak\s+lolos|ditolak|gagal|tidak\s+memenuhi/i.test(snippet)) {
      return { status: "rejected", rawText: "Tidak Lolos / Ditolak" };
    }
    if (/diterima|offering|penawaran/i.test(snippet)) {
      return { status: "offered", rawText: "Diterima / Penawaran" };
    }
    if (/menunggu|jawaban|terkirim|diproses|seleksi/i.test(snippet)) {
      return { status: "pending", rawText: "Menunggu Jawaban" };
    }
  }

  // Fallback: check whole page if marker not found directly
  if (/jadwal\s+wawancara|undangan\s+interview/i.test(lower)) {
    return { status: "interview", rawText: "Panggilan Wawancara / Interview" };
  }

  return null;
}

// Main background checker
async function checkAllPendingApplications() {
  if (isChecking) {
    return { success: false, message: "Pemeriksaan sedang berlangsung..." };
  }

  isChecking = true;
  const apiUrl = await getApiUrl();
  let updatedCount = 0;
  let totalChecked = 0;

  try {
    // 1. Fetch active applications from JobTracer Dashboard
    const res = await fetch(`${apiUrl}/api/applications`);
    if (!res.ok) {
      isChecking = false;
      return { success: false, message: "Dashboard lokal tidak dapat dihubungi." };
    }

    const data = await res.json();
    const apps = data.applications || [];

    // Filter applications needing check (pending or interview, with KarirHub URL)
    const targets = apps.filter((app) => 
      (app.status === "pending" || app.status === "interview") &&
      app.job_url &&
      app.job_url.includes("karirhub.kemnaker.go.id")
    );

    totalChecked = targets.length;
    console.log(`[JobTracer Background] Mengecek ${totalChecked} lowongan di KarirHub...`);

    // 2. Check each target silently via background fetch with user's session cookies
    for (const app of targets) {
      try {
        // Polite delay between requests
        await new Promise((r) => setTimeout(r, 1200));

        const pageRes = await fetch(app.job_url, {
          method: "GET",
          credentials: "include",
          headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
          }
        });

        if (!pageRes.ok) continue;

        const html = await pageRes.text();
        const detected = parseKarirHubStatus(html);

        if (detected && detected.status !== app.status) {
          // Status has changed! Update Next.js DB
          const updateRes = await fetch(`${apiUrl}/api/applications/${app.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: detected.status,
              notes: (app.notes ? app.notes + "\n" : "") +
                `[Auto-Sync ${new Date().toLocaleDateString("id-ID")} ${new Date().toLocaleTimeString("id-ID")}]: Status di KarirHub diperbarui ke '${detected.rawText}' secara otomatis.`
            })
          });

          if (updateRes.ok) {
            updatedCount++;

            // Trigger Desktop Notification
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icon.png",
              title: `⚡ JobTracer: Status Terupdate (${detected.rawText})`,
              message: `${app.job_title} di ${app.company_name} kini berstatus: ${detected.rawText}!`,
              priority: 2
            });
          }
        }
      } catch (err) {
        console.warn(`[JobTracer Background] Gagal memeriksa ${app.job_title}:`, err);
      }
    }

    // Save timestamp of last check
    chrome.storage.local.set({
      jobtracer_last_check: Date.now(),
      jobtracer_last_summary: {
        totalChecked,
        updatedCount,
        timestamp: new Date().toISOString()
      }
    });

    isChecking = false;
    return {
      success: true,
      totalChecked,
      updatedCount,
      message: `Pemeriksaan selesai. ${totalChecked} lowongan dicek, ${updatedCount} status diperbarui.`
    };
  } catch (err) {
    isChecking = false;
    console.error("[JobTracer Background] Error during check:", err);
    return { success: false, error: err.message };
  }
}

// Listen for on-demand requests from popup or dashboard-bridge
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "CHECK_NOW") {
    checkAllPendingApplications().then((result) => {
      sendResponse(result);
    });
    return true; // Asynchronous response
  }

  if (request.type === "GET_STATUS") {
    chrome.storage.local.get(["jobtracer_last_check", "jobtracer_last_summary"], (data) => {
      sendResponse({
        isChecking,
        lastCheck: data.jobtracer_last_check || null,
        lastSummary: data.jobtracer_last_summary || null
      });
    });
    return true;
  }
});
