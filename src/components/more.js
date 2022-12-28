// import PdfViewer from './pdfViewer.js'
import React, { useState, useEffect } from 'react'
import ViewOnly from './viewOnly.js'

import { loadPdf } from './pdf.js'



export default function More() {
  const [url, setUrl] = useState();

  const [pdfRef, setPdfRef] = useState();
  const [pageArr, setPageArr] = useState();

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

  return (
    <div className='filePicker' >
      <div className='pdfDisplay' >
        {/* {url && <PdfViewer pdfRef={pdfRef} />} */}
        {pageArr && pageArr.map((pageNum, index) => {
          return (<ViewOnly pageNum={pageNum} pdfRef={pdfRef} key={index} />)
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