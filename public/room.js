"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const simple_peer_1 = __importDefault(require("simple-peer"));
const socket = (0, socket_io_client_1.default)();
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
// Получаем идентификатор комнаты из URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('roomId');
const userId = socket.id;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);
    socket.emit('join-room', roomId, userId);
    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    });
    socket.on('signal', (data) => {
        const peer = peers[data.userId];
        if (!peer) {
            const peer = new simple_peer_1.default({
                initiator: false,
                trickle: false,
                stream: stream
            });
            peer.on('signal', signal => {
                socket.emit('signal', { userId: data.userId, signal });
            });
            peer.on('stream', remoteStream => {
                const video = document.createElement('video');
                addVideoStream(video, remoteStream);
            });
            peers[data.userId] = peer;
        }
        peer.signal(data.signal);
    });
    socket.on('user-disconnected', (userId) => {
        if (peers[userId]) {
            peers[userId].destroy();
            delete peers[userId];
        }
    });
}).catch(error => {
    console.error('Ошибка доступа к медиа устройствам:', error);
});
// Функции для работы с видео
function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}
function connectToNewUser(userId, stream) {
    const peer = new simple_peer_1.default({
        initiator: true,
        trickle: false,
        stream: stream
    });
    peer.on('signal', signal => {
        socket.emit('signal', { userId, signal });
    });
    peer.on('stream', remoteStream => {
        const video = document.createElement('video');
        addVideoStream(video, remoteStream);
    });
    peers[userId] = peer;
}
