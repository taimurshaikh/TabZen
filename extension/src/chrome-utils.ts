// chromeUtils.ts
export type GroupedTabs = { [key: number]: string };
export type LabeledGroups = { [key: string]: string };

// Function to send a message to the background script
export const sendRuntimeMessage = (action: string): void => {
  chrome.runtime.sendMessage({ action }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
  });
};

// Function to get data from Chrome storage
export const getStorageData = (key: string): any => {
  try {
    const result = chrome.storage.local.get(key);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Function to query tabs
export const getAllTabs = async (): Promise<chrome.tabs.Tab[]> => {
  try {
    return await chrome.tabs.query({});
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Function to query tab groups
export const queryTabGroups = async (): Promise<
  chrome.tabGroups.TabGroup[]
> => {
  return new Promise((resolve, reject) => {
    chrome.tabGroups.query({}, (groups) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(groups);
    });
  });
};

// Function to update tab group titles
export const updateTabGroupTitle = async (
  groupId: number,
  title: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.tabGroups.update(groupId, { title }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
};
