import {
  RESULTS_CONTAINER_ID,
  RARITY_FILTER_ID,
  ADV_COLUMN_ID,
  ADV_CONDITION_ID,
  ADV_VALUE_ID,
  NAME_FILTER_ID,
  TREND_RARITY_FILTER_ID, 
} from "./constants.mjs";
import { formatForDisplay } from "./calculator.mjs";

// --- UI STATE ---
export let currentSort = {
  column: "Regular Value",
  direction: "desc",
};

// --- UI LOGIC ---

function filterOutItems(data) {
  return data.filter((pet) => {
    const regularValue = pet["Regular Value"];
    const neonValue = pet["Neon Value"];
    const megaValue = pet["Mega Value"];

    const hasRegular = !isNaN(regularValue);
    const hasNeonOrMega = !isNaN(neonValue) || !isNaN(megaValue);

    if (hasRegular && !hasNeonOrMega) {
      return false;
    }

    return true;
  });
}

/**
 * Filters data based on the text entered in the 'Search by Name' input field.
 */
function filterByName(data, nameFilterId) {
  // Get the search term from the new input field
  const nameFilter = document.getElementById(nameFilterId);
  if (!nameFilter) return data; // Defensive check
  
  const nameSearchTerm = nameFilter.value.toLowerCase().trim();

  if (!nameSearchTerm) {
    return data;
  }

  // Filter by checking if the pet's name includes the search term
  return data.filter((pet) => pet.name.toLowerCase().includes(nameSearchTerm));
}

function getAdvancedFilterCriteria() {
  const column = document.getElementById(ADV_COLUMN_ID).value;
  const condition = document.getElementById(ADV_CONDITION_ID).value;
  const value = parseFloat(document.getElementById(ADV_VALUE_ID).value);
  return { column, condition, value };
}

function filterData(data) {
  const rarityFilterValue = document.getElementById(RARITY_FILTER_ID).value;
  let filtered = data.filter((pet) => {
    if (rarityFilterValue !== "All" && pet.rarity !== rarityFilterValue) {
      return false;
    }
    return true;
  });

  filtered = filterByName(filtered, NAME_FILTER_ID);
  
  // --- Advanced Filter Logic ---
  const { column, condition, value } = getAdvancedFilterCriteria();

  if (column !== 'None' && condition !== 'None' && !isNaN(value)) {
    filtered = filtered.filter(pet => {
      const petValue = pet[column];

      if (petValue === null || petValue === undefined || isNaN(petValue)) {
          return false; // Cannot compare if pet value is missing
      }
      
      switch (condition) {
          case '>':
              return petValue > value;
          case '<':
              return petValue < value;
          case '=':
              // Use a small epsilon for floating point equality check
              return Math.abs(petValue - value) < 0.001;
          default:
              return true;
      }
    });
  }

  return filterOutItems(filtered);
}

/**
 * Applies filters and sorts the data for the Value Analysis tab.
 * @param {Array} data - The raw pet data.
 * @param {Function} handleTradeRecommendation - Function to call when a trade rec button is clicked.
 * @param {Function} handleHeaderClick - Function to call when a header is clicked for sorting.
 */
export function applyFiltersAndSort(data, handleTradeRecommendation, handleHeaderClick) {
  let filteredData = filterData(data);

  // Sort logic (using currentSort state)
  filteredData.sort((a, b) => {
    const aVal = a[currentSort.column];
    const bVal = b[currentSort.column];

    // Handle null/NaN values by pushing them to the end
    const isANull = aVal === null || aVal === undefined || isNaN(aVal);
    const isBNull = bVal === null || bVal === undefined || isNaN(bVal);

    if (isANull && isBNull) return 0;
    if (isANull) return currentSort.direction === 'desc' ? 1 : -1;
    if (isBNull) return currentSort.direction === 'desc' ? -1 : 1;

    if (aVal < bVal) return currentSort.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return currentSort.direction === "asc" ? 1 : -1;
    return 0;
  });

  renderResults(filteredData, handleTradeRecommendation, handleHeaderClick);
  return filteredData;
}

