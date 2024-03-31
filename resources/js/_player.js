import axios from 'axios'
import Cookies from 'js-cookie'
import Alpine from 'alpinejs'
import { Player } from 'player.js'

let isInitialLoad = true
let isVideoPlaying = false
let playerInterval = null
let keepPlayerPostId = null
let keepPlayer = false
let nextUpInterval = null

class VideoPlayer {
  constructor({
    el = 'ytEmbed',
    autoEmbed = true,
    videoId,
    httpMethod = 'post',
    httpUrl,
    httpPayload = {},
    watchSeconds = 0,
    isCompleted = false,
    isLive = false,
    autoplay = false,
  } = {}) {
    this.element = document.getElementById(el)
    this.progressionInterval = 5000
    this.isSavingProgression = false
    this.autoplay = autoplay
    this.startMuted = isLive
    this.watchSeconds = watchSeconds
    this.isCompleted = isCompleted
    this.bodyContent = document.getElementById('proseBody')
    this.placeholder = document.querySelector('[video-placeholder]')
    this.nextUpEl = document.getElementById('lessonVideoNextUp')
    this.btnCompleted = document.querySelector('[btn-completed]')
    this.btnNotCompleted = document.querySelector('[btn-not-completed]')
    this.elementInitialNodeName = this.element.nodeName
    this.videoId = videoId
    this.autoEmbed = autoEmbed
    this.http = {
      method: httpMethod,
      url: httpUrl,
      payload: httpPayload,
    }

    this.types = {
      YOUTUBE: 'youtube',
      HLS: 'hls',
      BUNNY: 'bunny',
    }

    Cookies.remove('playingId')

    if (isLive) this.autoplay = true
    if (!autoplay) {
      this.autoplay = window.$params.autoplay ?? 0
      delete window.$params.autoplay
    }

    if (watchSeconds) {
      Alpine.store('app').videoTimestamp = watchSeconds
    }

    this.onInitVideo()
  }

  get isYouTube() {
    return this.element.dataset.plyrProvider === 'youtube'
  }

  get isHlsVideo() {
    return this.elementInitialNodeName === 'VIDEO' && this.element.dataset.hlsUrl
  }

  get isBunnyEmbed() {
    return this.element.dataset.plyrProvider === 'bunny'
  }

  get type() {
    if (this.isYouTube) {
      return this.types.YOUTUBE
    } else if (this.isHlsVideo) {
      return this.types.HLS
    } else if (this.isBunnyEmbed) {
      return this.types.BUNNY
    }
  }

  async getCurrentTime() {
    switch (this.type) {
      case this.types.YOUTUBE:
        return this.player.getCurrentTime()
      case this.types.HLS:
        return this.player.currentTime
      case this.types.BUNNY:
        if (!this.player?.elem) return 0
        return new Promise((resolve) => this.player.getCurrentTime(value => resolve(value)))
    }
  }

  async getDuration() {
    switch (this.type) {
      case this.types.YOUTUBE:
        return this.player.getDuration()
      case this.types.HLS:
        return this.player.duration
      case this.types.BUNNY:
        if (!this.player?.elem) return 0
        return new Promise((resolve) => this.player.getDuration(value => resolve(value)))
    }
  }

  // #region Player Initialization

  /**
   * Initialize the video player and it's event listeners
   * @param {boolean} playOnReady
   * @param {number} skipToSeconds
   */
  async onInitVideo(playOnReady = this.autoplay) {
    keepPlayerPostId = this.http.payload.postId
    keepPlayer = false

    // clean up any prior video
    if (window.player && typeof window.player.destroy === 'function') {
      window.player.destroy()
    }

    clearInterval(nextUpInterval)
    clearInterval(playerInterval)

    await this.#initPlayer(playOnReady)

    this.bodyContent?.addEventListener('click', this.#onTimestampClick.bind(this))
  }

  /**
   * initializes either the youtube or plyr player
   * @param {boolean} playOnReady
   * @returns
   */
  async #initPlayer(playOnReady) {
    if (this.isYouTube) {
      this.player = await this.#initYouTubePlayer(playOnReady)
      return
    }

    if (this.isBunnyEmbed) {
      this.player = await this.#initBunnyEmbed(playOnReady)
      return
    }
  }

