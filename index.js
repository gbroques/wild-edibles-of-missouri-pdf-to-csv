const fs = require('fs');

const wildEdibles = JSON.parse(fs.readFileSync('WildEdibles.json'));

// White flowering edibles start on page 8
// Chickweed on page 17 is an example of where a new edible starts part-way down a page.
const startPage = 9 + 8;

const page = wildEdibles.formImage.Pages[startPage];

const indexOfPageTitle = findIndexOfPageTitle(page);
const pageTitleTextObject = findPageTitleTextObject(page);
const title = textObjectToText(pageTitleTextObject)

if (indexOfPageTitle === 1) {
    parsePageText(page, title);
} else if (indexOfPageTitle === -1) {
    // Append text to previous page uses
    console.log("No page title found. Appending results to previous page's USES.")
} else {
    const [firstPage, secondPage] = slicePageIntoTwoPages(page, indexOfPageTitle);
    // TODO: Get page number from firstPage and prepend it to text of secondPage
    parsePageText(secondPage, title);
}

function slicePageIntoTwoPages(page, sliceIndex) {
    const firstPage = fromTextObjectsToPage(page.Texts.slice(0, sliceIndex))
    const secondPage = fromTextObjectsToPage(page.Texts.slice(sliceIndex))
    return [firstPage, secondPage];
}

function fromTextObjectsToPage(textObjects) {
    return {Texts: textObjects};
}

function parsePageText(page, title) {
    const pageText = fromPageToText(page);
    const correctedText = correctText(title, pageText);
    const pagePattern = /^([0-9]+) (.*) \((.*)\) FLOWERS: (.*) DESCRIPTION: (.*) HABITAT: (.*) LOCATION: (.*) COLLECTION: (.*) USES: ([A-Z][^[A-Z]*) (.*)$/;
    const matchResult = correctedText.match(pagePattern);
    if (matchResult !== null) {
        const [match, pageNumber, name, scientificName, flowers, description, habitat, location, collection, useCategories, uses] = matchResult;
        // Page title TS === [0,18.425,1,0]
        console.log('Page Number: ', pageNumber);
        console.log('Name: ', name);
        console.log('Scientific Name: ', scientificName);
        console.log('Flowers: ', flowers);
        console.log('Description: ', description);
        console.log('Habitat: ', habitat);
        console.log('Location: ', location);
        console.log('Collection: ', collection);
        console.log('Use Categories: ', useCategories);
        console.log('Uses: ', uses);
    } else {
        console.error('No match found for page.');
    }
}

function fromPageToText(page) {
    return page.Texts.map(textObjectToText).join(' ')
}
function textObjectToText(textObject) {
    return decodeURIComponent(textObject.R[0].T).trim();
}

function findPageTitleTextObject(page) {
    return page.Texts.find(isTextObjectPageTitle);
}

function findIndexOfPageTitle(page) {
    return page.Texts.findIndex(isTextObjectPageTitle);
}

function isTextObjectPageTitle(textObject) {
    return JSON.stringify(textObject.R[0].TS) === JSON.stringify([0,18.425,1,0]);
}

function correctText(title, text) {
    switch (title) {
        case 'Chickweed':
            return text.replace('US ES', 'USES');
        default:
            return text;
    }
}
