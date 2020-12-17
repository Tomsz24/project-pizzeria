import { select, classNames, templates, settings } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    this.products = [];
    this.getElements(element);
    this.initActions();
  }

  getElements(element) {
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.toggleTrigger = this.dom.wrapper.querySelector(select.cart.toggleTrigger);
    this.dom.productList = this.dom.wrapper.querySelector(select.cart.productList);
    this.dom.deliveryFee = this.dom.wrapper.querySelector(select.cart.deliveryFee);
    this.dom.subtotalPrice = this.dom.wrapper.querySelector(select.cart.subtotalPrice);
    this.dom.totalPrice = this.dom.wrapper.querySelector(select.cart.totalPrice);
    this.dom.totalNumber = this.dom.wrapper.querySelector(select.cart.totalNumber);
    this.dom.totalPriceSummary = this.dom.wrapper.querySelector(select.cart.totalPriceSummary);
    this.dom.form = this.dom.wrapper.querySelector(select.cart.form);
    this.dom.address = this.dom.wrapper.querySelector(select.cart.address);
    this.dom.phone = this.dom.wrapper.querySelector(select.cart.phone);
  }

  initActions() {
    this.dom.toggleTrigger.addEventListener('click', () => {
      this.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    this.dom.productList.addEventListener('updated', () => {
      this.update();
    });
    this.dom.productList.addEventListener('remove', event => {
      this.remove(event.detail.cartProduct);
    });
    this.dom.form.addEventListener('submit', event => {
      event.preventDefault();
      this.sendOrder();
    });
  }

  add(menuProduct) {
    const generateHTML = templates.cartProduct(menuProduct);
    const generateDOM = utils.createDOMFromHTML(generateHTML);
    this.dom.productList.appendChild(generateDOM);

    this.products.push(new CartProduct(menuProduct, generateDOM));
    this.update();
  }

  update() {
    const deliveryFee = settings.cart.defaultDeliveryFee;
    this.totalNumber = 0;
    this.subtotalPrice = 0;

    for (const element of this.products) {
      this.totalNumber += element.amount;
      this.subtotalPrice += element.price;
    }

    this.dom.totalNumber.textContent = this.totalNumber;
    this.dom.subtotalPrice.textContent = this.subtotalPrice;
    if (this.totalNumber > 0) {
      this.dom.deliveryFee.textContent = deliveryFee;
      this.dom.totalPriceSummary.textContent = this.subtotalPrice + deliveryFee;
      this.dom.totalPrice.textContent = this.subtotalPrice + deliveryFee;
    } else {
      this.dom.deliveryFee.textContent = 0;
      this.dom.totalPriceSummary.textContent = 0;
      this.dom.totalPrice.textContent = 0;
    }
  }

  remove(product) {
    const index = this.products.indexOf(product);
    this.dom.productList.children.item(index).remove();
    this.products.splice(index, 1);
    this.update();
  }

  sendOrder() {
    const url = `${settings.db.url}/${settings.db.order}`;


    const payload = {
      address: this.dom.address.value,
      phone: this.dom.phone.value,
      totalPrice: this.subtotalPrice + settings.cart.defaultDeliveryFee,
      totalNumber: this.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      subTotalPrice: this.subtotalPrice,
      products: [],
    };

    for (let product of this.products) {
      payload.products.push(product.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
    console.log(payload);
  }
}

export default Cart;