/**
 * Renders the calculation results table for the Value Analysis tab.
 * @param {Array} data - The filtered and sorted pet data.
 * @param {Function} showTradeRecommendations - Callback to show trade recommendations.
 * @param {Function} handleValueHeaderClick - Callback to handle header clicks.
 */
export function renderResults(data, showTradeRecommendations, handleValueHeaderClick) {
  const container = document.getElementById(RESULTS_CONTAINER_ID);
  if (!container) return;

  // 1. Define the table headers (Value Analysis headers)
  const headers = [
    { key: "image_url", display: "Pet", sortable: false, class: "pet-name" },
    { key: "rarity", display: "Rarity", sortable: true, class: "rarity-cell" },
    { key: "year", display: "Year", sortable: true, class: "year-cell" },
    { key: "Regular Value", display: "Value", sortable: true, class: "calculation" },
    { key: "Neon Value", display: "Neon", sortable: true, class: "calculation" },
    { key: "Mega Value", display: "Mega", sortable: true, class: "calculation" },
    { key: "Neon Rate (N/R)", display: "N Rate", sortable: true, class: "calculation" },
    { key: "Neon Gain (N-4R)", display: "N Gain (V)", sortable: true, class: "calculation" },
    { key: "Weighted Neon Gain", display: "N Gain (W)", sortable: true, class: "calculation" },
    { key: "Mega Rate (M/N)", display: "M Rate", sortable: true, class: "calculation" },
    { key: "Mega Gain (M-4N)", display: "M Gain (V)", sortable: true, class: "calculation" },
    { key: "Weighted Mega Gain", display: "M Gain (W)", sortable: true, class: "calculation" },
    { key: "Trade Rec", display: "Trade Rec", sortable: false, class: "trade-rec" },
  ];

  // 2. Build the table HTML
  let tableHTML = "<table><thead><tr>";
  headers.forEach((h) => {
    let sortClass = "";
    let sortIndicator = "";
    if (h.sortable) {
      sortClass = "sortable-header";
      if (currentSort.column === h.key) {
        sortIndicator = currentSort.direction === "asc" ? " &uarr;" : " &darr;";
      }
    }
    tableHTML += `<th data-key="${h.key}" class="${sortClass} ${h.class}" style="min-width: 80px;">${h.display}${sortIndicator}</th>`;
  });
  tableHTML += "</tr></thead><tbody>";

  data.forEach((pet) => {
    tableHTML += "<tr>";
    headers.forEach((h) => {
      let cellClass = h.class || "";
      let displayValue = pet[h.key] === null || pet[h.key] === undefined ? "—" : pet[h.key];

      if (h.key === "image_url") {
        const imageUrl = pet["image_url"] || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        // 🟢 FIX: Added data-pet-name attribute to make the name clickable
        displayValue = `<img src="${imageUrl}" alt="${pet.name}" style="height:24px; vertical-align:middle; margin-right:8px; border-radius: 4px;"> <span class="trade-link" data-pet-name="${pet.name}">${pet.name}</span>`;
        cellClass = "pet-name";
      } else if (h.key === "rarity") {
        displayValue = pet.rarity || "—";
        cellClass = "rarity-cell";
      } else if (h.key === "year") {
        displayValue = pet.year || "—";
        cellClass = "year-cell";
      } else if (h.key === "Trade Rec") {
        displayValue = `<button class="recommend-button" data-pet-name="${pet.name}">Recommend</button>`;
        cellClass = "trade-rec";
      } else {
        displayValue = formatForDisplay(h.key, pet[h.key]);
        cellClass = "calculation";
      }

      tableHTML += `<td class="${cellClass}">${displayValue}</td>`;
    });
    tableHTML += "</tr>";
  });
  tableHTML += "</tbody></table>";

  container.innerHTML = tableHTML;
  
  // Re-attach listeners for sortable headers (Value Analysis headers)
  container.querySelectorAll('.sortable-header').forEach(header => {
    header.removeEventListener('click', handleValueHeaderClick);
    header.addEventListener('click', handleValueHeaderClick);
  });
  
  // Re-attach listeners for Trade Rec buttons
  container.querySelectorAll('.recommend-button').forEach(button => {
    button.removeEventListener('click', showTradeRecommendations);
    button.addEventListener('click', showTradeRecommendations);
  });

  // 🟢 NEW: Attach listeners to pet name links 🟢
  container.querySelectorAll('.trade-link').forEach(link => {
    link.removeEventListener('click', showTradeRecommendations);
    link.addEventListener('click', showTradeRecommendations);
  });
}


