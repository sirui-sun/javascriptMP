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

//------------------ Start actual implementation ---------------------------
// This node is the leader: sends out workers, waits for responses, and
// aggregates responses together; it should also find out how many lines are
// in the data, and send that to each worker (so the worker knows how many
// lines to read and where to start)

// parameters: hard-coded for now
var input_dir = "./input";					// input file directory
var output_dir = "./output";				// output file directory
var nNodes = 3;											// total number of worker nodes
var portNum = 30000;								// port number

// initialize personal node
var myNode = new Node(4, 0,portNum);

// run wc to count lines in input file (so we can divide the work)
var nLines;
var exec = require('child_process').exec;
exec('wc -l ' + input_dir,
	function callback(error, stdout, stderr) {
		nLines = parseInt(stdout);
	}
);

// use message passing to tell nodes what to do
fromNode.sendMessage(1, toSend, function() {
	var toNode = new Node(2,1,port);
	toNode.receiveMessage(0);
});

// run N nodes to perform Blackscholes computation
for (var i=0; i<nNodes; i++) {
	var node_id = i+1;
	var args = ' ' + node_id + ' ' + nNodes + ' ' + nLines;
	exec('node bs_node' + args,
		function callback(error, stdout, stderr) {
			// for now, just print out the response
			// eventually, use message passing to receive response
			console.log('Output from node ' + node_id + ':');
			console.log(stdout);
		}
};

//------------------- end implementation --------------------------------------


