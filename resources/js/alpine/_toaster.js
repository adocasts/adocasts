import Alpine from 'alpinejs'

Alpine.data("toaster", (toasts) => ({
  toasts,

  toast(type, message) {
    if (typeof type === 'object') {
      return this.toasts.push(type)
    }

    this.toasts.push({ type, message })
  },

  run(toasts) {
    this.toasts = this.toasts.concat(toasts)
  },

  remove(key) {
    this.toasts = this.toasts.filter(toast => toast.key !== key)
  }
}))