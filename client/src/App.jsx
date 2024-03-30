import React from 'react'
import Navbar from './components/Navbar'
import './App.css'
import Signup from './components/Signup'
import Login from './components/Login'
import Home from './components/Home'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const App = () => {
  return (
    <div>
        <Navbar/>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Signup/>}></Route>
            <Route path='/register' element={<Signup/>}></Route>
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/home' element={<Home/>}></Route>
          </Routes>
        </BrowserRouter>
    </div>
  )
}

export default App