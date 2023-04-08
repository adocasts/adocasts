import axios from 'axios'

let isYtVideoPlaying = false
let isInitialLoad = true
let playerInterval = null
let keepPlayerPostId = null
let keepPlayer = false

window.initVideo = function ({ el = 'ytEmbed', autoEmbed = true, videoId, httpMethod = 'post', httpUrl, httpPayload = {}, watchSeconds = 0, isLive = false, autoplay = false } = {}) {
  const startMuted = isLive || autoplay
  const bodyContent = document.querySelector('.body-content')

  if (isLive) {
    autoplay = true
  }

  if (!autoplay) {
    autoplay = window.$params.autoplay ?? 0
  }

  if (autoplay) {
    onInitVideo(true, watchSeconds)
    return
  }

  if (autoEmbed) {
    onInitVideo(false, watchSeconds)
  }

  const placeholder = document.querySelector('[video-placeholder]')
  const element = document.getElementById(el)

  bodyContent?.addEventListener('click', (event) => {
    const isTarget = event.target.classList.contains('timestamp')
    const containsTarget = event.target.closest('.timestamp')

    if (isTarget || containsTarget) {
      const target = isTarget ? event.target : event.target.closest('.timestamp')
      const displayDuration = target.textContent
      const splits = displayDuration.split(':')
      let duration = splits[splits.length]

      if (splits.length > 1) {
        duration = splits.reduce((x, s, i) => {
          return i == splits.length -1 ? x + parseInt(s) : x + (parseInt(s) * 60)
        }, 0)
      }

      if (window.player) {
        window.player.seekTo(duration)
      } else {
        onInitVideo(true, duration)
      }

      window.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth'
      })
    }
  })

  element.addEventListener('click', () => {
    element.removeEventListener('click', onInitVideo)
    onInitVideo(true, watchSeconds)
  })

  function onInitVideo(playOnReady, skipToSeconds = watchSeconds) {
    keepPlayerPostId = httpPayload.postId
    keepPlayer = false

    window.onYouTubeIframeAPIReady = function () {
      const playerVars = {
        autoplay: playOnReady,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        ecver: 2,
        start: skipToSeconds
      }

      if (isLive) {
        delete playerVars.start
      }

      window.player = new YT.Player(el, {
        videoId: videoId,
        playerVars,
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      })
    }

    if (isInitialLoad) {
      const tag = document.createElement('script')

      let playerInterval
      tag.src = "https://www.youtube.com/iframe_api"
      document.body.appendChild(tag)
      isInitialLoad = false
    } else {
      window.onYouTubeIframeAPIReady()
    }

    function onPlayerReady(event) {
      // setTimeout(() => player.pauseVideo(), 500)
      // setTimeout(() => player.seekTo(300), 500)
      if (startMuted) {
        event.target.mute()
      }
    }

    function onPlayerStateChange(event) {
      isYtVideoPlaying = event.data == YT.PlayerState.PLAYING

      // only update keepPlayer when on video's designated page
      if (location.pathname === placeholder.dataset.path) {
        keepPlayer = isYtVideoPlaying
        keepPlayerPostId = httpPayload.postId
      }

      if (isLive) return

      if (isYtVideoPlaying) {
        playerInterval = setInterval(async () => {
          const currentTime = window.player.getCurrentTime()
          const duration = window.player.getDuration()

          // duration may be 0 if meta data is still loading
          if (duration !== 0) {
            await storeWatchingProgression(currentTime, duration)
          }
        }, 15000)
      } else {
        const currentTime = window.player.getCurrentTime()
        const duration = window.player.getDuration()

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
      const btnCompleted = document.querySelector('[btn-completed]')
      const btnNotCompleted = document.querySelector('[btn-not-completed]')

      if (!btnCompleted || !btnNotCompleted) return

      if (isCompleted) {
        btnCompleted.classList.remove('hidden')
        btnNotCompleted.classList.add('hidden')
      } else {
        btnNotCompleted.classList.remove('hidden')
        btnCompleted.classList.add('hidden')
      }
    }
  }
}

let lessonVideoIntersection
let lessonVideoResize
let wasIntersecting = undefined

