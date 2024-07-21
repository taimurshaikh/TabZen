import React, { useState, useEffect } from "react";
import "../tailwind.css";
import { TabData, OrdinalGroupedTabs } from "../types";

const App: React.FC = () => {
  const [ordinalGroupedTabs, setOrdinalGroupedTabs] =
    useState<OrdinalGroupedTabs>({});

  const handleGroupTabs = async () => {
    try {
      // Send message to the background script to group tabs
      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage(
          { action: "groupTabsInBrowser" },
          (response) => {
            resolve();
          }
        );
      });

      // Retrieve pre-calculated groups from Chrome storage for display
      // NOTE: These groups are updated on every new tab or tab close
      const chromeStorageOrdinalGroupedTabsResult = await new Promise<{
        [key: string]: any;
      }>((resolve, reject) => {
        chrome.storage.local.get("ordinalGroupedTabs", (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      });

      const groups =
        chromeStorageOrdinalGroupedTabsResult.ordinalGroupedTabs as OrdinalGroupedTabs;

      if (groups) {
        console.log("Grouped tabs from storage:", groups); // Log the grouped tabs
        setOrdinalGroupedTabs(groups);

        // Now we call the backend to label the groups in the browser
        await new Promise<void>((resolve, reject) => {
          chrome.runtime.sendMessage({ action: "labelGroups" }, (response) => {
            resolve();
          });
        });

        // get grouplabels from chrome storage
        const groupLabels = await new Promise<{ [key: string]: any }>(
          (resolve, reject) => {
            chrome.storage.local.get("groupLabels", (result) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(result);
              }
            });
          }
        );

        console.log("Group labels from storage:", groupLabels); // Log the group labels
      }
    } catch (error) {
      console.error("Error grouping tabs:", error);
    }
  };

  useEffect(() => {
    console.log("Grouped tabs state updated:", ordinalGroupedTabs); // Log the grouped tabs when state updates
  }, [ordinalGroupedTabs]);

  return (
    <div className="bg-slate-50 p-4 w-80 h-min flex flex-col">
      <header className="flex flex-col items-start">
        <img
          src="vector/default-monochrome.svg"
          className="scale-50"
          alt="Logo"
        />
      </header>
      <p className="text-gray-600 mb-2 text-sm">
        The world's smartest tab manager. Group your workspace with just{" "}
        <span className="font-bold text-slate-950">one click</span>.
      </p>
      <div className="flex-shrink-0 mb-2">
        <button
          className="w-full px-8 py-2 rounded overflow-hidden border border-[#4E1A70] bg-slate-50 text-[#4E1A70] shadow-2xl
          relative transition-all duration-500 ease-in-out hover:text-slate-50 group"
          onClick={handleGroupTabs}
        >
          <span className="relative z-10 text-base">Group</span>
          <div className="absolute inset-0 h-full w-full scale-0 rounded transition-all duration-300 group-hover:scale-100">
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-[#4E1A70] to-[#2B4CF2]"></div>
          </div>
        </button>
      </div>
      {Object.keys(ordinalGroupedTabs).length > 0 ? (
        <div className="flex-grow overflow-y-auto rounded-lg shadow-md">
          {Object.entries(ordinalGroupedTabs).map(([groupNum, tabDataList]) => (
            <div
              key={groupNum}
              className="p-4 border-b border-gray-200 last:border-b-0"
            >
              <h2 className="font-bold text-lg text-[#4E1A70] mb-2">
                Group {groupNum}
              </h2>
              <div className="space-y-2">
                {tabDataList.map((tabData: TabData) => (
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
