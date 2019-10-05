const fs = require('fs');

const wildEdibles = JSON.parse(fs.readFileSync('WildEdibles.json'));

// White flowering edibles start on page 8
const startPage = 8;
const pagePattern = /^([0-9]+) (.*) \((.*)\) FLOWERS: (.*) DESCRIPTION: (.*) HABITAT: (.*) LOCATION: (.*) COLLECTION: (.*) USES: ([A-Z][^[A-Z]*) (.*)$/;

const page = wildEdibles.formImage.Pages[startPage];
const pageText = fromPageToText(page);
const matchResult = pageText.match(pagePattern);
const [match, pageNumber, name, scientificName, flowers, description, habitat, location, collection, useCategories, uses] = matchResult;

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

function fromPageToText(page) {
    return page.Texts.map(text => decodeURIComponent(text.R[0].T).trim()).join(' ')
}