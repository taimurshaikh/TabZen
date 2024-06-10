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
    <div className="bg-gray-100 items-center p-4 w-[400px]">
      <h1 className="text-2xl font-bold mb-4 whitespace-nowrap overflow-hidden overflow-ellipsis">
        TabZen<span>🧘🏽</span>
      </h1>

      <button
        className="relative px-4 py-2 rounded overflow-hidden border border-blue-400 bg-white text-blue-400 shadow-2xl transition-all before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:duration-500 after:absolute after:right-0 after:top-0 after:h-full after:w-0 after:duration-500 hover:text-white hover:shadow-blue-400 hover:before:w-2/4 hover:before:bg-gradient-to-r from-blue-500 to-blue-700 hover:after:w-2/4 hover:after:bg-blue-700"
        onClick={handleGroupTabs}
      >
        <span className="relative z-10">Group</span>
      </button>
      {Object.keys(groupedTabs).length > 0 && (
        <div className="mt-6 w-full">
          <h2 className="text-xl font-semibold mb-4">Grouped Tabs</h2>
          {Object.entries(groupedTabs).map(([group, titles], index) => (
            <div key={index} className="mb-4 p-4 bg-white rounded shadow">
              <h3 className="text-lg font-medium">Group {group}</h3>
              <ul className="list-disc list-inside">
                {titles.map((title, idx) => (
                  <li
                    key={idx}
                    className="ml-4 whitespace-nowrap overflow-hidden overflow-ellipsis"
                  >
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
