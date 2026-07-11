const express = require('express');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Inisialisasi Socket.io dengan izin akses (CORS) dari mana saja
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Menyimpan data semua pemain yang sedang aktif
let players = {};

io.on('connection', (socket) => {
    console.log(`Pemain baru terhubung: ${socket.id} 🌐`);

    // 1. Saat pemain baru bergabung, beri tahu dia ID uniknya
    socket.emit('init', { id: socket.id });

    // 2. Menerima pembaruan posisi dari salah satu pemain
    socket.on('update_position', (data) => {
        players[socket.id] = {
            x: data.x,
            y: data.y,
            anim: data.anim
        };
        
        // Siarkan data semua pemain ke seluruh player yang aktif
        socket.broadcast.emit('room_state', players);
    });

    // 3. Saat pemain keluar/terputus
    socket.on('disconnect', () => {
        console.log(`Pemain keluar: ${socket.id} ❌`);
        delete players[socket.id];
        socket.broadcast.emit('player_disconnected', socket.id);
    });
});

// Jalankan server di port bawaan Render atau port 3000 untuk lokal
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server WebSocket siap berdendang di port ${PORT} 🌌`);
});
