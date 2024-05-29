// Function to fetch tab data and calculate groups
async function fetchAndGroupTabs() {
  try {
    let tabs = await chrome.tabs.query({});
    let tabData = tabs.map((tab) => ({
      url: tab.url ?? "",
      title: tab.title,
    }));

    // Send tab data to the backend to calculate groups
    const response = await fetch("http://localhost:80/group-tabs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tabData),
    });

    const result = await response.json();

    // Store the group information using Chrome storage
    chrome.storage.local.set({ groupedTabs: result.groups }, () => {
      console.log("Tab groups pre-calculated and stored.");
    });
  } catch (error) {
    console.error("Error fetching and grouping tabs:", error);
  }
}

// Listener for tab updates (URL change)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    fetchAndGroupTabs();
  }
});

// Listener for new tabs
chrome.tabs.onCreated.addListener((tab) => {
  fetchAndGroupTabs();
});

// Initial grouping on extension installation
chrome.runtime.onInstalled.addListener(() => {
  fetchAndGroupTabs();
});
