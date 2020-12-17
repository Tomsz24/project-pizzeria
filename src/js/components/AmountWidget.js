import { settings, select } from '../settings.js';

class AmountWidget {
  constructor(element) {
    this.element = element;
    this.getElements(element);
    this.initActions();
    this.setValue(this.input.value);
  }

  getElements(element) {
    this.element = element;
    this.input = this.element.querySelector(select.widgets.amount.input);
    this.linkDecrease = this.element.querySelector(select.widgets.amount.linkDecrease);
    this.linkIncrease = this.element.querySelector(select.widgets.amount.linkIncrease);
  }

  initActions() {
    this.input.value = settings.amountWidget.defaultValue;
    this.input.addEventListener('change', (event) => {
      event.preventDefault();
      this.setValue(this.input.value);
    });

    this.linkDecrease.addEventListener('click', event => {
      event.preventDefault();
      this.setValue(--this.input.value);
    });

    this.linkIncrease.addEventListener('click', event => {
      event.preventDefault();
      this.setValue(++this.input.value);
    });
  }

  announce() {
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    this.element.dispatchEvent(event);
  }

  setValue(value) {
    const newValue = parseInt(value);
    if (this.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
      this.value = newValue;
      this.input.value = this.value;
      this.announce();
    }
    this.input.value = this.value;
  }
}

export default AmountWidget;