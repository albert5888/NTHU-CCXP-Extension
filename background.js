// =============================
// 監聽首次登入，處理登入資訊並跳轉
// =============================

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const url = new URL(tab.url);
  if (url.pathname.endsWith("/pages/template.html")) return;

  if (url.pathname.includes("select_entry.php")) {
    const ACIXSTORE = url.searchParams.get("ACIXSTORE");
    if (ACIXSTORE) {
      chrome.storage.local.set({ ACIXSTORE });
      chrome.tabs.update(tabId, { url: chrome.runtime.getURL("pages/template.html") });
    }
  }
});

// =============================
// 監聽已登入，處理登入資訊並跳轉
// =============================

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const url = new URL(tab.url);

  // 針對 /ccxp/INQUIRE/ 跳轉 /pages/template.html
  if (url.href === "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/") {
    chrome.storage.local.get("ACIXSTORE", (data) => {
      const acix = data.ACIXSTORE;
      if (acix) {
        chrome.tabs.update(tabId, { url: chrome.runtime.getURL("pages/template.html") });
        console.log("[NTHU 校務系統優化] 發現登入資訊，跳轉至擴充介面");
      }
    });
  }
});


// =============================
// 自動保持連線 (Beta) 每 5 分鐘
// =============================

let keepAliveInterval = null;
let countdownInterval = null;

function doKeepAlive() {
  chrome.storage.sync.get(["autoKeepAlive"], (result) => {
    if (!result.autoKeepAlive) {
      console.log("[NTHU 校務系統優化] 自動保持連線 - 關閉");
      return;
    }

    chrome.storage.local.get("ACIXSTORE", (data) => {
      const acix = data.ACIXSTORE;
      if (!acix) {
        console.warn("[NTHU 校務系統優化] 自動保持連線 - 尚未登入，無法保持連線");
        return;
      }

      const url = `https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/top.php?ACIXSTORE=${acix}`;
      console.log("[NTHU 校務系統優化] 自動保持連線 - 嘗試自動保持連線");

      fetch(url, { credentials: "include" })
        .then((res) => {
          if (!res.ok) {
            console.warn("[NTHU 校務系統優化] 自動保持連線 - 失敗", res.status);
            return;
          }
          res.text().then((body) => {
            if (body.includes("www.nthu.edu.tw")) {
              console.log("[NTHU 校務系統優化] 自動保持連線 - 成功");
            } else {
              console.warn("[NTHU 校務系統優化] 自動保持連線 - 成功但內容異常，可能需要重新登入");
            }
          });
        })
        .catch((err) =>
          console.error("[NTHU 校務系統優化] 自動保持連線 - 錯誤", err)
        );
    });
  });
}

function startCountdown(duration = 5 * 60) {
  let remaining = duration;
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    remaining -= 30;
    if (remaining > 0) {
      const min = Math.floor(remaining / 60);
      const sec = remaining % 60;
      console.log(
        `[NTHU 校務系統優化] 自動保持連線 - 剩餘 ${min}分${sec.toString().padStart(2, "0")}秒 自動連線`
      );
    } else {
      clearInterval(countdownInterval);
    }
  }, 30 * 1000);
}

function startAutoKeepAlive() {
  if (keepAliveInterval) clearInterval(keepAliveInterval);

  doKeepAlive(); // 立即執行一次
  startCountdown(); // 開始倒數

  keepAliveInterval = setInterval(() => {
    doKeepAlive();
    startCountdown(); // 每次 fetch 後重置倒數
  }, 5 * 60 * 1000);

  console.log("[NTHU 校務系統優化] 自動保持連線 - 開啟");
}

// 當 chrome 啟動或擴充安裝完成時檢查開關
chrome.runtime.onStartup.addListener(startAutoKeepAlive);
chrome.runtime.onInstalled.addListener(startAutoKeepAlive);

// 監聽 storage 變化，開關 autoKeepAlive 即時啟停
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.autoKeepAlive) {
    if (changes.autoKeepAlive.newValue) {
      startAutoKeepAlive();
    } else {
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      if (countdownInterval) clearInterval(countdownInterval);
      keepAliveInterval = null;
      countdownInterval = null;
      console.log("[NTHU 校務系統優化] 自動保持連線 - 已停止");
    }
  }
});
