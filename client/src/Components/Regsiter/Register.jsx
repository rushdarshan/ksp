import React, {useState} from 'react'
import './Register.css'
import '../../App.scss'
import { Link } from 'react-router-dom'

import video from '../../LoginAssets/video.mp4'
import logo from '../../LoginAssets/logo.png'


import { BsFillShieldLockFill } from "react-icons/bs";
import {  AiOutlineSwapRight } from "react-icons/ai";
import { MdMarkEmailRead } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import toast from 'react-hot-toast'
const apiUrl = import.meta.env.VITE_API_URL || '/server';

const Register = () => {
//usestate for input
const[email, setEmail] = useState("")
const[username, setUsername] = useState("")
const[password, setPassword] = useState("")
const[rank, setRank] = useState("")

const [isPending,setIspending] = useState(false)
//onclick for taking user input
const createUser = async (e) => {
  e.preventDefault();
  let loadingToastId;
  try {
    loadingToastId = toast.loading("Processing");
     setIspending(prev=>!prev);
    const res = await fetch(`${apiUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Email: email,
        Username: username,
        Password: password,
        Rank: rank
      })
    });
    const data = await res.json();
    if (res.ok)
      toast.success(data.message)
    toast.dismiss(loadingToastId);
  } catch (error) {
    toast.dismiss(loadingToastId);
    toast.error(error.message)
} finally{
    setIspending(prev=>!prev);
   }
}

  return (
    <div className= 'registerPage flex'>
      <div className="container flex">

        <div className="videoDiv">
          <video src={video} autoPlay muted loop>

          </video>
        

        <div className="textDiv">
        <h2 className="title">Enhance Efficiency with Our Dashboard</h2>
        <p>Stay organized in law enforcement!</p>
        </div>

        <div className="footerDiv flex">
          <span className="text">Already have an account ?</span>
          <Link to={"/login"}>
          <button className='btn'>Login</button>
          </Link>
        </div>
        </div>

        <div className="formDiv flex">
          <div className="headerDiv">
            <img src={logo} alt="Logo Image" />
            <h3>Register Yourself</h3>
          </div>

          <form action="" className='form grid'>

            <div className="inputDiv">
              <label htmlFor= "email">Email</label>
              <div className="input flex">
              <MdMarkEmailRead className='icon'/>
                <input type="email" id="email" placeholder='Enter Email' onChange={(event)=>{
                  setEmail(event.target.value)
                }} />
              </div>
            </div>

            
            <div className="inputDiv">
              <label htmlFor= "username">Username</label>
              <div className="input flex">
              <FaUser className='icon'/>
                <input type="username" id="username" placeholder='Enter Username' onChange={(event)=>{
                  setUsername(event.target.value)
                }} />
              </div>
            </div>

            <div className="inputDiv">
              <label htmlFor= "password">Password</label>
              <div className="input flex">
              <BsFillShieldLockFill className='icon'/>
                <input type="password" id="password" placeholder='Enter Password' onChange={(event)=>{
                  setPassword(event.target.value)
                }} />
              </div>
            </div>

            <div className="inputDiv">
              <label htmlFor= "rank">Rank</label>
              <div className="input flex">
              <BsFillShieldLockFill className='icon'/>
                <input type="text" id="rank" placeholder='Enter Rank' onChange={(event)=>{
                  setRank(event.target.value)
                }} />
              </div>
            </div>

            <button type='submit' className='btn flex' onClick={createUser}>
              {!isPending && <span> Register </span>}
              {isPending && <span> Processing </span>}
              <AiOutlineSwapRight  className='icon'/>

            </button>

            <span className='forgotPassword'>
              Forgot your password <a href="">Click Here</a>

            </span>

            
          </form>
        </div>
    </div>
    </div>
  )
}

export default Register
