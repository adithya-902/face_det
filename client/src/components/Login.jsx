import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import './styles/auth.css';
import axios from 'axios'
import bcrypt from 'bcryptjs';


const Login = () => {
    const [showWebcam, setShowWebcam] = useState(false);
    const [videoRef, setVideoRef] = useState(null);
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [faceVector, setFaceVector] = useState()
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const [capturedImage, setCapturedImage] = useState(false);
    const navigate = useNavigate();
    const [useFace, setuseFace] = useState(true)

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
        if (showWebcam && videoRef) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    videoRef.srcObject = stream;
                    startFaceDetection(stream);
                })
                .catch(error => {
                    console.error('Error accessing webcam:', error);
                });
        }
    }, [showWebcam, videoRef]);

    const startFaceDetection = async (stream) => {
        const videoElement = videoRef;

        await new Promise(resolve => {
            videoElement.onloadedmetadata = resolve;
        });

        const videoSettings = stream.getVideoTracks()[0].getSettings();
        videoElement.width = videoSettings.width;
        videoElement.height = videoSettings.height;

        const canvas = faceapi.createCanvasFromMedia(videoElement);
        document.body.append(canvas);

        const displaySize = { width: videoSettings.width, height: videoSettings.height };
        faceapi.matchDimensions(canvas, displaySize);

        const interval = setInterval(async () => {
            const detections = await faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
            if (detections.length > 0) {
                setIsFaceDetected(true);
            } else {
                setIsFaceDetected(false);
            }
        }, 1000);

        return () => clearInterval(interval);
    };

    const toggleWebcam = () => {
        setShowWebcam(!showWebcam);
    };

    const takeImage = async () => {
        if (videoRef) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.videoWidth;
            canvas.height = videoRef.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef, 0, 0, canvas.width, canvas.height);

            const imageUrl = canvas.toDataURL('image/jpeg');

            const img = new Image();
            img.src = imageUrl;

            await new Promise(resolve => {
                img.onload = resolve;
            });

            const faceDescriptor = await getFaceDescriptor(img);
            if (faceDescriptor) {
                console.log('Face Descriptor:', faceDescriptor);
                const descriptorArray = descriptorToArray(faceDescriptor);
                console.log('Face Descriptor Array:', descriptorArray);
                setFaceVector(descriptorArray)
            }

            setCapturedImage(imageUrl);
        }
    };

    const getFaceDescriptor = async (imageElement) => {
        const detection = await faceapi.detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
        if (detection) {
            return detection.descriptor;
        }
        return null;
    };

    const descriptorToArray = (descriptor) => {
        const descriptorArray = [];
        for (let key in descriptor) {
            descriptorArray.push(descriptor[key]);
        }
        return descriptorArray;
    };

    

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (faceVector === null) {
          alert("Make sure your face is detected in the webcam")
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!email || !emailRegex.test(email)) {
            alert("Please enter a valid email address");
            return;
          }
          axios.post('https://face-det-server.vercel.app/loginface', { email, faceVector })
          .then(response => {
            if (response.data.success) {
              // Authentication successful, navigate to home page
              navigate('/home')
            } else {
              // Authentication failed, display error message
              alert(response.data.message);
            }
            })
            .catch(error => {
            // Handle network errors or other errors
            console.error('Error:', error);
            alert('Internal server error');
            });
        }

        
          
        
    }

    return (
        <div className='signup'>
            <div className='signup-card'>
                <h2 className='card-heading'>Login</h2>
                <form action='#' onSubmit={handleSubmit} className='signup-form'>
                    <input type="text" name="email" id="email" placeholder='Email...' onChange={(e) => setEmail(e.target.value)}/>
                    <button className='faceid' onClick={toggleWebcam}>
                      {showWebcam ? 'Stop Webcam' : 'Start Webcam'}
                    </button>
                  {capturedImage && (<button  type="submit" className='submit'>Submit</button>)}
                  <h3>Don't have an account? <span className='switch'><Link className='link' to='/'>Sign up</Link></span></h3>
                </form>
            </div>
            
            {showWebcam && (
                <>
                    <div className='cam-div'>
                        <div>
                        <h2 className="confirmation">{isFaceDetected ? 'Face Detected' : ''}</h2>
                        </div>
                        <video className='cam' ref={ref => setVideoRef(ref)} autoPlay playsInline />
                        <button className='capture' onClick={takeImage}>Capture</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Login;
