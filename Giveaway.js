const importer = require('./Importer.js');
const dbConnector = importer('dbConnector');
const CommandHandler = importer('CommandHandler');

const QUESTIONS = [ 'Where should the giveaway take place (channel)?', 'At what unix timestamp should the giveaway start (default: now)?', 'How long should the Giveaway last? (in days)', 'How many winners?', 'What\'s the prize?' ];

class Giveaway {
	constructor(client, awaitMessages) {
		this.client = client;
		this.awaitMessages = awaitMessages;
		this.dbConnector = new dbConnector();
		this.commandHandler = new CommandHandler(this.dbConnector, awaitMessages, this);
	}

	onMessage(msg) {
		var prefixlength;
		this.dbConnector.getPrefixByGuildId(msg.guild.id).then(prefix => {
			if (msg.content.startsWith('<@!' + this.client.user.id + '>')) prefixlength = ('<@!' + this.client.user.id + '>').length; //ping
			if (msg.content.startsWith(prefix)) prefixlength = prefix.length; //prefix
			if (!prefixlength) return;
			var command = msg.content.substring(prefixlength).split(' ').filter(s => s.length)[0];
			if (!command) return;
			var oCommand = this.commandHandler.getCommand(command);
			if (!oCommand) return msg.reply('Non existant command!');
			var parameters = msg.content.substring(msg.content.indexOf(command) + oCommand.getName().length + 1).split(' ');
			oCommand.execute(msg, parameters);
		});
	}

	select_channel(msg, collected) {
                var channel = this.client.channels.cache.get(msg.content.replace('<#', '').replace('>', ''));
                if (!channel) return msg.channel.send('Not an existing channel!');
                if (channel.guild.id !== collected.guildId) return msg.channel.send('That channel isn\'t even in this guild L-O-L');
		collected.channel = channel;
                this.askNextQuestion(msg, collected);
        }

	select_startIn(msg, collected) {
		var startIn = parseFloat(msg.content) || Date.now();
		msg.channel.send('Ok, giveaway will start on ' + new Date(startIn) + '.');
		collected.startIn = startIn;
		this.askNextQuestion(msg, collected);
	}

	select_winners(msg, collected) {
		var winners = Math.max(parseInt(msg.content) || 1, 1);
		msg.channel.send('Ok, ' + winners + ' discord user can win.');
		collected.winners = winners;
		this.askNextQuestion(msg, collected);
	}

	select_prize(msg, collected) {
		msg.channel.send('Prize will be `' + msg.content + '`');
		collected.prize = msg.content;
		this.askNextQuestion(msg, collected);
	}

	select_duration(msg, collected) {
		if (Number.isNaN(parseFloat(msg.content))) {
			msg.channel.send('That\'s not a number lol');
		} else {
			collected.duration = parseFloat(msg.content) * 3600000 * 24 + Date.now();
		}
		this.askNextQuestion(msg, collected);
	}

	askNextQuestion(msg, collected) {
		var required = [ 'channel', 'startIn', 'duration', 'winners', 'prize' ];
		var nextQuestion = required.find(r => !Object.keys(collected).find(c => c === r));
		if (!nextQuestion) return this.commandHandler.startGiveaway(msg, collected);
		this.awaitMessages(msg.channel, msg.author.id, 30000, QUESTIONS[required.indexOf(nextQuestion)], 'select_' + nextQuestion, collected);
	}
}
module.exports = Giveaway;
