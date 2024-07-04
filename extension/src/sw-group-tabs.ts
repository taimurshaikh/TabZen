import { TabData } from "./types";

let isProcessing = false;

/**
 * Fetches tab data and updates tab groups on the server.
 * If a tabId is provided, only data for that tab is fetched and sent.
 * Otherwise, data for all tabs is fetched and sent.
 *
 * @param {number} [tabId] - Optional ID of a specific tab to update.
 */
async function fetchAndUpdateTabs(tabId?: number): Promise<void> {
  if (isProcessing) {
    return;
  }
  isProcessing = true;

  try {
    let response: Response;
    let tabDataList: TabData[];
    if (tabId) {
      const tab = await chrome.tabs.get(tabId);
      tabDataList = [
        {
          tab_id: tabId,
          url: tab.url ?? "",
          title: tab.title ?? "",
        },
      ];
    } else {
      const tabs = await chrome.tabs.query({});
      tabDataList = tabs.map((tab) => ({
        tab_id: tab.id ?? 0,
        url: tab.url ?? "",
        title: tab.title ?? "",
      }));
    }

    response = await fetch("http://localhost:80/update-tabs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tabDataList),
    });

    const resultingGroups: Map<number, TabData[]> = (await response.json())
      .groups;

    // Store the group information using Chrome storage
    chrome.storage.local.set({ groupedTabs: resultingGroups });
  } catch (error) {
    console.error("Error fetching and updating tabs:", error);
  } finally {
    isProcessing = false;
  }
}

/**
 * Groups tabs in the browser based on stored group information.
 */
async function groupTabsInBrowser(): Promise<void> {
  try {
    const result = await chrome.storage.local.get("groupedTabs");
    const groupedTabs: { [key: number]: TabData[] } = result.groupedTabs;
    if (!result.groupedTabs) return;

    for (const [groupNum, tabDataList] of Object.entries(groupedTabs)) {
      const tabIds = tabDataList.map((tabData) => tabData.tab_id);
      await chrome.tabs.group({ tabIds: tabIds });
    }
  } catch (error) {
    console.error("Error grouping tabs in browser:", error);
  }
}

// Listener for messages from the frontend to trigger tab grouping
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "groupTabs") {
    groupTabsInBrowser();
  }
  sendResponse({ status: "received" });
});

// Listener for newly created tabs
chrome.tabs.onCreated.addListener((tab) => {
  fetchAndUpdateTabs(tab.id);
});

// Listener for tab replacements
chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  fetchAndUpdateTabs(addedTabId);
});

// Initial tab grouping on extension installation
chrome.runtime.onInstalled.addListener(() => {
  fetchAndUpdateTabs();
});

// Listener for tab updates (e.g., URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    fetchAndUpdateTabs(tabId);
  }
});

// Listener for tab removals to update groups on the server
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  try {
    await fetch("http://localhost:80/delete-tab", {
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
