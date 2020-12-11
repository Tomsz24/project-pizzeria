/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        // input: 'input[name="amount"]',
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong',
      totalPriceSummary: '.cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      this.id = id;
      this.data = data;
      this.renderInMenu();
      this.getElements();
      this.initAccordion();
      this.initOrderForm();
      this.initAmountWidget();
      this.proccesOrder();

    }

    renderInMenu() {
      const generateHTML = templates.menuProduct(this.data);
      this.element = utils.createDOMFromHTML(generateHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(this.element);
    }

    getElements() {
      this.accordionTrigger = this.element.querySelector(select.menuProduct.clickable);
      this.form = this.element.querySelector(select.menuProduct.form);
      this.formInputs = this.form.querySelectorAll(select.all.formInputs);
      this.cartButton = this.element.querySelector(select.menuProduct.cartButton);
      this.priceElem = this.element.querySelector(select.menuProduct.priceElem);
      this.imageWrapper = this.element.querySelector(select.menuProduct.imageWrapper);
      this.amountWidget = this.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion() {
      this.accordionTrigger.addEventListener('click', event => {
        event.preventDefault();
        const activeProducts = document.querySelectorAll('.product.active');
        this.element.classList.toggle(classNames.menuProduct.wrapperActive);
        for (const activeProduct of activeProducts) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
      });
    }

    initOrderForm() {
      this.form.addEventListener('submit', event => {
        event.preventDefault();
        this.proccesOrder();
      });

      for (let input of this.formInputs) {
        input.addEventListener('change', () => {
          this.proccesOrder();
        });
      }

      this.cartButton.addEventListener('click', event => {
        event.preventDefault();
        this.proccesOrder();
        this.addToCart();
      });
    }

    initAmountWidget() {
      this.amountWidget.addEventListener('updated', () => {
        this.proccesOrder();
      });
      this.amountWidget = new AmountWidget(this.amountWidget);
    }

    addToCart() {
      app.cart.add(this.prepareCartProduct());
    }

    proccesOrder() {
      const formData = utils.serializeFormToObject(this.form);
      let price = this.data.price;

      for (let paramId in this.data.params) {
        const param = this.data.params[paramId];

        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          const optionImage = this.imageWrapper.querySelector(`.${paramId}-${optionId}`);
          if (optionImage) {
            if (optionSelected) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }

          if (optionSelected) {
            if (!option.default) {
              price += option.price;
            }
          } else {
            if (option.default) {
              price -= option.price;
            }
          }
        }
      }
      this.priceSingle = price;
      price *= this.amountWidget.value;
      this.priceElem.innerHTML = price;
    }

    prepareCartProduct() {
      const productSummary = {
        id: this.id,
        name: this.data.name,
        amount: this.amountWidget.value,
        priceSingle: this.priceSingle,
        price: this.priceSingle * this.amountWidget.value,
        params: this.prepareCartProductParams(),

      };
      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};

      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        params[paramId] = {
          label: param.label,
          options: {},
        };

        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected) {
            params[paramId].options[option.label] = option.label;
          }
        }
      }
      return params;
    }

  }
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
      // const event = new Event('updated');
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
    }

    initActions() {
      this.dom.toggleTrigger.addEventListener('click', () => {
        this.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      this.dom.productList.addEventListener('updated', () => {
        this.update();
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
      let totalNumber = 0;
      let subtotalPrice = 0;

      for (const element of this.products) {
        element.amount *= 1;
        totalNumber += element.amount
        subtotalPrice += element.price;
      }

      this.dom.totalNumber.textContent = parseInt(totalNumber);
      this.dom.subtotalPrice.textContent = subtotalPrice;
      if (totalNumber > 0) {
        this.dom.deliveryFee.textContent = deliveryFee;
        this.dom.totalPriceSummary.textContent = subtotalPrice + deliveryFee;
        this.dom.totalPrice.textContent = subtotalPrice + deliveryFee;
      } else {
        this.dom.deliveryFee.textContent = 0;
        this.dom.totalPriceSummary.textContent = 0;
        this.dom.totalPrice.textContent = 0;
      }
    }
  }

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
      this.dom.wrapper = new AmountWidget(this.dom.amountWidget);
      this.dom.input.value = this.amount;

      this.dom.amountWidget.addEventListener('updated', () => {
        this.amount = this.dom.input.value;
        this.price = this.amount * this.priceSingle;
        this.dom.price.innerHTML = this.price;
      });
    }
  }

  const app = {
    initMenu: function () {
      for (let productData in this.data.products) {
        new Product(productData, this.data.products[productData]);
      }
    },

    initData: function () {
      this.data = dataSource;
    },

    initCart: function () {
      const cartElement = document.querySelector(select.containerOf.cart);
      this.cart = new Cart(cartElement);
    },

    init: function () {
      this.initData();
      this.initMenu();
      this.initCart();
    },
  };

  app.init();
}
