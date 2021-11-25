const HOST = 'localhost';     ////'4.tcp.ngrok.io'
const PORT = 1234;
const NAME = '@oracle';
const FILES = ['file1.txt', 'file2.txt'];
const SEPARATOR ='@.@';  //used as a separator between FILE command, filename, and file contents

const PROTOCOL = {
  client : {
    NAME: 'Send the server your username in the form NAME:username',
    FILE: 'Request to dowload a file from the server ex: FILE:filename',
    QUIT: 'Quit request to the server',
  },
  server : {
    FILE: 'Server download a file to the client',
    QUIT: 'Server send the client an order to exit'
  }
}

module.exports = {
  HOST,
  PORT,
  NAME,
  FILES,
  SEPARATOR,
  PROTOCOL
}