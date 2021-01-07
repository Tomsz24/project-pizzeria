class Carousel {
  constructor(element) {
    this.render(element);
    this.initPlugin();
  }

  render(element) {
    this.wrapper = element;
  }

  initPlugin() {
    //eslint-disable-next-line no-undef
    new Flickity(this.wrapper, {
      cellAlign: 'left',
      wrapAround: true,
      contain: true,
      prevNextButtons: false,
      autoPlay: true,
    });
  }
}

export default Carousel;