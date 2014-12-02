var net = require('net'),
		Listener = require('./Listener.js');

var clients = {};

var broadcast = function(msg) {
	for(i=0; i < clients.length; i++){
		clients[i].send(msg);
	}
}

var follow = function(from, to) {
	if(from in clients){
		clients[from].addFollower(to);
	}
}

var unfollow = function(from, to) {
	if(from in clients){
		clients[from].removeFollower(to);
	}
}

var privateMessage = function(to, msg) {
	if(from in clients){
		clients[from].send(msg);
	}
}

var statusUpdate = function(from, msg) {
	if(from in clients){
		var followers = clients[from].getFollowers();
		for(i=0; i < followers.length; i++){
			var follower = followers[i];
			clients[follower].send(msg);
		}
	}
}

var handleMsgFromSender = function(msg) {
	switch(msg['type']) {
		case 'B':
			broadcast(msg);
			break;

		case 'F':
			follow(msg['from'], msg['to']);
			break;

		case 'U':
			unfollow(msg['from'], msg['to']);
			break;

		case 'P':
			privateMessage(msg['to'], msg['raw']);
			break;

		case 'S':
			statusUpdate(msg['from'], msg['raw']);
			break;
	}
}

var logout = function(id) {
	console.log(id + ' disconnected');
	delete clients[id];
}

var tryLogin = function(data, conn, eventEmitter) {
	if(conn['isLoggedIn']) {
		return;
	}

	data = String(data).trim();

	if(!(/^(0|[1-9]\d*)$/.test(data))) {
		conn.write('Login not successfull! Please use an non-negative integer!\r\n');
		return;
	}

	var id = Number(data)
	if (id in clients) {
		conn.write('Client with this id already connected, please use another id\r\n');
		return;
	} 

	clients[id] = new Listener(eventEmitter, conn);
	console.log(id + ' logged in');
	conn['isLoggedIn'] = true;

	eventEmitter.on('msg', handleMsgFromSender);
  conn.on('end', function() { logout(id) });
};

var initServer = function(eventEmitter) {
	return net.createServer(function(conn) {
	  console.log('listener connected');
		
		conn.on('data', function(data) { tryLogin(data, conn, eventEmitter); });
	});
}

module.exports = initServer;