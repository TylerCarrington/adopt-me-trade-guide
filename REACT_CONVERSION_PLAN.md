# Adopt Me Pet Value Tracker - React Conversion Plan

## Project Analysis

### Current Architecture
**Tech Stack:** Vanilla JavaScript (ESM modules), Parcel bundler, HTML/CSS  
**Data Flow:** Event-driven with global state (`globalPetData`, `historySnapshots`)  
**Rendering:** Direct DOM manipulation with Parcel

### Key Functionality to Preserve

1. **Data Fetching & Processing**
   - Scrape pet values from external source via CORS proxy
   - Calculate pet metrics (Neon rates, Mega rates, task counts, weighted gains)
   - Save daily snapshots to localStorage for historical data
   - Load and manage historical data across sessions

2. **Value Analysis Tab**
   - Display filterable/sortable pet data in table
   - Multi-level filtering: by rarity, name search, advanced conditions (>, <, =)
   - Column-based sorting with direction toggle
   - Display pet images, rarity, year, values (Regular/Neon/Mega)
   - Calculated metrics (Neon Rate, Mega Rate, gains, tasks)

3. **Trend Analysis Tab**
   - Calculate historical trends over configurable periods (7, 14, 30 days)
   - Show value change and percentage change for Regular/Neon/Mega
   - Apply same filtering/sorting capabilities as Value Analysis
   - Identify and highlight price increases/decreases

4. **Trade Recommendations Modal**
   - Generate trade recommendations for selected pet
   - Three categories: Value Swap Trades, Profitable Selling (Neon), Profitable Selling (Mega)
   - Show bundle recommendations with profit calculations
   - Display current pet value and weighted neon gain metrics

5. **Inventory Controls** (Recently Added)
   - Per-pet inventory tracking (Regular, Neon, Mega quantities)
   - Store inventory in localStorage separately from value data
   - Plus/minus buttons with bounds (0-100) in trade modal
   - Persistent across sessions

6. **State Management**
   - Global pet data array
   - Historical snapshots for trend analysis
   - Filter state: rarity, name, advanced filter criteria
   - Sort state: current column, direction
   - Modal open/close state

---

## React Conversion Strategy

### Phase 1: Project Setup

#### 1.1 Update Build Configuration
- **Replace:** Parcel with Vite (better ESM support, faster HMR)
- **Install dependencies:**
  ```bash
  npm install react react-dom
  npm install -D vite @vitejs/plugin-react
  npm install -D sass postcss
  ```

#### 1.2 Update `package.json`
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x"
  }
}
```

#### 1.3 Create Vite Configuration
- Create `vite.config.js` with React plugin
- Create `index.html` entry point (minimal)
- Create `src/main.jsx` as React app entry

---

### Phase 2: Component Architecture

#### 2.1 High-Level Component Tree
```
<App>
  ├── <Header>
  │   ├── Title
  │   └── RefreshButton
  ├── <TabContainer>
  │   ├── <TabButtons>
  │   └── <TabContent>
  │       ├── <ValueAnalysisTab>
  │       │   ├── <FilterSection>
  │       │   │   ├── RarityFilter
  │       │   │   ├── NameSearch
  │       │   │   └── AdvancedFilters
  │       │   └── <PetTable>
  │       │       └── PetRow (with Trade Rec button)
  │       ├── <TrendAnalysisTab>
  │       │   ├── <TrendFilterSection>
  │       │   └── <TrendTable>
  │       └── <InventoryTab>
  │           └── InventoryList
  └── <TradeRecommendationsModal>
      ├── CloseButton
      ├── PetHeader
      └── <TradeRecommendationsSections>
          ├── InventoryControls
          ├── ValueSwapSection
          ├── NeonSellSection
          └── MegaSellSection
```

#### 2.2 Component Breakdown

**Stateful Components (using hooks):**
- `App.jsx` - Main component, manages global state, data loading
- `TabContainer.jsx` - Manages active tab state
- `FilterSection.jsx` - Manages filter inputs
- `PetTable.jsx` - Manages sort state, renders rows
- `TradeRecommendationsModal.jsx` - Manages modal visibility & inventory controls

**Presentational Components:**
- `Header.jsx`
- `TabButtons.jsx`
- `ValueAnalysisTab.jsx`
- `TrendAnalysisTab.jsx`
- `InventoryTab.jsx`
- `PetRow.jsx`
- `TrendRow.jsx`
- `TradeRecommendationsContent.jsx`
- `InventoryControls.jsx`
- Various filter components

---

### Phase 3: State Management

#### 3.1 Use React Hooks (Context API + useReducer)
```javascript
// src/context/PetDataContext.jsx
export const PetDataContext = React.createContext();

