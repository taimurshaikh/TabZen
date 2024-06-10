import React, { useState } from "react";
import "./tailwind.css";

const App: React.FC = () => {
  const [groupedTabs, setGroupedTabs] = useState<{ [key: string]: string[] }>(
    {}
  );

  const handleGroupTabs = async () => {
    try {
      // Send message to the background script to group tabs
      chrome.runtime.sendMessage({ action: "groupTabs" }, (response) => {
        console.log("Group tabs message sent, response:", response);

        // Retrieve pre-calculated groups from Chrome storage
        chrome.storage.local.get("groupedTabs", (result) => {
          const groups: { [key: number]: string } = result.groupedTabs;

          if (groups) {
            // Group tabs according to the pre-calculated groups
            chrome.tabs.query({}, (tabs) => {
              const grouped = tabs.reduce((acc, tab) => {
                if (tab.id !== undefined) {
                  const group = groups[tab.id];
                  if (group !== undefined) {
                    if (!acc[group]) acc[group] = [];
                    if (tab.title) acc[group].push(tab.title);
                  }
                }
                return acc;
              }, {} as { [key: string]: string[] });

              setGroupedTabs(grouped);
            });
          }
        });
      });
    } catch (error) {
      console.error("Error grouping tabs:", error);
    }
  };

  return (
    <div className="bg-gray-100 items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Tab Grouper</h1>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
        onClick={handleGroupTabs}
      >
        Group Tabs
      </button>
      {Object.keys(groupedTabs).length > 0 && (
        <div className="mt-6 w-full">
          <h2 className="text-xl font-semibold mb-4">Grouped Tabs</h2>
          {Object.entries(groupedTabs).map(([group, titles], index) => (
            <div key={index} className="mb-4 p-4 bg-white rounded shadow">
              <h3 className="text-lg font-medium">Group {group}</h3>
              <ul className="list-disc list-inside">
                {titles.map((title, idx) => (
                  <li key={idx} className="ml-4">
                    {title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
