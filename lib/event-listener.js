var net = require('net'),
		Client = require('./Client.js');

function EventListener(eventEmitter) {
	this.eventEmitter = eventEmitter;
}

EventListener.prototype = {
	clients: {},

	CreateServer: function() {
		var that = this;
		return net.createServer(function(conn) {
			conn.on('data', function(data) { that.TryLogin.bind(that)(data, conn); });
		});
	},
	
	TryLogin: function(data, conn) {
		if(conn['isLoggedIn']) {
			return;
		}

		data = String(data).trim();
		if(!(/^(0|[1-9]\d*)$/.test(data))) {
			console.error('Client tried to log in with: ' + data + '\r\n');
			return;
		}

		var id = Number(data)
		if (id in this.clients) {
			console.error('Client tried to log in with id ' + id + ', which already exists.\r\n');
			return;
		} 

		this.clients[id] = new Client(conn);
		console.log(id + ' logged in. Number of Users: ' + Object.keys(this.clients).length);
		conn['isLoggedIn'] = true;

		this.eventEmitter.on('msg', this.HandleMsgFromSender.bind(this));

		var that = this;
	  conn.on('end', function() { that.Logout.bind(that)(id) });
	},

	Logout: function(id) {
		delete this.clients[id];
		console.log(id + ' disconnected');
	},

	HandleMsgFromSender: function(msg) {
		switch(msg['type']) {
			case 'B':
				this.Broadcast(msg['raw']);
				break;

			case 'F':
				this.Follow(msg['from'], msg['to']);
				break;

			case 'U':
				this.Unfollow(msg['from'], msg['to']);
				break;

			case 'P':
				this.PrivateMessage(msg['to'], msg['raw']);
				break;

			case 'S':
				this.StatusUpdate(msg['from'], msg['raw']);
				break;
		}
	},

	Broadcast: function(msg) {
		var keys = Object.keys(this.clients);
		for(i=0; i < keys.length; i++){
			this.clients[keys[i]].send(msg);
		}
	},

	Follow: function(from, to) {
		if(to in this.clients){
			this.clients[to].addFollower(from);
		}
	},

	Unfollow: function(from, to) {
		if(to in this.clients){
			this.clients[to].removeFollower(from);
		}
	},

	PrivateMessage: function(to, msg) {
		if(to in this.clients){
			this.clients[to].send(msg);
		}
	},

	StatusUpdate: function(from, msg) {
		if(from in this.clients){
			var followers = this.clients[from].getFollowers();
			for(i=0; i < followers.length; i++){
				var follower = followers[i];
				this.clients[follower].send(msg);
			}
		}
	}
}

module.exports = EventListener;