import net from 'net';
import * as process from 'process';

const client = new net.Socket();

// PostgreSQL protocol constants
// const protocolVersion = Buffer.from([0x00, 0x03, 0x00, 0x00]);
// const terminationByte = Buffer.from([0x00]);
client.on('data', (data) => {
  console.log('Received:', data.toString());
  // This will be where you listen for and process responses from the server.
  // Realistically, you'll need to parse binary data according to the protocol, not just convert it to a string.
});

client.on('close', () => {
  console.log('Connection closed');
});

client.on('error', (err) => {
  console.error('Connection error:', err);
  process.exit(1);
});

export { client };
