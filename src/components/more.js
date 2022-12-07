import React, { useState, useEffect } from 'react'
import PdfViewer from './pdfViewer.js'




export default function More() {
  const [url, setUrl] = useState();

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
        {url && <PdfViewer url={url} />}
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