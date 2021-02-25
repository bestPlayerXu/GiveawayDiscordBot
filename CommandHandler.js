const Command = require('./Command.js');

class CommandHandler {
	constructor(dbConnector, awaitMessages, giveaway) {
		this.aCommand = [];
		this.dbConnector = dbConnector;

		this.addCommand('ChangePrefix', (msg, param) => {
			dbConnector.setPrefix(msg.guild.id, param[0]);
			msg.channel.send('Prefix is now `' + param[0] + '`');
		});

		this.addCommand('Say', (msg, param) => {
			msg.channel.send(param.join(' ').slice(0, 999));
			msg.delete();
		});
		/*	var guildId = msg.guild.id;
			var channel = msg.channel;
			var startTime = Date.now() + parseInt(param[0]);
			var endTime = parseInt(param[1]) + startTime;
			var winners = parseInt(param[2]);
			var prize = param[3];
			this.startGiveaway(guildId, channel, startTime, endTime, winners, prize);
			this.dbConnector.addGiveaway(guildId, channel.id, null, startTime, endTime, winners, prize);
		});*/
		this.addCommand('Help', msg => {
			msg.channel.send({ embed: {
				title: 'Help',
				fields: [{ name: 'My commands', value: this.aCommand.map(c => c.getName()).join('\n') }]
			}});
		});
		this.addCommand('New', msg => {
			giveaway.askNextQuestion(msg, { guildId: msg.guild.id });
//			awaitMessages(msg.channel, msg.author.id, 30000, 'Where (what channel) should the giveaway take place? <#channel> or channel_id', 'selectChannel', { guildId: msg.guild.id });
		});
	}

	addCommand(name, execute) {
		this.aCommand.push(new Command(name, execute));
	}

	startGiveaway(msg, collected) {
		setTimeout(() => {
			collected.channel.send('new giveaway for ' + (collected.duration - Date.now()) / 3600000 / 24 + ' day(s) for `' + collected.winners + '` lucky winners. You can get `' + collected.prize + '`').then(m => {
				msg.channel.send({ embed: { description: 'Giveaway [here](' + m.url + ')' }});
        			m.react('806460058405306391');
                	        this.dbConnector.addGiveaway(collected.guildId, collected.channel.id, m.id, collected.startTime, collected.endTime, collected.winners, collected.prize);
                        	setTimeout(() => this.endGiveaway(m, collected.guildId), Math.max(collected.duration - Date.now(), 0));
	                });
		}, Math.max(collected.startIn -  Date.now(), 0));
	}

	endGiveaway(m, guildId) {
		var reaction = m.reactions.cache.get('806460058405306391');
		if (!reaction) return;
		var users = reaction.users;
		var winners = [];
		users.fetch().then(notWinners => {
			notWinners = notWinners.array().filter(u => !u.bot).map(w => w.id);
			var participants = notWinners.length;
			for (var i = 0; i < Math.min(participants, 1); i++) {
				var w = notWinners[Math.floor(Math.random() * notWinners.length)];
				notWinners = notWinners.filter(nw => nw !== w);
				winners.push(w);
			}
			m.channel.send(winners.length > 0 ? winners.map(w => '<@' + w + '>').join(', ') + ' won something!' : 'Nobody participated :(', { embed: { description: ':arrow_right: [link to giveaway](' + m.url + ') :link:' }});
		});
		this.dbConnector.removeGiveaway(m.id, guildId);
	}

	getCommand(name) {
		return this.aCommand.find(c => c.getName().toLowerCase() === name.toLowerCase());
	}
}
module.exports = CommandHandler;
