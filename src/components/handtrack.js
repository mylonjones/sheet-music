import React, { useRef } from 'react';

import * as handTrack from 'handtrackjs';

export default function HandTrack() {

  const video = useRef()
  const canvas = useRef()
  const button = useRef()
  let isVideo = false
  let model = null

  const modelParams = {
    flipHorizontal: true, // flip e.g for video
    maxNumBoxes: 2, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.6, // confidence threshold for predictions.
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

  function runDetection() {
    model.detect(video.current).then((predictions) => {
      console.log("Predictions: ", predictions);
      model.renderPredictions(predictions, canvas.current, canvas.current.getContext("2d"), video.current);
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
    <video width='500' height='400' ref={video}></video>
    <canvas ref={canvas}></canvas>
  </div>)
}