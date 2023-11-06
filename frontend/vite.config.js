import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { Server } from 'socket.io';

const webSocketServer = {
  name: 'webSocketServer',
  configureServer(server) {
    if (!server.httpServer) return;

    const io = new Server(server.httpServer);

    console.log('WebSocket Server has been created'); 

    io.on('connection', (socket) => {
      console.log('A user connected'); 

	  socket.emit('eventFromServer', 'Hello, World 👋');

      socket.on('message', (message) => {
        console.log('Received message:', message);
      });      

      socket.on('disconnect', () => {
        console.log('A user disconnected'); // 사용자 연결 해제 시 로그 출력
      });
    });
  }
};

export default defineConfig({
  plugins: [sveltekit(), webSocketServer]
});
