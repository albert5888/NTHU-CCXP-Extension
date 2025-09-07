document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("back-btn");
  const useNewTab = document.getElementById("use-newtab");
  const autoKeepAlive = document.getElementById("auto-keepalive");
  const status = document.getElementById("status");

  // 載入設定
  chrome.storage.sync.get(["useNewTab", "autoKeepAlive"], (result) => {
    useNewTab.checked = !!result.useNewTab;
    autoKeepAlive.checked = !!result.autoKeepAlive;
  });

  // 儲存事件 (useNewTab)
  useNewTab.addEventListener("change", () => {
    chrome.storage.sync.set({ useNewTab: useNewTab.checked }, showSaved);
  });

  // 儲存事件 (autoKeepAlive)
  autoKeepAlive.addEventListener("change", () => {
    chrome.storage.sync.set({ autoKeepAlive: autoKeepAlive.checked }, showSaved);
  });

  // 返回按鈕
  backBtn.addEventListener("click", () => {
    window.location.href = "popup.html";
  });

  function showSaved() {
    status.textContent = "已儲存設定 ✔";
    status.style.color = "green";
    setTimeout(() => (status.textContent = ""), 1500);
  }
});
