const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
    console.log('✅ Connected to WebSocket Server');
    ws.send('Hello Server!');
});

ws.on('message', (data) => {
    console.log('📩 Message from server:', data.toString());
});

ws.on('error', (error) => {
    console.error('❌ WebSocket Error:', error);
});

ws.on('close', () => {
    console.log('⚠️ Connection Closed');
});
