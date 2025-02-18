const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("출석랭킹")
        .setDescription("출석랭킹을 확인합니다."),
    run: async ({ interaction }) => {
        db.all("SELECT * FROM users ORDER BY point DESC", async (err, row) => {
            if (err) {
                console.error("Database error:", err);
                return interaction.reply("데이터베이스 오류가 발생했습니다.");
            }

            if (!row) {
                return interaction.reply(`랭크 데이터가 없습니다.`);
            } else {
                var Embed = new EmbedBuilder()
                    .setTitle("출석랭킹")
                    .setColor(0x00FF00);

                for (let user of row) {
                    var msg = '';
                    if (1 == 0) {
                        msg = `<@${user.userid}>\n**${user.point}P / ${user.ccnum}회 출석**\n**${u}일 연속출석 중!**`;
                    } else {
                        msg = `<@${user.userid}>\n**${user.point}P / ${user.ccnum}회 출석**`;
                    }

                    Embed.addFields({ name: '', value: msg });
                }

                interaction.reply({ embeds: [Embed] });
            }
        });
    },
};
