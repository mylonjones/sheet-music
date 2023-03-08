import React, { useState, useEffect } from 'react'
import ViewOnly from './viewOnly.js'

import { loadPdf, renderPdf } from './pdf.js'

import eraser from '../icons/eraser.png'
import pencil from '../icons/whitePencil.png'
import trash from '../icons/trash.png'
import disk from '../icons/disk.png'
import toolBox from '../icons/tool-box.png'

import up from '../icons/up.png'
import down from '../icons/down.png'
import metronome from '../icons/metronome.png'
import treble from '../icons/treble-clef.png'

import zoomIn from '../icons/zoom-in.png'
import zoomOut from '../icons/zoom-out.png'
import zoom from '../icons/search.png'

import file from '../icons/file.svg'

export default function More() {
  const [url, setUrl] = useState();

  const [pdfRef, setPdfRef] = useState();
  const [pageArr, setPageArr] = useState();
  const [currentPage, setCurrentPage] = useState(1)

  const [pdfWidth, setPdfWidth] = useState(.9)

  const [canvasHandlers, setHandlers] = useState([])

  const [translate, setTranslate] = useState(0)

  const [fileName, setFileName] = useState('')

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
      setFileName(e.target.value.slice(12, -4))
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

  const widthUp = () => {
    setPdfWidth(pdfWidth + .01)
    document.querySelector('style').sheet.deleteRule(0)
    document.querySelector('style').sheet.insertRule(`.canvas { width: ${window.innerWidth * (pdfWidth + .01)}px; }`)
  }

  const widthDown = () => {
    setPdfWidth(pdfWidth - .01)
    document.querySelector('style').sheet.deleteRule(0)
    document.querySelector('style').sheet.insertRule(`.canvas { width: ${window.innerWidth * (pdfWidth - .01)}px; }`)
  }

  const handleScrollDown = () => {
    if(currentPage < pdfRef.numPages) {
      setCurrentPage(currentPage + 1);
      let pages = document.getElementsByClassName('pageContainer')

      setTranslate(translate + pages[0].offsetHeight)

      for (let page of pages) {
        page.style.transform = `translateY(-${translate + pages[0].offsetHeight}px)`
      }
    }
  }

  const handleScrollUp = () => {
    if(currentPage > 1) {
      setCurrentPage(currentPage - 1);
      let pages = document.getElementsByClassName('pageContainer')

      setTranslate(translate - pages[0].offsetHeight)

      for (let page of pages) {
        page.style.transform = `translateY(-${translate - pages[0].offsetHeight}px)`
      }
    }
  }

  //add event handlers to array for each page
  const addHandlers = (events, index) => {
    let newList = canvasHandlers
    newList[index] = events
    setHandlers(newList)
  }

  const save = () => {
    canvasHandlers[currentPage].saveCanvas()
  }

  const clear = () => {
    canvasHandlers[currentPage].clearCanvas()
  }

  const erase = () => {
    canvasHandlers[currentPage].handleErase()
  }

  const draw = () => {
    canvasHandlers[currentPage].handleDraw()
  }

  //toolbar icon transition handlers
  const handleMarginStretch = (target, stretch) => {
    let group = document.querySelector('.' + target)
    let firstIcon = group.children[0]
    let specificIcons = group.children
    let lastIcon = group.children[group.children.length - 1]
    if (stretch) {
      group.style.backgroundColor = 'black'
      for(let icon of specificIcons) {
        icon.style.opacity = '1'
        icon.style.marginLeft = '15px'
      }
      firstIcon.style.marginLeft = '0'
      lastIcon.style.opacity = 0
      lastIcon.style.marginLeft = '-50px'
    } else {
      group.style.backgroundColor = 'white'
      for(let icon of specificIcons) {
        icon.style.opacity = '0'
        icon.style.marginLeft = '-50px'
      }
      firstIcon.style.marginLeft = '0'
      lastIcon.style.opacity = 1
    }
  }

  return (
    <div className='interface' >
      <div className='toolBar' >

        <div className='file group' >
          <label className='fileLabel'>
            <input
              className='fileSelect'
              type='file'
              onChange={getFile}
            ></input>
            <img src={file} alt='file' className='icon fileIcon'/>
          </label>
          <div className='fileName' >
            <span>{fileName}</span>
            <br/>
            <span className='pageNum' >{'Page: ' + currentPage}</span>
          </div>
        </div>

        <div className='mainTools' >
          <div className='music group'
               onMouseOver={() => {handleMarginStretch('music', true)}}
               onMouseLeave={() => {handleMarginStretch('music', false)}}>
            <img src={down} alt='down' className='icon firstIcon' onClick={handleScrollDown}/>
            <img src={up} alt='up' className='icon' onClick={handleScrollUp}/>
            <img src={metronome} alt='metronome' className='icon'/>
            <img src={treble} alt='treble' className='groupIcon icon'/>
          </div>

          <div className='draw group'
               onMouseOver={() => {handleMarginStretch('draw', true)}}
               onMouseLeave={() => {handleMarginStretch('draw', false)}}>
            <img src={pencil} alt='pencil' className='icon firstIcon' onClick={draw}/>
            <img src={eraser} alt='eraser' className='icon' onClick={erase} />
            <img src={trash} alt='trash' className='icon' onClick={clear}/>
            <img src={disk} alt='save' className='icon' onClick={save}/>
            <img src={toolBox} alt='trash' className='groupIcon icon'/>
          </div>

          <div className='zoom group'
              onMouseOver={() => {handleMarginStretch('zoom', true)}}
              onMouseLeave={() => {handleMarginStretch('zoom', false)}}>
            <img src={zoomIn} alt='zoomIn' className='icon firstIcon' onClick={widthUp}/>
            <img src={zoomOut} alt='zoomOut' className='icon' onClick={widthDown}/>
            <img src={zoom} alt='zoom' className='groupIcon icon'/>
          </div>
        </div>
      </div>



      {/* <div className='arrowContainer'>
        <button className='switchMode' onClick={switchMode} >
        Switch Mode
        </button>
      </div> */}

      <div className='pdfDisplay' >
        {/* {url && !mode && <PdfViewer addHandlers={addHandlers} pdfWidth={pdfWidth} currentPage={currentPage} pdfRef={pdfRef} renderPdf={renderPdf} />} */}

        <div
          style={{'height': `${window.innerHeight - 100}px`}}
          className='scrollControl'>
            {pageArr && pageArr.map((pageNum, index) => {
              return (<ViewOnly addHandlers={addHandlers} pdfWidth={pdfWidth} pageNum={pageNum} pdfRef={pdfRef} key={index} renderPdf={renderPdf} />)
            })}
        </div>
      </div>
    </div>
  )
}