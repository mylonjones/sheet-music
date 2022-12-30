import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';

export default function PdfViewer({ pdfRef, renderPdf, currentPage, pdfWidth}){

  const [canvas, setCanvas] = useState()
  const [ctx, setCtx] =  useState()
  const canvasRef = useRef();

  const [canvas2, setCanvas2] = useState()
  const [ctx2, setCtx2] =  useState()
  const canvasRef2 = useRef();



  let lineWidth = 1.51


  const img = useMemo(()=> new Image(), [])
  img.onload = function() {
    let canvas = canvasRef.current
    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(img,0,0, canvas.width, canvas.height)
  }

  const renderPage = useCallback((pageNum, pdf=pdfRef) => {
    renderPdf(pageNum, pdf, canvas, canvas2, img, ctx2, pdfWidth)
  }, [renderPdf, pdfRef, canvas, img, canvas2, ctx2, pdfWidth]);

  useEffect(() => {
    setCanvas(canvasRef.current)
    setCtx(canvasRef.current.getContext('2d'))

    setCanvas2(canvasRef2.current)
    setCtx2(canvasRef2.current.getContext('2d'))
    renderPage(currentPage, pdfRef);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    lineWidth = 1.51
  }, [pdfRef, currentPage, renderPage]);

  useEffect(() => {

    document.body.addEventListener("touchstart", function (e) {
      if (e.target === canvas) {
        e.preventDefault();
      }
    }, {passive: false});
    document.body.addEventListener("touchend", function (e) {
      if (e.target === canvas) {
        e.preventDefault();
      }
    }, {passive: false});
    document.body.addEventListener("touchmove", function (e) {
      if (e.target === canvas) {
        e.preventDefault();
      }
    }, {passive: false});

  })

  let drawing = false

  function getMousePos(e) {
    let touch = e.touches && e.touches[0]
    let sheetMusic = document.getElementsByClassName('sheetMusic')[0]

    return {
      x: (e.clientX || touch.clientX) - sheetMusic.offsetLeft, y: (e.clientY || touch.clientY) - sheetMusic.offsetTop + window.scrollY
    }
  }

  function startPosition(e){
    drawing = true
    draw(e)
  }

  function finishedPosition(e) {
    drawing = false
    ctx.beginPath()
  }

  function draw(e) {
    if(!drawing) return
    let position = getMousePos(e)

    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'

    ctx.lineTo(position.x, position.y)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(position.x, position.y)
  }



  const handleErase = () => {
    let color = ctx.globalCompositeOperation
    if(color !== 'source-over') {
      ctx.globalCompositeOperation = 'source-over'
      lineWidth = 1.51
    } else {
      ctx.globalCompositeOperation = 'destination-out'
      lineWidth = 10
    }
  }

  const saveCanvas = () => {
    localStorage.setItem('savedCanvas' + currentPage, canvas.toDataURL('image/png'))
  }


  const clearCanvas = () => {
    localStorage.removeItem('savedCanvas' + currentPage)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }



  return (
    <div className='pageContainer' >
      <div className='arrowContainer'>
        <button onClick={handleErase} >toggle</button>
        <button onClick={saveCanvas} >save</button>
        <button onClick={clearCanvas} >clear</button>
      </div>


      <div className='sheetMusic' >
        <canvas ref={canvasRef2} />
        <canvas
          className='drawing'
          ref={canvasRef}
          onMouseDown={startPosition}
          onMouseUp={finishedPosition}
          onMouseMove={draw}
          onTouchStart={startPosition}
          onTouchEnd={finishedPosition}
          onTouchMove={draw}
        ></canvas>
      </div>
    </div>
  )
}