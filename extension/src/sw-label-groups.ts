interface TabData {
  tab_id: number;
  url: string;
  title: string;
}

function convertStringKeyMapToNumberKeyMap(
  stringKeyMap: Map<string, Object>
): Map<number, Object> {
  const numberKeyMap = new Map<number, Object>();

  stringKeyMap.forEach((value, key) => {
    const numberKey = parseInt(key, 10);

    if (!isNaN(numberKey)) {
      numberKeyMap.set(numberKey, value);
    } else {
      throw new Error(`Key "${key}" is not a valid number.`);
    }
  });

  return numberKeyMap;
}

async function createLabelsForGroups(
  groups: Map<number, TabData[]>
): Promise<Map<number, string>> {
  const groupsObject = Object.fromEntries(groups);
  console.log("Sending data to backend API:", JSON.stringify(groupsObject));

  const response = await fetch("http://localhost:80/label-groups", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(groupsObject),
  });

  const data = await response.json();

  // Convert the received object to a Map<number, string>
  const labelsMap = new Map<number, string>();
  for (const [key, value] of Object.entries(data)) {
    labelsMap.set(Number(key), value as string);
  }

  return labelsMap;
}

async function labelGroups(): Promise<Map<number, string>> {
  try {
    // Query for every tab group
    const allGroups = await chrome.tabGroups.query({});
    const groupMap = new Map<number, TabData[]>();

    for (const group of allGroups) {
      const tabs = await chrome.tabs.query({ groupId: group.id });

      const tabDataList: TabData[] = tabs.map((tab) => ({
        tab_id: tab.id ?? 0,
        url: tab.url ?? "",
        title: tab.title ?? "",
      }));

      groupMap.set(group.id, tabDataList);
    }

    // Pass the group map to the server to create labels for each group
    const labels = await createLabelsForGroups(groupMap);

    return labels;
  } catch (error) {
    console.error("Error labeling groups:", error);
    return new Map<number, string>(); // Return an empty map instead of null
  }
}

async function sendLabels(sendResponse: Function, labels: Map<number, string>) {
  sendResponse({ result: Object.fromEntries(labels) });
}

// Add a listener for the "labelGroups" message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "labelGroups") {
    labelGroups()
      .then((labels) => {
        sendResponse({ result: labels });
      })
      .catch((error) => {
        console.error("Error labeling groups:", error);
        sendResponse({ result: new Map<number, string>() });
      });

    // Return true to indicate that sendResponse will be called asynchronously
    return true;
  }
});
