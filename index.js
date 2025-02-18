const config = require('./config.json');
const { Client, IntentsBitField } = require("discord.js");
const { CommandHandler } = require("djs-commander");
const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

var rank = 0;
var ranked_users = [];
const serverid = '1304973914572718160';
const chid = `1304999046754074626`;
const jsonpath = './log.json';

var interval = setInterval(function () {
  // if 00:00
  var date = new Date();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  if (hours == 0 && minutes == 0 && 1 >= seconds >= 0) {
    rank = 0;
    ranked_users = [];
  }
}, 1 * 1000);

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

function addData(userid, date) {
  // date => YYYYMMDD
  fs.readFile(jsonpath, 'utf8', (err, data) => {
      if (err) {
          console.error("파일을 읽는 중 오류 발생:", err);
          return;
      }
      let jsonData = JSON.parse(data);
      jsonData.users.push({userid : userid, date : date});

      fs.writeFile(jsonpath, JSON.stringify(jsonData, null, 2), (err) => {
          if (err) {
              console.error("파일을 저장하는 중 오류 발생:", err);
              return;
          }
          console.log("새로운 데이터가 추가되었습니다.");
      });
  });
}


new CommandHandler({
	client,
	commandsPath: path.join(__dirname, "commands"),
});

/**
 * 
 * @param {*} userid 
 * @param {*} rank 
 */
function add_user_db(userid, rank) {
  const db = new sqlite3.Database('db.db');

  db.serialize(() => {
      const users = client.guilds.cache.get(serverid)?.memberCount || 0;
      const point = users - rank;
      console.log(`[DB] ${userid}님의 포인트 ${point}P 추가`);

      db.get("SELECT * FROM users WHERE userid = ?", [userid], (err, row) => {
          if (err) {
              console.error("Database error:", err);
              db.close(); // 오류 발생 시 DB 닫기
              return;
          }

          if (!row) {
              // 유저가 없으면 INSERT
              const stmt = db.prepare("INSERT INTO users (userid, point, ccnum) VALUES (?, ?, ?)");
              stmt.run(userid, point, 1, (err) => {
                  if (err) console.error("Insert Error:", err);
                  stmt.finalize(() => db.close()); // finalize 후 DB 닫기
              });
          } else {
              // 유저가 있으면 UPDATE
              const newCcnum = row.ccnum + 1;
              const newPoint = row.point + point;
              const stmt = db.prepare("UPDATE users SET point = ?, ccnum = ? WHERE userid = ?");
              stmt.run(newPoint, newCcnum, userid, (err) => {
                  if (err) console.error("Update Error:", err);
                  stmt.finalize(() => db.close()); // finalize 후 DB 닫기
              });
          }
      });
  });
}

client.on("ready", (client) => {
  console.log(`${client.user.tag} is online.`);
});

client.on("messageCreate", (message) => {
	if (message.author.bot) {
		return;
	}
  if (!(ranked_users.includes(message.author.id)) && message.channel.id == chid) {
    const users = client.guilds.cache.get(serverid)?.memberCount || 0;
    const point = users - rank - 1;
    rank += 1;
    ranked_users.push(message.author.id);
    message.reply(`**${rank}등으로 출석했습니다. +${point}P**`);
    add_user_db(message.author.id, rank);
    // get date YYYYMMDD
    var date = new Date();
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    var datestr = `${year}${month}${day}`;
    console.log(datestr);
    addData(message.author.id, datestr);
  }
	return;
});

process.on('uncaughtException', (err) => {
  console.error("죽지마 ㅠㅠ");
  console.error(err);
});

client.login(config.token);