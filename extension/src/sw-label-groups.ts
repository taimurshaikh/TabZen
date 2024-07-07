import { TabData } from "./types";

const renameTabGroup = async (groupId: number): Promise<void> => {
  const groupIdToTabData: { [key: number]: TabData[] } = {};

  // Get all the chrome tabs
  const tabs = await chrome.tabs.query({});

  // Group the tabs by their group id
  tabs.forEach((tab) => {
    if (tab.groupId) {
      if (!groupIdToTabData[tab.groupId]) {
        groupIdToTabData[tab.groupId] = [];
      }
      groupIdToTabData[tab.groupId].push({
        tab_id: tab.id ?? 0,
        url: tab.url ?? "",
        title: tab.title ?? "",
      });
    }
  });

  const response = await fetch("http://localhost:80/label-groups", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(groupIdToTabData),
  });

  const groupIdToLabel: Response = await response.json();

  for (const [groupId, label] of Object.entries(groupIdToLabel)) {
    await chrome.tabGroups.update(parseInt(groupId), { title: label });
  }
};

async function labelGroups(): Promise<void> {
  // Get all the chrome groups
  const allGroups = await chrome.tabGroups.query({});
  const groupIds = allGroups.map((group) => group.id);

  // Rename all groups
  await Promise.all(groupIds.map(renameTabGroup));

  // Create a map of group IDs to the new group names
  const groupLabels: { [key: number]: string } = {};
  groupIds.forEach(async (groupId) => {
    const group = await chrome.tabGroups.get(groupId);
    groupLabels[groupId] = group.title ?? "";
  });

  // Store the group labels in chrome.storage
  await chrome.storage.local.set({ groupLabels: groupLabels });

  console.log("All tab groups renamed and stored in chrome.storage");
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "labelGroups") {
    labelGroups();
  }
});
