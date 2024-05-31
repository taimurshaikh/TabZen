interface TabData {
  tab_id: number;
  url: string;
  title: string;
}

let isProcessing = false;

interface TabData {
  tab_id: number;
  url: string;
  title: string;
}

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
    const updateResponse = await fetch("http://localhost:80/update-tabs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([]), // Send an empty array if no tabs are provided
    });
  } catch (error) {
    console.error("Error updating groups after tab removal:", error);
  }
});
