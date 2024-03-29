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
  const [erasing, setErasing] = useState(false)

  let lineWidth = 1.51

  const img = useMemo(()=> new Image(), [])
  img.onload = function() {
    let canvas = canvasRef.current
    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(img,0,0, canvas.width, canvas.height)
  }

  const renderPage = useCallback(() => {
    renderPdf(pageNum, pdfRef, canvas, canvas2, img, ctx2, fileName)
  }, [renderPdf, pageNum, pdfRef, canvas, canvas2, img, ctx2, fileName]);


  useEffect(() => {
    let positions = JSON.parse(localStorage.getItem(fileName + pageNum + 'Position'))
    if(positions) {
      setCover(positions[0] || 0)
      setTranslate(positions[1] || 0)
    }
  }, [fileName, pageNum])


  useEffect(() => {
    setCanvas(canvasRef.current)
    setCtx(canvasRef.current.getContext('2d'))

    setCanvas2(canvasRef2.current)
    setCtx2(canvasRef2.current.getContext('2d'))
    renderPage();


    // eslint-disable-next-line react-hooks/exhaustive-deps
    lineWidth = 1.51

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderPage]);


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

      if (erasing) {
        let position = getMousePos(e)
        ctx.lineWidth = 15
        ctx.globalCompositeOperation = 'destination-out'
        ctx.lineTo(position.x, position.y)
        ctx.stroke()
      }

      ctx.beginPath()
    }
  }

  function draw(e) {
    if (enableDraw) {
      if(!drawing) return
      let position = getMousePos(e)

      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'

      if (erasing) {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.lineWidth = 15
      }

      ctx.lineTo(position.x, position.y)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(position.x, position.y)

      if (erasing) {
        ctx.lineWidth = 13
        ctx.globalCompositeOperation = 'source-over'
        ctx.lineTo(position.x, position.y)
        ctx.stroke()
      }
    }
  }

  const handleErase = () => {
    setErasing(true)
    ctx.strokeStyle = '#ff6699'
  }

  const handleDraw = () => {
    setErasing(false)
    ctx.strokeStyle = '#ffffff'
  }

  const saveCanvas = () => {
    localStorage.setItem(fileName + pageNum, canvas.toDataURL('image/png'))
    localStorage.setItem(fileName + pageNum + 'Position', JSON.stringify([cover, translate]))
  }

  const clearCanvas = () => {
    localStorage.removeItem(fileName + pageNum)
    localStorage.removeItem(fileName + pageNum + 'Position')
    setCover(0)
    setTranslate(0)
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