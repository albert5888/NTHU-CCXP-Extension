chrome.storage.local.get("ACIXSTORE", (data) => {
  const acix = data.ACIXSTORE || "";

  if (!acix) {
    alert("暫無登入資訊，請重新登入");
    window.location.href = "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/";
    return;
  }

  // 驗證 ACIXSTORE
  const verifyUrl = `https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/4/4.19/JH4j002.php?ACIXSTORE=${acix}`;

  fetch(verifyUrl)
    .then(response => response.text())
    .then(text => {
        // document.register.email.value 是登入成功頁面的元素
        if (!text.includes("document.register.email.value")) {
            // ACIXSTORE 無效
            alert("暫存的登入資訊已失效，請重新登入");
            chrome.storage.local.remove("ACIXSTORE", () => {
            window.location.href = "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/";
            });
        } else {
            // ACIXSTORE 有效，載入 iframe
            console.log("[NTHU 校務系統優化] 成功驗證登入資訊");
            document.getElementById("top").src = `https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/top.php?ACIXSTORE=${acix}`;
            document.getElementById("left").src = `https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/IN_INQ_STU.php?ACIXSTORE=${acix}`;
            document.getElementById("right").src = `https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/xp03_m.htm?ACIXSTORE=${acix}`;
        }
    })
    .catch(err => {
      console.error("[NTHU 校務系統優化] 登入資訊驗證發生錯誤:", err);
      alert("無法驗證登入資訊，請重新登入");
      chrome.storage.local.remove("ACIXSTORE", () => {
        window.location.href = "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/";
      });
    });
});
