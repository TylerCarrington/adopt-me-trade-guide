import { 
    MAX_TRADE_SLOTS, INTERCHANGEABLE_RANGE, OPPONENT_WIN_MARGIN, USER_WIN_MARGIN, 
    MIXED_BUNDLE_COUNTS, TRADE_REC_ID, TASK_COUNTS 
} from './constants.mjs';
import { formatForDisplay } from './calculator.mjs';

// Define the new, lower discount for the opponent when the user is selling.
// A 2% opponent advantage means the maximum received bundle value (maxReceiveValue) 
// will be the sale value divided by 1.02.
const OPPONENT_SELL_ADVANTAGE = 1.02; 

/**
 * Calculates the required number of reference pets (or the simple bundle) to meet a target value.
 */
function calculateSimpleOfferBundle(requiredTargetValue, refPet) {
    const refValue = refPet['Regular Value'];
    const maxPets = MAX_TRADE_SLOTS;

    if (isNaN(refValue) || refValue <= 0) {
        return { petBundle: [], totalValue: 0, petCount: 0, isPossible: false, requiredPets: 0 };
    }

    const requiredPets = Math.ceil(requiredTargetValue / refValue);
    const totalValue = requiredPets * refValue;
    const isPossible = requiredPets <= maxPets;

    return { 
        petBundle: [{ name: refPet.name, count: requiredPets, value: refValue }],
        totalValue: totalValue, 
        petCount: requiredPets,
        isPossible: isPossible,
        requiredPets: requiredPets
    };
}

/**
 * Finds high-value target pets for the user to trade *for* (Cross-Pet Acquisition).
 * Returns grouped trades.
 * NOTE: This function is preserved but is no longer called in generateTradeRecommendations.
 */
function getTopTargetPets(globalPetData, refPet, targetType = 'Neon Value') {
    const refValue = refPet['Regular Value'];
    if (isNaN(refValue) || refValue <= 0) return [];

    // Max value we can offer (12 pets * refValue)
    const maxAffordableValue = refValue * MAX_TRADE_SLOTS / OPPONENT_WIN_MARGIN; 
    
    // Calculate the required pet count for an acquisition (Target Value * 1.05)
    const getRequiredCount = (targetValue) => {
        const requiredOfferValue = targetValue * OPPONENT_WIN_MARGIN;
        return Math.ceil(requiredOfferValue / refValue);
    };

    const targetPets = globalPetData
        .filter(pet => {
            const targetValue = pet[targetType];
            // Target must be non-NaN, not the reference pet, and affordable with the max offer.
            return !isNaN(targetValue) && pet.name !== refPet.name && targetValue <= maxAffordableValue;
        })
        .sort((a, b) => b[targetType] - a[b[targetType]]); // Sort by highest Target Value

    // Group by required pet count
    const groupedTrades = targetPets.reduce((acc, pet) => {
        const requiredCount = getRequiredCount(pet[targetType]);
        
        if (requiredCount > MAX_TRADE_SLOTS || requiredCount < 2) return acc;
        
        if (!acc[requiredCount]) {
            acc[requiredCount] = {
                requiredCount,
                targetValue: pet[targetValue],
                offerValue: requiredCount * refValue,
                targets: []
            };
        }
        acc[requiredCount].targets.push(pet.name);
        return acc;
    }, {});
    
    // Convert back to a sortable array
    return Object.values(groupedTrades).sort((a, b) => a.requiredCount - b.requiredCount).slice(0, 5);
}

/**
 * Finds all similar-value pets with better flipping potential (Value Swap/Interchangeable).
 */
function getTargetValueSwaps(globalPetData, refPet) {
    const refValue = refPet['Regular Value'];
    const refWeightedGain = refPet['Weighted Neon Gain'];
    if (isNaN(refValue) || refValue <= 0) return [];

    const lowerBound = refValue * (1 - INTERCHANGEABLE_RANGE);
    const upperBound = refValue * (1 + INTERCHANGEABLE_RANGE);

    return globalPetData
        .filter(pet => {
            const petValue = pet['Regular Value'];
            const petWeightedGain = pet['Weighted Neon Gain'];
            
            // 1. Similar Regular Value
            const isSimilarValue = !isNaN(petValue) && petValue >= lowerBound && petValue <= upperBound;
            
            // 2. Better Flipping Potential (Higher Weighted Neon Gain)
            const isBetterGain = !isNaN(petWeightedGain) && petWeightedGain > refWeightedGain * 1.01; // Must be at least 1% better
            
            return pet.name !== refPet.name && isSimilarValue && isBetterGain;
        })
        .sort((a, b) => b['Weighted Neon Gain'] - a['Weighted Neon Gain']); // Sort by best gain
}

