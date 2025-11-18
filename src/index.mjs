import { fetchAndParseData } from './scraper.mjs';
import { calculatePetMetrics } from './calculator.mjs';
import { generateTradeRecommendations } from './trade_logic.mjs';
import { 
    applyFiltersAndSort, populateRarityFilter, 
    populateAdvancedFilterControls, currentSort,
    populateTrendRarityFilter, renderResults, resetAdvancedFilterControls
} from './ui_renderer.mjs';
import { formatForDisplay } from './calculator.mjs'; 
import { 
    PROCESS_BUTTON_ID, RARITY_FILTER_ID, ADV_COLUMN_ID, TRADE_REC_ID,
    TAB_VALUE_ANALYSIS, TAB_TREND_ANALYSIS, TAB_PET_INVENTORY, ADV_CONDITION_ID, ADV_VALUE_ID,
    TREND_PERIOD_SELECTOR_ID, TREND_RESULTS_ID,
    TREND_NAME_FILTER_ID, TREND_RARITY_FILTER_ID, TREND_ADV_COLUMN_ID,
    TREND_ADV_CONDITION_ID, TREND_ADV_VALUE_ID,
    TREND_APPLY_FILTER_BUTTON_ID, TREND_CLEAR_FILTER_BUTTON_ID, NAME_FILTER_ID,
    APPLY_FILTER_BUTTON_ID, CLEAR_FILTER_BUTTON_ID, RESULTS_CONTAINER_ID,
    REFRESH_DATA_BUTTON_ID, INVENTORY_LIST_ID 
} from './constants.mjs';
import { saveSnapshot, loadHistory, getTodayDate } from './history_tracker.mjs'; 
import { calculateTrendData, applyTrendFiltersAndSort, currentTrendSort } from './trend_analyzer.mjs';


// --- GLOBAL STATE ---
let globalPetData = [];
let historySnapshots = [];

// --- INVENTORY PERSISTENCE & COUNTER LOGIC ---
const INVENTORY_STORAGE_KEY = 'petInventoryCounts';

/**
 * Loads all pet counts from localStorage.
 * @returns {Object} An object mapping petName to { regular: number, neon: number, mega: number }.
 */
function loadPetCounts() {
    try {
        const json = localStorage.getItem(INVENTORY_STORAGE_KEY);
        // Ensure we always return an object structure if parsing fails or is empty
        return json ? JSON.parse(json) : {};
    } catch (e) {
        console.error("Error loading pet counts from localStorage:", e);
        return {};
    }
}

/**
 * Saves all pet counts back to localStorage.
 * @param {Object} counts The counts object.
 */
function savePetCounts(counts) {
    try {
        localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(counts));
    } catch (e) {
        console.error("Error saving pet counts to localStorage:", e);
    }
}

/**
 * Generates the HTML for the pet counter controls.
 * @param {string} petName The name of the pet.
 * @param {Object} currentCounts The current pet counts for this pet.
 * @returns {string} The HTML string for the counter.
 */
