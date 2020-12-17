import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    this.id = menuProduct.id;
    this.amount = menuProduct.amount;
    this.price = menuProduct.price;
    this.name = menuProduct.name;
    this.priceSingle = menuProduct.priceSingle;
    this.params = menuProduct.params;
    this.getElements(element);
    this.initAmountCartProductWidget();
    this.initActions();
  }

  getElements(element) {
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.amountWidget = this.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    this.dom.price = this.dom.wrapper.querySelector(select.cartProduct.price);
    this.dom.edit = this.dom.wrapper.querySelector(select.cartProduct.edit);
    this.dom.remove = this.dom.wrapper.querySelector(select.cartProduct.remove);
    this.dom.input = this.dom.wrapper.querySelector(select.widgets.amount.input);
  }

  initAmountCartProductWidget() {
    this.amountWidget = new AmountWidget(this.dom.amountWidget);
    this.amountWidget.input.value = this.amount;

    this.dom.amountWidget.addEventListener('updated', () => {
      this.amount = this.amountWidget.value;
      this.price = this.amount * this.priceSingle;
      this.dom.price.innerHTML = this.price;
    });
  }

  remove() {
    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: this,
      },
    });
    this.dom.amountWidget.dispatchEvent(event);
  }

  initActions() {
    this.dom.edit.addEventListener('click', event => {
      event.preventDefault();
      this.remove();
    });

    this.dom.remove.addEventListener('click', event => {
      event.preventDefault();
      this.remove();
    });
  }

  getData() {
    const products = {
      id: this.id,
      amount: this.amount,
      price: this.price,
      priceSilngle: this.priceSingle,
      name: this.name,
      params: this.params,
    };
    return products;
  }
}

export default CartProduct;