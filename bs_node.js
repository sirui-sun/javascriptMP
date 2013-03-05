// Blackscholes implementation using node js and message passing
// Author: Sirui Sun (sirui.sun@yale.edu)

// ------------------ node code --------------------
// Required libraries
var net = require('net');
var NUM_RETRIES = 10;

function Node(totalNodes, nodeID, port) {
	this.totalNodes = totalNodes;
	this.nodeID = nodeID;
	this.nPort = port;
 	this.socket = new net.Socket();
 	this.toReturn = "";

 	this.socket.connect(this.nPort, function () {
 		console.log ('socket connected to port ' + port);
 	})

 	// on data receipt, process and shut down
	this.socket.on('data', function(data) {
		var realData = data.toString();
		var dataStr = JSON.stringify(realData);
		console.log('Node received data: ' + dataStr);
		toReturn = dataStr;
	});

	this.socket.on('end', function() {
    	console.log('socket disconnected');
  	});
}

// send a request
Node.prototype.sendRequest = function(JSONdata, callback)
{
	var JSONstring = JSON.stringify(JSONdata);// + "|";
	console.log('writing: ' + JSONstring);
	this.socket.write(JSONstring, 'utf8', callback);
};

// send a 'send' message
Node.prototype.sendMessage = function(toNode, msg, callback) {
	var toSend = 
	{
		"send": "send"
		, "receiver": toNode
		, "sender": this.nodeID
		, "message": msg					
	}

	this.sendRequest(toSend, callback);
}

// send a 'receive' message
Node.prototype.receiveMessage = function(fromNode, callback) {
	var toSend = 
	{
		"receive": "receive"
		, "receiver": this.nodeID
		, "sender": fromNode			
	}

	this.sendRequest(toSend, callback);
}

