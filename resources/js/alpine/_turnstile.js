import Alpine from "alpinejs"

Alpine.data('turnstile', function () {
  return {
    onRender(sitekey) {
      turnstile.render(this.$el, {
        sitekey,
        callback: function (token) {
          console.log({ turnstile: token })
        },
      })
    },
  }
})