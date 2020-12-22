import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initPages: function () {
    const thisApp = this;
    this.pages = document.querySelector(select.containerOf.pages).children;
    this.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');
    let pageMatchingHash = this.pages[0].id;

    for (let page of this.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }
    this.activatePage(pageMatchingHash);

    for (let link of this.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();
        const id = clickedElement.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);

        window.location.hash = `#/${id}`;
      });
    }
  },

  activatePage: function (pageId) {
    for (let page of this.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    for (let link of this.navLinks) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == `#${pageId}`);
    }

  },
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
    this.initPages();
  },
};

app.init();

