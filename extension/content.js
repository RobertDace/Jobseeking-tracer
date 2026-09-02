// KarirHub Auto Tracer - Content Script
(function () {
  "use strict";

  const DEFAULT_API_URL = "http://localhost:3000";
  let serverApiUrl = DEFAULT_API_URL;

  // Anti-duplicate submission tracker
  let lastRecordedUrl = "";
  let lastRecordedTime = 0;
  const DEBOUNCE_WINDOW_MS = 8000; // 8 seconds debounce for same URL

  // Retrieve configured API URL from Chrome storage
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["jobtracer_api_url"], (res) => {
      if (res && res.jobtracer_api_url) {
        serverApiUrl = res.jobtracer_api_url.replace(/\/+$/, "");
      }
    });
  }

  // --- MINIMALIST IN-PAGE TOAST SYSTEM ---
  function showToast(title, subtitle, type = "success") {
    let container = document.getElementById("jobtracer-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "jobtracer-toast-container";
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    const isError = type === "error";
    toast.style.cssText = `
      background: #FFFFFF;
      color: #111111;
      border: 1px solid ${isError ? "#FDEBEC" : "#EAEAEA"};
      border-left: 4px solid ${isError ? "#9F2F2D" : "#346538"};
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      border-radius: 6px;
      padding: 12px 16px;
      min-width: 280px;
      max-width: 400px;
      pointer-events: auto;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      transform: translateY(12px);
      opacity: 0;
    `;

    toast.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
        <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${isError ? "#9F2F2D" : "#346538"};">
          JobTracer ${isError ? "Peringatan" : "Terekam Otomatis"}
        </span>
        <span style="font-size: 10px; color: #787774; font-family: monospace;">${new Date().toLocaleTimeString()}</span>
      </div>
      <div style="font-size: 13px; font-weight: 600; color: #111111; margin-bottom: 2px; line-height: 1.3;">${title}</div>
      ${subtitle ? `<div style="font-size: 12px; color: #787774;">${subtitle}</div>` : ""}
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = "translateY(0)";
      toast.style.opacity = "1";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // --- FLOATING TRACER STATUS PILL ---
  function injectTracerBadge() {
    let badge = document.getElementById("jobtracer-floating-badge");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "jobtracer-floating-badge";
      badge.style.cssText = `
        position: fixed;
        bottom: 16px;
        left: 16px;
        z-index: 999990;
        background: #FFFFFF;
        border: 1px solid #EAEAEA;
        border-radius: 9999px;
        padding: 6px 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        color: #111111;
        box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        cursor: pointer;
        user-select: none;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      `;

      badge.innerHTML = `
        <span id="jobtracer-badge-dot" style="width: 7px; height: 7px; border-radius: 50%; background: #346538; display: inline-block;"></span>
        <span id="jobtracer-badge-text" style="font-weight: 500;">JobTracer Aktif</span>
      `;

      badge.addEventListener("mouseenter", () => {
        badge.style.transform = "scale(1.02)";
        badge.style.boxShadow = "0 4px 14px rgba(0,0,0,0.08)";
      });
      badge.addEventListener("mouseleave", () => {
        badge.style.transform = "scale(1)";
        badge.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)";
      });

      badge.addEventListener("click", () => {
        window.open(serverApiUrl, "_blank");
      });

      document.body.appendChild(badge);
    }
  }

  // Update badge text dynamically based on page detection
  function updateBadgeStatus(statusText, isRecorded = true) {
    const textEl = document.getElementById("jobtracer-badge-text");
    const dotEl = document.getElementById("jobtracer-badge-dot");
    const badge = document.getElementById("jobtracer-floating-badge");

    if (textEl && dotEl && badge) {
      if (isRecorded) {
        textEl.textContent = `✓ Terdata di Dashboard (${statusText})`;
        dotEl.style.background = "#956400";
        badge.style.borderColor = "#F3E7C4";
        badge.style.background = "#FBF3DB";
        badge.style.color = "#956400";
      } else {
        textEl.textContent = "JobTracer Aktif";
        dotEl.style.background = "#346538";
        badge.style.borderColor = "#EAEAEA";
        badge.style.background = "#FFFFFF";
        badge.style.color = "#111111";
      }
    }
  }

  // --- DETECT IF CURRENT PAGE HAS ALREADY APPLIED STATUS ---
  function detectAlreadyAppliedStatus() {
    // Look for element or card containing "Status Lamaran"
    const allDivs = Array.from(document.querySelectorAll("div, p, span, h1, h2, h3, h4, h5"));
    const statusHeader = allDivs.find(el => {
      const t = el.innerText?.trim().toLowerCase();
      return t === "status lamaran" || t === "status pendaftaran";
    });

    if (!statusHeader) return null;

    const card = statusHeader.closest("div[class*='card'], div[class*='box'], div[class*='border'], div[class*='shadow'], div");
    if (!card) return null;

    // Extract text lines inside this status card
    const cardLines = (card.innerText || "").split("\n").map(s => s.trim()).filter(Boolean);
    const textWithoutHeader = cardLines.filter(l => 
      !/status\s+lamaran/i.test(l) && !/lihat\s+detil/i.test(l) && !/lihat\s+detail/i.test(l)
    );

    const statusCandidate = textWithoutHeader[0] || card.innerText || "";
    const lower = statusCandidate.toLowerCase();

    let mappedStatus = "pending";
    if (/wawancara|interview|psikotes|tahap|tes/i.test(lower)) {
      mappedStatus = "interview";
    } else if (/tidak lolos|ditolak|gagal|tidak memenuhi/i.test(lower)) {
      mappedStatus = "rejected";
    } else if (/diterima|offering|penawaran/i.test(lower)) {
      mappedStatus = "offered";
    } else if (/menunggu|jawaban|terkirim|diproses|seleksi|administrasi/i.test(lower)) {
      mappedStatus = "pending";
    }

    return {
      status: mappedStatus,
      rawText: statusCandidate || "Menunggu Jawaban"
    };
  }

  // --- ACCURATE DOM EXTRACTION FOR KARIRHUB KEMNAKER ---
  function extractJobDetails() {
    let jobTitle = "";
    let companyName = "";
    let location = "Indonesia";
    let salaryRange = "";

    // 1. Job Title extraction (Exclude confirmation modal headers)
    const titleCandidates = Array.from(document.querySelectorAll("h1, [class*='job-title'], [class*='vacancy-title'], [class*='detail-title']"));
    for (const el of titleCandidates) {
      const text = el.innerText?.trim();
      if (text && text.length > 2 && !/konfirmasi|melamar/i.test(text)) {
        jobTitle = text;
        break;
      }
    }
    if (!jobTitle) {
      jobTitle = document.title.split("-")[0].replace(/karirhub|kemnaker/gi, "").trim();
    }

    // 2. Company Name extraction (Calibrated for KarirHub Kemnaker)
    // Strategy A: Find the Employer Card (has "Lihat Profil Perusahaan" or "Profil Perusahaan")
    const allLinks = Array.from(document.querySelectorAll("a, button, span, p"));
    const profileLink = allLinks.find(el => /profil\s+perusahaan/i.test(el.innerText || ""));

    if (profileLink) {
      let parent = profileLink.parentElement;
      for (let i = 0; i < 5; i++) {
        if (!parent) break;
        const headings = parent.querySelectorAll("h1, h2, h3, h4, h5, strong, [class*='title'], [class*='name'], p");
        for (const h of headings) {
          const txt = h.innerText?.trim();
          if (
            txt &&
            txt.length > 2 &&
            !/profil\s+perusahaan/i.test(txt) &&
            !/status\s+lamaran/i.test(txt) &&
            !/lihat/i.test(txt) &&
            !/konfirmasi/i.test(txt) &&
            txt !== jobTitle
          ) {
            companyName = txt;
            break;
          }
        }
        if (companyName) break;
        parent = parent.parentElement;
      }
    }

    // Strategy B: Corporate entity name matching (PT / CV / Persero / Perum)
    if (!companyName) {
      const corporateElements = Array.from(document.querySelectorAll("h2, h3, h4, strong, [class*='employer'], [class*='company']"));
      const strictCorporateRegex = /\b(?:PT\.?|CV\.?|Perum|Perseroan?|Yayasan)\s+([A-Z][A-Za-z0-9\s&.,-]{2,50})\b/;

      for (const el of corporateElements) {
        const txt = el.innerText?.trim();
        if (txt && !/konfirmasi|melamar/i.test(txt)) {
          const match = txt.match(strictCorporateRegex);
          if (match) {
            companyName = match[0].trim();
            break;
          }
        }
      }
    }

    // Strategy C: Check right sidebar container
    if (!companyName) {
      const sidebarCards = Array.from(document.querySelectorAll("aside [class*='card'], [class*='col'] [class*='card'], [class*='border']"));
      for (const card of sidebarCards) {
        const text = card.innerText?.trim() || "";
        if (text.includes("PT.") || text.includes("PT ") || text.includes("CV.")) {
          const lines = text.split("\n").map(s => s.trim()).filter(Boolean);
          const compLine = lines.find(l => /^(?:PT\.?|CV\.?)\s+[A-Z]/i.test(l));
          if (compLine) {
            companyName = compLine;
            break;
          }
        }
      }
    }

    // Sanitize company name
    if (companyName) {
      companyName = companyName.replace(/^konfirmasi\s+melamar\s+lowongan:?\s*/i, "").trim();
      if (/^pt\s+to\s+/i.test(companyName) || companyName.length > 70) {
        companyName = "";
      }
    }

    if (!companyName) {
      companyName = "Perusahaan KarirHub";
    }

    // 3. Location extraction (Located under H1 near location pin icon)
    const h1 = document.querySelector("h1");
    if (h1 && h1.parentElement) {
      const parentBlock = h1.parentElement;
      const elementsUnderH1 = Array.from(parentBlock.querySelectorAll("p, span, div"))
        .map(el => el.innerText?.trim())
        .filter(t => t && t.length > 3 && t !== h1.innerText.trim());

      const locCandidate = elementsUnderH1.find(t => 
        /\b(?:kota|kab|kabupaten|provinsi|dki|daerah|jakarta|bandung|surabaya|semarang|medan|bali|yogyakarta|mampang|kuningan|pancoran)\b/i.test(t) ||
        (t.includes(",") && !t.includes(":") && !/diposting|batas/i.test(t))
      );

      if (locCandidate) {
        location = locCandidate;
      }
    }

    // 4. Salary Range extraction (Look for label "Rentang gaji")
    const allLabels = Array.from(document.querySelectorAll("div, p, span, dt, label"));
    const salaryLabel = allLabels.find(el => {
      const txt = el.innerText?.trim().toLowerCase();
      return txt === "rentang gaji" || txt === "gaji" || txt === "estimasi gaji";
    });

    if (salaryLabel) {
      const sibling = salaryLabel.nextElementSibling;
      if (sibling && sibling.innerText?.trim()) {
        salaryRange = sibling.innerText.trim();
      } else if (salaryLabel.parentElement) {
        const lines = salaryLabel.parentElement.innerText.split("\n").map(s => s.trim()).filter(Boolean);
        const idx = lines.findIndex(l => /rentang\s+gaji/i.test(l));
        if (idx !== -1 && lines[idx + 1]) {
          salaryRange = lines[idx + 1];
        }
      }
    }

    // Fallback search for Rp / IDR or "Dirahasiakan"
    if (!salaryRange) {
      const rpMatch = document.body.innerText.match(/Rp\s*[\d.,]+\s*-\s*(?:Rp\s*)?[\d.,]+/i);
      if (rpMatch) {
        salaryRange = rpMatch[0].trim();
      } else if (/rentang\s+gaji\s*[:\n]?\s*dirahasiakan/i.test(document.body.innerText)) {
        salaryRange = "Dirahasiakan";
      }
    }

    return {
      company_name: companyName,
      job_title: jobTitle,
      location: location,
      salary_range: salaryRange || "Dirahasiakan",
      job_url: window.location.href,
      source: "karirhub",
      status: "pending"
    };
  }

  // --- SEND APPLICATION TO NEXT.JS API (With Anti-Duplicate Protection) ---
  async function recordApplication(details, isAutoSyncOnLoad = false) {
    const currentUrl = details.job_url.split("?")[0].replace(/\/+$/, "");
    const now = Date.now();

    // Prevent duplicate firing within 8s debounce window
    if (currentUrl === lastRecordedUrl && (now - lastRecordedTime) < DEBOUNCE_WINDOW_MS) {
      console.log("[JobTracer] Duplicate click ignored within debounce window:", currentUrl);
      return;
    }

    lastRecordedUrl = currentUrl;
    lastRecordedTime = now;

    try {
      const response = await fetch(`${serverApiUrl}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(details)
      });

      if (response.ok) {
        const statusLabel = details.status === "interview" ? "Interview" : details.status === "rejected" ? "Ditolak" : "Menunggu Jawaban";
        showToast(
          isAutoSyncOnLoad ? `Terekam Otomatis (${statusLabel})` : details.job_title,
          `${details.job_title} · ${details.company_name}`
        );
      }
    } catch (err) {
      console.warn("[JobTracer] Gagal terhubung ke Tracer API:", err);
    }
  }

  // --- ACTIVE AUTO-WATCHER (Continuously inspects page on load until Status Lamaran card appears) ---
  function startActiveStatusWatcher() {
    let attempts = 0;
    const maxAttempts = 18; // check every 350ms for ~6.5 seconds to handle slow government servers

    const interval = setInterval(() => {
      attempts++;

      const isVacancyPage = window.location.href.includes("/lowongan") || 
                            window.location.href.includes("/vacancies") ||
                            document.querySelector("h1");

      if (!isVacancyPage && attempts > 6) {
        clearInterval(interval);
        return;
      }

      const appliedInfo = detectAlreadyAppliedStatus();
      if (appliedInfo) {
        clearInterval(interval);
        const currentCleanUrl = window.location.href.split("?")[0].replace(/\/+$/, "");
        const sessionKey = "jobtracer_synced_" + currentCleanUrl;

        // Update the floating badge in bottom-left corner with real-time feedback
        updateBadgeStatus(appliedInfo.rawText || "Menunggu Jawaban", true);

        if (!sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, "true");
          const details = extractJobDetails();
          details.status = appliedInfo.status;
          details.notes = `Status dari KarirHub: ${appliedInfo.rawText}`;
          recordApplication(details, true);
        }
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 350);
  }

  // --- DETECT CLICK ON "LAMAR" BUTTONS ---
  function isLamarButton(el) {
    if (!el) return false;
    const text = (el.innerText || el.textContent || el.value || "").toLowerCase().trim();
    const isClickable = el.tagName === "BUTTON" || el.tagName === "A" || el.getAttribute("role") === "button" || el.classList.contains("btn");

    if (!isClickable && !el.closest("button, a, .btn")) return false;

    const keywords = [
      "lamar sekarang",
      "lamar lowongan",
      "lamar pekerjaan",
      "kirim lamaran",
      "daftar lowongan",
      "kirim pendaftaran",
      "ya, kirim",
      "ya, lamar",
      "daftar pekerjaan",
      "ajukan lamaran"
    ];

    return keywords.some((kw) => text.includes(kw));
  }

  document.addEventListener("click", (e) => {
    let target = e.target;
    let foundButton = null;

    if (isLamarButton(target)) {
      foundButton = target;
    } else {
      const parentBtn = target.closest("button, a, .btn");
      if (parentBtn && isLamarButton(parentBtn)) {
        foundButton = parentBtn;
      }
    }

    if (foundButton) {
      console.log("[JobTracer] Tombol lamar terdeteksi diklik:", foundButton);
      setTimeout(() => {
        const details = extractJobDetails();
        recordApplication(details, false);
      }, 300);
    }
  }, true);

  // --- INITIALIZATION ---
  function runPageChecks() {
    injectTracerBadge();
    startActiveStatusWatcher();
  }

  function init() {
    runPageChecks();

    // Listen for SPA route changes on KarirHub / SIAPkerja
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        runPageChecks();
      }
    }).observe(document, { subtree: true, childList: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
