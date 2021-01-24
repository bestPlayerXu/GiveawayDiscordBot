///////PROCESS HANDLER/////////////

process.title = 'GiveawayBot';
//not using the process.on('exit') to be able to call async functions
var exit = () => {
	//do whatever necessary before exit
	client.destroy();
	console.log('Destroyed client. now killing myself ...');
	process.exit();
}
process.on('SIGTERM', () => exit());
process.on('SIGINT', () => exit());


///////DISCORD INIT////////////
var client = new (require('discord.js').Client)();

client.on('ready', () => {
	console.log('Logged in as ' + client.user.tag + '.')
	
	//Slash commands:
	console.log(client.api.applications(client.user.id).commands.get());
	client.api.applications(client.user.id).guilds('776876439671668826').commands.post({
		data: {
			name: 'Test',
			description: 'test command'
		}
	});
});

////////CORE//////////////////
client.on('message', msg => {
	if (msg.author.bot) return;
	msg.reply('Bot online.');
});

client.login(process.env.BOT_TOKEN);
