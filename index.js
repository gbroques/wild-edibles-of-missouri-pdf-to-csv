const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');

const wildEdibles = JSON.parse(fs.readFileSync('WildEdibles.json'));
const pages = wildEdibles.formImage.Pages;

// White flowering edibles section starts on page 7
const startPage = 7;
let currentSection = '';
const edibles = [];
for (let i = startPage; i < 70; i++) {
    const page = pages[i];
    const sectionTitleTextObjects = filterSectionTitleTextObjects(page);
    if (sectionTitleTextObjects.length > 0) {
        currentSection = fromTextObjectsToText(sectionTitleTextObjects);
        console.log(currentSection);
        console.log(currentSection.split('').map(() => '=').join(''));
    } else {
        const indexOfPageTitle = findIndexOfPageTitleTextObject(page);
        if (indexOfPageTitle !== -1) {
            const pageTitleTextObject = findPageTitleTextObject(page);
            const pageTitleText = fromTextObjectToText(pageTitleTextObject);
            let result;
            if (indexOfPageTitle === 1) {
                result = parsePageText(page, pageTitleText, currentSection);
            } else {
                const [firstPage, secondPage] = slicePageIntoTwoPages(page, indexOfPageTitle);
                result = parsePageText(secondPage, pageTitleText, currentSection);
                appendPageToPreviousPageBackgroundInformation(firstPage);
            }
            if (result !== null) {
                edibles.push(result);
            }
        } else {
            appendPageToPreviousPageBackgroundInformation(page);
        }
    }
}

function appendPageToPreviousPageBackgroundInformation(page) {
    const textObjectsWithoutPageNumber = page.Texts.slice(1);
    const text = fromTextObjectsToText(textObjectsWithoutPageNumber);
    edibles[edibles.length-1].backgroundInformation += ' ' + text;
}

console.log('\nCreating WildEdibles.csv'); 
fs.writeFileSync('./WildEdibles.csv', convertArrayToCSV(edibles));

function parsePageText(page, title, sectionTitle) {
    const pageText = fromPageToText(page);
    const correctedText = correctText(title, pageText);
    const pagePattern = /^([0-9]+) (.*) \((.*)\) FLOWERS: (.*) DESCRIPTION: (.*) HABITAT: (.*) LOCATION: (.*) COLLECTION: (.*) USES: ([A-Z][^[A-Z]*)( CAUTION: (See page [0-9]{3}|[\w\.?\s]+\w\.))? (.*)$/;
    const matchResult = correctedText.match(pagePattern);
    if (matchResult === null) {
        const pageNumber = correctedText.split(' ')[0];
        console.error(`${pageNumber} No match found for ${title}.`);
        return null;
    }
    const [match, pageNumber, name, scientificName, flowers, description, habitat, location, collection, uses, cautionLabel, cautionText, backgroundInformation] = matchResult;
    console.log(pageNumber, name);
    return {
        pageNumber,
        name,
        scientificName,
        flowers,
        sectionTitle,
        description,
        habitat,
        location,
        collection,
        uses,
        caution: cautionText,
        backgroundInformation
    };
}

function slicePageIntoTwoPages(page, sliceIndex) {
    const firstPageTextObjects = page.Texts.slice(0, sliceIndex);
    const pageNumberTextObject = Object.assign({}, firstPageTextObjects[0]);
    const firstPage = fromTextObjectsToPage(firstPageTextObjects)
    const secondPage = fromTextObjectsToPage([pageNumberTextObject, ...page.Texts.slice(sliceIndex)])
    return [firstPage, secondPage];
}

function fromTextObjectsToPage(textObjects) {
    return {Texts: textObjects};
}

function fromPageToText(page) {
    return fromTextObjectsToText(page.Texts);
}

function fromTextObjectsToText(textObjects) {
    return textObjects.map(fromTextObjectToText).join(' ');
}

function fromTextObjectToText(textObject) {
    return decodeURIComponent(textObject.R[0].T).trim();
}

function findPageTitleTextObject(page) {
    return page.Texts.find(isTextObjectPageTitle);
}

function filterSectionTitleTextObjects(page) {
    return page.Texts.filter(isTextObjectSectionTitle);
}

function findIndexOfPageTitleTextObject(page) {
    return page.Texts.findIndex(isTextObjectPageTitle);
}

function isTextObjectPageTitle(textObject) {
    return isTextObjectEqualToStyles(textObject, [0,18.425,1,0]);
}

function isTextObjectSectionTitle(textObject) {
    return isTextObjectEqualToStyles(textObject, [0,22.425,1,1]);
}

function isTextObjectEqualToStyles(textObject, textObjectStyles) {
    return JSON.stringify(textObject.R[0].TS) === JSON.stringify(textObjectStyles);
}

function correctText(title, text) {
    const textWithPageNumberCorrect = fixPageNumber(text);
    switch (title) {
        case 'Chickweed':
            return textWithPageNumberCorrect.replace('US ES', 'USES');
        case 'Shepherd’s Purse': // Located: instead of LOCATION:
            return textWithPageNumberCorrect.replace('Located', 'LOCATION');
        case 'Bitter Cress':
            // Bitter Cress doesn't have all fields like FLOWERS, DESCRIPTION, HABITAT, etc.
            // So we choose to ignore it
            return textWithPageNumberCorrect.replace('Bitter Cress (Cardamine pennsylvanica, C. parvi flora) ', '');
        case 'Ho': // Honewort
            return textWithPageNumberCorrect.replace('Ho newort', 'Honewort').replace('Descriptions', 'DESCRIPTION');
        case 'Persimmons': // No COLLECTION field listed for Persimmons
            return textWithPageNumberCorrect.replace('USES', 'COLLECTION:  USES')
        case 'Black Haw Berries': // First letter of Uses not capitalized
            return textWithPageNumberCorrect.replace('field nibble', 'Field Nibble'); // First use needs to be capitalized
        case 'Pussy Toes': // No HABITAT field listed for Pussy Toes
            return textWithPageNumberCorrect.replace('LOCATION', 'HABITAT:  LOCATION').replace('gum', 'Gum');
        case 'Bellwort': // Located: instead of LOCATION: and no USES field listed for Bellwort
            return textWithPageNumberCorrect.replace('Located', 'LOCATION').replace('roots Bellwort', 'roots USES: Bellwort');
        default:
            return textWithPageNumberCorrect;
    }
}

function fixPageNumber(text) {
    const match = text.match(/See page ([0-9] ?[0-9] ?[0-9])/);
    if (match === null) {
        return text;
    }
    const seePageNumberText = match[0];
    const pageNumber = match[1];
    const pageNumberWithoutSpaces =  pageNumber.replace(' ', '');
    const correctedSeePageNumberText = seePageNumberText.replace(pageNumber, pageNumberWithoutSpaces);
    return text.replace(seePageNumberText, correctedSeePageNumberText);
}