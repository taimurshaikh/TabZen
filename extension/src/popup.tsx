// import { FaissStore } from "@langchain/community/vectorstores/faiss";
// import { OpenAIEmbeddings } from "@langchain/openai";

import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

async function getTabTitles() {
  const tabs = await chrome.tabs.query({});
  const tabTitles: string[] = [];
  tabs.forEach((tab) => {
    if (tab.title !== undefined) {
      tabTitles.push(tab.title);
    }
  });
  return tabTitles;
}

const Popup = () => {
  return (
    <>
      <h1>TabZen 🧘🏽</h1>
      <div className="card">
        <button
          onClick={() =>
            getTabTitles().then((tabTitles) => {
              console.log(tabTitles);
            })
          }
        >
          {"Group"}
        </button>
      </div>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
