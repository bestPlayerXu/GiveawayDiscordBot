module.exports = module => {
	delete require.cache[__dirname + '/' + module + '.js'];
	return require('./' + module + '.js');
}
