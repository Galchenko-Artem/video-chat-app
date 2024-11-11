export {};

const form = document.getElementById('room-form') as HTMLFormElement;
const roomIdInput = document.getElementById('room-id') as HTMLInputElement;
const usernameInput = document.getElementById('username') as HTMLInputElement;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const roomId = roomIdInput.value.trim();
  const username = usernameInput.value.trim();
  if (roomId && username) {
    window.location.href = `/room?roomId=${roomId}&username=${encodeURIComponent(username)}`;
  }
});