/**
 * Generates an alternative mixed-pet bundle for a target value using a fixed count of the reference pet.
 * NOTE: This function is preserved but is no longer called in generateTradeRecommendations.
 */
function generateAlternativeBundle(targetValue, refPet, interchangeablePets, fixedRefCount) {
    const refValue = refPet['Regular Value'];
    
    if (fixedRefCount >= MAX_TRADE_SLOTS) return null;
    if (fixedRefCount * refValue >= targetValue * OPPONENT_WIN_MARGIN) return null; 

    const currentOfferValue = fixedRefCount * refValue;
    const requiredOfferValue = targetValue * OPPONENT_WIN_MARGIN;
    const remainingValueNeeded = requiredOfferValue - currentOfferValue;
    const remainingSlots = MAX_TRADE_SLOTS - fixedRefCount;

    if (remainingValueNeeded <= 0.01) return null;
    
    // Find the single best interchangeable pet (IP) to fill the gap.
    // Use an IP that is NOT the reference pet, but is near its value.
    const ipsExcludingRef = interchangeablePets.filter(p => p.name !== refPet.name && p['Regular Value'] > 0);
    const bestIP = ipsExcludingRef.find(p => p['Regular Value'] > 0) || refPet; // Fallback to refPet if no other IP exists
    
    const ipValue = bestIP['Regular Value'];
    
    // If the best IP is the reference pet itself, and we already capped at 12, this is not a mixed alternative.
    if (bestIP.name === refPet.name && fixedRefCount === MAX_TRADE_SLOTS) return null;
    
    const ipCount = Math.ceil(remainingValueNeeded / ipValue);
    
    if (ipCount <= 0 || fixedRefCount + ipCount > MAX_TRADE_SLOTS) return null; 

    // Calculate the actual offer value and return the bundle.
    const petBundle = [];

    // 1. Add fixed count of reference pet
    if (fixedRefCount > 0) {
        petBundle.push({ name: refPet.name, count: fixedRefCount, value: refValue });
    }
    
    // 2. Add calculated count of IP
    if (ipCount > 0) {
        // If the best IP is the reference pet, just add the count to the existing entry
        if (bestIP.name === refPet.name) {
            if (petBundle.length === 0) { // Should only happen if fixedRefCount was 0
                 petBundle.push({ name: refPet.name, count: ipCount, value: refValue });
            } else {
                 petBundle[0].count += ipCount;
            }
        } else {
            petBundle.push({ name: bestIP.name, count: ipCount, value: ipValue });
        }
    }
    
    const totalValue = petBundle.reduce((sum, item) => sum + item.count * item.value, 0);
    const totalPetCount = petBundle.reduce((sum, item) => sum + item.count, 0);

    return {
        petBundle,
        totalValue,
        petCount: totalPetCount,
        ipName: bestIP.name,
    };
}


/**
 * Generates profitable bundles to receive when selling an aged pet.
 */
