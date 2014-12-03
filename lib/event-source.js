var net = require('net');

function EventSource(eventEmitter) {
	this.eventEmitter = eventEmitter;
}

EventSource.prototype = {
	createServer: function() {
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

	ParseMessage: function(msg) {
		var parts = msg.split('|');
		var msgAsObj = {
			'sequence': parts[0],
			'type': parts[1],
			'msg': msg
		}

		switch(parts[1]) {
			case 'B':
				break;

			case 'S':
				msgAsObj['from'] = parts[2];
				break;

			default:
				msgAsObj['from'] = parts[2];
				msgAsObj['to'] = parts[3];
				break;
		}
		return msgAsObj;
	},

	DataReceived: function(data) {
		var payload = String(data).trim().split('\n');
		for(i=0; i<payload.length; i++) {
			//console.log('Data received: ' + payload[i]);
			this.eventEmitter.emit('msg', this.ParseMessage(payload[i]));
		}
	}
}

module.exports = EventSource; 