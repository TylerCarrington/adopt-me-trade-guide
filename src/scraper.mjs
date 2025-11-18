import { CORS_PROXY, TARGET_URL, BASE_URL } from './constants.mjs';

/**
 * Extracts pet name, rarity, and year from an image alt attribute string.
 */
function extractPetDetails(altText) {
    const parts = altText.split(' - ');
    let name = altText;
    let rarity = 'Unknown';
    
    if (parts.length >= 2) {
        name = parts[0].trim();
        rarity = parts[1].split(' from ')[0].trim();
    }
    
    let year = '';
    const yearMatch = altText.match(/(\d{4})/); 
    if (yearMatch) {
        year = yearMatch[0];
    }
    
    return { name, rarity, year };
}

/**
 * Parses the raw HTML string to extract and group all pet values.
 */
function extractPetValues(htmlString) {
    const petData = {};
    const parser = new DOMParser();
    const wrapper = `<div>${htmlString}</div>`;
    const doc = parser.parseFromString(wrapper, 'text/html');

    const listItems = doc.querySelectorAll('.liclass');

    for (const item of listItems) {
        const valueElement = item.querySelector('.ctr');

        if (!valueElement) continue;

        const rawValueText = valueElement.textContent.replace('RP', '').trim();
        const numberMatch = rawValueText.match(/(\d+\.?\d*)/); 
        if (!numberMatch || numberMatch.length < 1) continue;
        const numberString = numberMatch[1];
        
        const value = parseFloat(numberString);

        if (isNaN(value)) continue;

        const petImages = item.querySelectorAll('.column img');

        for (const imgElement of petImages) {
            if (!imgElement.alt || !imgElement.src) continue;
            
            const { name, rarity, year } = extractPetDetails(imgElement.alt);
            const image_url = BASE_URL + imgElement.getAttribute('src').replace(/\\/g, '/');
            
            if (!name) continue;

            const parentItem = imgElement.closest('.list-group-item');

            let petType = 'Regular';
            if (parentItem.querySelector('.bottom-right-mega')) {
                petType = 'Mega';
            } else if (parentItem.querySelector('.bottom-right-neon')) {
                petType = 'Neon';
            }

            if (!petData[name]) {
                petData[name] = {
                    name, rarity, regular: null, neon: null, mega: null, image_url, year 
                };
            }

            if (petType === 'Neon') {
                if (petData[name].neon === null || value > petData[name].neon) {
                     petData[name].neon = value;
                }
            } else if (petType === 'Mega') {
                if (petData[name].mega === null || value > petData[name].mega) {
                     petData[name].mega = value;
                }
            } else { // Regular
                if (petData[name].regular === null || value > petData[name].regular) {
                     petData[name].regular = value;
                }
            }
        }
    }

    return Object.values(petData);
}

/**
 * Main function to fetch and parse the raw data.
 */
export async function fetchAndParseData() {
    const fullURL = CORS_PROXY + encodeURIComponent(TARGET_URL);
    
    const response = await fetch(fullURL);
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}. The CORS proxy may be blocked or the target site may be down.`);
    }
    
    const htmlSource = await response.text();
    
    if (!htmlSource.includes('liclass')) {
         throw new Error("HTML content received, but no pet data (liclass elements) was found. The target page structure may have changed.");
    }

    return extractPetValues(htmlSource);
}