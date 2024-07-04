import React, { useState, useEffect } from "react";
import "./tailwind.css";
import { TabData } from "./types";

const App: React.FC = () => {
  const [groupedTabs, setGroupedTabs] = useState<Map<number, TabData[]>>(
    new Map<number, TabData[]>()
  );

  const handleGroupTabs = async () => {
    try {
      // Send message to the background script to group tabs
      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "groupTabs" }, (response) => {
          resolve();
        });
      });

      // Retrieve pre-calculated groups from Chrome storage
      const result = await new Promise<{ [key: string]: any }>(
        (resolve, reject) => {
          chrome.storage.local.get("groupedTabs", (result) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(result);
            }
          });
        }
      );

      const groups = result.groupedTabs as { [key: number]: TabData[] };

      if (groups) {
        console.log("Grouped tabs from storage:", groups); // Log the grouped tabs
        setGroupedTabs(
          new Map(Object.entries(groups).map(([k, v]) => [parseInt(k, 10), v]))
        );
      }
    } catch (error) {
      console.error("Error grouping tabs:", error);
    }
  };

  useEffect(() => {
    console.log("Grouped tabs state updated:", groupedTabs); // Log the grouped tabs when state updates
  }, [groupedTabs]);

  return (
    <div className="bg-gray-100 p-4 w-[300px] h-[500px] flex flex-col">
      <header className="flex flex-col items-start mb-2">
        <img src="vector/default.svg" alt="Logo" className="-m-6" />
      </header>
      <p className="text-gray-600 mb-2 text-sm">
        TabZen is the world's smartest tab manager. Group your workspace with
        just <span className="font-bold text-slate-950">one click</span>.
      </p>
      <div className="flex-shrink-0 mb-2">
        <button
          className="w-full px-8 py-2 rounded overflow-hidden border border-[#4E1A70] bg-white text-[#4E1A70] shadow-2xl
          relative transition-all duration-500 ease-in-out hover:text-white group"
          onClick={handleGroupTabs}
        >
          <span className="relative z-10 text-base">Group</span>
          <div className="absolute inset-0 h-full w-full scale-0 rounded transition-all duration-300 group-hover:scale-100">
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-[#4E1A70] to-[#2B4CF2]"></div>
          </div>
        </button>
      </div>
      {groupedTabs.size > 0 ? (
        <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-md">
          {Array.from(groupedTabs).map(([groupNum, tabDataList]) => (
            <div
              key={groupNum}
              className="p-4 border-b border-gray-200 last:border-b-0"
            >
              <h2 className="font-bold text-lg text-[#4E1A70] mb-2">
                Group {groupNum}
              </h2>
              <div className="space-y-2">
                {tabDataList.map((tabData) => (
                  <div
                    key={tabData.tab_id}
                    className="bg-gray-50 rounded-md p-2 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <p
                      className="text-sm text-gray-800 truncate"
                      title={tabData.title}
                    >
                      {tabData.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-grow"></div>
      )}
    </div>
  );
};

export default App;
