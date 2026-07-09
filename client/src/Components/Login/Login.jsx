import React, { useEffect, useState } from 'react'
import './Login.css'
import '../../App.scss'
import { Link, useNavigate } from 'react-router-dom'

import video from '../../LoginAssets/video.mp4'
import logo from '../../LoginAssets/logo.png'

import { FaUserShield } from "react-icons/fa";
import { BsFillShieldLockFill } from "react-icons/bs";
import { AiOutlineSwapRight } from "react-icons/ai";

import toast from 'react-hot-toast'
import { useAuth } from '../../AuthContext'

const apiUrl = import.meta.env.VITE_API_URL;

const Login = () => {
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useAuth();
  const [loginusername, setLoginUsername] = useState("")
  const [loginpassword, setLoginPassword] = useState("")
  const navigateTo = useNavigate()

  const loginUser = async (e) => {
    let loadingToastId;
    e.preventDefault();
    loadingToastId = toast.loading("Signing In");

    const mockUsers = {
      anjumala: { rank: 'ACP', name: 'Anjumala' },
      dharmendra: { rank: 'Inspector', name: 'Dharmendra' },
      marutig: { rank: 'Subinspector', name: 'Maruti G' }
    };

    if (!apiUrl && mockUsers[loginusername] && loginpassword === '123') {
      setTimeout(() => {
        toast.dismiss(loadingToastId);
        toast.success("Successfully logged In");
        const mockToken = 'mock-jwt-' + loginusername;
        localStorage.setItem("token", mockToken);
        localStorage.setItem("user", JSON.stringify(mockUsers[loginusername]));
        setIsAuthenticated(true);
        setUser(mockUsers[loginusername]);
      }, 500);
      return;
    }

    fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        LoginUsername: loginusername,
        LoginPassword: loginpassword
      })
    }).then(r => r.json()).then((data) => {
      toast.success("Successfully logged In")
      toast.dismiss(loadingToastId);
      localStorage.setItem("token", data.jwtToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      setIsAuthenticated(true);
      setUser(data.user)
    })
    .catch((error) => {
      toast.dismiss(loadingToastId);
      toast.error(error?.message || 'Login failed');
    })
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.rank) {
        case 'ACP':
          navigateTo('/dashboard/home');
          break;
        case 'Inspector':
          navigateTo('/inspector/home');
          break;
        case 'Subinspector':
          navigateTo('/subinspector/home');
          break;
        default:
          navigateTo('/dashboard');
          break;
      }
    }
  }, [isAuthenticated])

  const fillDemo = (username) => {
    setLoginUsername(username);
    setLoginPassword('123');
  };

  return (
    <div className='loginPage flex'>
      <div className="container flex">
        <div className="videoDiv">
          <video src={video} autoPlay muted loop></video>
          <div className="textDiv">
            <h2 className="title">Crime Analytics Platform</h2>
            <p>Investigative tools for Karnataka State Police officers.</p>
          </div>
          <div className="footerDiv flex">
            <span className="text">Don't have an account?</span>
            <Link to={"/register"}>
              <button className='btn'>Sign Up</button>
            </Link>
          </div>
        </div>

        <div className="formDiv flex">
          <div className="headerDiv">
            <img src={logo} alt="KSP Logo" />
            <h3>Welcome Back</h3>
          </div>

          <form action="" className='form grid' onSubmit={loginUser}>
            <div className="inputDiv">
              <label htmlFor="username">Username</label>
              <div className="input flex">
                <FaUserShield className='icon'/>
                <input type="text" id="username" value={loginusername} placeholder='Enter Username' onChange={(event) => {
                  setLoginUsername(event.target.value)
                }}/>
              </div>
            </div>

            <div className="inputDiv">
              <label htmlFor="password">Password</label>
              <div className="input flex">
                <BsFillShieldLockFill className='icon'/>
                <input type="password" id="password" value={loginpassword} placeholder='Enter Password' onChange={(event) => {
                  setLoginPassword(event.target.value)
                }}/>
              </div>
            </div>

            <button type='submit' className='btn flex' onClick={loginUser}>
              <span>Login</span>
              <AiOutlineSwapRight className='icon'/>
            </button>

            {import.meta.env.DEV && (
              <div className="demo-hint">
                <span>Demo access:</span>
                <button type="button" onClick={() => fillDemo('anjumala')} className="demo-link">DySP</button>
                <button type="button" onClick={() => fillDemo('dharmendra')} className="demo-link">Inspector</button>
                <button type="button" onClick={() => fillDemo('marutig')} className="demo-link">Sub-Inspector</button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
