import React, { useEffect } from 'react'
import {Routes , Route} from "react-router-dom"
import HomePage from "./pages/HomePage"
import SignUpPage from './pages/SignUpPage'
import LogInPage from './pages/LogInPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'

import './App.css'
import Navbar from './components/Navbar'
import { useAuthStore } from './store/useAuthStore'

const App = () => {
const{authUser , checkAuth} = useAuthStore()
useEffect(()=>{
  checkAuth()
},[checkAuth])
console.log(authUser);

  return (
    <div className=''>
      <Navbar/>
    <Routes>
<Route path='/' element={<HomePage/>} />
<Route path='/singup' element={<SignUpPage/>} />
<Route path='/login' element={<LogInPage/>} />
<Route path='/setting' element={<SettingsPage/>} />
<Route path='/profile' element={<ProfilePage/>} />

    </Routes>
    </div>
  )
}

export default App