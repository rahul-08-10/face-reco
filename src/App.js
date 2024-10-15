import { useRef, useEffect } from 'react';
import './App.css';
import * as faceapi from 'face-api.js';

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();

  // LOAD FROM USEEFFECT
  useEffect(() => {
    startVideo();
    loadModels();
  }, []);

  // OPEN YOU FACE WEBCAM
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // LOAD MODELS FROM FACE API
  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    ]).then(() => {
      faceMyDetect();
    });
  };

  const faceMyDetect = () => {
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceExpressions();

      // Clear previous drawing
      const canvas = canvasRef.current;
      const displaySize = {
        width: videoRef.current.clientWidth,
        height: videoRef.current.clientHeight
      };

      faceapi.matchDimensions(canvas, displaySize);

      // Resize the results
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      // Clear the canvas
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw on canvas
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 1000);
  };

  return (
    <div className="myapp">
      <h1>Face Detection</h1>
      <div className="appvideo">
        <video
          crossOrigin="anonymous"
          ref={videoRef}
          autoPlay
          className="responsive-video"
        ></video>
        <canvas ref={canvasRef} className="responsive-canvas"></canvas>
      </div>
    </div>
  );
}

export default App;
