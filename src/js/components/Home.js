import { templates, select, } from '../settings.js';
import Carousel from './Carousel.js';

class Home {
  constructor(element) {
    this.render(element);
    this.initWidgets();
  }

  render(element) {
    const generatedHTML = templates.homeWidget();

    this.dom = {};
    this.dom.wrapper = element;
    this.dom.wrapper.innerHTML = generatedHTML;

    this.dom.carouselWidget = this.dom.wrapper.querySelector(select.widgets.carousel.wrapper);
    this.dom.orderButton = this.dom.wrapper.querySelector(select.home.orderButton);
    this.dom.bookButton = this.dom.wrapper.querySelector(select.home.bookButton);
    this.navLinks = document.querySelectorAll(select.nav.links);
  }

  initWidgets() {
    this.carouselWidget = new Carousel(this.dom.carouselWidget);
  }
}

export default Home;