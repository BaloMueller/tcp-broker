var net = require('net'),
	EventEmitter = require('events').EventEmitter,
	EventSource = require('./lib/event-source.js'),
	EventListener = require('./lib/event-listener.js');

var eventEmitter = new EventEmitter(),
	eventSource = new EventSource(eventEmitter),
	eventListener = new EventListener(eventEmitter);

eventEmitter.setMaxListeners(0);

eventSource.createServer().listen(9090, function() {
  console.log('endpoint for event source open');
});

eventListener.CreateServer().listen(9099, function() { 
  console.log('endpoint for receivers open');
});

setInterval(function() {
	console.log(count + '/1000ms');
	count = 0;
}, 1000);

var count = 0;
eventEmitter.on('msg', function () { count++; });