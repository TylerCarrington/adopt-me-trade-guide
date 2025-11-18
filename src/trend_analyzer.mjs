import { 
    TREND_PERIOD_SELECTOR_ID, TREND_RESULTS_ID,
    // 🟢 NEW: Import trend filter IDs 🟢
    TREND_NAME_FILTER_ID, TREND_RARITY_FILTER_ID,
    TREND_ADV_COLUMN_ID, TREND_ADV_CONDITION_ID, TREND_ADV_VALUE_ID
} from './constants.mjs';
import { formatForDisplay } from './calculator.mjs';

// --- Trend Tab State ---\
export let currentTrendSort = { // Exported for use in index.mjs when sorting from other events
    column: 'Value Change %', // Default sort
    direction: 'desc'
};
// This stores the calculated data *before* filtering
let rawTrendData = []; 

// --- Helper Functions ---

/**
 * Finds the snapshot in history closest to the target date.
 * @param {Array} history - Array of {date: string, pets: Array}
 * @param {Date} targetDate - The ideal date to find.
 * @returns {Object|null} The closest snapshot found, or null.
 */
function findClosestSnapshot(history, targetDate) {
    if (!history || history.length === 0) return null;

    const targetTime = targetDate.getTime();
    
    // Find the snapshot with the minimum time difference to the target
    const closestSnapshot = history.reduce((prev, curr) => {
        const prevDiff = Math.abs(new Date(prev.date).getTime() - targetTime);
        const currDiff = Math.abs(new Date(curr.date).getTime() - targetTime);
        return (currDiff < prevDiff) ? curr : prev;
    });

    return closestSnapshot;
}

/**
 * Calculates the change between two values
 * @param {number} current
 * @param {number} previous
 * @returns {{change: number, percent: number}}
 */
function calculateChange(current, previous) {
    if (isNaN(current) || isNaN(previous) || previous === 0) {
        return { change: null, percent: null };
    }
    const change = current - previous;
    const percent = (change / previous) * 100;
    return { change, percent };
}

// --- Trend Data Processing ---

/**
 * Maps the pet value properties to the keys used in the raw trend data structure.
 * This is crucial because a single value (e.g., 'Regular Value') can have three
 * associated trend properties: The value itself, the change amount, and the change percentage.
 */
const TREND_COLUMNS_MAP = {
    'Regular Value': 'regular',
    'Neon Value': 'neon',
    'Mega Value': 'mega',
};

/**
 * 🟢 NEW: Filters trend data based on all active filters (Name, Rarity, Advanced).
 * @param {Array} data - The array of calculated trend objects.
 * @returns {Array} The filtered array.
 */
function filterTrendData(data) {
    // 1. Get filter criteria
    const nameFilter = document.getElementById(TREND_NAME_FILTER_ID).value.toLowerCase().trim();
    const rarityFilter = document.getElementById(TREND_RARITY_FILTER_ID).value;
    
    const advColumn = document.getElementById(TREND_ADV_COLUMN_ID).value;
    const advCondition = document.getElementById(TREND_ADV_CONDITION_ID).value;
    const advValue = parseFloat(document.getElementById(TREND_ADV_VALUE_ID).value);

    return data.filter(pet => {
        // --- Rarity Filter ---
        if (rarityFilter !== 'All' && pet.rarity !== rarityFilter) {
            return false;
        }

        // --- Name Filter ---
        if (nameFilter && !pet.name.toLowerCase().includes(nameFilter)) {
            return false;
        }

        // --- Advanced Filter ---
        if (advColumn !== 'None' && advCondition !== 'None' && !isNaN(advValue)) {
            let petValue = pet[advColumn];
            
            if (petValue === null || petValue === undefined || isNaN(petValue)) {
                return false; // Cannot compare if pet value is missing
            }
            
            // Apply the condition
            switch (advCondition) {
                case '>':
                    if (!(petValue > advValue)) return false;
                    break;
                case '<':
                    if (!(petValue < advValue)) return false;
                    break;
                case '=':
                    // Use a small epsilon for floating point equality check
                    if (!(Math.abs(petValue - advValue) < 0.001)) return false;
                    break;
            }
        }

        // If all filters pass
        return true;
    });
}


