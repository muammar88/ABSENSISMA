const { sequelize, Op, Tag, Post, Setting } = require("../db/models");
var moment = require("moment");
const { promises } = require("fs");

const helper = {};

helper.convertDate = async (d) => {
    let day = d.getDate();
    let year = d.getFullYear();
    let month = d.getMonth() + 1;

    console.log("====YYYYYYY===============");
    console.log(month.toString().length);
    console.log("====YYYYYYY===============");
    return (
        year +
        "-" +
        (month.toString().length == 1
            ? "0" + month.toString()
            : month.toString()) +
        "-" +
        (day.toString().length == 1 ? "0" + day.toString() : day.toString())
    );
};

// get local date
helper.LocalDates = async () => {
    var d = new Date(),
        y = d.getFullYear(),
        m = d.getMonth();

    var lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
        .toLocaleString("id-ID")
        .split(",");

    var lastDt;
    if (lastDay[1].includes("PM") || lastDay[1].includes("AM")) {
        lastDt = lastDay[0].split("/")[1];
    } else {
        lastDt = lastDay[0].split("/")[0];
    }

    lastDt =
        lastDt.toString().length == 1
            ? "0" + lastDt.toString()
            : lastDt.toString();

    var local = d.toLocaleString("id-ID");
    var dayName = d.toLocaleString("id-ID", {
        weekday: "long",
        hourCycle: "h24",
        hour12: false,
    });

    var monthName = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];

    var datetime = local.split(",");
    var dates = datetime[0].split("/");

    if (datetime[1].includes("PM") || datetime[1].includes("AM")) {
        var dateTrim = datetime[1].trim();
        var specificdatetime = dateTrim.split(" ");

        if (dateTrim.includes("PM")) {
            var times = specificdatetime[0].split(":");
            var jam = 12 + parseInt(times[0]);
            jam = jam.toString();
        } else {
            var times = specificdatetime[0].split(":");
            var jam = times[0];
        }

        var hours = jam.trim();
        var minutes = times[1];
        var second = times[2];

        var year = dates[2].replace(",", "");
        var monthIndex = dates[0];
        var month =
            dates[0].toString().length == 1
                ? "0" + dates[0].toString()
                : dates[0].toString();

        var dayIndex = dates[1];
        var day =
            dates[1].toString().length == 1
                ? "0" + dates[1].toString()
                : dates[1].toString();
    } else {
        var times = datetime[1].split(".");
        var hours = times[0].trim();
        var minutes = times[1];
        var second = times[2];

        var year = dates[2].replace(",", "");
        var monthIndex = dates[1];
        var month =
            dates[1].toString().length == 1
                ? "0" + dates[1].toString()
                : dates[1].toString();

        var dayIndex = dates[0];
        var day =
            dates[0].toString().length == 1
                ? "0" + dates[0].toString()
                : dates[0].toString();
    }

    var firstDate = year + "-" + month + "-01";
    var lastDate = year + "-" + month + "-" + lastDt;

    var date_slash = year + "/" + month + "/" + day;
    var date_dash = year + "-" + month + "-" + day;
    var time_colon = hours + ":" + minutes + ":" + second;

    return {
        year,
        month,
        monthIndex,
        day,
        dayIndex,
        dayName,
        hours,
        minutes,
        second,
        firstDate,
        lastDate,
        lastDay: lastDt,
        monthName: monthName[monthIndex - 1],
        dateSlash: date_slash,
        dateDash: date_dash,
        dateDashTime: date_dash + " " + time_colon,
    };
};

helper.parsingDate = async (date) => {
    const d = new Date(date);
    let day = d.getDate();
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let hours = d.getHours();
    let minutes = d.getMinutes();
    let seconds = d.getSeconds();

    // console.log("day");
    // console.log(day);
    // console.log("day");
    var monthName = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];
    var monthNameTriCharacter = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MEI",
        "JUN",
        "JUL",
        "AGS",
        "SEP",
        "OKT",
        "NOV",
        "DES",
    ];

    return {
        year,
        month:
            month.toString().length == 1
                ? "0" + month.toString()
                : month.toString(),
        monthIndex: month - 1,
        monthName: monthName[month],
        monthNameTriCharacter: monthNameTriCharacter[month],
        day: day.toString().length == 1 ? "0" + day.toString() : day.toString(),
        hours,
        minutes,
        seconds,
    };
};

