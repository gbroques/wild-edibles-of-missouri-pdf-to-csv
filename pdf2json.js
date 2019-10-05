/**
 * Convert WildEdibles.pdf to JSON and write to WildEdibles.json
 */
const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser();

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
    fs.writeFile('./WildEdibles.json', JSON.stringify(pdfData));
    console.log('WildEdibles.json created!');
});
pdfParser.loadPDF('./WildEdibles.pdf');
