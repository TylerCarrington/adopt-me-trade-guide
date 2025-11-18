// history_tracker.mjs

/**
 * Key used to store the pet history in localStorage.
 */
const HISTORY_STORAGE_KEY = "petValueHistory";

/**
 * Gets the current date in YYYY-MM-DD format.
 */
export function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Loads the pet value history from local storage.
 * @returns {Array<Object>} An array of historical snapshots, or an empty array.
 */
export function loadHistory() {
  try {
    const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY);
    // The structure is an array of daily snapshots: [{ date: '...', pets: [...] }]
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (e) {
    console.error("Error loading history from localStorage:", e);
    return [];
  }
}

/**
 * Saves a new daily snapshot of pet data to local storage, including all necessary values and the image URL.
 * @param {Array<Object>} currentPetData An array of pet data objects from the latest scrape.
 * @returns {void}
 */
export function saveSnapshot(currentPetData) {
  const history = loadHistory();
  const today = getTodayDate();

  // Create the new snapshot object, ensuring all required fields are stored
  const newSnapshot = {
    date: today,
    pets: currentPetData.map((pet) => ({
      name: pet.name,
      rarity: pet.rarity,
      year: pet.year,
      regular: pet["Regular Value"],
      neon: pet["Neon Value"],
      mega: pet["Mega Value"],
      image_url: pet.image_url, // 🟢 ADDED: Image URL 🟢
    })),
  };

  // Check if a snapshot for today already exists
  const todayIndex = history.findIndex((snapshot) => snapshot.date === today);

  if (todayIndex > -1) {
    // Overwrite existing snapshot for today
    history[todayIndex] = newSnapshot;
    console.log(`✅ History snapshot for ${today} updated.`);
  } else {
    // Add new snapshot
    history.push(newSnapshot);
    history.sort((a, b) => new Date(a.date) - new Date(b.date)); // Keep chronologically sorted
    console.log(`✅ New history snapshot for ${today} saved.`);
  }

  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Error saving history to localStorage:", e);
  }
}
