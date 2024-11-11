"use strict";
const form = document.getElementById('room-form');
const roomIdInput = document.getElementById('room-id');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const roomId = roomIdInput.value.trim();
    if (roomId) {
        window.location.href = `/room?roomId=${roomId}`;
    }
});
