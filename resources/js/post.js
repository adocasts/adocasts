let isYtVideoPlaying = false
window.initVideo = function ({ el = 'ytEmbed', videoId, httpMethod = 'post', httpUrl, httpPayload = {}, watchSeconds = 0 } = {}) {
  const tag = document.createElement('script')
  const appCompleted = document.getElementById('appCompleted')
  let player
  let playerInterval
  tag.src = "https://www.youtube.com/iframe_api"
  document.body.appendChild(tag)

  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player(el, {
      videoId: videoId,
      playerVars: {
        autoplay: window.$params.autoplay ?? 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        ecver: 2,
        start: watchSeconds
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    })
  }

  function onPlayerReady(event) {
    // player.playVideo()
    // setTimeout(() => player.pauseVideo(), 500)
    // setTimeout(() => player.seekTo(300), 500)
    window.player = player
  }

  function onPlayerStateChange(event) {
    isYtVideoPlaying = event.data == YT.PlayerState.PLAYING

    if (isYtVideoPlaying) {
      playerInterval = setInterval(async () => {
        const currentTime = player.getCurrentTime()
        const duration = player.getDuration()

        // duration may be 0 if meta data is still loading
        if (duration !== 0) {
          await storeWatchingProgression(currentTime, duration)
        }
      }, 15000)
    } else {
      const currentTime = player.getCurrentTime()
      const duration = player.getDuration()

      clearInterval(playerInterval)
      storeWatchingProgression(currentTime, duration)
    }
  }

  async function storeWatchingProgression(currentTime, duration) {
    const watchPercent = Math.floor(currentTime / duration * 100)
    const { data } = await axios[httpMethod](httpUrl, {
      ...httpPayload,
      watchPercent,
      watchSeconds: Math.floor(currentTime)
    })

    const isCompleted = data.progression.isCompleted
    const event = new CustomEvent('completed', { detail: { isCompleted } })
    appCompleted.dispatchEvent(event)
  }
}

// scroll active series item into view
// document.querySelector('ol li a.active').scrollIntoView({
//   behavior: 'smooth',
//   block: 'nearest',
//   inline: 'start'
// })

window.initProgression = function ({ storeProgression = false, httpMethod = 'post', httpUrl, httpPayload }) {
  const post = document.querySelector(".body-content .prose")
  const progress = document.getElementById("reading-progress")
  const appCompleted = document.getElementById('appCompleted')
  let inViewport = false
  let intersectionY = 0

  let observer = new IntersectionObserver(handler)

  observer.observe(post)

  function handler(entries, observer) {
    for (entry of entries) {
      intersectionY = entry.boundingClientRect.y

      if (entry.isIntersecting) {
        inViewport = true
      } else {
        inViewport = false
      }
    }
  }

  /* Get the percentage scrolled of an element. It does not change if its not in view.*/
  function getScrollProgress(el) {
    let progressPercentage = 0

    if (inViewport || intersectionY < 0) {
      let coords = el.getBoundingClientRect()
      let height = coords.height

      if(coords.top < 0){
        progressPercentage = (Math.abs(coords.top) / height) * 100
      }
    }

    return progressPercentage
  }

  /* Set the reading aside using the value attribute*/
  function showReadingProgress() {
    const scrollProgress = getScrollProgress(post)

    progress.setAttribute("value", scrollProgress)

    scrollProgress > 0
      ? progress.classList.remove('hidden')
      : progress.classList.add('hidden')

    scrollProgress >= 93
      ? progress.classList.add('is-complete')
      : progress.classList.remove('is-complete')

    return scrollProgress
  }

  async function storeReadingProgression(scrollProgress) {
    if (!storeProgression) return
    const readPercent = Math.floor(scrollProgress)
    const { data } = await axios[httpMethod](httpUrl, { ...httpPayload, readPercent })
    const isCompleted = data.progression.isCompleted
    const event = new CustomEvent('completed', { detail: { isCompleted } })
    appCompleted.dispatchEvent(event)
  }

  /* Use requestAnimationFrame*/
  var timeout
  var saveTimeout
  var lastScrollProgress = 0

  window.onscroll = function () {
    if (timeout) {
      window.cancelAnimationFrame(timeout)
    }

    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    timeout = window.requestAnimationFrame(function () {
      // Run our scroll functions
      lastScrollProgress = showReadingProgress()
    });

    saveTimeout = setTimeout(() => storeReadingProgression(lastScrollProgress), 1500)
  }
}


