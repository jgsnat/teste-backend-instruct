const neatCsv = require('neat-csv');
const fs = require('fs');
const moment = require('moment');

const readFile = (nameFile) => {
    try {
        let data = fs.readFileSync(`${__dirname}/${nameFile}`);

        return neatCsv(data);
    } catch (err) {
        console.error(err);
    }
};

const dateValidation = (date) => {
    let partsDate = date.split('-');

    if (partsDate.length === 2) {
        let year = new Date().getFullYear();
        let month = partsDate[0];
        let day = partsDate[1];
        let time = moment(`${year}-${month}-${day}`, "YYYY-MM-DD", true);

        return time.isValid();
    } else if (partsDate.length === 3) {
        let year = partsDate[0]
        let month = partsDate[1]
        let day = partsDate[2]
        let time = moment(`${year}-${month}-${day}`, "YYYY-MM-DD", true);

        return time.isValid();
    } else {
        return false;
    }
}

const meeusAlgorithm = (year) => {
    // more information: https://pt.wikipedia.org/wiki/C%C3%A1lculo_da_P%C3%A1scoa#Algoritmo_de_Meeus/Jones/Butcher
    a = year % 19;
    b = parseInt(year/100);
    c = year % 100;
    d = parseInt(b/4);
    e = b % 4;
    f = parseInt((b + 8) / 25);
    g = parseInt((b -f + 1) / 3);
    h = (19 * a + b - d - g + 15) % 30;
    i = parseInt(c/4);
    k = c % 4;
    l = (32 + 2 * e + 2 * i - h - k) % 7;
    m = parseInt((a + 11 * h + 22 * l) / 451);
    month = parseInt((h + l - 7 * m + 114) / 31);
    day = 1 + (h + l - 7 * m + 114) % 31;

    return `${year}-${month}-${day}`;
}

exports.readFile = readFile;
exports.dateValidation = dateValidation;
exports.meeusAlgorithm = meeusAlgorithm;