function generateCounterHTML(petName, currentCounts) {
    const types = [
        { key: 'regular', label: 'Regular' },
        { key: 'neon', label: 'Neon' },
        { key: 'mega', label: 'Mega' }
    ];

    let html = `
        <div id="pet-counter-controls">
            <p style="font-weight: 600; margin-bottom: 8px; color: #333;">Your Inventory Count:</p>
            <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
    `;

    types.forEach(({ key, label }) => {
        // Use 0 if the value is not found
        const count = currentCounts[key] || 0;
        
        // Buttons use the .count-btn class defined in styles.css
        html += `
            <div style="display: flex; align-items: center; gap: 5px;">
                <span style="font-weight: 500; min-width: 50px;">${label}:</span>
                <button class="count-btn" data-pet="${petName}" data-type="${key}" data-delta="-1">-</button>
                <span id="${petName}-${key}-count-display" style="min-width: 25px; text-align: center; font-weight: bold;">${count}</span>
                <button class="count-btn" data-pet="${petName}" data-type="${key}" data-delta="1">+</button>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;
    return html;
}

/**
 * Updates the count for a specific pet and type, handling bounds and persistence.
 * @param {string} petName The name of the pet.
 * @param {string} type 'regular', 'neon', or 'mega'.
 * @param {number} delta +1 or -1.
 */
function handlePetCountChange(petName, type, delta) {
    const counts = loadPetCounts();
    
    // Initialize pet entry if it doesn't exist
    if (!counts[petName]) {
        counts[petName] = { regular: 0, neon: 0, mega: 0 };
    }
    
    // Use 0 if the specific type count is not set
    const currentCount = counts[petName][type] || 0;
    
    let newCount = currentCount + delta;
    
    // Apply bounds: 0 to 100
    newCount = Math.max(0, Math.min(100, newCount));
    
    if (newCount !== currentCount) {
        counts[petName][type] = newCount;
        savePetCounts(counts);
        
        // Update the display element
        const displayElement = document.getElementById(`${petName}-${type}-count-display`);
        if (displayElement) {
            displayElement.textContent = newCount;
        }
        
        // If the Inventory tab is active, re-render it
        if (document.getElementById(TAB_PET_INVENTORY).style.display === 'block') {
            renderInventory();
        }
    }
}

function handleCounterButtonClick(e) {
    const button = e.currentTarget;
    const petName = button.dataset.pet;
    const type = button.dataset.type; // 'regular', 'neon', 'mega'
    const delta = parseInt(button.dataset.delta, 10); // 1 or -1
    
    handlePetCountChange(petName, type, delta);
}

// --- UTILITY FUNCTIONS ---
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById(tabId).style.display = 'block';

    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    // Find the correct button using data-tab attribute
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // Load data specific to the tab if necessary
    if (tabId === TAB_TREND_ANALYSIS) {
        loadTrendTab();
    } else if (tabId === TAB_VALUE_ANALYSIS) {
        // Re-render the existing data if we switch back
        applyFiltersAndSort(globalPetData, showTradeRecommendations, handleValueHeaderClick);
    } else if (tabId === TAB_PET_INVENTORY) {
        // NEW: Render the inventory when the tab is switched 
        renderInventory();
    }
}
window.showTab = showTab; // Expose to global scope for index.html onclick

function updateStatus(message) {
    // This function can be expanded to show status messages in a dedicated UI element
    console.log(`STATUS: ${message}`);
    // For now, we'll just update the results container when loading
    const resultsContainer = document.getElementById(RESULTS_CONTAINER_ID);
    if (resultsContainer) {
        resultsContainer.innerHTML = `<p>${message}</p>`;
    }
    const trendResultsContainer = document.getElementById(TREND_RESULTS_ID);
    if (trendResultsContainer && document.getElementById(TAB_TREND_ANALYSIS).style.display === 'block') {
         trendResultsContainer.innerHTML = `<p>${message}</p>`;
    }
}

// --- DATA & CORE LOGIC ---

/**
 * Main function to fetch, process, and render data.
 */
async function loadData() {
    updateStatus("Fetching latest data from source. This may take a moment...");
    
    // Clear old data while loading
    globalPetData = [];

    try {
        const rawPets = await fetchAndParseData();
        updateStatus("Data fetched. Calculating metrics...");
        
        // 1. Calculate the final metrics
        const petsWithMetrics = calculatePetMetrics(rawPets);
        globalPetData = petsWithMetrics;

        // 2. Save snapshot to history
        saveSnapshot(globalPetData);
        
        // 3. Load history for trend analysis
        historySnapshots = loadHistory();
        
        // 4. Populate filters
        populateRarityFilter(globalPetData);
        populateAdvancedFilterControls(ADV_COLUMN_ID, false); // For Value Analysis
        populateTrendRarityFilter(globalPetData);
        populateAdvancedFilterControls(TREND_ADV_COLUMN_ID, true); // For Trend Analysis

        updateStatus("Processing complete. Rendering results.");

        // 5. Render results for the active tab
        const activeTabButton = document.querySelector('.tab-button.active');
        const activeTab = activeTabButton ? activeTabButton.dataset.tab : TAB_VALUE_ANALYSIS;
        if (activeTab === TAB_TREND_ANALYSIS) {
            loadTrendTab();
        } else if (activeTab === TAB_PET_INVENTORY) {
            renderInventory();
        } else {
            applyFiltersAndSort(globalPetData, showTradeRecommendations, handleValueHeaderClick);
        }

    } catch (error) {
        console.error("Critical error during data load:", error);
        updateStatus(`Error: Could not load pet data. ${error.message}. Please try again later.`);
    }
}

/**
 * Renders the user's pet inventory table.
 * NEW FUNCTION FOR INVENTORY TAB 
 */
function renderInventory() {
    const inventoryContainer = document.getElementById(INVENTORY_LIST_ID);
    if (!inventoryContainer) return;
    
    const petCounts = loadPetCounts();
    // Get pet data that the user actually owns (count > 0 for any type)
    const ownedPets = globalPetData.filter(pet => {
        const counts = petCounts[pet.name] || {};
        return (counts.regular > 0 || counts.neon > 0 || counts.mega > 0);
    });
    
    if (ownedPets.length === 0) {
        // Direct the user to the first tab if inventory is empty
        inventoryContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; border: 2px dashed #ccc; border-radius: 8px; margin-top: 20px;">
                <h3 style="color: #FF5722;">Your Inventory is Empty!</h3>
                <p>To start tracking your pets, please go to the <strong>Value Analysis</strong> tab, find a pet, and use the counter in the Trade Recommendations modal to set its count (Regular, Neon, or Mega).</p>
                <button class="tab-button" onclick="showTab('${TAB_VALUE_ANALYSIS}')" data-tab="${TAB_VALUE_ANALYSIS}" style="margin-top: 15px; padding: 10px 20px; background-color: #4CAF50; color: white; border-bottom: none;">
                    Go to Value Analysis
                </button>
            </div>
        `;
        return;
    }
    
    // Calculate total value
    let totalInventoryValue = 0;
    
    // Build the table
    let tableHTML = `
        <table class="results-table">
            <thead>
                <tr>
                    <th style="width: 50px;"></th>
                    <th class="sortable-header" data-key="name" style="text-align: left;">Pet Name</th>
                    <th>Rarity</th>
                    <th>Year</th>
                    <th>Reg Count</th>
                    <th>Neon Count</th>
                    <th>Mega Count</th>
                    <th>Reg Value (RP)</th>
                    <th>Neon Value (RP)</th>
                    <th>Mega Value (RP)</th>
                    <th>Total Pet Value (RP)</th>
                </tr>
            </thead>
            <tbody>
    `;

    ownedPets.forEach(pet => {
        const counts = petCounts[pet.name] || { regular: 0, neon: 0, mega: 0 };
        const regCount = counts.regular || 0;
        const neonCount = counts.neon || 0;
        const megaCount = counts.mega || 0;
        
        const regVal = pet['Regular Value'] || 0;
        const neonVal = pet['Neon Value'] || 0;
        const megaVal = pet['Mega Value'] || 0;
        
        const petTotalValue = 
            (regCount * regVal) + 
            (neonCount * neonVal) + 
            (megaCount * megaVal);
            
        totalInventoryValue += petTotalValue;

        // Apply visual styling based on ownership
        const rowClass = (regCount + neonCount + megaCount) > 0 ? 'owned-pet-row' : '';

        tableHTML += `<tr class="${rowClass}">`;
        
        // Image
        tableHTML += `<td><img src="${pet.image_url}" onerror="this.onerror=null;this.src='https://placehold.co/40x40/FF5722/white?text=X'" alt="${pet.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"></td>`;
        
        // Pet Details
        tableHTML += `<td style="text-align: left; font-weight: 600;">${pet.name}</td>`;
        tableHTML += `<td>${pet.rarity}</td>`;
        tableHTML += `<td>${pet.year || '—'}</td>`;
        
        // Counts
        tableHTML += `<td>${regCount}</td>`;
        tableHTML += `<td>${neonCount}</td>`;
        tableHTML += `<td>${megaCount}</td>`;

        // Values
        tableHTML += `<td>${formatForDisplay('Value', regVal)}</td>`;
        tableHTML += `<td>${formatForDisplay('Value', neonVal)}</td>`;
        tableHTML += `<td>${formatForDisplay('Value', megaVal)}</td>`;
        
        // Total Value for this pet
        tableHTML += `<td style="font-weight: bold; color: #4CAF50;">${formatForDisplay('Value', petTotalValue)}</td>`;

        tableHTML += `</tr>`;
    });
    
    tableHTML += `
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="10" style="text-align: right; font-weight: bold; font-size: 1.2em; padding-top: 15px;">TOTAL INVENTORY VALUE:</td>
                    <td style="font-weight: bold; font-size: 1.2em; color: #007bff; padding-top: 15px;">${formatForDisplay('Value', totalInventoryValue)} RP</td>
                </tr>
            </tfoot>
        </table>
    `;

    inventoryContainer.innerHTML = tableHTML;
}


/**
 * Logic specific to the Trend Analyzer tab.
 */
function loadTrendTab() {
    if (globalPetData.length === 0) {
        document.getElementById(TREND_RESULTS_ID).innerHTML = '<p>No current pet data available to calculate trends. Please ensure data is loaded in the Value Analysis tab.</p>';
        return;
    }
    
    document.getElementById(TREND_RESULTS_ID).innerHTML = '<p>Calculating trends...</p>';
    calculateTrendData(globalPetData, historySnapshots);
}


// --- EVENT HANDLERS ---

function handleValueHeaderClick(e) {
    const columnKey = e.currentTarget.dataset.key;
    
    if (currentSort.column === columnKey) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = columnKey;
        currentSort.direction = 'desc';
    }
    
    // Re-render the data with the new sort
    applyFiltersAndSort(globalPetData, showTradeRecommendations, handleValueHeaderClick);
}

