let isYtVideoPlaying = false
window.initVideo = function ({ el = 'ytEmbed', videoId, httpMethod = 'post', httpUrl, httpPayload = {}, watchSeconds = 0 } = {}) {
  const tag = document.createElement('script')
  let player
  tag.src = "https://www.youtube.com/iframe_api"
  document.body.appendChild(tag)

  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player(el, {
      videoId: videoId,
      playerVars: {
        autoplay: false,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        ecver: 2
      },
      events: {
        'onReady': onPlayerReady
      }
    })
  }

  function onPlayerReady(event) {
    window.player = player
  }
}
