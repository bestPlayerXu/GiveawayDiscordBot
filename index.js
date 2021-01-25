const fs = require('fs');

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


///////DISCORD INIT////////////
var client = new (require('discord.js').Client)();

client.on('ready', () => {
	console.log('Logged in as ' + client.user.tag + '.')
	
	/////////Slash commands:///////////////
	//Init
	client.api.applications(client.user.id).guilds('776876439671668826').commands.post({
		data: {
			name: 'Test',
			description: 'test command'
		}
	});
	//Inveraction
	client.ws.on('INTERACTION_CREATE', interaction => {
        var command = interaction.data.name.toLowerCase();
        var channel = client.channels.get(interaction.channel_id);
        
		console.log('Slashing ' + command + ' in ' + channel.name);
		
		client.api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 4,
				data: {
					content: 'Executing ' + command + ' as if you typed it in chat ...'
				}
			}
		});
    });
});

////////CORE//////////////////
client.on('message', msg => {
	if (msg.author.bot) return;
	var prefix;
	if (msg.content.startsWith('<@!' + client.user.id + '>')) prefix = msg.content.slice(0, ('<@!' + client.user.id + '>').length); //ping
	if (msg.content.startsWith('ga!')) prefix = 'ga!'; //prefix
	if (!prefix) return; //nothing for me
	var command = msg.content.split(prefix)[1].split(' ').filter(s => s.length)[0];
});

client.login(process.env.BOT_TOKEN);
