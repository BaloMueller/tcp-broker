var net = require('net'),
	EventEmitter = require('events').EventEmitter,
	EventSource = require('./lib/event-source.js'),
	EventListener = require('./lib/event-listener.js');

var eventEmitter = new EventEmitter(),
	eventSource = new EventSource(eventEmitter),
	eventListener = new EventListener(eventEmitter);

// The eventEmitter is a PubSub system to send messages
// from the sender to the clients
eventEmitter.setMaxListeners(0);

// The eventSource is the Endpoint for the sender of all 
// of the events
eventSource.CreateServer().listen(9090, function() {
  console.log('endpoint for event source open');
});

// The eventListener ist the Endpoint for all the clients
// who listen to sent events
eventListener.CreateServer().listen(9099, function() { 
  console.log('endpoint for receivers open');
});
