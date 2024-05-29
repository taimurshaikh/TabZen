import React, { useState } from "react";

const App: React.FC = () => {
  const [groupedTabs, setGroupedTabs] = useState<{ [key: string]: string[] }>(
    {}
  );

  const handleGroupTabs = async () => {
    try {
      // Retrieve pre-calculated groups from Chrome storage
      chrome.storage.local.get("groupedTabs", (result) => {
        const groups = result.groupedTabs;

        if (groups) {
          // Group tabs according to the pre-calculated groups
          chrome.tabs.query({}, (tabs) => {
            const grouped = tabs.reduce((acc, tab, index) => {
              const group = groups[index];
              if (!acc[group]) acc[group] = [];
              if (tab.title) acc[group].push(tab.title);
              return acc;
            }, {} as { [key: string]: string[] });

            setGroupedTabs(grouped);
          });
        }
      });
    } catch (error) {
      console.error("Error grouping tabs:", error);
    }
  };

  return (
    <div>
      <h1>Tab Grouper</h1>
      <button onClick={handleGroupTabs}>Group Tabs</button>
      {Object.keys(groupedTabs).length > 0 && (
        <div>
          <h2>Grouped Tabs</h2>
          {Object.entries(groupedTabs).map(([group, titles], index) => (
            <div key={index}>
              <h3>Group {group}</h3>
              <ul>
                {titles.map((title, idx) => (
                  <li key={idx}>{title}</li>
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
