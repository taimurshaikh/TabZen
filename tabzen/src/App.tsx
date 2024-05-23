import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";

// config for dotenv
console.log(process.env.OPENAI_API_KEY);

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

export const initVectors = async (texts: string[]) => {
  // Get OpenAI API key from environment
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (OPENAI_API_KEY === undefined) {
    throw new Error("OpenAI API key not found");
  }

  const vectorStore = await FaissStore.fromTexts(
    texts,
    texts.map((_, index: number) => ({ id: index + 1 })),
    new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY })
  );

  return vectorStore;
};

function App() {
  return (
    <div className="App">
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
    </div>
  );
}

export default App;
