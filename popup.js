const acixDiv = document.getElementById("acix");
const restoreBtn = document.getElementById("restore-login");
const logoutBtn = document.getElementById("logout-login");

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
  // 恢復登入
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.update(tab.id, { url: chrome.runtime.getURL("pages/template.html") });
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
