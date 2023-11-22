import Starback from 'starback'

window.starfield = (canvasLine, canvasDot) => {
  if (canvasLine) {
    new Starback(canvasLine, {
      type: 'line',
      quantity: 25,
      speed: 5,
      frequency: 75,
      slope: { x: -1, y: 10 },
      directionX: 1,
      speed: 3,
      spread: -3,
      width: canvasLine.parentElement.clientWidth,
      height: canvasLine.parentElement.clientHeight,
      backgroundColor: 'transparent',
    })
  }

  if (canvasDot) {
    new Starback(canvasDot, {
      type: 'dot',
      quantity: 100,
      direction: 200,
      starSize: [0,1],
      width: canvasDot.parentElement.clientWidth,
      height: canvasDot.parentElement.clientHeight,
      backgroundColor: 'transparent',
      randomOpacity: true,
    })
  }
}