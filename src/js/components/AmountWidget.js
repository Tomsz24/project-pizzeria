import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    this.getElements(element);
    this.initActions();
  }

  getElements() {
    this.dom.input = this.dom.wrapper.querySelector(select.widgets.amount.input);
    this.dom.linkDecrease = this.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    this.dom.linkIncrease = this.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  initActions() {
    this.dom.input.value = settings.amountWidget.defaultValue;
    this.dom.input.addEventListener('change', (event) => {
      event.preventDefault();
      this.setValue(this.dom.input.value);
    });

    this.dom.linkDecrease.addEventListener('click', event => {
      event.preventDefault();
      this.setValue(--this.dom.input.value);
    });

    this.dom.linkIncrease.addEventListener('click', event => {
      event.preventDefault();
      this.setValue(++this.dom.input.value);
    });
  }

  isValid(value) {
    return !isNaN(value) && value >= settings.amountWidget.defaultMin && value <= settings.amountWidget.defaultMax;
  }

  renderValue() {
    this.dom.input.value = this.value;
  }
}

export default AmountWidget;