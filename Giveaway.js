const importer = require('./Importer.js');
const dbConnector = importer('dbConnector');
const CommandHandler = importer('CommandHandler');

class Giveaway {
	constructor(client) {
		this.client = client;
		this.dbConnector = new dbConnector();
		this.commandHandler = new CommandHandler(this.dbConnector);
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
}
module.exports = Giveaway;
