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

// 監聽 Tab 更新
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
