var net = require('net');

function EventSource(eventEmitter) {
	this.eventEmitter = eventEmitter;
}

EventSource.prototype = {
	// Creates the TCP Server Endpoint
	CreateServer: function() {
		var that = this;
		return net.createServer(function(c) { 
		  console.log('event source connected');
		  
		  c.on('end', function() {
		    console.log('event source disconnected');
		  });

		  c.on('data', function(data) { 
				that.DataReceived(data); 
			});

		  c.write('Hello! You are the sender!\r\n');
		});
	},

	// Parses a single line and returns a message object
	ParseLine: function(msg) {
		var parts = msg.split('|');
		var msgAsObj = {
			'sequence': parts[0],
			'type': parts[1],
			'raw': msg
		}

		switch(parts[1]) {
			case 'B':
				break;

			case 'S':
				msgAsObj['from'] = Number(parts[2]);
				break;

			default:
				msgAsObj['from'] = Number(parts[2]);
				msgAsObj['to'] = Number(parts[3]);
				break;
		}

		return msgAsObj;
	},

	// Parses a bunch of received messages, get's them parsed
	// and emits them as events using the eventEmitter
	DataReceived: function(data) {
		var lines = String(data).trim().split('\n');
		for(i=0; i<lines.length; i++) {
			var line = lines[i];
			var msg = this.ParseLine(lines[i]);
			this.eventEmitter.emit('msg', msg);
		}
	}
}

module.exports = EventSource; 