  /**
   * initializes the youtube player
   * @param {boolean} playOnReady
   * @returns
   */
  async #initYouTubePlayer(playOnReady) {
    return new Promise((resolve) => {
      window.onYouTubeIframeAPIReady = () => {
        const playerVars = {
          autoplay: playOnReady,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          ecver: 2,
          start: this.watchSeconds,
        }

        if (this.isLive) {
          delete playerVars.start
        }

        const player = new YT.Player(this.element, {
          videoId: this.videoId,
          playerVars,
          events: {
            onReady: (event) => this.startMuted && event.target.mute(),
            onStateChange: this.#onYouTubeStateChange.bind(this),
          },
        })

        window.player = player

        resolve(player)
      }

      if (isInitialLoad) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.body.appendChild(tag)
        isInitialLoad = false
      } else {
        window.onYouTubeIframeAPIReady()
      }
    })
  }

  async #initBunnyEmbed(playOnReady) {
    return new Promise((resolve) => {
      const player = new Player(this.element)

      player.on('play', this.#onBunnyStateChange.bind(this, { action: 'play' }))
      player.on('pause', this.#onBunnyStateChange.bind(this, { action: 'pause' }))
      player.on('ended', this.#onBunnyStateChange.bind(this, { action: 'ended'}))
      player.on('timeupdate', this.#onPlayerTimeUpdate.bind(this))

      player.on('ready', () => {
        setTimeout(() => {
          if (!this.isCompleted && this.watchSeconds && !this.isLive) {
            console.log('setting current video time', this.watchSeconds)
            player.setCurrentTime(this.watchSeconds)
          }

          if (this.startMuted) player.mute()
          if (playOnReady) player.play()
        }, 300)

        window.player = player

        resolve(player)
      })
    })
  }

  /**
   * dispatches times updates to the nextUp element
   * @param {CustomEvent} event
   * @returns
   */
  async #onPlayerTimeUpdate(event) {
    const currentTime = Math.ceil(await this.getCurrentTime())
    const duration = Math.ceil(await this.getDuration())

    if (currentTime === this.lastTimeUpdate) return

    this.lastTimeUpdate = currentTime

    Alpine.store('app').videoTimestamp = currentTime

    // don't dispatch to nextUp if player isn't actively playing
    if (!isVideoPlaying) return

    if (this.nextUpEl) {
      this.nextUpEl.dispatchEvent(
        new CustomEvent('timeupdate', { detail: { currentTime, duration } })
      )
    }
  }

  // #endregion
  // #region Player State Handlers

  #onYouTubeStateChange(event) {
    isVideoPlaying = event.data == YT.PlayerState.PLAYING

    Alpine.store('app').videoPlaying = isVideoPlaying

    if (isVideoPlaying) {
      nextUpInterval = setInterval(() => this.#onPlayerTimeUpdate(), 1000)
    } else {
      clearInterval(nextUpInterval)
    }

    // only update keepPlayer when on video's designated page
    if (location.pathname === this.placeholder.dataset.path) {
      keepPlayer = isVideoPlaying
      keepPlayerPostId = this.http.payload.postId
    }

    if (this.isLive) return

    if (!this.player) {
      Cookies.remove('playingId')
      keepPlayer = null
      keepPlayerPostId = null
      return
    }

    if (!isVideoPlaying) {
      clearInterval(playerInterval)
      Cookies.remove('playingId')

      const currentTime = window.player.getCurrentTime()
      const duration = window.player.getDuration()

      this.#storeWatchingProgression(currentTime, duration)
      
      return
    }

    if (!Cookies.get('playingId')) {
      Cookies.set('playingId', this.http.payload.postId)
    }

    playerInterval = setInterval(async () => {
      const currentTime = window.player.getCurrentTime()
      const duration = window.player.getDuration()

      // duration may be 0 if meta data is still loading
      if (duration <= 0) return
      this.#storeWatchingProgression(currentTime, duration)
    }, this.progressionInterval)
  }

  async #onBunnyStateChange({ action }) {
    isVideoPlaying = action === 'play'

    Alpine.store('app').videoPlaying = isVideoPlaying

    if (location.pathname === this.placeholder.dataset.path) {
      keepPlayer = isVideoPlaying
      keepPlayerPostId = this.http.payload.postId
    }

    if (this.isLive) return

    if (!this.player) {
      Cookies.remove('playingId')
      keepPlayer = null
      keepPlayerPostId = null
      return
    }

    if (!isVideoPlaying) {
      clearInterval(playerInterval)
      Cookies.remove('playingId')

      const currentTime = await this.getCurrentTime()
      const duration = await this.getDuration()

      if (typeof currentTime !== 'number') return 

      return this.#storeWatchingProgression(currentTime, duration)
    }

    if (!Cookies.get('playingId')) {
      Cookies.set('playingId', this.http.payload.postId)
    }

    playerInterval = setInterval(async () => {
      const currentTime = await this.getCurrentTime()
      const duration = await this.getDuration()

      // duration may be 0 if meta data is still loading
      if (duration <= 0) return
      this.#storeWatchingProgression(currentTime, duration)
    }, this.progressionInterval)
  }

  /**
   * store's the user's current progress for the video
   * @param {number} currentTime
   * @param {number} duration
   * @returns
   */
  async #storeWatchingProgression(currentTime, duration) {
    if (!window.isAuthenticated || this.isSavingProgression) return

    this.isSavingProgression = true

    const watchPercent = Math.ceil((currentTime / duration) * 100)
    const { data } = await axios[this.http.method](this.http.url, {
      ...this.http.payload,
      watchPercent,
      watchSeconds: Math.floor(currentTime),
    })

    this.isSavingProgression = false

    if (typeof data !== 'object') return

    const isCompleted = data.progression.isCompleted

    if (!this.btnCompleted || !this.btnNotCompleted) return

    if (isCompleted) {
      this.btnCompleted.classList.remove('hidden')
      this.btnNotCompleted.classList.add('hidden')
      return
    }

    this.btnNotCompleted.classList.remove('hidden')
    this.btnCompleted.classList.add('hidden')
  }

  /**
   * handles when a timestamp has been clicked within the body copy (jumps to position in video)
   * @param {MouseEvent} event
   * @returns
   */
  #onTimestampClick(event) {
    const isTarget = event.target.classList.contains('timestamp')
    const containsTarget = event.target.closest('.timestamp')

    if (!isTarget && !containsTarget) return

    const target = isTarget ? event.target : containsTarget
    const displayDuration = target.textContent
    const splits = displayDuration.split(':')
    let duration = splits[splits.length]

    if (splits.length > 1) {
      duration = splits.reduce((x, s, i) => {
        return i == splits.length - 1 ? x + Number.parseInt(s) : x + Number.parseInt(s) * 60
      }, 0)
    }

    this.startAtTime(duration)

    window.scrollTo({
      top: this.element.offsetTop,
      behavior: 'smooth',
    })
  }

  startAtTime(duration) {
    // youtube... setting currentTime then calling play mutes the video for some reason
    // so this is a workaround that
    if (this.isYouTube) {
      this.player.seekTo(duration)
    } else if (this.isBunnyEmbed) {
      this.player.setCurrentTime(duration)
    } else if (typeof this.player.embed?.seekTo === 'function') {
      this.player.embed.seekTo(duration)
    } else {
      this.player.currentTime = duration
    }

    if (!isVideoPlaying) {
      this.isYouTube ? this.player.playVideo() : this.player.play()
    }
  }

  // #endregion
}