function findProfitableSellBundles(soldPet, targetType, globalPetData) {
    const saleValue = soldPet[`${targetType} Value`];
    if (isNaN(saleValue) || saleValue <= 0) return [];

    // The maximum value the received bundle should have to give the opponent a 2% win (discount for them)
    const maxReceiveValue = saleValue / OPPONENT_SELL_ADVANTAGE; 
    
    const tradeBundles = [];
    
    // --- Phase 1: Check specific low-count trades (1, 2, 4 pets) for ease of finding. ---
    const TARGET_COUNTS = [1, 2, 4];
    
    for (const petCount of TARGET_COUNTS) {
        // Find the single pet with the best WNG that can be received at this exact count.
        // We calculate the maximum affordable value for this pet count (must be <= maxReceiveValue).
        const maxAffordablePetValue = maxReceiveValue / petCount;
        
        const profitablePetsForCount = globalPetData
            .filter(pet => {
                const petRegValue = pet['Regular Value'];
                const petNeonValue = pet['Neon Value'];

                if (isNaN(petRegValue) || petRegValue <= 0 || isNaN(petNeonValue)) return false;

                // 1. Must be affordable at this count
                if (petRegValue > maxAffordablePetValue) return false;

                // 2. Calculate "Full Cycle Profit"
                const tradesNeeded = 4 / petCount;
                if (tradesNeeded !== Math.floor(tradesNeeded)) return false; // Skip if we can't complete a neon (e.g., 3x, 5x)

                const totalSaleValue = soldPet.NeonValue * tradesNeeded;
                const agedValue = petNeonValue; // We make 1 Neon of the target pet
                const futureProfit = agedValue - totalSaleValue;
                
                // 3. Must be profitable or very close to break-even (>= -0.05 RP loss)
                return futureProfit >= -0.05; 
            })
            // Sort by the pet that offers the highest Neon Value for the *full cycle profit*
            .sort((a, b) => b['Neon Value'] - a['Neon Value']);

        // Pick the top 2 most profitable pets for this fixed count
        profitablePetsForCount.slice(0, 2).forEach(bundlePet => {
            const petRegValue = bundlePet['Regular Value'];
            const petNeonValue = bundlePet['Neon Value'];

            const tradesNeeded = 4 / petCount;
            const finalCount = petCount;
            const bundleValue = finalCount * petRegValue;
            
            const totalSaleValue = soldPet.NeonValue * tradesNeeded;
            const agedValue = petNeonValue; 
            const futureProfit = agedValue - totalSaleValue;

            tradeBundles.push({
                petName: bundlePet.name,
                count: finalCount,
                bundleValue: bundleValue,
                // The next three values are calculated for the *Full Cycle* (4 trades needed) 
                // but displayed as the "Future Profit Potential" for clarity.
                agedNeonCount: 1, // Full cycle result is always 1 Neon of the target pet
                agedValue: agedValue,
                futureProfit: futureProfit,
                wng: bundlePet['Weighted Neon Gain'],
                isFixedCount: true, // Mark as a requested fixed-count trade
                tradesToComplete: tradesNeeded
            });
        });
    }

    // --- Phase 2: Find the overall top profitable trades (usually high count 8-12 pets). ---
    const topBundles = [];
    for (const bundlePet of globalPetData) {
        const petRegValue = bundlePet['Regular Value'];
        const petNeonValue = bundlePet['Neon Value'];
        
        if (isNaN(petRegValue) || petRegValue <= 0 || isNaN(petNeonValue)) continue;
        
        // 1. Calculate max count based on value and slot limit
        let maxCountBySlots = MAX_TRADE_SLOTS;
        let maxCountByValue = Math.floor(maxReceiveValue / petRegValue);
        const finalCount = Math.min(maxCountBySlots, maxCountByValue);
        
        // Must be a bundle large enough to make at least 1 Neon (count >= 4)
        if (finalCount < 4) continue; 
        
        const bundleValue = finalCount * petRegValue;
        const agedNeonCount = Math.floor(finalCount / 4);
        const agedValue = agedNeonCount * petNeonValue;
        
        // Future Profit is the value of the resulting aged pets MINUS the value of the pet we sold.
        const futureProfit = agedValue - saleValue;

        // Only recommend if the future profit is substantial (> 10% of the sale value)
        if (futureProfit > saleValue * 0.10) {
            // Only add this if it's not a count we already generated in Phase 1 (4x)
            const isDuplicate = tradeBundles.some(b => b.petName === bundlePet.name && b.count === finalCount);
            if (!isDuplicate || finalCount > 4) {
                 topBundles.push({
                    petName: bundlePet.name,
                    count: finalCount,
                    bundleValue: bundleValue,
                    agedNeonCount: agedNeonCount,
                    agedValue: agedValue,
                    futureProfit: futureProfit,
                    wng: bundlePet['Weighted Neon Gain'],
                    tradesToComplete: 1
                });
            }
        }
    }
    
    // Combine, sort by future profit, and ensure we only keep the absolute top.
    const combinedBundles = [...tradeBundles, ...topBundles];

    // Sort by: 1. Count (1, 2, 4 first), 2. Highest Future Profit.
    return combinedBundles.sort((a, b) => {
        const countOrder = [1, 2, 4].indexOf(a.count) - [1, 2, 4].indexOf(b.count);
        if (countOrder !== 0) {
             // If both are fixed (1,2,4), sort by the fixed order. If one is fixed and the other isn't, put fixed first.
             if (a.isFixedCount && b.isFixedCount) return countOrder;
             if (a.isFixedCount) return -1;
             if (b.isFixedCount) return 1;
        }
        return b.futureProfit - a.futureProfit; // Otherwise sort by profit
    });
}


