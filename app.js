var net = require('net'),
	EventEmitter = require('events').EventEmitter,
	EventSource = require('./lib/event-source.js'),
	EventListener = require('./lib/event-listener.js');

var eventEmitter = new EventEmitter(),
	eventSource = new EventSource(eventEmitter),
	eventListener = EventListener(eventEmitter);

eventEmitter.setMaxListeners(0);

eventSource.createServer().listen(9090, function() {
  console.log('endpoint for event source open');
});

eventListener.listen(9099, function() { 
  console.log('endpoint for receivers open');
});