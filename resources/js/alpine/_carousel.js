import Alpine from 'alpinejs'

Alpine.data('carousel', () => ({
  scrollState: 'left',

  get overflowStyle() {
    return {
      '--opacity-left': this.scrollState === 'left' ? 0 : 1,
      '--opacity-right': this.scrollState === 'right' ? 0 : 1,
    }
  },

  init() {
    this.scrollState = this.getScrollState([...this.$el.children].at(0))
  },

  handleScroll(event) {
    this.scrollState = this.getScrollState(event.target)
  },

  getScrollState(target) {
    const { scrollLeft, scrollWidth, clientWidth } = target
    
    if (scrollLeft === 0) {
      return 'left'
    } else if (scrollLeft + clientWidth >= scrollWidth) {
      return 'right'
    } else {
      return 'middle'
    }
  },
}))
