// ----- D3 Demo ------
/*
 * Node
 *   Node in message-passing implementation
 */

// Required libraries
var net = require('net');
var NUM_RETRIES = 10;

function Node(totalNodes, nodeID, port) {
	this.totalNodes = totalNodes;
	this.nodeID = nodeID;
	this.nPort = port;
 	this.socket = new net.Socket();
 	this.toReturn = "nothing";

 	this.socket.connect(this.nPort, "localhost", function () {
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

	this.sendRequest(toSend);

	// listen for data receipt
	this.socket.on('data', callback);
}

// -------------------- Test code --------------------------------
var port = 12345;
var __dir = "/home/sirui/Desktop/CPSC490/d3_test"
var __data = "/data.tsv"

// -------------------- Receive data from server ---------------------------
var node = new Node(2,0,port);

var jsonToSend = "{'Hi': 'From Node 0'}";
var toSend = JSON.stringify(jsonToSend);
node.receiveMessage(0, function (data) {
		console.log('callback fired: ' + data);
	});

// -------------------- Write data out to data.tsv -------------------------
var fs = require('fs');
fs.writeFile(__dir + __data, "letter\tfrequency\nA\t10\nB\t10", function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
}); 

// -------------------- Server up webpage --------------------------
var connect = require('connect');
connect.createServer(
    connect.static(__dir)
).listen(8081);