const net = require('net');
const fs = require('fs');

const path = require('path');
//const readline = require("readline");

const { HOST, PORT, NAME, FILES, SEPARATOR, PROTOCOL}  = require('./constants.js');



const displayPrompt = function() {
  for (let key in PROTOCOL.client) {
    console.log(key,' ===> ',PROTOCOL.client[key]);
  }
  //console.log(JSON.stringify(PROTOCOL.client));
}
// setup stdin and list to user's input

process.stdin.setEncoding('utf8');
var stdin = process.openStdin();


stdin.addListener("data", function(d) {
    let inp = d.toString().trim(); // clean input functions here
    if (inp === "EXIT") {
      //client.write("goodbye");
      socket.destroy();
      stdin.destroy();
    } else {
      socket.write(inp);
      process.stdout.write('> ');
    }
});

//================================================
//open a connection to the server and listen

const socket = new net.Socket();
socket.connect(PORT, HOST);

socket.on("connect", () => {

  socket.write(`NAME:${NAME}`);

  console.log('Successfully Connected to server: ' + HOST + ':' + PORT);
  displayPrompt();
  process.stdout.write('>>> ');

 
  // for (let file of FILES) {
  //   socket.write(`FILE:${file}`);
  // }
  // socket.write("QUIT");
});

socket.on('data', (data) => {
  const command = data.toString().substring(0,4);

  if (command === 'FILE') {
    const arr = data.toString().split(SEPARATOR);

    const file = arr[1];
    const contents = arr[2];

    let filePath = path.join(__dirname, file);

    fs.writeFile(filePath, contents, function(err) {
      if (err) {
        console.log(`Error Saving ${filename}: ${err.code}.`);
      } else {
        console.log(`File ${file} downloaded and saved successfully!`);
      }
    });
    process.stdout.write('> ');
    return;
  }

  if (command === 'QUIT') {
    console.log(`Server Terminated Your Connection`);
    socket.destroy();
    return;
  }

  // Unhandeld commands will be printed on console:  
  console.log('(Server) ==> ' + data);
  process.stdout.write('> ');

});

socket.on('error', (err) => {
  //console.error(err);
  console.log("ERROR: " + err.message);
  process.exit(1);
});

socket.on('end', function() {
  console.log('Connection ended.');
});

// Add a 'close' event handler for the client socket
socket.on('close', function() {
//  console.log('Connection closed');
  process.exit();
});
