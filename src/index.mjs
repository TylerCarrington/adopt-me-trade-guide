import { fetchAndParseData } from './scraper.mjs';
import { calculatePetMetrics } from './calculator.mjs';
import { generateTradeRecommendations } from './trade_logic.mjs';
import { 
    applyFiltersAndSort, populateRarityFilter, 
    populateAdvancedFilterControls, currentSort,
    populateTrendRarityFilter, renderResults, resetAdvancedFilterControls
} from './ui_renderer.mjs';
import { 
    PROCESS_BUTTON_ID, RARITY_FILTER_ID, ADV_COLUMN_ID, TRADE_REC_ID,
    TAB_VALUE_ANALYSIS, TAB_TREND_ANALYSIS, TAB_PET_INVENTORY, ADV_CONDITION_ID, ADV_VALUE_ID,
    TREND_PERIOD_SELECTOR_ID, TREND_RESULTS_ID,
    TREND_NAME_FILTER_ID, TREND_RARITY_FILTER_ID, TREND_ADV_COLUMN_ID,
    TREND_ADV_CONDITION_ID, TREND_ADV_VALUE_ID,
    TREND_APPLY_FILTER_BUTTON_ID, TREND_CLEAR_FILTER_BUTTON_ID, NAME_FILTER_ID,
    APPLY_FILTER_BUTTON_ID, CLEAR_FILTER_BUTTON_ID, RESULTS_CONTAINER_ID,
    // 🟢 NEW CONSTANT IMPORT 🟢
    REFRESH_DATA_BUTTON_ID
} from './constants.mjs';
import { saveSnapshot, loadHistory, getTodayDate } from './history_tracker.mjs'; 
// 🟢 Import new trend logic 🟢
import { calculateTrendData, applyTrendFiltersAndSort, currentTrendSort } from './trend_analyzer.mjs';


// --- GLOBAL STATE ---
let globalPetData = [];
let historySnapshots = [];

// --- UTILITY FUNCTIONS ---
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById(tabId).style.display = 'block';

    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');

    // Load data specific to the tab if necessary
    if (tabId === TAB_TREND_ANALYSIS) {
        loadTrendTab();
    } else if (tabId === TAB_VALUE_ANALYSIS) {
        // Re-render the existing data if we switch back
        applyFiltersAndSort(globalPetData, showTradeRecommendations, handleValueHeaderClick);
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
        if (document.getElementById(TAB_TREND_ANALYSIS).style.display === 'block') {
            loadTrendTab();
        } else {
            applyFiltersAndSort(globalPetData, showTradeRecommendations, handleValueHeaderClick);
        }

    } catch (error) {
        console.error("Critical error during data load:", error);
        updateStatus(`Error: Could not load pet data. ${error.message}. Please try again later.`);
    }
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
    
    // Generate the recommendations content
    const recContent = generateTradeRecommendations(pet, globalPetData);
    document.getElementById('recommendation-details').innerHTML = recContent;
    
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

    // 🟢 NEW: Refresh Data Button Listener 🟢
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
    
    // 3. 🟢 Trend Analysis Tab listeners 🟢
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
    
    // 🟢 Apply/Clear buttons for the Trend Advanced Filter 🟢
    const trendApplyFilterBtn = document.getElementById(TREND_APPLY_FILTER_BUTTON_ID);
    if(trendApplyFilterBtn) trendApplyFilterBtn.addEventListener('click', handleTrendFilterChange);
    
    const trendClearFilterBtn = document.getElementById(TREND_CLEAR_FILTER_BUTTON_ID);
    if(trendClearFilterBtn) trendClearFilterBtn.addEventListener('click', clearTrendAdvancedFilter);
});