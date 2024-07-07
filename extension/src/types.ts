export interface TabData {
  tab_id: number;
  url: string;
  title: string;
}

// Maps ordinal numbers (1, 2, 3, ...) to an array of TabData objects
// Ordinal numbers are NOT the unique IDs of the groups within the map
export interface OrdinalGroupedTabs {
  [key: number]: TabData[];
}
