const neatCsv = require('neat-csv');
const fs = require('fs');

const readFile = (nameFile) => {
    try {
        let data = fs.readFileSync(`${__dirname}/${nameFile}`);

        return neatCsv(data);
    } catch (err) {
        console.error(err);
    }
};

exports.readFile = readFile;