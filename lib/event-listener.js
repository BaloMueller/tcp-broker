var net = require('net'),
		Client = require('./Client.js');

function EventListener(eventEmitter) {
	this.eventEmitter = eventEmitter;
	this.eventEmitter.on('msg', this.HandleMsgFromSender.bind(this));
}

EventListener.prototype = {
	// All currently logged in listeners
	clients: {},

	// Creates the TCP Server Endpoint
	CreateServer: function() {
		var that = this;
		return net.createServer(function(conn) {
			conn.on('data', function(data) { that.TryLogin.bind(that)(data, conn); });
		});
	},
	
	// Handles the login procedure and makes sure, that only
	// positive integers are accepted as ids
	TryLogin: function(data, conn) {
		if(conn['isLoggedIn']) {
			return;
		}

		data = String(data).trim();
		if(!(/^(0|[1-9]\d*)$/.test(data))) {
			throw 'Client tried to log in with: ' + data;
		}

		var id = Number(data)
		if (id in this.clients) {
			throw 'Client tried to log in with id ' + id + ', which already exists.';
		} 

		this.clients[id] = new Client(conn);
		console.log(id + ' logged in. Number of Users: ' + Object.keys(this.clients).length);
		conn['isLoggedIn'] = true;

		var that = this;
	  conn.on('end', function() { that.Logout.bind(that)(id) });
	},

	// When a listener disconnectes, it will be removed from clients[]
	Logout: function(id) {
		delete this.clients[id];
		console.log(id + ' disconnected');
	},

	// This dispatches the messages to the appropriate message type handler
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

	// Sends broadcast events to all listeners
	Broadcast: function(msg) {
		var keys = Object.keys(this.clients);
		for(i=0; i < keys.length; i++) {
			this.clients[keys[i]].Send(msg);
		}
	},

	// Adds followers to the appropriate clients
	Follow: function(from, to) {
		if(to in this.clients) {
			this.clients[to].AddFollower(from);
		}
	},

	// Removes a follower from the client
	Unfollow: function(from, to) {
		if(to in this.clients) {
			this.clients[to].RemoveFollower(from);
		}
	},

	// Sends a private message to a specific client
	PrivateMessage: function(to, msg) {
		if(to in this.clients) {
			this.clients[to].Send(msg);
		}
	},

	// Distributes a status update to all of this client's followers
	StatusUpdate: function(from, msg) {
		if(from in this.clients) {
			var followers = this.clients[from].GetFollowers();
			for(i=0; i < followers.length; i++){
				var follower = followers[i];
				this.clients[follower].Send(msg);
			}
		}
	}
}

module.exports = EventListener;