const neatCsv = require('neat-csv');
const fs = require('fs');
const moment = require('moment');

const readFile = (nameFile) => {
    try {
        const data = fs.readFileSync(`${__dirname}/${nameFile}`);

        return neatCsv(data);
    } catch (err) {
        console.error(err);
    }
};

const dateValidation = (date) => {
    return moment(date, "YYYY-MM-DD", true).isValid();
}

const getDayMonthAndYear = (date) => {
    const partsOfDate = date.split('-');
    const year = partsOfDate[0].trim();
    const month = partsOfDate[1].trim();
    const day = partsOfDate[2].trim();

    return { day, month, year };
}

const comparateDates = (date1, date2) => {
    const {
        day: day1,
        month: month1,
        year: year1
    } = getDayMonthAndYear(date1);

    const {
        day: day2,
        month: month2,
        year: year2
    } = getDayMonthAndYear(date2);

    return (year1 === year2 && month1 === month2 && day1 === day2);    
}

const meeusAlgorithm = (year) => {
    // more information: https://pt.wikipedia.org/wiki/C%C3%A1lculo_da_P%C3%A1scoa#Algoritmo_de_Meeus/Jones/Butcher
    const a = year % 19;
    const b = parseInt(year/100);
    const c = year % 100;
    const d = parseInt(b/4);
    const e = b % 4;
    const f = parseInt((b + 8) / 25);
    const g = parseInt((b -f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = parseInt(c/4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = parseInt((a + 11 * h + 22 * l) / 451);
    const month = parseInt((h + l - 7 * m + 114) / 31);
    const day = 1 + (h + l - 7 * m + 114) % 31;

    return `${year}-${month}-${day}`;
}

exports.readFile = readFile;
exports.dateValidation = dateValidation;
exports.meeusAlgorithm = meeusAlgorithm;
exports.getDayMonthAndYear = getDayMonthAndYear;
exports.comparateDates = comparateDates;