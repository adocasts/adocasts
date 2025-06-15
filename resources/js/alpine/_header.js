import Alpine from 'alpinejs'

Alpine.data('header', () => ({
  isWindowScrolled: false,
  isShown: true,

  init() {
    this.isWindowScrolled = window.scrollY > 0
    this.onLocationChange({
      detail: {
        location: window.location.href
      }
    })
  },

  onWindowScroll() {
    this.isWindowScrolled = window.scrollY > 0
  },

  onLocationChange(event) {
    const location = event.detail.location
    this.isShown = !location.includes('/lessons/')
  }
}))

Alpine.data('nav', () => ({
  activeMenu: '',
  closeDelay: 200,
  closeTimeout: null,

  onItemHover(el, identifier) {
    this.activeMenu = identifier
    this.reposition(el)
  },

  onDropdownHover() {
    this.clearTimeout()
  },

  onMouseLeave() {
    this.menuTimeout = setTimeout(() => {
      this.close()
    }, this.closeDelay)
  },

  close() {
    this.activeMenu = ''
  },

  reposition(el) {
    this.clearTimeout()
    this.$refs.dropdown.style.left = el.offsetLeft + 'px'
    this.$refs.dropdown.style.marginLeft = el.offsetWidth / 2 + 'px'
  },

  clearTimeout() {
    clearTimeout(this.menuTimeout)
  },
}))
