import { settings, select } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initMenu: function () {
    for (let productData in this.data.products) {
      new Product(this.data.products[productData].id, this.data.products[productData]);
    }
  },

  initData: function () {
    this.data = {};
    const url = `${settings.db.url}/${settings.db.product}`;

    fetch(url).then(function (rawResponse) {
      return rawResponse.json();
    }).then(parsedResponse => {
      this.data.products = parsedResponse;
      app.initMenu();
    });
  },

  initCart: function () {
    const cartElement = document.querySelector(select.containerOf.cart);
    this.cart = new Cart(cartElement);

    this.productList = document.querySelector(select.containerOf.menu);

    this.productList.addEventListener('add-to-cart', event => {
      app.cart.add(event.detail.product);
    });
  },

  init: function () {
    this.initData();
    this.initCart();
  },
};

app.init();