function handleValueFilterChange() {
    applyFiltersAndSort(globalPetData, showTradeRecommendations, handleValueHeaderClick);
}

function handleTrendFilterChange() {
    // Only apply filters (no re-calculation needed)
    applyTrendFiltersAndSort();
}

function clearAdvancedFilter() {
    resetAdvancedFilterControls(ADV_COLUMN_ID, ADV_CONDITION_ID, ADV_VALUE_ID);
    // Re-render to clear the filter effect
    handleValueFilterChange(); 
}

function clearTrendAdvancedFilter() {
    resetAdvancedFilterControls(TREND_ADV_COLUMN_ID, TREND_ADV_CONDITION_ID, TREND_ADV_VALUE_ID);
    // Re-render to clear the filter effect
    handleTrendFilterChange(); 
}

function showTradeRecommendations(e) {
    const petName = e.currentTarget.dataset.petName;
    const pet = globalPetData.find(p => p.name === petName);
    
    if (!pet) {
        document.getElementById('recommendation-details').innerHTML = `<p>Error: Could not find data for ${petName}.</p>`;
        return;
    }
    
    // --- INVENTORY COUNTER LOGIC ---
    const allCounts = loadPetCounts();
    // Default to { regular: 0, neon: 0, mega: 0 } if no entry exists
    const currentCounts = allCounts[petName] || { regular: 0, neon: 0, mega: 0 }; 
    
    // 1. Generate Counter HTML
    const counterHTML = generateCounterHTML(petName, currentCounts);
    
    // 2. Generate the recommendations content (from trade_logic.mjs)
    const recContentHTML = generateTradeRecommendations(pet, globalPetData);
    
    const detailsContainer = document.getElementById('recommendation-details');
    
    // 3. Prepend counter HTML and append recommendations
    detailsContainer.innerHTML = counterHTML + recContentHTML;
    
    // 4. Attach event listeners to the new counter buttons
    detailsContainer.querySelectorAll('.count-btn').forEach(button => {
        // Remove existing listeners to prevent duplication
        button.removeEventListener('click', handleCounterButtonClick);
        button.addEventListener('click', handleCounterButtonClick);
    });
    // --- END INVENTORY COUNTER LOGIC ---

    // Show the modal
    document.getElementById(TRADE_REC_ID).style.display = 'block';
}

