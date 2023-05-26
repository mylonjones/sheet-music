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
import over from '../icons/over.png'
import under from '../icons/under.png'

import file from '../icons/file.svg'

import song from '../Clair_de_Lune.pdf'

let mobile

if (navigator.userAgent.match(/Android/i)
  || navigator.userAgent.match(/webOS/i)
  || navigator.userAgent.match(/iPhone/i)
  || navigator.userAgent.match(/iPad/i)
  || navigator.userAgent.match(/iPod/i)
  || navigator.userAgent.match(/BlackBerry/i)
  || navigator.userAgent.match(/Windows Phone/i)) {
      mobile = true ;
} else {
  mobile = false ;
}

export default function More() {
  const [url, setUrl] = useState(song);

  const [pdfRef, setPdfRef] = useState();
  const [pageArr, setPageArr] = useState();

  let width = Number(localStorage.getItem('Clair_de_LuneWidth')) || .9

  const [pdfWidth, setPdfWidth] = useState(width)

  const [canvasHandlers, setHandlers] = useState([])

  const [fileName, setFileName] = useState('Clair_de_Lune')

  const [currentActiveGroup, setCurrentActiveGroup] = useState(null)

  const [enableDraw, setEnableDraw] = useState(false)
  const [enablePages, setEnablePages] = useState(false)
  const [enableAdjust, setEnableAdjust] = useState(false)

  const [tuckImg, setTuckImg] = useState(over)

  const [scrollLevel, setScrollLevel] = useState(0)
  // const [scrollSpeed, setScrollSpeed] = useState(5)

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
    let name = e.target.value.slice(12, -4)

    let width = Number(localStorage.getItem(name + 'Width')) || .9
    setPdfWidth(width)
    document.querySelector('style').sheet.deleteRule(0)
    document.querySelector('style').sheet.insertRule(`.canvas { width: ${window.innerWidth * (width)}px; }`)

    setPageArr([])
    setFileName(name)
    setUrl(URL.createObjectURL(file))

    // FOR SAVING FILES TO DEVICE
    // try {
    //   const root = await navigator.storage.getDirectory()
    //   const musicDirectory = await root.getDirectoryHandle('musicDirectory', { 'create': true})
    //   const fileHandle = await musicDirectory.getFileHandle('text.pdf', {'create': true})

    //   const stream = await fileHandle.createWritable()
    //   await stream.write(file)
    //   await stream.close()

    //   file = await fileHandle.getFile()
    //   // await root.removeEntry(musicDirectory.name, {'recursive': true})
    // } catch (e) {
    //   console.log(e)
    // } finally {
    //   setFileName(e.target.value.slice(12, -4))
    //   setUrl(URL.createObjectURL(file))
    // }
  }

  useEffect(() => {
    const intervalID = setInterval(()=>{
      if(document.querySelector('style').sheet.cssRules[0].selectorText
      !== 'body') {
        document.querySelector('style').sheet.deleteRule(0)
      }
      document.querySelector('style').sheet.insertRule(`.canvas { width: ${window.innerWidth * Number(localStorage.getItem(fileName + 'Width')) || .9}px; }`)
      clearInterval(intervalID)
    }, 1000)

    // setPageArr([])
    // setFileName('Clair_de_Lune')
    // setUrl(song)
    // let width = localStorage.getItem('Clair_de_LuneWidth')
    // width && setPdfWidth(width)

    // async function checkFileSystem() {
    //   try {
    //     const root = await navigator.storage.getDirectory()
    //     const musicDirectory = await root.getDirectoryHandle('musicDirectory')
    //     const fileHandle = await musicDirectory.getFileHandle('text.pdf')
    //     setUrl(URL.createObjectURL(await fileHandle.getFile()))
    //   } catch(e) {
    //     console.log(e)
    //   }
    // }
    //  checkFileSystem()
  }, [fileName])

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

  //add listener for key press to change page
  useEffect(() => {
    document.addEventListener('keydown', handleKeyScroll)
    return () => {
      document.removeEventListener("keydown", handleKeyScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enablePages, scrollLevel])

  const handleKeyScroll = (e) => {
    let letters = 'qwertyuiopasdfghjklzxcvbnm'
    let upKeys = letters.split('')
    upKeys.push('ArrowUp')
    let downKeys = [' ', 'ArrowDown']

    if (upKeys.includes(e.key)) {
      handleScrollUp()
    } else if (downKeys.includes(e.key)) {
      handleScrollDown()
    }
  }

  const handleTapScroll = (e) => {
    let touch = (e.touches && e.touches[0]) || e
    let middle = e.target.offsetHeight/2

    if (touch.clientY < middle) {
      handleScrollUp()
    } else {
      handleScrollDown()
    }
  }

  const handleScrollDown = () => {
    if(enablePages) {
      let display = document.getElementsByClassName('pdfDisplay')[0]
      let nextPage = scrollLevel + (window.innerHeight - 100)
      if(nextPage > display.offsetHeight) nextPage = scrollLevel
      display.style.transform = `translateY(-${nextPage}px)`
      setScrollLevel(nextPage)
    }
  }

  const handleScrollUp = () => {
    if(enablePages) {
      let display = document.getElementsByClassName('pdfDisplay')[0]
      let lastPage = scrollLevel - (window.innerHeight - 100)
      if(lastPage < 0) lastPage = 0
      display.style.transform = `translateY(-${lastPage}px)`
      setScrollLevel(lastPage)
    }
  }

  //add event handlers to array for each page
  const addHandlers = (events, index) => {
    let newList = canvasHandlers
    newList[index] = events
    setHandlers(newList)
  }

  const save = () => {
    localStorage.setItem(fileName + 'Width', pdfWidth)
    enableDraw && canvasHandlers.map(handler => handler.saveCanvas(fileName))
  }

  const clear = () => {
    localStorage.removeItem(fileName + 'Width')
    if(window.confirm('Are you sure you want to erase all saved changes?')) {
      enableDraw && canvasHandlers.map(handler => handler.clearCanvas(fileName))
    }
  }

  const erase = () => {
    enableDraw && canvasHandlers.map(handler => handler.handleErase())
  }

  const draw = () => {
    enableDraw && canvasHandlers.map(handler => handler.handleDraw())
  }

  const tuckSwitch = () => {
    if (enableAdjust) {
      if(tuckImg === over) {
        setTuckImg(under)
      } else {
        setTuckImg(over)
      }
      canvasHandlers.map(handler => handler.tuckSwitch())
    }
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

  const handleScrollSpeed = (e) => {
    // setScrollSpeed(e.target.value)
    document.querySelector('.pdfDisplay')
      .style.transition = `transform ${e.target.value}s linear`
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
            {/* <span className='pageNum' >{'Page: ' + currentPage}</span> */}
          </div>
        </div>

        <div className='mainTools' >
          <div className='music group'
               onClick={() => {handleMarginStretch('music')}}>
            <img src={down} alt='down' className='icon firstIcon' onClick={handleScrollDown}/>
            <img src={up} alt='up' className='icon' onClick={handleScrollUp}/>
            <select className='icon' defaultValue='5' onChange={handleScrollSpeed}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
            </select>
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
            <img src={tuckImg} alt='tuck' className='icon firstIcon' onClick={tuckSwitch} />
            <img src={zoomIn} alt='zoomIn' className='icon' onClick={widthUp}/>
            <img src={zoomOut} alt='zoomOut' className='icon' onClick={widthDown}/>
            <img src={zoom} alt='zoom' className='groupIcon icon'/>
          </div>
        </div>
      </div>



      <div style={{'height': `${window.innerHeight - 90}px`}}
          className='scrollControl'
          onClick={handleTapScroll}
          onTouchStart={handleTapScroll}
          >
        <div className='pdfDisplay' >
            {pageArr && pageArr.map((pageNum, index) => {
              return (<ViewOnly
                addHandlers={addHandlers}
                pdfWidth={pdfWidth}
                pageNum={pageNum}
                pdfRef={pdfRef}
                key={index}
                enableDraw={enableDraw}
                enableAdjust={enableAdjust}
                renderPdf={renderPdf}
                fileName={fileName} />)
            })}
        </div>
      </div>
      {mobile && <div style={{'height': '20px'}}/>}
    </div>
  )
}