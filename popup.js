const acixDiv = document.getElementById("acix");
const restoreBtn = document.getElementById("restore-login");
const logoutBtn = document.getElementById("logout-login");
const settingsBtn = document.getElementById("settings-btn");

updateACIX();

function updateACIX() {
  chrome.storage.local.get("ACIXSTORE", (data) => {
    if (data.ACIXSTORE) {
      acixDiv.textContent = "發現登入資訊";
      acixDiv.style.backgroundColor = "#28a745";
      acixDiv.style.color = "#fff";
    } else {
      acixDiv.textContent = "暫無登入資訊";
      acixDiv.style.backgroundColor = "#f8d7da";
      acixDiv.style.color = "#721c24";
    }
  });
}

restoreBtn.addEventListener("click", async () => {
  // 讀取設定
  chrome.storage.sync.get(["useNewTab"], async (result) => {
    if (result.useNewTab) {
      // 使用新分頁
      chrome.tabs.create({ url: chrome.runtime.getURL("pages/template.html") });
    } else {
      // 更新目前分頁
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.update(tab.id, { url: chrome.runtime.getURL("pages/template.html") });
    }
  });
});

logoutBtn.addEventListener("click", () => {
  chrome.storage.local.remove("ACIXSTORE", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.update(tabs[0].id, { url: "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/" });
      }
    });
    updateACIX();
  });
});

settingsBtn.addEventListener("click", () => {
  window.location.href = "setting.html"; // 切換到設定頁面
});
