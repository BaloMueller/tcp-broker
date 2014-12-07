var expect = require('chai').expect,
    sinon = require('sinon'),
    mockery = require('mockery');

var sandbox = sinon.sandbox.create(),
    EventEmitter,
    eventEmitter,
    Source,
    source;

describe('Listeners', function() {

	before(function() {
    mockery.enable();
  });

	beforeEach(function(){
    mockery.registerAllowables(['net','events']);
    mockery.registerAllowable('../lib/event-source.js', true);

		EventEmitter = require('events').EventEmitter;
		eventEmitter = new EventEmitter();
		Source = require('../lib/event-source.js');
		source = new Source(eventEmitter);
	});

  afterEach(function() {
    mockery.deregisterAll();
  });

  after(function() {
    mockery.disable();
  });

  describe('ParseLine()', function() {
    function assert(input, expected) {
      var result = source.ParseLine(input);

      var keys = Object.keys(expected);
      expect(keys.length).equal(Object.keys(result).length);

      for(i=0; i<keys.length; i++) {
        var key = keys[i];
        expect(result[key]).equal(expected[key]);
      }
    }

    it('parses broadcast events', function() {
    	var line = "0|B";
      var expected = {
        'sequence': "0",
        'type': "B",
        'raw': line
      };

      assert(line, expected);
    });

    it('parses status events', function() {
      var line = "0|S|0";
      var expected = {
        'sequence': "0",
        'type': "S",
        'raw': line,
        'from': 0
      };

      assert(line, expected);
    });

    it('parses follow events', function() {
      var line = "0|F|0|0";
      var expected = {
        'sequence': "0",
        'type': "F",
        'raw': line,
        'from': 0,
        'to': 0
      };

      assert(line, expected);
    });

    it('parses unfollow events', function() {
      var line = "0|U|0|0";
      var expected = {
        'sequence': "0",
        'type': "U",
        'raw': line,
        'from': 0,
        'to': 0
      };

      assert(line, expected);
    });
  });
});