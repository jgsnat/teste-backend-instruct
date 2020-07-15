const neatCsv = require('neat-csv');
const fs = require('fs');

const REGEX_CODES = /^\d{2}|\d{7}$/g;
const REGEX_DATES = /^\d{4}-\d{2}-\d{2}|\d{2}-\d{2}$/g;

const readFile = (nameFile) => {
    try {
        let data = fs.readFileSync(`${__dirname}/${nameFile}`);

        return neatCsv(data);
    } catch (err) {
        console.error(err);
    }
};

const codeValidation = (code) => {
    return REGEX_CODES.test(code);
}

const dateValidation = (date) => {
    if (REGEX_DATES.test(date)) {
        let partsDate = date.split('-');

        if (partsDate.length === 2) {
            let year = new Date().getFullYear();
            let month = parseInt(partsDate[0], 10);
            let day = parseInt(partsDate[1], 10);
            let time = new Date(year, month -1, day, 12, 0, 0, 0);

            return month === (time.getMonth()+1) 
                && day === time.getDate()
                && year === time.getFullYear();
        } else if (partsDate.length === 3) {
            let year = parseInt(partsDate[0], 10);
            let month = parseInt(partsDate[1], 10);
            let day = parseInt(partsDate[2], 10);
            let time = new Date(year, month -1, day, 12, 0, 0, 0);

            return month === (time.getMonth()+1) 
                && day === time.getDate()
                && year === time.getFullYear();
        } else {
            return false;
        }
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
exports.codeValidation = codeValidation;
exports.dateValidation = dateValidation;
exports.meeusAlgorithm = meeusAlgorithm;