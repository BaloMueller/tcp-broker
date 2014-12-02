/**
 * Listener constructor.
 *
 * @api public
 */

function Listener(eventEmitter, conn){
	var that = this;

	this.eventEmitter = eventEmitter;
	this.conn = conn;
};

Listener.prototype.Followers = [];

/**
 * Sends a message to this Listener.
 *
 * @api public
 */

Listener.prototype.send = function(msg) {
  this.conn.write(msg + '\r\n');
};

Listener.prototype.getFollowers = function() {
  return this.Followers.slice();
};

Listener.prototype.addFollower = function(id) {
  followers.push(id);
};

Listener.prototype.removeFollower = function(id) {
	var index = this.Followers.indexOf(id);
	if (index > -1) {
    followers.splice(index, 1);
	}
};

module.exports = Listener;