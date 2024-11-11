declare var io: any;
declare var SimplePeer: any;

const socket = io();
const videoGrid = document.getElementById('video-grid') as HTMLElement;
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers: { [id: string]: any } = {};
const messageForm = document.getElementById('message-form') as HTMLFormElement;
const messageInput = document.getElementById('message-input') as HTMLInputElement;
const chatWindow = document.getElementById('chat') as HTMLElement;
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('roomId');
const username = urlParams.get('username') || 'Аноним';

socket.emit('join-room', roomId, username);

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then((stream) => {
  addVideoStream(myVideo, stream);
  socket.on('user-connected', (userId: string) => {
    connectToNewUser(userId, stream);
  });
  socket.on('signal', (data: any) => {
    let peer = peers[data.userId];
    if (!peer) {
      peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: stream
      });
      peer.on('signal', (signal: any) => {
        socket.emit('signal', { userId: data.userId, signal });
      });
      peer.on('stream', (remoteStream: MediaStream) => {
        const video = document.createElement('video');
        addVideoStream(video, remoteStream);
      });
      peers[data.userId] = peer;
    }
    peer.signal(data.signal);
  });
  socket.on('user-disconnected', (userId: string) => {
    if (peers[userId]) {
      peers[userId].destroy();
      delete peers[userId];
    }
  });
  socket.on('createMessage', (data: { username: string; message: string }) => {
    appendMessage(`${data.username}: ${data.message}`);
  });
}).catch((error) => {
  console.error('Ошибка доступа к медиа устройствам:', error);
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('message', {
      username: username, 
      message: message 
    });
    messageInput.value = ''; 
    appendMessage(`Вы: ${message}`); 
  }
});

function addVideoStream(video: HTMLVideoElement, stream: MediaStream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

function connectToNewUser(userId: string, stream: MediaStream) {
  const peer = new SimplePeer({
    initiator: true,
    trickle: false,
    stream: stream
  });
  peer.on('signal', (signal: any) => {
    socket.emit('signal', { userId, signal });
  });
  peer.on('stream', (remoteStream: MediaStream) => {
    const video = document.createElement('video');
    addVideoStream(video, remoteStream);
  });
  peers[userId] = peer;
}

function appendMessage(message: string) {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
