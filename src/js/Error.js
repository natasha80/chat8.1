/* eslint-disable linebreak-style */
/* eslint-disable eol-last */
export default class Error {
  constructor(container, input) {
    this.container = container;
    this.input = input;

    this.showError = this.showError.bind(this);
    this.removeError = this.removeError.bind(this);
  }

  showError(e) {
    this.error = document.createElement('div');
    this.error.classList.add('error');

    this.error.innerHTML = `
      <div class="error__arrow"></div>
      <div class="error__text">${e.reason}</div>
    `;

    const { left, bottom } = this.input.getBoundingClientRect();

    this.error.style.left = `${window.scrollX + left - this.input.offsetWidth / 3}px`;
    this.error.style.bottom = `${window.scrollY + bottom + 25}px`;

    this.container.appendChild(this.error);
    this.input.addEventListener('focus', this.removeError);
  }

  removeError() {
    this.input.value = '';
    this.error.remove();
  }
}