function closeTradeRecommendations() {
    document.getElementById(TRADE_REC_ID).style.display = 'none';
}


// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Data Load
    loadData();

    // 2. Set up event listeners

    const refreshDataButton = document.getElementById(REFRESH_DATA_BUTTON_ID);
    if(refreshDataButton) {
        refreshDataButton.addEventListener('click', loadData);
    }
    
    // Value Analysis Tab listeners
    const rarityFilter = document.getElementById(RARITY_FILTER_ID);
    if(rarityFilter) rarityFilter.addEventListener('change', handleValueFilterChange);
    
    const nameFilter = document.getElementById(NAME_FILTER_ID);
    if(nameFilter) nameFilter.addEventListener('input', handleValueFilterChange);
    
    // Apply/Clear buttons for the Advanced Filter
    const applyFilterBtn = document.getElementById(APPLY_FILTER_BUTTON_ID);
    if(applyFilterBtn) applyFilterBtn.addEventListener('click', handleValueFilterChange);
    
    const clearFilterBtn = document.getElementById(CLEAR_FILTER_BUTTON_ID);
    if(clearFilterBtn) clearFilterBtn.addEventListener('click', clearAdvancedFilter);
    
    const closeRecBtn = document.getElementById('close-rec-button');
    if(closeRecBtn) closeRecBtn.addEventListener('click', closeTradeRecommendations);
    
    // 3. Trend Analysis Tab listeners 
    const trendSelector = document.getElementById(TREND_PERIOD_SELECTOR_ID);
    if(trendSelector) {
        trendSelector.addEventListener('change', () => {
            // Re-calculate data and render if the trend tab is active
            if (document.getElementById(TAB_TREND_ANALYSIS).style.display === 'block') {
                loadTrendTab(); 
            }
        });
    }
    
    const trendRarityFilter = document.getElementById(TREND_RARITY_FILTER_ID);
    if(trendRarityFilter) trendRarityFilter.addEventListener('change', handleTrendFilterChange);
    
    const trendNameFilter = document.getElementById(TREND_NAME_FILTER_ID);
    if(trendNameFilter) trendNameFilter.addEventListener('input', handleTrendFilterChange);
    
    // Apply/Clear buttons for the Trend Advanced Filter 
    const trendApplyFilterBtn = document.getElementById(TREND_APPLY_FILTER_BUTTON_ID);
    if(trendApplyFilterBtn) trendApplyFilterBtn.addEventListener('click', handleTrendFilterChange);
    
    const trendClearFilterBtn = document.getElementById(TREND_CLEAR_FILTER_BUTTON_ID);
    if(trendClearFilterBtn) trendClearFilterBtn.addEventListener('click', clearTrendAdvancedFilter);
});