class Command {
	constructor(name, execute) {
		this.name = name;
		this.execute = execute;
	}
	
	getName() {
		return this.name;
	}
}
module.exports = Command;