/**
 * Generates and *returns* the HTML string for all trade recommendations for the clicked pet.
 * The calling function (in index.mjs) is responsible for rendering the HTML and showing the modal.
 * * 🟢 FIX 1: Changed signature to match the call in index.mjs
 * 🟢 FIX 2: Removed redundant and erroneous pet lookup (globalPetData.find)
 * 🟢 FIX 3: Changed function to RETURN the HTML string instead of manipulating the DOM (matching index.mjs expectation)
 * * @param {Object} refPet - The already found pet object being analyzed.
 * @param {Array} globalPetData - The global array of all pet data.
 * @returns {string} The generated HTML content.
 */
export function generateTradeRecommendations(refPet, globalPetData) {
    
    // Safety check: if refPet is null/undefined (which index.mjs should prevent)
    if (!refPet) {
        return '<p>Error: Pet data not found.</p>';
    }
    
    // Get all Interchangeable Pets (IPs) with better WNG for alternatives and 1:1 swaps.
    const ips = getTargetValueSwaps(globalPetData, refPet); 
    let html = '';
    let tradesGenerated = 0;
    
    // The main Trade Recommendation header is in index.html, but we will add the pet-specific context here.
    html += `<h2>Recommendations for ${refPet.name}</h2>`;
    html += `<p style="font-size: 1.1em; font-weight: bold; margin-bottom: 20px;">Current Value: ${formatForDisplay('Regular Value', refPet['Regular Value'])} RP</p>`;


    // --- 1. VALUE SWAP TRADES (Optimize for Flipping) ---
    const valueSwaps = ips;
    
    html += '<div class="rec-section"><h3>🔄 Value Swap Trades (Maximize Aging Profit)</h3>';
    html += `<p>Trade **1x ${refPet.name}** for 1x of a pet with a similar regular value (±${(INTERCHANGEABLE_RANGE * 100).toFixed(0)}%) but a **better Weighted Neon Gain**.</p>`;
    
    if (valueSwaps.length === 0) {
        html += `<p>No similar-value pets found with significantly better flipping potential.</p>`;
    } else {
        html += `<p>Your Current Weighted Neon Gain: <strong>${formatForDisplay('Weighted Gain', refPet['Weighted Neon Gain'])}</strong></p>`;
        
        // Group swaps by the Weighted Neon Gain value for a cleaner list
        const groupedSwaps = valueSwaps.reduce((acc, pet) => {
            const wng = formatForDisplay('Weighted Gain', pet['Weighted Neon Gain']);
            if (!acc[wng]) {
                acc[wng] = [];
            }
            acc[wng].push(pet.name);
            return acc;
        }, {});

        // Sort groups by WNG (highest first)
        const sortedWNGs = Object.keys(groupedSwaps).sort((a, b) => parseFloat(b) - parseFloat(a));

        sortedWNGs.forEach(wng => {
            const targetsList = groupedSwaps[wng].join(', ');
            const gainDifference = parseFloat(wng) - refPet['Weighted Neon Gain'];
            
            html += `
                <div class="trade-box" style="background-color: #f0fff0;">
                    <h3>Weighted Neon Gain: ${wng} (+${formatForDisplay('Weighted Gain', gainDifference)} vs ${refPet.name})</h3>
                    <p>Trade 1:1 for: <strong>${targetsList}</strong></p>
                </div>
            `;
            tradesGenerated++;
        });
    }
    html += '</div>';


    // --- 2. PROFITABLE SELLING TRADES (Maximize Value Received for Aging) ---
    html += '<div class="rec-section"><h3>💰 Profitable Selling Trades (Maximize Value Received for Aging)</h3>';
    // --- TEXT UPDATED FOR 2% ADVANTAGE ---
    html += `<p>Sell your aged ${refPet.name} for a bundle of high-profit pets to age up next. We calculate a value that gives the opponent a **2% gain** on the ${refPet.name} value.</p>`;
    
    const neonSellBundles = findProfitableSellBundles(refPet, 'Neon', globalPetData);
    const megaSellBundles = findProfitableSellBundles(refPet, 'Mega', globalPetData);
    
    // NEON SELLING
    if (neonSellBundles.length > 0) {
        const saleValue = refPet['Neon Value'];
        html += `<div class="trade-box" style="background-color: #e6ffe6;"><h4>Sell 1x Neon ${refPet.name} (Value: ${formatForDisplay('Value', saleValue)} RP)</h4>`;
        // --- TARGET VALUE UPDATED FOR 2% ADVANTAGE ---
        html += `<p>Target: Receive a bundle worth up to ${formatForDisplay('Value', saleValue / OPPONENT_SELL_ADVANTAGE)} RP.</p>`;

        // Group bundles by their outcome (Future Profit and Aged Neon Count)
        const groupedBundles = neonSellBundles.reduce((acc, bundle) => {
            // Group by Future Profit (RP) and the number of pets received (count)
            const key = `${bundle.futureProfit.toFixed(2)}~${bundle.agedNeonCount}~${bundle.count}~${bundle.tradesToComplete}`;
            if (!acc[key]) {
                acc[key] = {
                    bundles: [],
                    futureProfit: bundle.futureProfit,
                    agedNeonCount: bundle.agedNeonCount,
                    agedValue: bundle.agedValue,
                    saleValue: saleValue,
                    count: bundle.count, 
                    tradesToComplete: bundle.tradesToComplete
                };
            }
            acc[key].bundles.push(bundle);
            return acc;
        }, {});
        
        // Sort groups to put 1x, 2x, 4x first, then highest profit.
        const sortedGroups = Object.values(groupedBundles).sort((a, b) => {
            const countOrder = [1, 2, 4].indexOf(a.count) - [1, 2, 4].indexOf(b.count);
            if (countOrder !== 0) {
                 return countOrder;
            }
            return b.futureProfit - a.futureProfit; // Otherwise sort by profit
        });

        sortedGroups.forEach(group => {
            const gainPercentage = (group.futureProfit / (group.saleValue * group.tradesToComplete) * 100).toFixed(0);
            
            // --- FIX: Correctly pluralize "trade" ---
            const tradeText = group.tradesToComplete === 1 ? 'trade' : 'trades';

            // Start of a group box for a specific profit tier
            html += `<div style="margin-top: 15px; padding: 10px; border: 1px solid #c3e6cb; border-radius: 5px;">`;

            // Display the offer/profit once for the whole group
            html += `<p style="font-weight: bold; color: #28a745; font-size: 1.1em;">
                → Future Profit Potential: ${formatForDisplay('Value', group.futureProfit)} RP 
                <span style="font-size: 0.9em;">[${group.tradesToComplete} ${tradeText} $\\to$ 1 Neon pet | ${gainPercentage}% return]</span>
            </p>`;
            
            html += `<p style="margin-top: 10px;"><strong>Offer (Per Trade):</strong> 1x Neon ${refPet.name}</p>`;
            
            // List all interchangeable receive options
            html += `<p style="font-weight: bold; margin-top: 5px;">Receive Options (Count: ${group.count}):</p>`;

            group.bundles.forEach(bundle => {
                html += `<p style="margin-left: 20px; margin-bottom: 5px; font-size: 0.95em;">
                    - **${bundle.count}x ${bundle.petName}** (Bundle Value: ${formatForDisplay('Value', bundle.bundleValue)} RP)
                </p>`;
            });
            
            html += `</div>`;
            tradesGenerated++; // Count each group as a generated trade
        });
        html += `</div>`;
    }
    
    // MEGA SELLING
    if (megaSellBundles.length > 0) {
        const saleValue = refPet['Mega Value'];
        html += `<div class="trade-box" style="background-color: #fff0e6;"><h4>Sell 1x Mega ${refPet.name} (Value: ${formatForDisplay('Value', saleValue)} RP)</h4>`;
        // --- TARGET VALUE UPDATED FOR 2% ADVANTAGE ---
        html += `<p>Target: Receive a bundle worth up to ${formatForDisplay('Value', saleValue / OPPONENT_SELL_ADVANTAGE)} RP.</p>`;

        // Group bundles by their outcome (Future Profit and Aged Neon Count)
        const groupedBundles = megaSellBundles.reduce((acc, bundle) => {
            const key = `${bundle.futureProfit.toFixed(2)}~${bundle.agedNeonCount}~${bundle.count}~${bundle.tradesToComplete}`;
            if (!acc[key]) {
                acc[key] = {
                    bundles: [],
                    futureProfit: bundle.futureProfit,
                    agedNeonCount: bundle.agedNeonCount,
                    agedValue: bundle.agedValue,
                    saleValue: saleValue,
                    count: bundle.count,
                    tradesToComplete: bundle.tradesToComplete
                };
            }
            acc[key].bundles.push(bundle);
            return acc;
        }, {});
        
        // Sort groups to put 1x, 2x, 4x first, then highest profit.
        const sortedGroups = Object.values(groupedBundles).sort((a, b) => {
            const countOrder = [1, 2, 4].indexOf(a.count) - [1, 2, 4].indexOf(b.count);
            if (countOrder !== 0) {
                 return countOrder;
            }
            return b.futureProfit - a.futureProfit; // Otherwise sort by profit
        });

        sortedGroups.forEach(group => {
            // Note: The Mega calculation is currently only for 1 trade, but the formula is robust.
            const gainPercentage = (group.futureProfit / (group.saleValue * group.tradesToComplete) * 100).toFixed(0);
            
            // --- FIX: Correctly pluralize "trade" ---
            const tradeText = group.tradesToComplete === 1 ? 'trade' : 'trades';

            // Start of a group box for a specific profit tier
            html += `<div style="margin-top: 15px; padding: 10px; border: 1px solid #c3e6cb; border-radius: 5px;">`;

            // Display the offer/profit once for the whole group
            html += `<p style="font-weight: bold; color: #28a745; font-size: 1.1em;">
                → Future Profit Potential: ${formatForDisplay('Value', group.futureProfit)} RP 
                <span style="font-size: 0.9em;">[${group.tradesToComplete} ${tradeText} $\\to$ ${group.agedNeonCount} Neon pets | ${gainPercentage}% return]</span>
            </p>`;
            
            html += `<p style="margin-top: 10px;"><strong>Offer (Per Trade):</strong> 1x Mega ${refPet.name}</p>`;
            
            // List all interchangeable receive options
            html += `<p style="font-weight: bold; margin-top: 5px;">Receive Options (Count: ${group.count}):</p>`;

            group.bundles.forEach(bundle => {
                html += `<p style="margin-left: 20px; margin-bottom: 5px; font-size: 0.95em;">
                    - **${bundle.count}x ${bundle.petName}** (Bundle Value: ${formatForDisplay('Value', bundle.bundleValue)} RP)
                </p>`;
            });
            
            html += `</div>`;
            tradesGenerated++; 
        });
        html += `</div>`;
    }
    
    if (neonSellBundles.length === 0 && megaSellBundles.length === 0) {
        html += `<p>No highly profitable bundles (where the future profit is at least 10% of the aged ${refPet.name} value) could be found that fit within the 12-pet limit.</p>`;
    }

    html += '</div>';

    if (tradesGenerated === 0) {
        return '<p>Trade data is unavailable for this pet (missing Neon/Mega values) or its value is too low to generate practical trades within the 12-pet limit.</p>';
    } else {
        return html;
    }
}