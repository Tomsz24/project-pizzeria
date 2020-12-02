/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      });
    }

    initAmountWidget() {
      this.amountWidget.addEventListener('updated', () => {
        this.proccesOrder();
      });
      this.amountWidget = new AmountWidget(this.amountWidget);
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
      price *= this.amountWidget.value;
      this.priceElem.innerHTML = price;
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
      const event = new Event('updated');
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

  const app = {
    initMenu: function () {
      for (let productData in this.data.products) {
        new Product(productData, this.data.products[productData]);
      }
    },

    initData: function () {
      this.data = dataSource;
    },

    init: function () {
      this.initData();
      this.initMenu();
    },
  };

  app.init();
}
