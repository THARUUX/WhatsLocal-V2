const express = require('express');
const chalk = require('chalk');
const figlet = require('figlet');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;
const messages = [];
const me = "https://www.tharuux.github.io";

const qrFolderPath = path.join(__dirname, 'QR');
let latestQRFile = null; // Store latest QR filename
let isConnected = false;  // Track connection state

// Function to start the server
const startServer = () => {
    console.log("Opened connection");
    console.log(chalk.green(figlet.textSync("WhatsLocal", { font: "Standard" })));
    console.log(chalk.green("Developed by THARUUX"));
    console.log(chalk.green(me));

    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'public')));

    // Serve latest QR Code
    app.get('/qr/latest', (req, res) => {
        if (!latestQRFile) {
            return res.status(404).send("No QR code available");
        }
        res.sendFile(path.join(qrFolderPath, latestQRFile));
    });

    // Messages API
    app.get('/messages', (req, res) => {
        res.json(messages);
    });

    // Handle other routes
    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // WebSocket Connection
    io.on('connection', (socket) => {
        console.log("Client connected to WebSocket");
        socket.emit('status', { isConnected, qrAvailable: !!latestQRFile });
    });

    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
};

// Function to send QR update to frontend
const sendQRUpdate = (qrFile) => {
    latestQRFile = qrFile;
    io.emit('qrUpdate', { qrAvailable: true });
};

// Function to send connection update to frontend
const sendConnectionUpdate = (status) => {
    isConnected = status;
    io.emit('status', { isConnected: status, qrAvailable: !!latestQRFile });
};

module.exports = { startServer, sendQRUpdate, sendConnectionUpdate };
