import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

const faceid = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    };

    loadModels();
  }, []);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Error accessing webcam: ', err);
      }
    };

    startVideo();
  }, []);

  useEffect(() => {
    const detectFace = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas) {
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);
        
        const result = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
        
        if (result) {
          const dims = faceapi.resizeResults(result, displaySize);
          setIsFaceDetected(true);
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = 'green';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.rect(dims.detection._box.x, dims.detection._box.y, dims.detection._box.width, dims.detection._box.height);
          ctx.stroke();
        } else {
          setIsFaceDetected(false);
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };

    const interval = setInterval(detectFace, 1000); // Detect face every second
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div style={{ position: 'relative'}}>
        <video ref={videoRef} width={500} height={500} autoPlay muted></video>
        <canvas ref={canvasRef}  style={{ position: 'absolute', top: 0, left: 0,width:'200', height:'200' }}></canvas>
      </div>
    </div>
  );
};

export default faceid;
