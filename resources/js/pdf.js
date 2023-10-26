import Alpine from 'alpinejs'
import { domToJpeg } from 'modern-screenshot'
import { jsPDF } from 'jspdf'
import axios from 'axios'

Alpine.data('pdf', function ({ filename = 'invoice.pdf', ...data }) {
  return {
    ...data,
    showConfirm: false,
    isExporting: false,
    isDone: false,
    scale: '1',
    timeout: null,

    init() {
      this.scalePage()
      window.onresize = () => this.scalePage()
      window.onbeforeprint = this.scalePage(1)
      window.onafterprint = this.scalePage()
    },

    scalePage(scale) {
      if (!scale) {
        scale = (document.body.clientWidth - 16) / this.$refs.page.clientWidth
      }
      
      this.scale = scale > 1 ? 1 : scale
      this.$refs.page.style.setProperty('--scale', this.scale)
      this.scale === 1 
        ? this.$refs.page.classList.remove('scaled')
        : this.$refs.page.classList.add('scaled')
    },

    async onPrint(element) {
      window.print()
    },

    async onExport(element) {
      this.scalePage(1)
      setTimeout(async () => {
        const jpeg = await domToJpeg(element, { scale: 2, quality: .75 })
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'in'
        })

        this.scalePage()

        doc.setPage(1)
        doc.addImage(jpeg, 'JPEG', 0, 0, 8.27, 11.69, null, 'FAST')

        this.addLinks(element, doc)

        doc.save(filename)
      }, 300)
    },

    addLinks(element, doc) {
      const links = Array.from(element.querySelectorAll('a[href]'))

      links.map(link => {
        const rect = link.getBoundingClientRect()
        const { left, top } = this.getOffset(link)
        const x = this.getInchesFromPixels(left)
        const y = this.getInchesFromPixels(top)
        const width = this.getInchesFromPixels(rect.width)
        const height = this.getInchesFromPixels(rect.height)
        const config = link.dataset.page
          ? { pageNumber: parseInt(link.dataset.page) }
          : { url: link.href }

        doc.link(x, y, width, height, config)
      })
    },

    getOffset(element, acc = { left: 0, top: 0 }) {
      acc.left += element.offsetLeft
      acc.top += element.offsetTop

      if (element.offsetParent && !element.offsetParent.classList.contains('pdf-page')) {
        acc = this.getOffset(element.offsetParent, acc)
      }

      return acc
    },

    getInchesFromPixels(pixels) {
      const ppi = 96
      const dpi = devicePixelRatio
      return pixels / dpi / ppi
    },

    confirmBillToInfo() {
      if (!this.billToInfo) {
        this.billToInfo = this.isCustomBillTo 
          ? this.$refs.billToInfoCustom.innerHTML.replaceAll('<br>', '\n')
          : this.$refs.billToInfo.innerHTML.replaceAll('<br>', '\n')
      }

      this.showConfirm = true
    },

    async saveBillToInfo() {
      const billToInfo = this.billToInfo
      try {
        this.isSavingBillTo = true
        
        const { data } = await axios.patch('/api/users/billto', { billToInfo })

        this.successBillTo = data.clearedBillTo 
          ? `Your address info has been reset back to the invoice original`
          : `Your address info has been saved successfully`

        if (data.clearedBillTo) {
          this.changeIsCustomBillTo(false)
        }
      } catch (error) {
        this.errorBillTo = `Sorry, something went wrong. We've logged this error and will have it fixed soon`
      } finally {
        this.isSavingBillTo = false
      }

      setTimeout(() => {
        this.successBillTo = null
        this.errorBillTo = null
      }, 7500)
    },

    changeIsCustomBillTo(value) {
      this.isCustomBillTo = value
      this.billToInfo = this.isCustomBillTo 
          ? this.$refs.billToInfoCustom.innerHTML.replaceAll('<br>', '\n')
          : this.$refs.billToInfo.innerHTML.replaceAll('<br>', '\n')
    }
  }
})

Alpine.start()
