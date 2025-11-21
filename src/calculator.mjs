import { TASK_COUNTS } from './constants.mjs';

/**
 * Performs all necessary calculations and formats the final data, keeping values as numbers.
 */
export function calculatePetMetrics(pets) {
    return pets.map(pet => {
        const regular = pet.regular === null ? NaN : pet.regular;
        const neon = pet.neon === null ? NaN : pet.neon;
        const mega = pet.mega === null ? NaN : pet.mega;

        const neonRate = (!isNaN(neon) && !isNaN(regular) && regular !== 0) ? (neon / regular) : NaN;
        const neonGain = (!isNaN(neon) && !isNaN(regular)) ? (neon - regular * 4) : NaN; 
        const megaRate = (!isNaN(mega) && !isNaN(neon) && neon !== 0) ? (mega / neon) : NaN;
        const megaGain = (!isNaN(mega) && !isNaN(neon)) ? (mega - neon * 4) : NaN; 
        
        const tasks = TASK_COUNTS[pet.rarity] || TASK_COUNTS['Unknown'];
        
        const weightedNeonGain = !isNaN(neonGain) ? (neonGain / tasks) * 100 : NaN;
        const weightedMegaGain = !isNaN(megaGain) ? (megaGain / tasks) * 100 : NaN;
        
        return {
            name: pet.name,
            rarity: pet.rarity,
            year: pet.year,
            image_url: pet.image_url,
            'Regular Value': regular,
            'Neon Value': neon,
            'Mega Value': mega,
            'Neon Rate (N/R)': neonRate,
            'Neon Gain (N-4R)': neonGain,
            'Weighted Neon Gain': weightedNeonGain, 
            'Mega Rate (M/N)': megaRate,
            'Mega Gain (M-4N)': megaGain,
            'Weighted Mega Gain': weightedMegaGain,
            'Tasks': tasks,
        };
    });
}

/**
 * Formats a numeric value for display in the table and recommendations.
 */
export function formatForDisplay(key, val) {
    if (isNaN(val) || val === null) return '—';
    
    if (key.includes('Value') || key.includes('Gain') || key.includes('Rate') || key === 'Tasks') {
        return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
}