up.compiler('#lessonVideoEmbed', function(element) {
  const isInitialized = element.nodeName === 'IFRAME'
  const isPostPage = !!document.getElementById('videoPlayerPosition')

  // if not post page and player is already initialized, do nothing
  if (!isPostPage && isInitialized) return

  const data = element.dataset

  // re-position to primary position when re-initialized
  positionVideoPlaceholder()

  // kick-off video initialization
  initVideo({
    el: 'lessonVideoEmbed',
    isLive: data.isLive == "true",
    videoId: data.videoId,
    watchSeconds: parseInt(data.watchSeconds || '0'),
    httpUrl: data.httpUrl,
    httpPayload: {
      postId: data.payloadPostId,
      collectionId: data.payloadCollectionId,
      userId: data.payloadUserId,
      route: data.payloadRoute
    }
  })

  if (!!window.ResizeObserver) {
    let observer = new ResizeObserver((entries) => {
      if (typeof wasIntersecting !== 'undefined') {
        positionVideoPlaceholder(!wasIntersecting)
      }
    })

    observer.observe(document.body)
    lessonVideoResize = () => observer.unobserve(document.body)
  }
})

up.compiler('#videoPlayerPosition', position => {
  if (typeof lessonVideoIntersection == 'function') {
    lessonVideoIntersection()
  }

  // ensure the player gets opened back up
  const placeholder = document.querySelector('[video-placeholder]')
  placeholder?.dispatchEvent(new CustomEvent('open'))

  // if (!isYtVideoPlaying) {
  //   const embed = document.getElementById('lessonVideoEmbed')
  //   if (embed) {
  //     embed.dataset.keepPlayer = false
  //   }
  // }

  // move to small position when primary position is out of view
  if(!!window.IntersectionObserver) {
    let observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        wasIntersecting = entry.isIntersecting
        positionVideoPlaceholder(!entry.isIntersecting)
      });
    }, { rootMargin: "0px" });

    observer.observe(position)
    lessonVideoIntersection = () => observer.unobserve(position)
  }
})

up.on('up:location:changed', function(event) {
  const placeholder = document.querySelector('[video-placeholder]')
  const element = document.getElementById('lessonVideoEmbed')

  // if video hasn't loaded yet - don't do anything
  if (!element || element.nodeName !== 'IFRAME') return

  // if opening user menu, don't do anything
  if (event.url === '/users/menu') return

  const videoPath = placeholder.dataset.path
  const isVideoPath = videoPath == location.pathname
  const isSamePost = !keepPlayerPostId || keepPlayerPostId == placeholder.dataset.postId

  if (!keepPlayer && !isVideoPath && isSamePost) {
    placeholder.dispatchEvent(new CustomEvent('close'))
    return
  }
})

// change to small player if the page doesn't contain it's positioning element
up.on('up:fragment:loaded', event => {
  setTimeout(() => {
    const main = document.querySelector('[up-main]')
    const mains = Array.from(document.querySelectorAll('[up-main-header], [up-main-footer]'))

    if (main.classList.contains('lesson-wrapper')) {
      mains.map(m => m.classList.add('lesson-wrapper'))
    } else {
      mains.map(m => m.classList.remove('lesson-wrapper'))
    }
  }, 300)

  const isLayer = ['modal', 'drawer'].includes(event.request.mode)
  const isSmallPlayer = !event.response.text.includes('id="videoPlayerPosition"')
  positionVideoPlaceholder(isSmallPlayer && !isLayer)
})

const footer = document.querySelector('footer')
window.addEventListener('scroll', () => {
  const placeholder = document.querySelector('[video-placeholder]')
  const scrollBottom = document.documentElement.scrollTop + document.documentElement.clientHeight
  const footerTop = footer.offsetTop

  if (scrollBottom >= footer.offsetTop) {
    placeholder.style.bottom = `${scrollBottom - footerTop}px`
    placeholder.style.transition = "unset"
  } else {
    placeholder.style.bottom = null
    placeholder.style.transition = null
  }
})

function positionVideoPlaceholder(isSmallPlayer = false) {
  const placeholder = document.querySelector('[video-placeholder]')

  if (!placeholder) return

  const videoPath = placeholder.dataset.path
  const isVideoPath = videoPath == location.pathname

  if (isSmallPlayer) {
    isVideoPath
      ? placeholder.classList.add('video-noactions')
      : placeholder.classList.remove('video-noactions')

    placeholder.classList.add('video-small')
    placeholder.classList.remove('aspect-video')
    placeholder.removeAttribute('style')

    return
  }

  const position = document.getElementById('videoPlayerPosition')
  const rect = offset(position)

  if (!rect) return

  placeholder.classList.add('aspect-video')
  placeholder.classList.remove('video-small', 'video-noactions')
  placeholder.style.position = 'absolute'
  placeholder.style.padding = 0
  placeholder.style.width = rect.width + 'px'
  placeholder.style.hight = rect.height + 'px'
  placeholder.style.left = rect.left + 'px'
  placeholder.style.top = rect.top + 'px'
}

function offset(el) {
  if (!el) return
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height
  };
}
