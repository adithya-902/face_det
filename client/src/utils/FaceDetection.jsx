import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceDetection = ({ videoStream }) => {
    const canvasRef = useRef(null);
    const [isFaceDetected, setIsFaceDetected] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models')
            ]);
        };

        loadModels();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        let isMounted = true;

        const startFaceDetection = async () => {
            const videoElement = document.createElement('video');
            videoElement.srcObject = videoStream;
            videoElement.play();

            const videoSettings = videoStream.getVideoTracks()[0].getSettings();
            videoElement.width = videoSettings.width;
            videoElement.height = videoSettings.height;

            faceapi.matchDimensions(canvas, videoSettings);

            const detectionOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 512 });

            const interval = setInterval(async () => {
                const detections = await faceapi.detectAllFaces(videoElement, detectionOptions).withFaceLandmarks().withFaceDescriptors();

                context.clearRect(0, 0, canvas.width, canvas.height);

                detections.forEach(detection => {
                    const box = detection.detection.box;
                    context.beginPath();
                    context.rect(box.x, box.y, box.width, box.height);
                    context.lineWidth = 2;
                    context.strokeStyle = 'green';
                    context.stroke();
                });

                if (isMounted) {
                    setIsFaceDetected(detections.length > 0);
                }
            }, 100);

            return () => {
                clearInterval(interval);
                videoElement.pause();
                videoElement.srcObject = null;
                if (isMounted) {
                    setIsFaceDetected(false);
                }
            };
        };

        startFaceDetection();

        return () => {
            isMounted = false;
        };
    }, [videoStream]);

    return <canvas ref={canvasRef} />;
};

export default FaceDetection;
