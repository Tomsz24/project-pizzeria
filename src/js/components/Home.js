import { templates, select, } from '../settings.js';
class Home {
  constructor(element) {
    this.render(element);
  }

  render(element) {
    const generatedHTML = templates.homeWidget();

    this.dom = {};
    this.dom.wrapper = element;
    this.dom.wrapper.innerHTML = generatedHTML;

    this.dom.orderButton = this.dom.wrapper.querySelector(select.home.orderButton);
    this.dom.bookButton = this.dom.wrapper.querySelector(select.home.bookButton);
    this.navLinks = document.querySelectorAll(select.nav.links);
  }
}

export default Home;