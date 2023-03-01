import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';

export default function ViewOnly({renderPdf, pdfRef, pageNum, pdfWidth }){

  const [canvas, setCanvas] = useState()
  const [ctx, setCtx] =  useState()
  const canvasRef = useRef();

  const [canvas2, setCanvas2] = useState()
  const [ctx2, setCtx2] =  useState()
  const canvasRef2 = useRef();

  const img = useMemo(()=> new Image(), [])
  img.onload = function() {
    let canvas = canvasRef.current
    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(img,0,0, canvas.width, canvas.height)
  }

  const renderPage = useCallback((pageNum, pdf=pdfRef) => {
    renderPdf(pageNum, pdf, canvas, canvas2, img, ctx2)
  }, [renderPdf, pdfRef, canvas, img, canvas2, ctx2]);

  useEffect(() => {
    setCanvas(canvasRef.current)
    setCtx(canvasRef.current.getContext('2d'))

    setCanvas2(canvasRef2.current)
    setCtx2(canvasRef2.current.getContext('2d'))
    renderPage(pageNum, pdfRef);

    const intervalID = setInterval(()=>{
      console.log('testing width')
      if(canvasRef.current.width !== '') {
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



  return (
    <div className='pageContainer' id={`page${pageNum}`} >
      <div className='sheetMusic' >
        <canvas ref={canvasRef2} className='canvas' />
        <canvas
          className='drawing canvas'
          ref={canvasRef}
        ></canvas>
      </div>
    </div>
  )
}