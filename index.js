const fs = require('fs');
const { convertArrayToCSV } = require('convert-array-to-csv');

const wildEdibles = JSON.parse(fs.readFileSync('WildEdibles.json'));
const pages = wildEdibles.formImage.Pages;

// White flowering edibles section starts on page 7
const startPage = 7;
let currentSection = '';
const edibles = [];
for (let i = startPage; i < 22; i++) {
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
            edibles.push(result);
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
    const pagePattern = /^([0-9]+) (.*) \((.*)\) FLOWERS: (.*) DESCRIPTION: (.*) HABITAT: (.*) LOCATION: (.*) COLLECTION: (.*) USES: ([A-Z][^[A-Z]*)( CAUTION: [\w\s)]+\w\.)? (.*)$/;
    const matchResult = correctedText.match(pagePattern);
    if (matchResult !== null) {
        const [match, pageNumber, name, scientificName, flowers, description, habitat, location, collection, uses, cautionText, backgroundInformation] = matchResult;
        const caution = cautionText === undefined ? '' : cautionText.replace(' CAUTION: ', '');
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
            caution,
            backgroundInformation
        };
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