// calculate work time
helper.calculateDays = async (startDate, endDate, restStart, restEnd) => {
    const settings = await Setting.findOne({
        where: { setting_name: "jam_kerja" },
    });

    var durasiMasuk = 0;
    if (startDate != "") {
        // menghitung durasi masuk
        var start_date = moment(startDate, "YYYY-MM-DD HH:mm:ss");
        var rest_start = moment(restStart, "YYYY-MM-DD HH:mm:ss");
        var durationMasuk = moment.duration(rest_start.diff(start_date));
        durasiMasuk = durationMasuk.asMinutes();
    }

    var durasiKeluar = 0;
    if (endDate != "") {
        // menghitung durasi keluar
        var rest_end = moment(restEnd, "YYYY-MM-DD HH:mm:ss");
        var end_date = moment(endDate, "YYYY-MM-DD HH:mm:ss");
        var durationKeluar = moment.duration(end_date.diff(rest_end));
        durasiKeluar = durationKeluar.asMinutes();
    }

    // count
    var total = durasiMasuk + durasiKeluar; // menjumlah total durasi masuk dengan keluar
    var r = total % settings.setting_value;
    // 45
    var s = total - r;
    var t = s / settings.setting_value;
    // return
    return t.toString() + "hr" + r.toString() + "minutes";
};

helper.convertDate_1 = async (date) => {
    const d = new Date(date);
    let day = d.getDate();
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let hours = d.getHours();
    let minutes = d.getMinutes();
    let seconds = d.getSeconds();

    return (
        year +
        "-" +
        (month.toString().length == 1 ? "0" + month : month) +
        "-" +
        (day.toString().length == 1 ? "0" + day : day) +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds
    );
};

helper.hitungWaktuKerja = async (tgl, masuk, keluar) => {
    var parsing = await helper.parsingDate(tgl);
    var tanggal = parsing.year + "-" + parsing.month + "-" + parsing.day;

    var start_date = masuk != null ? tanggal + " " + masuk + ":00" : "";
    var end_date = keluar != null ? tanggal + " " + keluar + ":00" : "";
    var rest_start = tanggal + " " + "12:30:00";
    var rest_end =
        tanggal +
        " " +
        ((await helper.getDayName(tanggal)) == "jum'at"
            ? "14:00:00"
            : "13:30:00");

    totalKerja = await helper.calculateDays(
        start_date,
        end_date,
        rest_start,
        rest_end
    );

    return totalKerja;
};

helper.getDayName = async (date) => {
    let d = new Date(date);
    var days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jum'at",
        "Sabtu",
    ];
    return days[d.getDay()];
};

helper.getDayName2 = async (dateStr, locale) => {
    var date = new Date(dateStr);
    var x = date.toLocaleDateString(locale, { weekday: "long" });
    return x;
};

helper.getMonthDateRange = async (year, month) => {
    var moment = require("moment");
    var firstDay = new Date(year, month - 1, 1);
    var startDate = moment(firstDay).startOf("month").format("YYYY-MM-DD");
    var endDate = moment(startDate).endOf("month").format("YYYY-MM-DD");
    return { start_date: startDate, end_date: endDate };
};

helper.enumerateDaysBetweenDates = async (
    startDate,
    endDate,
    LiburMingguan,
    Izin
) => {
    let date = [];
    while (moment(startDate) <= moment(endDate)) {
        if (LiburMingguan != undefined) {
            var day = moment(startDate).format("dddd");
            if (!LiburMingguan.includes(day)) {
                date.push(startDate);
            }
        } else {
            date.push(startDate);
        }
        startDate = moment(startDate).add(1, "days").format("YYYY-MM-DD");
    }
    return date;
};

// helper.enumerateDaysBetweenDates = function (startDate, endDate, skipDate) {
//     var dates = [];

//     var currDate = moment(startDate).startOf("day");
//     var lastDate = moment(endDate).startOf("day");

//     console.log("xxxxxx1");
//     console.log(currDate);
//     console.log(lastDate);
//     console.log("xxxxxx1");

//     var n = 1;

//     while (currDate.add(1, "days").diff(lastDate) < 0) {
//         // console.log(currDate.toDate());
//         dates.push(currDate.clone().toDate());
//         console.log(n);
//         n++;
//     }

//     return dates;
// };

// helper.enumerateDaysBetweenDates = function (startDate, endDate) {
//     var now = startDate.clone(),
//         dates = [];

//     while (now.isSameOrBefore(endDate)) {
//         dates.push(now.format("M/D/YYYY"));
//         now.add(1, "days");
//     }

//     console.log("xxxxxx1");
//     console.log(dates);
//     console.log("xxxxxx1");
//     return dates;
// };

module.exports = helper;
