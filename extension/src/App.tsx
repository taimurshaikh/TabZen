import React, { useEffect } from "react";
import {
  GroupedTabs,
  LabeledGroups,
  getAllTabs,
  queryTabGroups,
  sendRuntimeMessage,
  getStorageData,
  updateTabGroupTitle,
} from "./chrome-utils";
import "./tailwind.css";

// Main function to group and label tabs
const groupAndLabelTabs = async () => {
  try {
    sendRuntimeMessage("groupTabs");
    console.log("Group tabs message sent");

    const groupedTabs: GroupedTabs = getStorageData("groupedTabs");
    if (!groupedTabs) {
      throw new Error("No groups found in storage.");
    }

    const tabs = await getAllTabs();
    const grouped = tabs.reduce((acc, tab) => {
      if (tab.id !== undefined) {
        const group = groupedTabs[tab.id];
        if (group !== undefined) {
          if (!acc[group]) acc[group] = [];
          if (tab.title) acc[group].push(tab.title);
        }
      }
      return acc;
    }, {} as { [key: string]: string[] });

    // sendRuntimeMessage("labelGroups");
    // console.log("Label groups message sent");

    // const labeledGroups: LabeledGroups = await getStorageData("labeledGroups");
    // if (!labeledGroups) {
    //   throw new Error("No labeled groups found in storage.");
    // }
    // console.log("Labeled groups:", labeledGroups);

    // const groups = await queryTabGroups();
    // await Promise.all(
    //   groups.map((group) => {
    //     const label = labeledGroups[group.id];
    //     if (label) {
    //       return updateTabGroupTitle(group.id, label);
    //     }
    //     return Promise.resolve();
    //   })
    // );
  } catch (error) {
    console.error(error);
  }
};

const App: React.FC = () => {
  return (
    <div className="bg-gray-100 items-center p-4 w-[200px]">
      <h1 className="text-2xl font-bold mb-4 whitespace-nowrap overflow-hidden overflow-ellipsis">
        TabZen <span>🧘🏽</span>
      </h1>
      <p className="text-gray-500 text-sm mb-4">
        The world's <span className="font-bold">smartest</span> tab manager.
        Group your workspace with just one click.
      </p>
      <button
        className="relative px-8 py-2 rounded overflow-hidden border border-purple-400 bg-white text-purple-400 shadow-2xl transition-all before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:duration-500 after:absolute after:right-0 after:top-0 after:h-full after:w-0 after:duration-500 hover:text-white hover:shadow-purple-400 hover:before:w-2/4 hover:before:bg-gradient-to-r from-purple-500 to-purple-700 hover:after:w-2/4 hover:after:bg-purple-700"
        onClick={groupAndLabelTabs}
      >
        <span className="relative z-10">Group</span>
      </button>
    </div>
  );
};

export default App;
