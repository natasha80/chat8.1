/* eslint-disable linebreak-style */
/* eslint-disable eol-last */
import Error from './Error';

export default class Login {
  constructor(container, server) {
    this.container = container;
    this.server = server;

    this.showPopup();
  }

  showPopup() {
    this.popup = document.createElement('div');
    this.popup.classList.add('popup');

    this.popup.innerHTML = `
      <div class="popup__body">
        <div class="popup__content">
          <h3 class="popup__title">Выберите псевдоним</h3>
          <form class="form">
            <input type="text" class="form-group__field">
            <div class="form__control">
              <button class="form-control__button button button__save">Продолжить</button>
            </div>
          </form> 
        </div>
      </div>
    `;

    this.container.appendChild(this.popup);

    this.input = this.container.querySelector('input.form-group__field');
    this.form = this.container.querySelector('.form');
    this.error = new Error(this.form, this.input);

    this.form.addEventListener('submit', this.onSubmit.bind(this));

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();

    if (!this.input.value) {
      this.error.showError({ reason: 'Укажите никнейм' });
      return;
    }

    this.start();
  }

  start() {
    this.ws = new WebSocket(this.server);
    this.ws.addEventListener('open', () => {
      this.ws.send(JSON.stringify({
        event: 'login',
        message: this.input.value,
      }));
    });

    this.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);

      if (msg.event === 'connect') {
        this.usersList = msg.message;
        this.container.dispatchEvent(new Event('connect'));
      }
    });

    this.ws.addEventListener('close', (e) => {
      if (e.code !== 1000) this.check();
      this.error.showError(e);
    });
  }

  check() {
    if (!this.ws || this.ws.readyState === 3) this.start();
  }

  removePopup() {
    this.popup.remove();
  }
}