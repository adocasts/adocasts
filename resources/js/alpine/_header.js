import Alpine from "alpinejs"

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
    this.$refs.dropdown.style.marginLeft = (el.offsetWidth / 2) + 'px'
  },

  clearTimeout() {
    clearTimeout(this.menuTimeout)
  }
}))