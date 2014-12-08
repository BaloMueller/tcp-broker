/**
 * Client constructor.
 *
 * @api public
 */

function Client(conn){
	var that = this;
	this.conn = conn;
	this.followers = new Array();
};

Client.prototype = {
	followers: null,
	
	//Sends a message to this Client
	Send: function(msg) {
	  this.conn.write(msg + '\r\n');
	},

	GetFollowers: function() {
	  return this.followers.slice();
	},

	AddFollower: function(id) {
	  this.followers.push(id);
	},

	RemoveFollower: function(id) {
		var index = this.followers.indexOf(id);
		if (index > -1) {
	    this.followers.splice(index, 1);
		}
	}
}

module.exports = Client;