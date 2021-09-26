/* eslint-disable linebreak-style */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable class-methods-use-this */
/* eslint-disable linebreak-style */
/* eslint-disable eol-last */
import Login from './Login';

export default class ChatManager {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.server = 'wss://ahj-chat-heroku.herokuapp.com//ws';
    this.users = this.container.querySelector('.chat__users');
    this.messagebox = this.container.querySelector('.chat-messagebox__messages');
    this.textarea = this.container.querySelector('.chat-messagebox__text');
    this.login = new Login(this.container, this.server);

    this.start = this.start.bind(this);
  }

  bindToDOM() {
    this.container.addEventListener('connect', this.start);
  }

  start() {
    this.nickname = this.login.input.value;
    this.chatUsers = this.login.usersList;
    this.reloadUsersList();
    this.login.removePopup();

    this.login.ws.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      if (msg.event === 'dialogue') {
        let newMsg;

        if (this.nickname === msg.message.nickname) {
          newMsg = this.msgConstructor('Вы', msg.message.date, msg.message.text);
          newMsg.classList.add('self');
        } else {
          newMsg = this.msgConstructor(msg.message.nickname, msg.message.date, msg.message.text);
        }

        this.messagebox.appendChild(newMsg);
        this.messagebox.scrollTop = this.messagebox.scrollHeight;
      }

      if (msg.event === 'system') this.showSystemMsg(msg);
    });

    this.textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this.textarea.value.trim()) this.sendMsg(e);
    });
  }

  msgConstructor(sender, date, text) {
    const dateInfo = new Date(date);
    const time = dateInfo.toLocaleTimeString().substring(0, 5);
    const day = dateInfo.toLocaleDateString();
    const message = document.createElement('div');
    message.classList.add('chat-messagebox__message');

    message.innerHTML = `
        <div class="chat-message__info">${sender}, ${time} ${day}</div>
        <div class="chat-message__text">${text}</div>
    `;

    return message;
  }

  sendMsg(e) {
    e.preventDefault();

    const msg = JSON.stringify({
      event: 'dialogue',
      message: this.textarea.value,
    });

    this.login.ws.send(msg);
    this.textarea.value = '';
  }

  showSystemMsg(msg) {
    // const msgContainer = document.createElement('div');
    // msgContainer.classList.add('chat-messagebox__system-msg');
    // msgContainer.classList.add('chat-messagebox__message');

    if (msg.message.action === 'login' && this.nickname !== msg.message.nickname) {
      // if (this.nickname === msg.message.nickname) {
      //   msgContainer.textContent = 'Вы присоединились к чату';
      // } else {
      //   msgContainer.textContent = `Пользователь ${msg.message.nickname} присоединился к чату`;
      //   this.chatUsers.push(msg.message.nickname);
      // }
      this.chatUsers.push(msg.message.nickname);
    } else if (msg.message.action === 'logout') {
      // msgContainer.textContent = `Пользователь ${msg.message.nickname} покинул чат`;

      const userIndex = this.chatUsers.findIndex((user) => user === msg.message.nickname);
      this.chatUsers.splice(userIndex, 1);
    }

    // this.messagebox.appendChild(msgContainer);
    // this.messagebox.scrollTop = this.messagebox.scrollHeight;

    this.reloadUsersList();
  }

  reloadUsersList() {
    this.users.innerHTML = '';

    this.chatUsers.forEach((user) => {
      const li = document.createElement('li');
      li.classList.add('chat__user');

      li.innerHTML = `
        <div class="chat-user__icon"></div>
        <div class="chat-user__name">${user}</div>
      `;

      this.users.appendChild(li);
    });

    const li = document.createElement('li');
    li.classList.add('chat__user');
    li.innerHTML = `
      <div class="chat-user__icon"></div>
      <div class="chat-user__name chat-user-name__you">Вы</div>
    `;
    this.users.appendChild(li);
  }
}