// JobTracer - Dashboard Bridge Content Script
// Connects the local Next.js Web Dashboard with the Chrome Extension Background Worker.

(function () {
  "use strict";

  // Announce extension presence to the React web app
  window.__JOBTRACER_EXTENSION_INSTALLED__ = true;
  document.documentElement.setAttribute("data-jobtracer-extension", "true");
  window.dispatchEvent(new CustomEvent("jobtracer:extension-ready"));

  // Listen for trigger events from React dashboard
  window.addEventListener("jobtracer:trigger-sync", () => {
    console.log("[JobTracer Bridge] Menerima sinyal sinkronisasi dari Dashboard...");

    chrome.runtime.sendMessage({ type: "CHECK_NOW" }, (response) => {
      window.dispatchEvent(new CustomEvent("jobtracer:sync-complete", { detail: response }));
    });
  });

  // Listen for status check request from React dashboard
  window.addEventListener("jobtracer:get-status", () => {
    chrome.runtime.sendMessage({ type: "GET_STATUS" }, (response) => {
      window.dispatchEvent(new CustomEvent("jobtracer:status-response", { detail: response }));
    });
  });

  // Periodically re-announce presence in case React mounted late
  setInterval(() => {
    document.documentElement.setAttribute("data-jobtracer-extension", "true");
  }, 2000);
})();
