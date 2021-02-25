const fs = require('fs');
const importer = require('./Importer.js');
const client = new (require('discord.js').Client)();
client.login(process.env.BOT_TOKEN);

///////PROCESS HANDLER/////////////
process.title = 'GiveawayBot';
fs.writeFileSync('logs/pid.log', '' + process.pid);

//not using the process.on('exit') to be able to call async functions
var exit = () => {
	//do whatever necessary before exit
	client.destroy();
	console.log('Destroyed client. now killing myself ...');
	process.exit();
}
process.on('SIGTERM', () => exit());
process.on('SIGINT', () => exit());

var giveaway;
var awaitMessages = [];

var update = async () => {
	console.log('New client!');
	giveaway = new (importer('Giveaway'))(client, async (channel, userId, time, question, fnOnFinish, param) => {
		await channel.send(question);
		awaitMessages.push({ channel: channel, userId: userId, fnOnFinish: fnOnFinish, param: param });
		setTimeout(() => {
			if (awaitMessages.find(a => a.channel === channel && a.userId === userId)) {
				channel.send('`Aborting due to timeout. Please try again!`');
				awaitMessages = awaitMessages.filter(a => a.channel !== channel && a.userId !== userId);
			}
		}, time);
	});
}

client.on('ready', () => {
	console.log('Logged in as ' + client.user.tag + '.');
	require('ping-a-monitor')('http://192.168.178.44:1122/Giveaway', 600000, () => client.ws.ping, { sendInQuery: true, sentAtStart: true });
	update();
	//setInterval(update, 10000);
});

client.on('message', msg => {
	if (msg.author.bot) return;
	var am = awaitMessages.find(a => a.channel === msg.channel && msg.author.id === a.userId);
	if (am) {
		awaitMessages = awaitMessages.filter(a => a !== am);
		giveaway[am.fnOnFinish](msg, am.param);
		return;
	}
	if (msg.content.startsWith('<@!' + client.user.id + '>') && !giveaway) return msg.reply('Bot in maintainance mode. Try again later!');
	giveaway.onMessage(msg);
});