let lessonVideoIntersection
let lessonVideoResize
let wasIntersecting

up.compiler('#lessonVideoEmbed', function (element) {
  // wait for next tick so that other required elements can populate
  setTimeout(() => {
    const postPaths = ['/lessons/', '/posts/', '/blog/', '/news/', '/snippet/', '/streams/']
    const isInitialized = !!window.player
    const isPostPage = postPaths.some((path) => window.location.pathname.includes(path))

    // if not post page and player is already initialized, do nothing
    if (!isPostPage && isInitialized) return

    const data = element.dataset

    // re-position to primary position when re-initialized
    positionVideoPlaceholder()

    // kick-off video initialization
    window.embed = new VideoPlayer({
      el: 'lessonVideoEmbed',
      isLive: data.isLive == 'true',
      isCompleted: data.isCompleted == 'true',
      videoId: data.videoId,
      watchSeconds: Number.parseInt(data.watchSeconds || '0'),
      httpUrl: data.httpUrl,
      httpPayload: {
        postId: data.payloadPostId,
        collectionId: data.payloadCollectionId,
        userId: data.payloadUserId,
        route: data.payloadRoute,
      },
    })

    if (window.ResizeObserver) {
      let observer = new ResizeObserver((entries) => {
        if (typeof wasIntersecting !== 'undefined') {
          positionVideoPlaceholder(!wasIntersecting)
        }
      })

      observer.observe(document.body)
      lessonVideoResize = () => observer.unobserve(document.body)
    }
  })
})