// --- Main Logic ---

/**
 * Applies all filters and the current sort order to the trend data.
 * @returns {Array} The filtered and sorted data.
 */
export function applyTrendFiltersAndSort() {
    let filteredData = filterTrendData(rawTrendData);
    
    // Sort the filtered data
    filteredData.sort((a, b) => {
        const aVal = a[currentTrendSort.column];
        const bVal = b[currentTrendSort.column];

        // Handle null/NaN values by pushing them to the end (important for trend data)
        const isANull = aVal === null || aVal === undefined || isNaN(aVal);
        const isBNull = bVal === null || bVal === undefined || isNaN(bVal);

        if (isANull && isBNull) return 0;
        if (isANull) return currentTrendSort.direction === 'desc' ? 1 : -1;
        if (isBNull) return currentTrendSort.direction === 'desc' ? -1 : 1;
        
        if (aVal < bVal) return currentTrendSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentTrendSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    renderTrendResults(filteredData);
    return filteredData;
}


/**
 * Core function to calculate all trend data for the selected period.
 * @param {Array} currentPets - Today's pet value data.
 * @param {Array} history - The loaded history snapshots.
 */
export function calculateTrendData(currentPets, history) {
    const periodSelector = document.getElementById(TREND_PERIOD_SELECTOR_ID);
    const period = periodSelector ? parseInt(periodSelector.value, 10) : 7; // Default to 7 days
    
    // 1. Determine the target previous date
    // Note: getTodayDate is not imported/defined here, assuming it comes from index.mjs flow
    const today = new Date(); // Use current date as a fallback if getTodayDate is unavailable
    // const today = new Date(getTodayDate()); // Assuming getTodayDate is available via context
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - period); // Go back X days

    // 2. Find the closest historical snapshot
    const previousSnapshot = findClosestSnapshot(history, targetDate);

    if (!previousSnapshot) {
        // If no previous data is found, we cannot calculate trends.
        rawTrendData = [];
        return applyTrendFiltersAndSort(); 
    }
    
    const previousPetsMap = new Map(previousSnapshot.pets.map(p => [p.name, p]));
    const trendData = [];
    
    // 3. Calculate trends for each pet
    currentPets.forEach(currentPet => {
        const previousPet = previousPetsMap.get(currentPet.name);
        
        const trend = {
            name: currentPet.name,
            rarity: currentPet.rarity,
            year: currentPet.year,
            'image_url': currentPet['image_url'], // 🐛 FIX: Access pet['image_url'] and store under 'image_url'
            
            // Current Values (used for comparison and advanced filtering)
            'Regular Value': currentPet['Regular Value'] || null,
            'Neon Value': currentPet['Neon Value'] || null,
            'Mega Value': currentPet['Mega Value'] || null,

            // Initialize change properties
            'Value Change': null, 'Value Change %': null,
            'Neon Change': null, 'Neon Change %': null,
            'Mega Change': null, 'Mega Change %': null,
        };
        
        if (previousPet) {
            // Regular Value Trend
            const prevR = previousPet.regular;
            const currR = currentPet['Regular Value'];
            const regTrend = calculateChange(currR, prevR);
            trend['Value Change'] = regTrend.change;
            trend['Value Change %'] = regTrend.percent;

            // Neon Value Trend
            const prevN = previousPet.neon;
            const currN = currentPet['Neon Value'];
            const neonTrend = calculateChange(currN, prevN);
            trend['Neon Change'] = neonTrend.change;
            trend['Neon Change %'] = neonTrend.percent;
            
            // Mega Value Trend
            const prevM = previousPet.mega;
            const currM = currentPet['Mega Value'];
            const megaTrend = calculateChange(currM, prevM);
            trend['Mega Change'] = megaTrend.change;
            trend['Mega Change %'] = megaTrend.percent;
        }

        trendData.push(trend);
    });

    rawTrendData = trendData;
    applyTrendFiltersAndSort();
}

/**
 * Renders the trend data table.
 * @param {Array} data - The trend data to display.
 */
export function renderTrendResults(data) {
    const container = document.getElementById(TREND_RESULTS_ID);
    if (!container) return;
    
    // 1. Define the table headers for the Trend Tab
    const headers = [
        { key: 'image_url', display: 'Pet', sortable: false, class: 'pet-name' }, // 🐛 FIX: Changed "Image URL" to "image_url"
        { key: 'rarity', display: 'Rarity', sortable: true, class: 'rarity-cell' },
        { key: 'year', display: 'Year', sortable: true, class: 'year-cell' },
        { key: 'Regular Value', display: 'Current Value', sortable: true, class: 'calculation' },
        { key: 'Value Change', display: 'Change', sortable: true, class: 'calculation' },
        { key: 'Value Change %', display: 'Change %', sortable: true, class: 'calculation' },
        { key: 'Neon Value', display: 'Current N', sortable: true, class: 'calculation' },
        { key: 'Neon Change', display: 'N Change', sortable: true, class: 'calculation' },
        { key: 'Neon Change %', display: 'N Change %', sortable: true, class: 'calculation' },
        { key: 'Mega Value', display: 'Current M', sortable: true, class: 'calculation' },
        { key: 'Mega Change', display: 'M Change', sortable: true, class: 'calculation' },
        { key: 'Mega Change %', display: 'M Change %', sortable: true, class: 'calculation' },
    ];
    
    // 2. Build the table HTML
    let tableHTML = '<table><thead><tr>';
    headers.forEach(h => {
        let sortClass = '';
        let sortIndicator = '';
        if (h.sortable) {
            sortClass = 'sortable-header';
            if (currentTrendSort.column === h.key) {
                sortIndicator = currentTrendSort.direction === 'asc' ? ' &uarr;' : ' &darr;';
            }
        }
        tableHTML += `<th data-key="${h.key}" class="${sortClass} ${h.class}" style="min-width: 80px;">${h.display}${sortIndicator}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    data.forEach(pet => {
        tableHTML += '<tr>';
        headers.forEach(h => {
            let cellClass = h.class || '';
            let displayValue = pet[h.key] === null || pet[h.key] === undefined ? '—' : pet[h.key];

            if (h.key === 'image_url') { // 🐛 FIX: Check against the correct key "image_url"
                const imageUrl = pet['image_url'] || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 🐛 FIX: Access pet['image_url']
                // 🟢 No trade recommendations on the trend tab, just text 🟢
                displayValue = `<img src="${imageUrl}" alt="${pet.name}" style="height:24px; vertical-align:middle; margin-right:8px; border-radius: 4px;"> ${pet.name}`;
                cellClass = 'pet-name';
            } else if (h.key === 'rarity') {
                displayValue = pet.rarity || '—';
                cellClass = 'rarity-cell';
            } else if (h.key === 'year') {
                displayValue = pet.year || '—';
                cellClass = 'year-cell';
            } else {
                displayValue = formatForDisplay(h.key, pet[h.key]);
                // 🟢 Highlight positive/negative change 🟢
                if (h.key.includes('Change') || h.key.includes('%')) {
                    const numVal = pet[h.key];
                    if (!isNaN(numVal) && numVal !== null) {
                        // Use appropriate color based on value, apply cellClass
                        cellClass += (numVal > 0) ? ' gain-win' : (numVal < 0 ? ' gain-loss' : '');
                    }
                }
            }
            tableHTML += `<td class="${cellClass}">${displayValue}</td>`;
        });
        tableHTML += '</tr>'; 
    });
    tableHTML += '</tbody></table>';

    container.innerHTML = tableHTML;
    
    // 3. Re-attach listeners for the new headers
    container.querySelectorAll('.sortable-header').forEach(header => {
        header.removeEventListener('click', handleTrendHeaderClick); // Remove old listener if any
        header.addEventListener('click', handleTrendHeaderClick);
    });
}

/**
 * Handles clicks on the trend table headers to sort the data.
 * @param {Event} e 
 */
function handleTrendHeaderClick(e) {
    const columnKey = e.currentTarget.dataset.key;
    
    if (currentTrendSort.column === columnKey) {
        // Toggle direction
        currentTrendSort.direction = currentTrendSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // New column, default to descending
        currentTrendSort.column = columnKey;
        currentTrendSort.direction = 'desc';
    }
    
    applyTrendFiltersAndSort(); // Re-sort and re-render
}