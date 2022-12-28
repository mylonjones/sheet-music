import React, { useRef } from 'react';

import * as handTrack from 'handtrackjs';

export default function HandTrack(props) {

  const video = useRef()
  // const canvas = useRef()
  const button = useRef()
  const message = useRef()
  let isVideo = false
  let model = null

  const modelParams = {
    flipHorizontal: true, // flip e.g for video
    maxNumBoxes: 3, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.7, // confidence threshold for predictions.
  };

  function toggleVideo() {
    if (!isVideo) {
      startVideo();
    } else {
      handTrack.stopVideo(video.current);
      isVideo = false
    }
  }

  function startVideo() {
    handTrack.startVideo(video.current).then(function (status) {
      console.log("video started", status);
      if (status) {
        isVideo = true;
        runDetection();
      } else {
        console.log("Please enable video");
      }
    });
  }

  let position = 0
  let time = 0
  let speeds = [0,0,0]

  function runDetection() {
    model.detect(video.current).then((predictions) => {
      // model.renderPredictions(predictions, canvas.current, canvas.current.getContext("2d"), video.current);
      let hands = predictions.filter(obj => obj.label === 'open')



      if(hands.length > 0){
        // setTimeout(()=>{
        //   position = hands[0].bbox[0]
        // }, 500)

        // if(position + 300 < hands[0].bbox[0] ) {
        //   console.log('right')
        // }
        let now = new Date().getTime()/1000
        let speed = (hands[0].bbox[0] - position)/(now - time)

        speeds.shift()
        speeds.push(speed)

        position = hands[0].bbox[0]
        time = now
        let avg = (speeds[0] + speeds[1] + speeds[2])/3
        if(avg > 300){
          console.log('left')
          document.getElementById('left').click()
          speeds = [0,0,0]
        } else if(avg < -300) {
          console.log('right')
          document.getElementById('right').click()
          speeds = [0,0,0]
        }
      } else {
        speeds = [0,0,0]
      }


      hands[0] && (message.current.innerHTML = predictions[0].bbox[0])
      if (isVideo) {
        requestAnimationFrame(runDetection);
      }
    });
  }

  handTrack.load(modelParams).then((lmodel) => {
    model = lmodel;
    console.log(model);
    console.log("Loaded Model!");
  });

  return (<div>
    <button ref={button} onClick={toggleVideo}></button>
    <video width='500' height='400' ref={video} style={{display: 'none'}}></video>
    {/* <canvas ref={canvas}></canvas> */}
    <div ref={message} >

    </div>
  </div>)
}