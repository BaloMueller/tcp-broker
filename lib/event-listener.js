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
		  console.log('listener connected');
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
		if (id in clients) {
			console.error('Client tried to log in with id ' + id + ', which already exists.\r\n');
			return;
		} 

		this.clients[id] = new Client(this.eventEmitter, conn);
		console.log(id + ' logged in');
		conn['isLoggedIn'] = true;

		eventEmitter.on('msg', this.HandleMsgFromSender.bind(this));

		var that = this;
	  conn.on('end', function() { that.Logout.bind(that)(id) });
	},

	Logout: function(id) {
		console.log(id + ' disconnected');
		delete this.clients[id];
	},

	HandleMsgFromSender: function(msg) {
		switch(msg['type']) {
			case 'B':
				this.Broadcast.bind(this)(msg);
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
		debugger;
		for(i=0; i < this.clients.length; i++){
			this.clients[i].send(msg);
		}
	},

	Follow: function(from, to) {
		if(from in this.clients){
			this.clients[from].addFollower(to);
		}
	},

	Unfollow: function(from, to) {
		if(from in this.clients){
			this.clients[from].removeFollower(to);
		}
	},

	PrivateMessage: function(to, msg) {
		if(from in this.clients){
			this.clients[from].send(msg);
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