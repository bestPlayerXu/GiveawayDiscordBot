const mariadb = require('mariadb/callback');

class dbConnector {
	constructor() {
		this.connection = mariadb.createConnection({
			user: process.env.MARIADB_USERNAME,
			password: process.env.MARIADB_PASSWORD,
			database: 'GiveawayDiscordBot'
		});
	}
	
	addGuild(id, prefix) {
		this.connection.query('REPLACE INTO Guild VALUES (?,?)', [id, prefix], () => this.connection.commit());
	}
	
	addGuildIfNotExist(id) {
		this.connection.query('INSERT IGNORE INTO Guild VALUES (?,?)', [id, 'ga!'], () => this.connection.commit());
	}
	
	addGiveaway(guildId, channelId, messageId, start, end, winners, prize) {
		this.addGuildIfNotExist(guildId);
		this.connection.query('REPLACE INTO Giveaway VALUES (?,?,?,?,?,?,?)', [guildId, channelId, messageId, new Date(start), new Date(end), winners, prize], () => this.connection.commit());
	}
	
	getGuildById(id) {
		return new Promise(r => this.connection.query('SELECT * FROM Guild as g where g.Id = ' + id, (err, res) => r(res.length === 0 ? null : res[0])));
	}
	
	getPrefixByGuildId(id) {
		return new Promise(r => this.getGuildById(id).then(guild => r(guild ? guild.Prefix : 'ga!')));
	}
	
	removeGiveaway(guildId, messageId) {
		this.connection.query('DELETE FROM Giveaway WHERE MessageId = ' + messageId, () => {
			this.connection.commit();
			this.removeGuildIfStandard(guildId);
		});
	}
	
	removeGuild(id) {
		this.connection.query('DELETE FROM Guild WHERE Id = ' + id, () => this.connection.commit());
		
	}
	
	removeGuildIfStandard(id) {
		this.getPrefixByGuildId(id).then(prefix => prefix === 'ga!' ? this.removeGuild(id) : {});
	}
	
	setPrefix(guildId, prefix) {
		this.getGuildById(guildId).then(guild => {
			this.addGuild(guildId, prefix);
			this.removeGuildIfStandard(guildId);
		});
	}
}
module.exports = dbConnector;