up.compiler('#videoPlayerPosition', (position) => {
  if (typeof lessonVideoIntersection === 'function') {
    lessonVideoIntersection()
  }

  // ensure the player gets opened back up
  const placeholder = document.querySelector('[video-placeholder]')
  placeholder?.dispatchEvent(new CustomEvent('open'))

  if (!isVideoPlaying) {
    const embed = window.player?.elements?.container
    if (embed) {
      embed.dataset.keepPlayer = false
    }
  }

  // move to small position when primary position is out of view
  if (window.IntersectionObserver) {
    let observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          wasIntersecting = entry.isIntersecting
          positionVideoPlaceholder(!entry.isIntersecting)
        })
      },
      { rootMargin: '0px' }
    )

    observer.observe(position)
    lessonVideoIntersection = () => observer.unobserve(position)
  }
})

up.on('up:location:changed', function (event) {
  const exitPaths = ['/users/menu', '/signin', '/signup', '/histories/', '/watchlist/']
  const placeholder = document.querySelector('[video-placeholder]')
  const isPlayerInitialized = !!window.player

  if (!placeholder) return

  if (placeholder.classList.contains('no-access')) {
    placeholder.dispatchEvent(new CustomEvent('close'))
    return
  }

  // if video hasn't loaded yet - don't do anything
  if (!isPlayerInitialized) return

  // if opening one of the exit paths, don't do anything
  if (exitPaths.some((path) => event.location.toLowerCase().includes(path))) return

  const isEnabledMiniPlayer = placeholder.dataset.isEnabledMiniPlayer === 'true'
  const videoPath = placeholder.dataset.path
  const isVideoPath = videoPath == location.pathname
  const isSamePost = !keepPlayerPostId || keepPlayerPostId == placeholder.dataset.postId

  if ((!keepPlayer || !isEnabledMiniPlayer) && !isVideoPath && isSamePost) {
    placeholder.dispatchEvent(new CustomEvent('close'))
    return
  }
})

// change to small player if the page doesn't contain it's positioning element
up.on('up:fragment:loaded', (event) => {
  setTimeout(() => {
    const main = document.querySelector('[up-main-content]')
    const sync = Array.from(document.querySelectorAll(main.dataset.syncTo))

    if (main.classList.contains(main.dataset.postClass)) {
      sync.map((m) => m.classList.add(main.dataset.postClass))
    } else {
      sync.map((m) => m.classList.remove(main.dataset.postClass))
    }
  }, 300)

  const exitPaths = [
    '/users/menu',
    '/signin',
    '/signup',
    '/histories/',
    '/watchlist/',
    '/fragments',
  ]
  const requestUrl = event.request.url.toLowerCase()
  if (exitPaths.some((path) => requestUrl.includes(path))) return

  const isLayer = ['modal', 'drawer'].includes(event.request.mode)
  const isSmallPlayer = !event.response.text.includes('id="videoPlayerPosition"')
  positionVideoPlaceholder(isSmallPlayer && !isLayer)

  setTimeout(() => positionVideoPlaceholder(isSmallPlayer && !isLayer), 600)
})

// const footer = document.querySelector('footer')
// window.addEventListener('scroll', () => {
//   const placeholder = document.querySelector('[video-placeholder]')
//   const scrollBottom = document.documentElement.scrollTop + document.documentElement.clientHeight
//   const footerTop = footer.offsetTop

//   if (!placeholder) return

//   if (scrollBottom >= footer.offsetTop) {
//     placeholder.style.bottom = `${scrollBottom - footerTop}px`
//     placeholder.style.transition = "unset"
//   } else {
//     placeholder.style.bottom = null
//     placeholder.style.transition = null
//   }
// })

function positionVideoPlaceholder(isSmallPlayer = false) {
  const placeholder = document.querySelector('[video-placeholder]')

  if (!placeholder) return

  const isEnabledMiniPlayer = placeholder.dataset.isEnabledMiniPlayer === 'true'
  const videoPath = placeholder.dataset.path
  const isVideoPath = videoPath == location.pathname
  const useSmallPlayer =
    isSmallPlayer && isEnabledMiniPlayer && !placeholder.classList.contains('no-access')

  setTimeout(() => {
    Alpine.store('app').videoSmall = useSmallPlayer
    Alpine.store('app').videoHeight = placeholder.clientHeight
  })

  if (useSmallPlayer) {
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
  const rect = el.getBoundingClientRect()
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  }
}
