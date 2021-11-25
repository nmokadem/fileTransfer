const net = require('net');
const fs = require('fs');
const path = require('path');

const { PORT, HOST } = require('../client/constants');

let sockets = [];


//=====================================================================

let welcome = function(nickname,socket) {

  // Log it to the server output
  console.log(`New client connected ===>> ${nickname}`);

  socket.nickname = nickname;

  //Add to existing clients
  sockets.push(socket);

  // Welcome user to the socket
  socket.write(`${nickname} welcome to telnet chat!\n`);

  let message = nickname + ' Joined this telnet.\n';

  // Broadcast to others excluding this socket
  broadcast(nickname, message);
}


// Broadcast to others, excluding the sender
function broadcast(from, message) {

  // Log it to the server output
  //process.stdout.write(message);
  console.log(message);

	// If there are no sockets, then don't broadcast any messages
	if (sockets.length === 0) {
		//process.stdout.write('Everyone left the chat');
    //console.log("No connections found!");
		return;
	}

	// If there are clients remaining then broadcast message
	sockets.forEach(function(socket, index, array){
		// Dont send any messages to the sender
	  if (socket.nickname !== from) {
		  socket.write(message);
    }
	});
};


// Remove disconnected client from sockets array
function removeSocket(socket) {
  let thisAddress = '';
  let nickname = socket.nickname;
  let clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;

  // Remove client from socket array
  let index = sockets.findIndex((s) => {
    thisAddress = `${s.remoteAddress}:${s.remotePort}`;
    return clientAddress === thisAddress;
  })

  if (index !== -1) sockets.splice(index, 1);

  let message = `connection closed: ${nickname}`;

  // Notify all clients
  broadcast(nickname, message);
};


//========================================================================


let server = net.createServer(function(client) {

  // When client sends data
	client.on('data', function(data) {
    let command = data.toString();
    let message = '';
    let nickname = '';
    let file = '';

    if (command.substring(0,4) === 'NAME') {
      nickname = command.substring(5);
      client.nickname = nickname;        //add a nickname to client socket
      welcome(nickname,client);
      return;
    }

    if (command.substring(0,4) === 'FILE') {
      nickname = client.nickname;
      file = command.substring(5);
      message = `${nickname} requested : ${file}`;
      //broadcast(nickname, message);

      let filePath = path.join(__dirname, file);
      fs.readFile(filePath, 'utf8', function(err, contents) {
        if (err) {
          if (err.code == 'ENOENT') {
            client.write('ERROR: File does not exist: '+ file); // Send error to client
          } else {
            console.error(err);
          }
        } else {
          client.write(`FILE@.@${file}@.@${contents}`); // Send file to client
        }
      });
      return;
    }

    if (command.substring(0,4) === "QUIT") {
      nickname = client.nickname;
      client.write(`Pleasure serving you ${nickname}`);
      // message = `Connection closed by request : ${nickname}`;
      // broadcast(nickname,message);
      client.end();
      return;
    }

    // Unhandeld commands will be printed on console:
    nickname = client.nickname;
    message = `${nickname}:  ${data}`;
    broadcast(nickname,message);
	});


  // set time to end idle connections
  client.setTimeout(60000);
  client.on('timeout', () => {
    console.log('socket timeout');
    client.write("(Server) ==> Connection timed out! Connection ended.")
    client.end();
  });

  // When client leaves
	client.on('end', function() {
    removeSocket(client);
	});

  client.on('close', function() {
    // let nickname = client.nickname;
    // console.log(`Connection Closed For : ${nickname}`);
  });

	// When socket gets errors
	client.on('error', err => {
    let nickname = client.nickname;
    console.log(`Error occurred in ${nickname}: ${err.message}`);
	});

});


// Listen for a port to telnet to
// then in the terminal just run 'telnet localhost [port]'
server.listen(PORT, HOST, () => {
  console.log(`TCP server listening on ${HOST}:${PORT}`);
});


// server.on('listening', function(){
//   console.log("Server Listening....");
// });


// Listening for any problems with the server
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log('Address in use, retrying...');
    setTimeout(() => {
      server.close();
      server.listen(PORT, HOST);
    }, 1000);
  } else {
    console.log("Huston we have a problem! ", e.message);
    process.exit(1);
  }
});
