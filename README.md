# Wild Edibles of Missouri: PDF to CSV
The goal of this project is to transform a **PDF** copy of [Wild Edibles of Missouri](https://nature.mdc.mo.gov/discover-nature/recipes/wild-edibles-missouri) by Jan Phillips to a **CSV** file.

![Wild Edibles of Missouri Cover](WildEdiblesCover.jpg)

## PDF to JSON
The **Node.js** script `pdf2json.js` transforms [WildEdibles.pdf](WildEdibles.pdf) into [WildEdibles.json](WildEdibles.json) using the [pdf2json](https://www.npmjs.com/package/pdf2json) library.

Usage:
```
node pdf2json.js
```

## JSON to CSV
After the PDF is converted to JSON, the **Node.js** script `index.js` transforms [WildEdibles.json](WildEdibles.json) into [WildEdibles.csv](WildEdibles.csv).

Usage:
```
node index.js
```

## Node.js Version
Tested with Node.js **v8.16.0**.
