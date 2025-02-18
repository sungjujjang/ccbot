const { SlashCommandBuilder } = require('discord.js');
const pingus = require('pingus');

module.exports = {
	data: new SlashCommandBuilder()
	  .setName("ping")
	  .setDescription("아이피에 핑을 날립니다.")
	  .addStringOption(option =>
		option.setName("ip")
		  .setDescription("ping 할 문자열을 입력하세요.")
		  .setRequired(true)),
	run: ({ interaction }) => {
		const ip = interaction.options.getString("ip");
		pingus.icmp({ host: ip }).then((result) => {
			console.log(result); //결과 출력
			if (result.status === "error") {
				interaction.reply(`\`\`\`${result.error}\`\`\``);
			} else {
				interaction.reply(`\`\`\`${result.time}초, 대상 ${result.host}에게 성공적으로 ping 했습니다.\`\`\``);
			}
		}).catch((err) => {
			console.warn(err);
		});
	},
  };