// Initial state structure
const initialState = {
  petData: [],
  historySnapshots: [],
  isLoading: false,
  error: null,
  filters: {
    rarity: 'All',
    name: '',
    advancedColumn: 'None',
    advancedCondition: 'None',
    advancedValue: ''
  },
  sort: {
    column: 'Regular Value',
    direction: 'desc'
  },
  trendPeriod: 7,
  inventory: {} // petName -> { regular, neon, mega }
};

// Reducer actions
const reducer = (state, action) => {
  switch(action.type) {
    case 'SET_PET_DATA':
      return { ...state, petData: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_FILTER':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'UPDATE_SORT':
      return { ...state, sort: action.payload };
    case 'UPDATE_INVENTORY':
      return { ...state, inventory: { ...state.inventory, ...action.payload } };
    // ... other actions
  }
};
```

#### 3.2 Keep Business Logic Separate
- **Core utilities remain as-is:**
  - `scraper.mjs` - Data fetching (no changes needed)
  - `calculator.mjs` - Metric calculations (no changes needed)
  - `trade_logic.mjs` - Trade recommendations (no changes needed)
  - `trend_analyzer.mjs` - Trend calculations (minor refactor to remove DOM access)
  - `history_tracker.mjs` - localStorage management (no changes needed)

---

### Phase 4: File Structure

```
/workspaces/adopt-me-trade-guide/
├── src/
│   ├── main.jsx                    # Entry point
│   ├── App.jsx                     # Root component
│   ├── App.scss                    # Global styles
│   ├── index.html                  # HTML template (minimal)
│   │
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── TabContainer.jsx
│   │   ├── TabButtons.jsx
│   │   ├── ValueAnalysisTab.jsx
│   │   ├── TrendAnalysisTab.jsx
│   │   ├── InventoryTab.jsx
│   │   ├── FilterSection.jsx
│   │   ├── TrendFilterSection.jsx
│   │   ├── PetTable.jsx
│   │   ├── PetRow.jsx
│   │   ├── TrendTable.jsx
│   │   ├── TrendRow.jsx
│   │   ├── TradeRecommendationsModal.jsx
│   │   ├── TradeRecommendationsContent.jsx
│   │   ├── InventoryControls.jsx
│   │   └── ...
│   │
│   ├── context/
│   │   └── PetDataContext.jsx      # Global state with useReducer
│   │
│   ├── hooks/
│   │   ├── usePetData.js           # Custom hook for data fetching
│   │   ├── useFilters.js           # Custom hook for filter logic
│   │   └── useInventory.js         # Custom hook for inventory management
│   │
│   ├── utils/
│   │   ├── scraper.mjs             # (unchanged)
│   │   ├── calculator.mjs           # (unchanged)
│   │   ├── constants.mjs            # (unchanged)
│   │   ├── trade_logic.mjs          # (unchanged - pure functions)
│   │   ├── trend_analyzer.mjs       # (refactor: remove DOM access)
│   │   └── history_tracker.mjs      # (unchanged)
│   │
│   └── styles/
│       ├── index.scss
│       ├── components.scss
│       └── variables.scss
│
├── public/
│   └── (static assets)
├── index.html                       # Root HTML (template)
├── vite.config.js
├── package.json
└── REACT_CONVERSION_PLAN.md        # This file
```

---

### Phase 5: Detailed Implementation Steps

#### Step 1: Initialize React Project
1. Update `package.json` with new dependencies
2. Create `vite.config.js`
3. Create `index.html` template with single div for React
4. Create `src/main.jsx` entry point
5. Move `index.html` content to be generated by React

#### Step 2: Create Context & Hooks
1. Implement `PetDataContext` with useReducer
2. Create `usePetData()` hook for fetching and managing pet data
3. Create `useFilters()` hook for filter logic
4. Create `useInventory()` hook for inventory state and localStorage

#### Step 3: Create Layout Components
1. `Header.jsx` - Simple title + refresh button
2. `TabContainer.jsx` - Manage tab state
3. `TabButtons.jsx` - Tab navigation

#### Step 4: Implement Value Analysis Tab
1. `FilterSection.jsx` - All filter inputs
2. `PetTable.jsx` - Render table with sorting
3. `PetRow.jsx` - Individual pet row with trade rec button
4. Wire filters to update context
5. Wire sorting to update sort state

#### Step 5: Implement Trade Recommendations Modal
1. `TradeRecommendationsModal.jsx` - Modal container
2. `InventoryControls.jsx` - +/- buttons with localStorage sync
3. `TradeRecommendationsContent.jsx` - Display recommendations HTML (can use `dangerouslySetInnerHTML` initially)
4. Close button handler
5. Connect modal visibility to context

#### Step 6: Implement Trend Analysis Tab
1. Refactor `trend_analyzer.mjs` to remove DOM access
2. `TrendFilterSection.jsx` - Period selector + filters
3. `TrendTable.jsx` - Render trend data
4. `TrendRow.jsx` - Individual trend row
5. Wire trend calculation to context

#### Step 7: Implement Inventory Tab
1. `InventoryTab.jsx` - Simple layout (WIP placeholder)
2. Option to integrate with inventory controls from modal

#### Step 8: Styling Migration
1. Move inline styles to SCSS modules
2. Create CSS-in-JS solution or SCSS files
3. Maintain visual consistency with current design

#### Step 9: Testing & Refinement
1. Test data loading and caching
2. Verify localStorage persistence
3. Test all filter combinations
4. Test modal open/close with inventory
5. Test trend calculations
6. Performance optimization (memoization, lazy loading)

---

### Phase 6: Key Refactoring Points

#### 6.1 trend_analyzer.mjs Refactor
**Current:** DOM manipulation via `document.getElementById`  
**After:** Pure functions that receive state, return data

```javascript
// BEFORE (current)
export function calculateTrendData(currentPets, history) {
  const periodSelector = document.getElementById(TREND_PERIOD_SELECTOR_ID);
  const period = periodSelector.value; // ❌ Direct DOM access
  // ...
  renderTrendResults(data); // ❌ DOM manipulation
}

// AFTER (React)
export function calculateTrendData(currentPets, history, period) {
  // Pure calculation
  // Returns data object
  return { trendData, calculatedMetrics };
}
```

#### 6.2 Component Lifecycle Management
- **Data loading** → useEffect hook
- **Filter updates** → useCallback + context
- **Sort updates** → useCallback + context
- **Modal state** → useState for visibility
- **Inventory persistence** → useEffect with localStorage

#### 6.3 Props vs Context
- **Pass via props:** Immediate children, form inputs
- **Use context:** Global state (petData, filters, sort, inventory)

---

### Phase 7: Performance Optimization

1. **Memoization:**
   - `React.memo()` for expensive components (PetRow, TrendRow)
   - `useMemo()` for filter/sort calculations

2. **Code Splitting:**
   - Lazy load modal component
   - Lazy load trend tab content

3. **Virtualization (optional):**
   - For large pet datasets, use react-window for table virtualization

---

### Phase 8: Migration Path (Minimal Disruption)

**Recommended incremental approach:**

1. ✅ Set up React project with Vite (Phase 1)
2. ✅ Create App shell with tab structure (Phase 2-3)
3. ✅ Migrate Value Analysis tab first (Phase 4-5)
4. ✅ Verify data fetching works correctly
5. ✅ Add modal & inventory controls
6. ✅ Migrate Trend Analysis tab
7. ✅ Migrate Inventory tab (placeholder)
8. ✅ Polish styling & performance
9. ✅ Remove old `index.mjs` and `ui_renderer.mjs`

---

## Functionality Checklist

### Core Features
- [x] Data fetching from external source
- [x] Pet metrics calculation
- [x] Historical data storage (localStorage)
- [x] Daily snapshots
- [x] Value Analysis table with filtering
- [x] Value Analysis sorting (multi-column)
- [x] Trade recommendations modal
- [x] Trend Analysis with period selection
- [x] Inventory tracking with localStorage
- [x] Modal with inventory +/- controls
- [x] Error handling and loading states
- [x] Responsive UI

### Quality Metrics
- ✓ No functionality lost
- ✓ Same data persistence (localStorage)
- ✓ Same performance characteristics
- ✓ Improved code organization (component-based)
- ✓ Better type safety (can add TypeScript later)
- ✓ Easier testing (pure components)
- ✓ Better developer experience (HMR with Vite)

---

## Estimated Effort

| Phase | Task | Effort |
|-------|------|--------|
| 1 | Project Setup | 1-2 hours |
| 2-3 | State Management & Hooks | 2-3 hours |
| 4 | Layout Components | 1-2 hours |
| 5 | Value Analysis Tab | 3-4 hours |
| 6 | Trade Modal & Inventory | 2-3 hours |
| 7 | Trend Analysis Tab | 2-3 hours |
| 8 | Inventory Tab | 1 hour |
| 9 | Styling & Polish | 2-3 hours |
| 10 | Testing & Refinement | 2-3 hours |
| **Total** | | **16-23 hours** |

---

## Risk Mitigation

1. **Data Loss:** Keep all utility files unchanged; only UI changes
2. **Performance:** Use React DevTools Profiler to optimize
3. **Browser Compatibility:** Test in target browsers
4. **localStorage:** Verify inventory/history data persists correctly
5. **External API:** Keep scraper logic unchanged (proven working)

---

## Post-Migration Improvements

Once React migration is complete, consider:

1. **TypeScript migration** - Type safety for better DX
2. **Testing suite** - Unit & integration tests with Vitest
3. **Component library** - Extract reusable components
4. **State management** - Zustand or Jotai if context becomes complex
5. **API integration** - Replace fetch + CORS proxy with backend API
6. **Mobile responsiveness** - Improve mobile UI/UX
