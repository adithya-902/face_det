# https://face-det-client.vercel.app/

## This app is built using Reactjs + Vite, Express, Nodejs, MongoDB and hosted on vercel

I have used the face-api.js api to detect faces and obtain the face descriptors from the webcam.
The app uses the api as a method of signing in.

After the initial sign in (Where the user provides the model the facial descriptors), during sign in the app checks if the face descriptors match the one for the email. 
If they are a match you can move on to the home page. Otherwise you'll have to retry.

I have used bcrypt library to hash encode the passwords so that it does not show up in the console or database.

I have used vite along with react to speed up the development process.

This project uses native css as anything else would have been overkill for a project of this scale.

I used axios library to communicate with the backend.

I used .env files to keep my api keys private (add mongodb url to a .env file in the root directory of server as DB).

### Install following dependencies for the frontend: 
    "axios": "^1.6.8",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "face-api.js": "^0.22.2",
    "mongoose": "^8.2.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-dotenv": "^0.1.3",
    "react-router-dom": "^6.22.3"
### Install following dependencies for the backend:
    "bcrypt": "^5.1.1",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "joi": "^17.12.2",
    "joi-password-complexity": "^5.2.0",
    "jsonwebtoken": "^9.0.2",
    "mongoos": "^0.0.1-security",
    "mongoose": "^8.2.4",
    "nodemon": "^3.1.0"
  


