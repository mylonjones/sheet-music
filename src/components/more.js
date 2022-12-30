import React, { useState, useEffect } from 'react'
import PdfViewer from './pdfViewer.js'
import ViewOnly from './viewOnly.js'

import { loadPdf, renderPdf } from './pdf.js'



export default function More() {
  const [url, setUrl] = useState();

  const [pdfRef, setPdfRef] = useState();
  const [pageArr, setPageArr] = useState();
  const [mode, setMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [pdfWidth, setPdfWidth] = useState(.99)

  useEffect(() => { url && loadPdf(url, setPdfRef) }, [url]);

  useEffect(() => {
    if(pdfRef){
      let arr = []
      for (let i = 1; i <= pdfRef.numPages; i++) {
        arr.push(i)
      }
      setPageArr(arr)
    }
  }, [pdfRef])

  async function getFile(e) {

    let file = e.target.files[0]

    try {
      const root = await navigator.storage.getDirectory()
      const musicDirectory = await root.getDirectoryHandle('musicDirectory', { 'create': true})
      const fileHandle = await musicDirectory.getFileHandle('text.pdf', {'create': true})

      const stream = await fileHandle.createWritable()
      await stream.write(file)
      await stream.close()

      file = await fileHandle.getFile()
      // await root.removeEntry(musicDirectory.name, {'recursive': true})
    } catch (e) {
      console.log(e)
    } finally {
      setUrl(URL.createObjectURL(file))
    }
  }

  useEffect(() => {
    async function checkFileSystem() {
      try {
        const root = await navigator.storage.getDirectory()
        const musicDirectory = await root.getDirectoryHandle('musicDirectory')
        const fileHandle = await musicDirectory.getFileHandle('text.pdf')
        setUrl(URL.createObjectURL(await fileHandle.getFile()))
      } catch(e) {
        console.log(e)
      }
    }
     checkFileSystem()
  }, [])

  function switchMode()  {
    if(mode) {
      setMode(false)
    } else {
      setMode(true)
    }
  }

  const widthUp = () => {
    setPdfWidth(pdfWidth + .01)
  }

  const widthDown = () => {
    setPdfWidth(pdfWidth - .01)
  }

  const nextPage = () => pdfRef && currentPage < pdfRef.numPages && setCurrentPage(currentPage + 1);

  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return (
    <div className='filePicker' >
      <div className='arrowContainer'>
        <div id='left' className='arrow' onClick={prevPage} >{`<`}</div>
        <button className='switchMode' onClick={switchMode} >
        Switch Mode
        </button>
        <div id='right' className='arrow' onClick={nextPage} >{`>`}</div>
      </div>

      <div className='counter' >
        <button onClick={widthDown}>-</button>
        {'Width'}
        <button onClick={widthUp}>+</button>
      </div>

      <div className='pdfDisplay' >
        {url && !mode && <PdfViewer pdfWidth={pdfWidth} currentPage={currentPage} pdfRef={pdfRef} renderPdf={renderPdf} />}
        {pageArr && mode && pageArr.map((pageNum, index) => {
          return (<ViewOnly pdfWidth={pdfWidth} pageNum={pageNum} pdfRef={pdfRef} key={index} renderPdf={renderPdf} />)
        })}
      </div>
      <input
        type='file'
        title='file input'
        id='fileInput'
        onChange={getFile}
      ></input>
    </div>
  )
}