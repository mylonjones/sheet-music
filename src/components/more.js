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

  const [fileName, setFileName] = useState('')

  const [currentActiveGroup, setCurrentActiveGroup] = useState(null)

  const [enableDraw, setEnableDraw] = useState(false)
  const [enablePages, setEnablePages] = useState(false)
  const [enableAdjust, setEnableAdjust] = useState(false)

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
    if (enableAdjust) {
      setPdfWidth(pdfWidth + .01)
      document.querySelector('style').sheet.deleteRule(0)
      document.querySelector('style').sheet.insertRule(`.canvas { width: ${window.innerWidth * (pdfWidth + .01)}px; }`)
    }
  }

  const widthDown = () => {
    if (enableAdjust) {
      setPdfWidth(pdfWidth - .01)
      document.querySelector('style').sheet.deleteRule(0)
      document.querySelector('style').sheet.insertRule(`.canvas { width: ${window.innerWidth * (pdfWidth - .01)}px; }`)
    }
  }

  const getPosition = (num) => {
    const pages = [...document.getElementsByClassName('pageContainer')]
    let breakpoints = pages.map((page) => page.offsetHeight)

    return breakpoints.slice(0, num).reduce((a, b) => (a + b), 0)
  }

  const handleScrollDown = () => {
    if(enablePages && (currentPage < pdfRef.numPages)) {
      let display = document.getElementsByClassName('pdfDisplay')[0]
      display.style.transform = `translateY(-${getPosition(currentPage)}px)`
      setCurrentPage(currentPage + 1);
    }
  }

  const handleScrollUp = () => {
    if(enablePages && (currentPage > 1)) {
      let display = document.getElementsByClassName('pdfDisplay')[0]
      display.style.transform = `translateY(-${getPosition(currentPage - 2)}px)`
      setCurrentPage(currentPage - 1);
    }
  }

  //add event handlers to array for each page
  const addHandlers = (events, index) => {
    let newList = canvasHandlers
    newList[index] = events
    setHandlers(newList)
  }

  const save = () => {
    enableDraw && canvasHandlers[currentPage].saveCanvas()
  }

  const clear = () => {
    enableDraw && canvasHandlers[currentPage].clearCanvas()
  }

  const erase = () => {
    enableDraw && canvasHandlers[currentPage].handleErase()
  }

  const draw = () => {
    enableDraw && canvasHandlers[currentPage].handleDraw()
  }

  //toolbar icon transition handlers
  const handleMarginStretch = (target) => {


    let group = document.querySelector('.' + target)
    let firstIcon = group.children[0]
    let specificIcons = group.children
    let lastIcon = group.children[group.children.length - 1]

    group.style.backgroundColor = 'black'
    for(let icon of specificIcons) {
      icon.style.opacity = '1'
      icon.style.marginLeft = '15px'
    }
    firstIcon.style.marginLeft = '0'
    lastIcon.style.opacity = 0
    lastIcon.style.marginLeft = '-50px'

    currentActiveGroup && (currentActiveGroup !== target) &&handleShrink(currentActiveGroup)
    setCurrentActiveGroup(target)

    if (target === 'draw') setEnableDraw(true)
    if (target === 'music') setEnablePages(true)
    if (target === 'zoom') setEnableAdjust(true)
  }

  const handleShrink = (target) => {
    let group = document.querySelector('.' + target)
    let firstIcon = group.children[0]
    let specificIcons = group.children
    let lastIcon = group.children[group.children.length - 1]

    group.style.backgroundColor = 'white'
    for(let icon of specificIcons) {
      icon.style.opacity = '0'
      icon.style.marginLeft = '-50px'
    }
    firstIcon.style.marginLeft = '0'
    lastIcon.style.opacity = 1

    if (target === 'draw') setEnableDraw(false)
    if (target === 'music') setEnablePages(false)
    if (target === 'zoom') setEnableAdjust(false)
  }

  return (
    <div className='interface' >
      <div className='toolBar' >

        <div className='file' >
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
               onClick={() => {handleMarginStretch('music')}}>
            <img src={down} alt='down' className='icon firstIcon' onClick={handleScrollDown}/>
            <img src={up} alt='up' className='icon' onClick={handleScrollUp}/>
            <img src={metronome} alt='metronome' className='icon'/>
            <img src={treble} alt='treble' className='groupIcon icon'/>
          </div>

          <div className='draw group'
               onClick={() => {handleMarginStretch('draw')}}>
            <img src={pencil} alt='pencil' className='icon firstIcon' onClick={draw}/>
            <img src={eraser} alt='eraser' className='icon' onClick={erase} />
            <img src={trash} alt='trash' className='icon' onClick={clear}/>
            <img src={disk} alt='save' className='icon' onClick={save}/>
            <img src={toolBox} alt='trash' className='groupIcon icon'/>
          </div>

          <div className='zoom group'
              onClick={() => {handleMarginStretch('zoom')}}>
            <img src={zoomIn} alt='zoomIn' className='icon firstIcon' onClick={widthUp}/>
            <img src={zoomOut} alt='zoomOut' className='icon' onClick={widthDown}/>
            <img src={zoom} alt='zoom' className='groupIcon icon'/>
          </div>
        </div>
      </div>



      <div style={{'height': `${window.innerHeight - 100}px`}}
          className='scrollControl' >
        <div className='pdfDisplay' >
            {pageArr && pageArr.map((pageNum, index) => {
              return (<ViewOnly
                addHandlers={addHandlers}
                pdfWidth={pdfWidth}
                pageNum={pageNum}
                pdfRef={pdfRef}
                key={index}
                enableDraw={enableDraw}
                renderPdf={renderPdf} />)
            })}
        </div>
      </div>
    </div>
  )
}