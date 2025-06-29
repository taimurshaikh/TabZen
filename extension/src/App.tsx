function App() {
  return (
    <>
      <div className="h-full w-full bg-gray-900 flex flex-col items-center py-10 px-4">
        <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">
          TabZen
        </h1>
        <button
          className="mb-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition"
          onClick={() => {
            // Placeholder for clustering logic
            alert("Cluster Tabs clicked!");
          }}
        >
          Cluster Tabs
        </button>
        <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Tab Groups</h2>
          {/* Example tab groups data */}
          {[
            {
              name: "Work",
              tabs: [
                { title: "Gmail", url: "https://mail.google.com" },
                { title: "Docs", url: "https://docs.google.com" },
              ],
            },
            {
              name: "Personal",
              tabs: [
                { title: "YouTube", url: "https://youtube.com" },
                { title: "Reddit", url: "https://reddit.com" },
              ],
            },
          ].map((group, idx) => (
            <div key={idx} className="mb-6 last:mb-0">
              <div className="text-lg font-medium text-blue-400 mb-2">
                {group.name}
              </div>
              <ul className="space-y-1">
                {group.tabs.map((tab, tabIdx) => (
                  <li
                    key={tabIdx}
                    className="flex items-center bg-gray-700 rounded px-3 py-2 hover:bg-gray-600 transition"
                  >
                    <span className="text-white flex-1 truncate">
                      {tab.title}
                    </span>
                    <a
                      href={tab.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 text-blue-300 hover:underline text-sm"
                    >
                      Visit
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
