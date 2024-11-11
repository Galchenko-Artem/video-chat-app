import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const publicPath = path.join(process.cwd(), 'dist_public');

app.use(express.static(publicPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/room', (req, res) => {
  res.sendFile(path.join(publicPath, 'room.html'));
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId: string, username: string) => {
    socket.join(roomId);
    socket.data.username = username;
    socket.to(roomId).emit('user-connected', socket.id);
    socket.on('signal', (data: any) => {
      io.to(data.userId).emit('signal', {
        userId: socket.id,
        signal: data.signal
      });
    });
    socket.on('message', (data: { username: string; message: string }) => {
      socket.broadcast.to(roomId).emit('createMessage', {
        username: data.username,
        message: data.message
      });
    });
    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', socket.id);
    });
  });
});

server.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});