/**
 * Populates the Rarity filter dropdown for the Value Analysis tab.
 * @param {Array} data - The pet data array.
 */
export function populateRarityFilter(data) {
  const select = document.getElementById(RARITY_FILTER_ID);
  if (!select) return;

  const rarities = [...new Set(data.map((pet) => pet.rarity))].filter(r => r).sort();

  select
    .querySelectorAll('option:not([value="All"])')
    .forEach((option) => option.remove());

  rarities.forEach((rarity) => {
    // Only add non-empty rarities
    if (rarity) {
        const option = document.createElement("option");
        option.value = rarity;
        option.textContent = rarity;
        select.appendChild(option);
    }
  });
}

/**
 * 🟢 NEW: Populates the Rarity filter dropdown for the Trend Analysis tab.
 * @param {Array} data - The pet data array.
 */
export function populateTrendRarityFilter(data) {
  const select = document.getElementById(TREND_RARITY_FILTER_ID);
  if (!select) return;

  const rarities = [...new Set(data.map((pet) => pet.rarity))].filter(r => r).sort();

  select
    .querySelectorAll('option:not([value="All"])')
    .forEach((option) => option.remove());

  rarities.forEach((rarity) => {
    // Only add non-empty rarities
    if (rarity) {
        const option = document.createElement("option");
        option.value = rarity;
        option.textContent = rarity;
        select.appendChild(option);
    }
  });
}

// 🟢 MODIFIED: Accepts an ID and a flag to populate any advanced filter 🟢
export function populateAdvancedFilterControls(columnSelectId, includeTrendColumns = false) {
  const columnSelect = document.getElementById(columnSelectId);
  
  if (!columnSelect) {
      console.error(`Filter control with ID ${columnSelectId} not found. Skipping population.`);
      return; 
  }
  
  let filterableColumns = [
    "Regular Value",
    "Neon Value",
    "Mega Value",
    "Neon Rate (N/R)",
    "Neon Gain (N-4R)",
    "Weighted Neon Gain", 
    "Mega Rate (M/N)",
    "Mega Gain (M-4N)",
    "Weighted Mega Gain",
    "Year",
  ];

  // If it's the trend tab, add the trend-specific columns
  if (includeTrendColumns) {
      filterableColumns.push(
          "Value Change", "Value Change %",
          "Neon Change", "Neon Change %",
          "Mega Change", "Mega Change %"
      );
  }

  columnSelect.innerHTML = '<option value="None">-- Select Value --</option>';

  filterableColumns.sort().forEach((column) => {
    const option = document.createElement("option");
    option.value = column;
    option.textContent = column;
    columnSelect.appendChild(option);
  });
}

/**
 * 🟢 NEW: Export a function to reset controls, used by clearAdvancedFilter in index.mjs 🟢
 */
export function resetAdvancedFilterControls(columnId, conditionId, valueId) {
    const columnSelect = document.getElementById(columnId);
    const conditionSelect = document.getElementById(conditionId);
    const valueInput = document.getElementById(valueId);

    if (columnSelect) columnSelect.value = 'None';
    if (conditionSelect) conditionSelect.value = 'None';
    if (valueInput) valueInput.value = '';
}