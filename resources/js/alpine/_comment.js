import Alpine from "alpinejs"

Alpine.data('comments', function () {
  return {
    editId: null,
    createId: null,
    create(createId) {
      this.cancel()
      this.createId = createId
    },
    edit(editId) {
      this.cancel()
      this.editId = editId
    },
    cancel() {
      this.editId = null
      this.createId = null
    },
  }
})