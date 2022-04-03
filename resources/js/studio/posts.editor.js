import { DateTime } from 'luxon'

// publish at btn updator
document.addEventListener('DOMContentLoaded', function() {

  const now = DateTime.now()

  const dateEl = document.forms.postForm.publishAtDate
  const timeEl = document.forms.postForm.publishAtTime

  dateEl.addEventListener('input', (event) => {
    const dte = getDateTimeFromForm()
    updatePublishText(dte)
  })

  timeEl.addEventListener('input', (event) => {
    const dte = getDateTimeFromForm()
    updatePublishText(dte)
  })

  const dte = getDateTimeFromForm()
  const btnPublish = document.getElementById('btnPublish')
  const initialPublishText = btnPublish.innerText;

  if (dte.isValid) {
    updatePublishText(dte)
  } else {
    updatePublishText(now)
  }

  function getDateTimeFromForm() {
    const date = dateEl.value
    const time = timeEl.value
    return DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm')
  }

  function updatePublishText(dte) {
    if (dte > now) {
      btnPublish.innerText = `Publish ${dte.toFormat('ccc DD t ZZZZ')}`
    } else {
      btnPublish.innerText = initialPublishText
    }
  }

})

class VideoManager {
  static #normalizeSource(source) {
    return source
      .replace('www.', '')
      .replace('https://youtu.be/', 'https://youtube.com/watch?v=')
      .replace('https://youtube-nocookie.com/embed/', 'https://youtube.com/watch?v=')
      .replace('https://youtube.com/embed/', 'https://youtube.com/watch?v=')
      .replace('https://player.vimeo.com/video', 'https://vimeo.com/')
      .trim()
      .split('&')[0]
  }

  static #isSourceValid(source) {
    const videoId = source.replace('https://youtube.com/watch?v=', '')
    return (source.startsWith('https://youtube.com/watch?v=') || source.startsWith('https://vimeo.com/')) && videoId.length
  }

  static #embed(source) {
    const videoId = source.replace('https://youtube.com/watch?v=', '')
    const tag = document.createElement('script')
    let player

    tag.src = "https://www.youtube.com/iframe_api"
    document.body.appendChild(tag)

    function onPlayerReady(event) {
      const duration = player.getDuration()
      document.querySelector('input[name=videoSeconds]').value = duration
    }

    window.onYouTubeIframeAPIReady = function () {
      player = new YT.Player('videoDurationEmbed', {
        videoId: videoId,
        events: {
          'onReady': onPlayerReady,
        }
      })
    }
  }

  static getEmbed(source) {
    var embedUrl = source
      .replace('https://youtube.com/watch?v=', 'https://youtube.com/embed/')
      .replace('https://vimeo.com/', 'https://player.vimeo.com/video/')

    return `
      <iframe
        style="width: 100%;"
        src="${embedUrl}"
        frameborder="0"
        allow="accelerometer;autoplay;encrypted-media;gyroscope;picture-in-picture"
        allowfullscreen
      ></iframe>`
  }

  static onInput(event) {
    const element = event.target ? event.target : event

    if (!element.dataset.previewSelector) {
      console.warn('Video input is missing a preview selector')
      return
    }

    const source = this.#normalizeSource(element.value)
    const isValid = this.#isSourceValid(source)

    if (!isValid) return

    this.#embed(source)
  }

  static onLoad(element) {
    this.onInput(element)
  }
}

window.videoManager = VideoManager
