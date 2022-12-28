import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { renderPdf } from './pdf.js'

export default function ViewOnly({ pdfRef, pageNum }){

  const [canvas, setCanvas] = useState()
  const [ctx, setCtx] =  useState()
  const canvasRef = useRef();

  const [canvas2, setCanvas2] = useState()
  const [ctx2, setCtx2] =  useState()
  const canvasRef2 = useRef();

  const [currentPage] = useState(pageNum);

  const [pdfWidth] = useState(.9)

  const img = useMemo(()=> new Image(), [])
  img.onload = function() {
    let canvas = canvasRef.current
    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(img,0,0, canvas.width, canvas.height)
  }

  const renderPage = useCallback((pageNum, pdf=pdfRef) => {
    renderPdf(pageNum, pdf, canvas, canvas2, img, ctx2, pdfWidth)
  }, [pdfRef, canvas, img, canvas2, ctx2, pdfWidth]);

  useEffect(() => {
    setCanvas(canvasRef.current)
    setCtx(canvasRef.current.getContext('2d'))

    setCanvas2(canvasRef2.current)
    setCtx2(canvasRef2.current.getContext('2d'))
    renderPage(currentPage, pdfRef);

  }, [pdfRef, currentPage, renderPage]);



  return (
    <div className='pageContainer' >
      <div className='sheetMusic' >
        <canvas ref={canvasRef2} />
        <canvas
          className='drawing'
          ref={canvasRef}
        ></canvas>
      </div>
    </div>
  )
}