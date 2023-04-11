import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';

export default function ViewOnly({renderPdf, pdfRef, pageNum, pdfWidth, addHandlers, enableDraw, enableAdjust, fileName }){

  const [canvas, setCanvas] = useState()
  const [ctx, setCtx] =  useState()
  const canvasRef = useRef();

  const [canvas2, setCanvas2] = useState()
  const [ctx2, setCtx2] =  useState()
  const canvasRef2 = useRef();

  const [translate, setTranslate] = useState(0)
  const [grabing, setGrabing] = useState(false)
  const [grabPosition, setGrabPos] = useState(0)
  const [cover, setCover] = useState(0)
  const [covering, setCovering] = useState(true)

  let lineWidth = 1.51

  const img = useMemo(()=> new Image(), [])
  img.onload = function() {
    let canvas = canvasRef.current
    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(img,0,0, canvas.width, canvas.height)
  }

  const renderPage = useCallback((pageNum, pdf=pdfRef) => {
    renderPdf(pageNum, pdf, canvas, canvas2, img, ctx2, fileName)
  }, [renderPdf, pdfRef, canvas, img, canvas2, ctx2, fileName]);

  useEffect(() => {
    setCanvas(canvasRef.current)
    setCtx(canvasRef.current.getContext('2d'))

    setCanvas2(canvasRef2.current)
    setCtx2(canvasRef2.current.getContext('2d'))
    renderPage(pageNum, pdfRef);


    // eslint-disable-next-line react-hooks/exhaustive-deps
    lineWidth = 1.51

    const intervalID = setInterval(()=>{
      if(canvasRef.current && (canvasRef.current.width !== '')) {
        if(document.querySelector('style').sheet.cssRules[0].selectorText
        !== 'body') {
          document.querySelector('style').sheet.deleteRule(0)
        }
        document.querySelector('style').sheet.insertRule(`.canvas { width: ${window.innerWidth * pdfWidth}px; }`)
        clearInterval(intervalID)
      }
    }, 1000)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfRef, pageNum, renderPage]);


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


    //send handlers to parent component
    addHandlers({
      handleErase,
      handleDraw,
      saveCanvas,
      clearCanvas,
      tuckSwitch
    }, pageNum)

  })

  let drawing = false

  function getMousePos(e) {
    let touch = (e.touches && e.touches[0]) || e
    let offset = e.target.getBoundingClientRect()

    return {
      x: (touch.clientX - offset.left) / pdfWidth,
      y: (touch.clientY - offset.top + window.scrollY) / pdfWidth
    }
  }

  function startPosition(e){
    if (enableDraw) {
      drawing = true
      draw(e)
    }
  }

  function finishedPosition(e) {
    if (enableDraw) {
      drawing = false
      ctx.beginPath()
    }
  }

  function draw(e) {
    if (enableDraw) {
      if(!drawing) return
      let position = getMousePos(e)

      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'

      ctx.lineTo(position.x, position.y)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(position.x, position.y)
    }
  }

  const handleErase = () => {
    ctx.globalCompositeOperation = 'destination-out'
    lineWidth = 10
  }

  const handleDraw = () => {
    ctx.globalCompositeOperation = 'source-over'
    lineWidth = 1.51
  }

  const saveCanvas = () => {
    localStorage.setItem(fileName + pageNum, canvas.toDataURL('image/png'))
  }

  const clearCanvas = () => {
    localStorage.removeItem(fileName + pageNum)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  const tuckSwitch = () => {
    if(covering) {
      setCovering(false)
    } else {
      setCovering(true)
    }
  }


  const grabPage = (e) => {
    if(enableAdjust) {
      let touch = (e.touches && e.touches[0]) || e
      if (covering) {
        setGrabPos(touch.clientY - cover)
      } else {
        setGrabPos(touch.clientY - translate)
      }
      setGrabing(true)
    }
  }

  const dragPage = (e) => {
    if (grabing && enableAdjust) {
      let touch = (e.touches && e.touches[0]) || e
      if (covering) {
        setCover(touch.clientY - grabPosition)
      } else {
        setTranslate(touch.clientY - grabPosition)
      }
    }
  }

  const letPageGo = () => {
    if(enableAdjust) {
      setGrabing(false)
    }
  }


  return (
    <div className='pageContainer'
      id={`page${pageNum}`}
      style={{'marginBottom': `${translate}px`,
              'marginTop': `${cover}px`}}
      >
      <div className='sheetMusic'
        style={{'transform': `translateY(${translate}px)`}}
        onMouseDown={grabPage}
        onMouseMove={dragPage}
        onMouseUp={letPageGo}
        onTouchStart={grabPage}
        onTouchMove={dragPage}
        onTouchEnd={letPageGo}
        >
        <canvas ref={canvasRef2} className='canvas' />
        <canvas
          className='drawing canvas'
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