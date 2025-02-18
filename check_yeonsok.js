const fs = require('fs');
const jsonpath = './log.json';

function convertToDate(dateStr) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6) - 1;  // 월은 0부터 시작하므로 -1을 해줍니다.
    const day = dateStr.substring(6, 8) -1;
    return new Date(year, month, day);
}

function isNextDay(date1, date2) {
    date1.setDate(date1.getDate() + 1);
    return date1.getTime() === date2.getTime();
}

function checkyeonsok(userid) {
    return new Promise((resolve, reject) => {
        fs.readFile(jsonpath, 'utf8', (err, data) => {
            if (err) {
                reject("파일을 읽는 중 오류 발생: " + err);
                return;
            }

            let jsonData = JSON.parse(data);
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            let users = jsonData.users;
            let firstuserdate = 0;
            let userDate = 0;
            let yonsok = 0;

            for (let user of users) {
                if (user.userid == userid) {
                    firstuserdate = convertToDate(user.date);
                    break;
                }
            }

            for (let user of users) {
                if (user.userid == userid) {
                    userDate = convertToDate(user.date);
                    if (userDate.getTime() == firstuserdate.getTime()) {
                        continue;
                    }
                    if (isNextDay(userDate, firstuserdate)) {
                        console.log(`${userDate.getTime()} == ${firstuserdate.getTime()} (${userid})`);
                        yonsok++;
                    }
                }
            }

            if (userDate.getTime() != currentDate.getTime()) {
                console.log(`${userDate.getTime()} != ${currentDate.getTime()} (${userid})`);
                yonsok = 0;
            }

            resolve(yonsok);  // yonsok 값 반환
        });
    });
}

module.exports = checkyeonsok;
