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
    <div className="bg-gray-100 items-center p-4 w-[200px]">
      <h1 className="text-3xl font-bold mb-4 whitespace-nowrap overflow-hidden overflow-ellipsis">
        TabZen <span>🧘🏽</span>
      </h1>
      <p className="text-gray-600 mb-4 text-base">
        The world's <span className="font-bold text-slate-950">smartest</span>{" "}
        tab manager. Group your workspace with just one click.
      </p>
      <button
        className="relative px-8 py-2 rounded overflow-hidden border border-purple-500 bg-white text-purple-500 shadow-2xl 
        transition-all before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:duration-500 after:absolute 
        after:right-0 after:top-0 after:h-full after:w-0 after:duration-500 hover:text-white hover:shadow-purple-500 
        hover:before:w-2/4 hover:before:bg-gradient-to-r from-purple-500 to-purple-700 hover:after:w-2/4 hover:after:bg-purple-700"
        onClick={handleGroupTabs}
      >
        <span className="relative z-10 text-base">Group</span>
      </button>
    </div>
  );
};

export default App;
