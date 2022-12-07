let drawing = false

export function getMousePos(e) {
  let touch = e.touches && e.touches[0]
  let sheetMusic = document.getElementsByClassName('sheetMusic')[0]

  return {
    x: (e.clientX || touch.clientX) - sheetMusic.offsetLeft, y: (e.clientY || touch.clientY) - sheetMusic.offsetTop + window.scrollY
  }
}

export function startPosition(e, ctx, lineWidth){
  drawing = true
  draw(e, ctx, lineWidth)
}

export function finishedPosition(e, ctx) {
  drawing = false
  ctx.beginPath()
}

export function draw(e, ctx, lineWidth) {
  if(!drawing) return
  let position = getMousePos(e)

  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'

  ctx.lineTo(position.x, position.y)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(position.x, position.y)
}