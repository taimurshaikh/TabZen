console.log("Hello from content.ts");
// Send message to service worker
chrome.runtime.sendMessage({ greeting: "group" }, (response) => {
  console.log(response.farewell);
  alert("Grouping tabs...");
});
