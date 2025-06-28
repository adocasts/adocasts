import axios from 'axios'
import Cookies from 'js-cookie'
import Alpine from 'alpinejs'
import { Player } from 'player.js'
import { VidstackPlayer, VidstackPlayerLayout } from 'vidstack/global/player'
import { TextTrack } from 'vidstack'
import 'vidstack/player/styles/default/theme.css'
import 'vidstack/player/styles/default/layouts/video.css'

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
      R2: 'r2',
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

  get isR2() {
    return this.element.dataset.plyrProvider === 'r2'
  }

  get type() {
    if (this.isYouTube) {
      return this.types.YOUTUBE
    } else if (this.isHlsVideo) {
      return this.types.HLS
    } else if (this.isBunnyEmbed) {
      return this.types.BUNNY
    } else if (this.isR2) {
      return this.types.R2
    }
  }

  async getCurrentTime() {
    switch (this.type) {
      case this.types.YOUTUBE:
        return this.player.getCurrentTime()
      case this.types.HLS:
      case this.types.R2:
        return this.player.currentTime
      case this.types.BUNNY:
        if (!this.player?.elem) return 0
        return new Promise((resolve) => {
          try {
            this.player.getCurrentTime((value) => resolve(value))
          } catch (_error) {
            console.debug('player was disposed')
            return -1
          }
        })
    }
  }

  async getDuration() {
    switch (this.type) {
      case this.types.YOUTUBE:
        return this.player.getDuration()
      case this.types.HLS:
      case this.types.R2:
        return this.player.duration
      case this.types.BUNNY:
        if (!this.player?.elem) return 0
        return new Promise((resolve) => {
          try {
            this.player.getDuration((value) => resolve(value))
          } catch (_error) {
            console.debug('player was disposed')
            return -1
          }
        })
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

    // clean up any prior video, except the vidstack player... that uses web components & gracefully handles cleanup
    if (
      window.player &&
      typeof window.player.destroy === 'function' &&
      window.player.nodeName !== 'MEDIA-PLAYER'
    ) {
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

    if (this.isR2) {
      this.player = await this.#initR2Player(playOnReady)
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

      player.on('play', this.#onPlayerStateChange.bind(this, { action: 'play' }))
      player.on('pause', this.#onPlayerStateChange.bind(this, { action: 'pause' }))
      player.on('ended', this.#onPlayerStateChange.bind(this, { action: 'ended' }))
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

  async #initR2Player(playOnReady) {
    const authorizationV = this.element.dataset.authorizationV
    const authorizationKey = this.element.dataset.authorizationKey
    const authorizationExp = this.element.dataset.authorizationExp
    const userId = this.element.dataset.userId

    const player = await VidstackPlayer.create({
      target: this.element,
      title: this.element.dataset.title,
      src: `https://vid.adocasts.com/${this.videoId}/main.m3u8`,
      autoPlay: playOnReady,
      currentTime: this.watchSeconds,
      layout: new VidstackPlayerLayout(),
      poster: this.element.dataset.poster,
    })

    window.player = player

    const captions = JSON.parse(this.element.dataset.captions) || []
    const chapters = JSON.parse(this.element.dataset.chapters) || []

    captions.map((caption, index) => {
      if (!caption.language) return

      const lang = new TextTrack({
        src: `https://vid.adocasts.com/${this.videoId}/${caption.filename}`,
        kind: 'captions',
        type: caption.type,
        label: caption.label,
        language: caption.language,
        default: index === 0,
      })

      player.textTracks.add(lang)
    })

    if (chapters?.length) {
      const chapterTrack = new TextTrack({
        kind: 'chapters',
        type: 'vtt',
        default: true,
      })

      chapters.map((chapter) => {
        const cue = new VTTCue(chapter.startSeconds, chapter.endSeconds, chapter.text)
        chapterTrack.addCue(cue)
      })

      player.textTracks.add(chapterTrack)
    }

    player.addEventListener('play', this.#onPlayerStateChange.bind(this, { action: 'play' }))
    player.addEventListener('pause', this.#onPlayerStateChange.bind(this, { action: 'pause' }))
    player.addEventListener('ended', this.#onPlayerStateChange.bind(this, { action: 'ended' }))
    player.addEventListener('time-update', this.#onPlayerTimeUpdate.bind(this))
    player.addEventListener('provider-change', (event) => {
      const provider = event.detail

      if (provider?.type === 'hls') {
        provider.config = {
          xhrSetup(xhr) {
            xhr.setRequestHeader('X-Authorization-V', authorizationV)
            xhr.setRequestHeader('X-Authorization-Key', authorizationKey)
            xhr.setRequestHeader('X-Authorization-Exp', authorizationExp)
            xhr.setRequestHeader('X-User-Id', userId)
          },
        }
      }
    })

    // create call's currentTime seems to be ignored
    // perhaps because metadata isn't loaded yet
    player.addEventListener(
      'loaded-metadata',
      () => {
        player.currentTime = this.watchSeconds
      },
      { once: true }
    )

    let hasErrored = false
    const onError = (status, text, message) => {
      if (hasErrored) return

      hasErrored = true
      player.destroy()

      this.element.innerHTML = `
        <div class="bg-base-100 text-error flex flex-col items-center justify-center w-full h-full">
          <img class="w-24 mx-auto" src="/imgs/robot/slice7.svg" alt="robot broken">
          ${status ? `<h3 class="text-5xl font-bold">${status}</h3>` : ''}
          <h3 class="text-3xl font-bold">${text || 'Video Error'}</h3>
          <p class="text-sm">${message}</p>
        </div>
      `
    }

    player.addEventListener('hls-error', (event) => {
      console.error({ hlsError: event })

      const error = event.detail

      // HyperDX.addAction('R2 HLS Error', {
      //   authorizationV,
      //   authorizationKey,
      //   authorizationExp,
      //   userId,
      //   error: JSON.stringify(error),
      //   videoId: this.videoId,
      // })
    })

    player.addEventListener('error', (event) => {
      console.debug({ error: event })

      const error = event.detail

      onError(null, null, error.message)
    })

    return player
  }

  /**
   * dispatches times updates to the nextUp element
   * @param {CustomEvent} event
   * @returns
   */
  async #onPlayerTimeUpdate(event) {
    const currentTime = Math.ceil(await this.getCurrentTime())
    const duration = Math.ceil(await this.getDuration())
    const wasDisposed = currentTime === -1 || duration === -1

    if (currentTime === this.lastTimeUpdate || wasDisposed) return

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

      console.debug('youtube play stopped, storing last progress', currentTime)

      if (currentTime === -1 || duration === -1) return

      this.#storeWatchingProgression(currentTime, duration)

      return
    }

    if (!Cookies.get('playingId')) {
      Cookies.set('playingId', this.http.payload.postId)
    }

    clearInterval(playerInterval)

    playerInterval = setInterval(async () => {
      const currentTime = window.player.getCurrentTime()
      const duration = window.player.getDuration()

      console.debug('youtube progress interval', currentTime)

      // duration may be 0 if meta data is still loading
      if (currentTime <= 0 || duration <= 0) return

      this.#storeWatchingProgression(currentTime, duration)
    }, this.progressionInterval)
  }

  async #onPlayerStateChange({ action }) {
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

      console.debug('bunny play stopped, storing last progress', currentTime)

      if (currentTime === -1 || duration === -1) return
      if (typeof currentTime !== 'number') return

      return this.#storeWatchingProgression(currentTime, duration)
    }

    if (!Cookies.get('playingId')) {
      Cookies.set('playingId', this.http.payload.postId)
    }

    clearInterval(playerInterval)

    playerInterval = setInterval(async () => {
      const currentTime = await this.getCurrentTime()
      const duration = await this.getDuration()

      console.debug('bunny progress interval', currentTime)

      // duration may be 0 if meta data is still loading
      if (currentTime <= 0 || duration <= 0) return

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

up.compiler('#lessonVideoEmbed', function (element) {
  // wait for next tick so that other required elements can populate
  setTimeout(() => {
    const postPaths = ['/lessons/', '/posts/', '/blog/', '/news/', '/snippet/', '/streams/']
    const isInitialized = !!window.player
    const isPostPage = postPaths.some((path) => window.location.pathname.includes(path))

    // if not post page and player is already initialized, do nothing
    if (!isPostPage && isInitialized) return

    const data = element.dataset

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
  })
})
