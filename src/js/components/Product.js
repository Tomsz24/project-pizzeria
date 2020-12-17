import { templates, select, classNames } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';

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
    console.log(this.element);
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
    // app.cart.add(this.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: this.prepareCartProduct(),
      },
    });

    this.element.dispatchEvent(event);
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

export default Product;