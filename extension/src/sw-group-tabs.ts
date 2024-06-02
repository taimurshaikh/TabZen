interface TabData {
  tab_id: number;
  url: string;
  title: string;
}

let isProcessing = false;

// Function to fetch tab data and update groups
async function fetchAndUpdateTabs(tabId?: number): Promise<void> {
  if (isProcessing) {
    return;
  }
  isProcessing = true;
  try {
    let response: Response;
    if (tabId) {
      const tab = await chrome.tabs.get(tabId);
      const tabData: TabData[] = [
        {
          tab_id: tabId,
          url: tab.url ?? "",
          title: tab.title ?? "",
        },
      ];
      response = await fetch("http://localhost:80/update-tabs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tabData), // Send as an array
      });
    } else {
      const tabs = await chrome.tabs.query({});
      const tabDataList: TabData[] = tabs.map((tab) => ({
        tab_id: tab.id ?? 0,
        url: tab.url ?? "",
        title: tab.title ?? "",
      }));
      response = await fetch("http://localhost:80/update-tabs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tabDataList),
      });
    }

    const result = await response.json();

    // Store the group information using Chrome storage
    chrome.storage.local.set({ groupedTabs: result.groups }, () => {
      console.log("Tab groups pre-calculated and stored.");
    });
  } catch (error) {
    console.error("Error fetching and updating tabs:", error);
  } finally {
    isProcessing = false;
  }
}

// Function to group tabs in the browser
async function groupTabsInBrowser(): Promise<void> {
  try {
    const result = await chrome.storage.local.get("groupedTabs");
    const groupedTabs: { [key: number]: TabData[] } = result.groupedTabs;
    if (!groupedTabs) return;

    for (const [groupId, tabDataList] of Object.entries(groupedTabs)) {
      const tabIds = tabDataList.map((tabData) => tabData.tab_id);
      await chrome.tabs.group({ tabIds: tabIds });
    }
  } catch (error) {
    console.error("Error grouping tabs in browser:", error);
  }
}

// Listener for messages from the frontend
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "groupTabs") {
    groupTabsInBrowser();
  }
  sendResponse({ status: "received" });
});

// Listener for new tabs
chrome.tabs.onCreated.addListener((tab) => {
  fetchAndUpdateTabs(tab.id);
});

chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  fetchAndUpdateTabs(addedTabId);
});

// Initial grouping on extension installation
chrome.runtime.onInstalled.addListener(() => {
  fetchAndUpdateTabs();
});

// Listener for tab updates (URL change)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    fetchAndUpdateTabs(tabId);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  try {
    const response = await fetch("http://localhost:80/delete-tab", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tab_id: tabId }),
    });

    // Fetch the latest groups after removal
    await fetchAndUpdateTabs();
  } catch (error) {
    console.error("Error updating groups after tab removal:", error);
  }
});
