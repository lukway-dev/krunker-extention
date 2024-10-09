// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log(message)
//   console.log(sender)
//   if (message.action === "enablePopup") {
//     chrome.action.setPopup({ tabId: sender.tab.id, popup: "popup.html" });
//   } else if (message.action === "disablePopup") {
//     chrome.action.setPopup({ tabId: sender.tab.id, popup: "" });
//   }
// });