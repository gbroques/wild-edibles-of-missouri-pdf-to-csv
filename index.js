const fs = require('fs');

const wildEdibles = JSON.parse(fs.readFileSync('WildEdibles.json'));
const pages = wildEdibles.formImage.Pages;

// White flowering edibles section starts on page 7
const startPage = 7;
let currentSection = '';
for (let i = startPage; i < 11; i++) {
    const page = pages[i];
    const sectionTitleTextObjects = filterSectionTitleTextObjects(page);
    if (sectionTitleTextObjects.length > 0) {
        currentSection = fromTextObjectsToText(sectionTitleTextObjects);
        const logMessage = `SECTION: ${currentSection}`;
        console.log(logMessage);
        console.log(logMessage.split('').map(() => '=').join(''));
    } else {
        const indexOfPageTitle = findIndexOfPageTitleTextObject(page);
        if (indexOfPageTitle !== -1) {
            const pageTitleTextObject = findPageTitleTextObject(page);
            const pageTitleText = fromTextObjectToText(pageTitleTextObject);
            if (indexOfPageTitle === 1) {
                parsePageText(page, pageTitleText, currentSection);
            } else {
                const [firstPage, secondPage] = slicePageIntoTwoPages(page, indexOfPageTitle);
                parsePageText(secondPage, pageTitleText, currentSection);
            }
        } else {
            // Append text to previous page uses
            console.log("No page title found. Appending results to previous page's USES.")
        }
    }
    console.log(''); // print newline
}

function parsePageText(page, title, sectionTitle) {
    const pageText = fromPageToText(page);
    const correctedText = correctText(title, pageText);
    // TODO: Add support for parsing CAUTION
    const pagePattern = /^([0-9]+) (.*) \((.*)\) FLOWERS: (.*) DESCRIPTION: (.*) HABITAT: (.*) LOCATION: (.*) COLLECTION: (.*) USES: ([A-Z][^[A-Z]*) (.*)$/;
    const matchResult = correctedText.match(pagePattern);
    if (matchResult !== null) {
        const [match, pageNumber, name, scientificName, flowers, description, habitat, location, collection, useCategories, uses] = matchResult;
        console.log('Page Number: ', pageNumber);
        console.log('Name: ', name);
        console.log('Scientific Name: ', scientificName);
        console.log('Flowers: ', flowers);
        console.log('Section: ', sectionTitle);
        console.log('Description: ', description);
        console.log('Habitat: ', habitat)
        console.log('Location: ', location);
        console.log('Collection: ', collection);
        console.log('Use Categories: ', useCategories);
        console.log('Uses: ', uses);
    } else {
        console.error('No match found for page.');
    }
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
    switch (title) {
        case 'Chickweed':
            return text.replace('US ES', 'USES');
        default:
            return text;
    }
}
