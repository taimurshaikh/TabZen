import React, { useState } from "react";
import axios from "axios";

const App: React.FC = () => {
  const [groupedTabs, setGroupedTabs] = useState<{ [key: string]: string[] }>(
    {}
  );

  const handleGroupTabs = async () => {
    try {
      const tabs = await chrome.tabs.query({});
      const tabData = tabs.map((tab) => ({ url: tab.url, title: tab.title }));

      const response = await axios.post(
        "http://localhost:8000/group-tabs",
        tabData
      );
      const { groups } = response.data;

      const grouped = tabs.reduce((acc, tab, index) => {
        const group = groups[index];
        if (!acc[group]) acc[group] = [];
        acc[group].push(tab.title ?? "");
        return acc;
      }, {} as { [key: string]: string[] });

      setGroupedTabs(grouped);
    } catch (error) {
      console.error("Error grouping tabs:", error);
    }
  };

  return (
    <div>
      <h1>TabZen</h1>
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
