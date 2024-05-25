console.log("Hello from sw-group-tabs.ts");

// Save default API suggestions
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    chrome.storage.local.set({
      apiSuggestions: ["tabs", "storage", "scripting"],
    });
  }
});

// Send tip to content script via messaging
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.greeting === "group") {
    //chrome.storage.local.get('tip').then(sendResponse);
    sendResponse({ farewell: "done" });
    return true;
  }
});
