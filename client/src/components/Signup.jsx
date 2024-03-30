import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import './styles/auth.css';
import axios from 'axios'
import bcrypt from 'bcryptjs';


const Signup = () => {
    const [showWebcam, setShowWebcam] = useState(false);
    const [videoRef, setVideoRef] = useState(null);
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [faceVector, setFaceVector] = useState()
    const [name, setName] = useState()
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const [capturedImage, setCapturedImage] = useState(false);
    const navigate = useNavigate();

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

        
    
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            alert("Please enter a valid email address");
            return;
        }
    
        // Password validation
        if (!password || password.length < 6) {
            alert("Password must be at least 6 characters long");
            return;
        }
    
        // If all validations pass, make the axios POST request
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds

        // Send the hashed password to the backend along with other data
        axios.post("http://localhost:3001/", { name, email, password: hashedPassword, faceVector })
        .then(result => {console.log(result)
        navigate('/login')
        })
        .catch(err => console.log(err));
    }

    return (
        <div className='signup'>
            <div className='signup-card'>
                <h2 className='card-heading'>SIGNUP</h2>
                <form action='#'  className='signup-form'>
                    <input type="text" name="email" id="email" placeholder='Email...' onChange={(e) => setEmail(e.target.value)}/>
                    <input type="text" name="name" id="name" placeholder='Name...' onChange={(e) => setName(e.target.value)}/>
                    <input type="password" name="password" id="password" placeholder='Password...' onChange={(e) => setPassword(e.target.value)}/>
                    <button className='faceid' onClick={toggleWebcam}>
                    {showWebcam ? 'Stop Webcam' : 'Start Webcam'}
                </button>
                {capturedImage && (<button onClick={handleSubmit} type="submit" className='submit'>Submit</button>)}
                <h3>Already have an account? <span className='switch'><Link className='link' to='/login'>Login</Link></span></h3>
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

export default Signup;
