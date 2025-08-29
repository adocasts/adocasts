import Alpine from 'alpinejs'

Alpine.data('seriesCard', () => ({
  scrollState: 'top',

  get overflowStyle() {
    return {
      '--opacity-top': this.scrollState === 'top' ? 0 : 1,
      '--opacity-bottom': this.scrollState === 'bottom' ? 0 : 1,
    }
  },

  init() {
    this.scrollState = this.getScrollState([...this.$el.children].at(0))
  },

  handleScroll(event) {
    this.scrollState = this.getScrollState(event.target)
  },

  getScrollState(target) {
    const { scrollTop, scrollHeight, clientHeight } = target
    
    if (scrollTop === 0) {
      return 'top'
    } else if (Math.ceil(scrollTop + clientHeight) >= scrollHeight) {
      return 'bottom'
    } else {
      return 'middle'
    }
  },
}))
