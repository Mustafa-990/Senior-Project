const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const imageInput = document.getElementById('image-input');
const attachImageBtn = document.getElementById('attach-image-btn');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', (message) => {
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Image from server
socket.on('image', (imageData) => {
  outputImage(imageData);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  if (msg.trim() !== '') {
    // Handle text message
    socket.emit('chatMessage', msg.trim());
  }

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Attach Image button click
attachImageBtn.addEventListener('click', (e) => {
  e.preventDefault();
  imageInput.click();
});

// Image input change
imageInput.addEventListener('change', (e) => {
  const imageFile = e.target.files[0];

  if (imageFile) {
    // Handle image upload
    const reader = new FileReader();
    reader.onload = function (e) {
      const imageData = e.target.result;
      socket.emit('chatImage', imageData);
    };
    reader.readAsDataURL(imageFile);
  }

  // Reset the file input
  imageInput.value = '';
});

// Output message or image to DOM
function outputMessage(data) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = data.username;
  p.innerHTML += `<span>${getCurrentTime()}</span>`;
  div.appendChild(p);

  if (data.text) {
    // Display text message
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = data.text;
    div.appendChild(para);
  } else if (data.imageData) {
    // Display image
    const img = document.createElement('img');
    img.classList.add('image');
    img.src = data.imageData;
    div.appendChild(img);
  }

  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

// Get current time in HH:MM format
function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Prompt the user before leaving the chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  }
});