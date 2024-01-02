import React, { useState } from 'react'
import Loading from '../components/Loading';
import { BsFillClipboardDataFill } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google';
import jwt_decode from 'jwt-decode'
import md5 from 'md5';
import Swal from 'sweetalert2';

const Home = () => {

  const host = process.env.REACT_APP_BACKEND_URL;

  let navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // console.log('fired');
    if(document.getElementById('email').value==='' || document.getElementById('password').value==='') {
      // alert('Please enter the fields');
      Swal.fire({
        title: 'Alert',
        text: 'Please enter the fields.',
        icon: 'error', // Options: 'success', 'error', 'warning', 'info'
      });
      return;
    }
    const emailHash = md5(document.getElementById('email').value);
    const avatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;
    localStorage.setItem('picture', avatarUrl);
    setLoading(true)
    const res = await fetch(`${host}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email: document.getElementById('email').value, 
        password: document.getElementById('password').value, 

      })
    })

    const data = await res.json();
    // console.log(data);
    setLoading(false);
    if(data.error) { alert(data.error); return; }
    else if (data) {
      // console.log(data)
      localStorage.setItem('auth-token', data.authToken);
      localStorage.setItem('name', data.name);
      localStorage.setItem('email', document.getElementById('email').value);
      localStorage.setItem('menues', JSON.stringify(data.menues));
      navigate('/dashboard', { replace: true });
    }
  }

  const handleSuccess = async (credentialResponse) => {
    // console.log(credentialResponse)
    const userObject = jwt_decode(credentialResponse.credential);
    // console.log(userObject);

    localStorage.setItem('email', userObject.email);
    localStorage.setItem('name', userObject.name);
    localStorage.setItem('picture', userObject.picture);

    const res = await fetch(`${host}/api/auth/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userObject.email })
    });
    const data = await res.json();
    setLoading(false);
    // console.log(data.)
    if (data.authToken) {
      localStorage.setItem('auth-token', data.authToken);
      localStorage.setItem('email', userObject.email);
      localStorage.setItem('name', userObject.name);
      localStorage.setItem('picture', userObject.picture);
      navigate('/dashboard', { replace: true });
    }
    else {
      alert('Invalid credentials');
    }

  }

  const handleChange = () => {

  }


  return (
    <>
      {/* Loading Bar */}
      {loading ? <Loading /> : ''}
      <div className='w-full h-screen  bg-[#5c405c] flex flex-col justify-center items-center '>
        <div className="rows w-full px-4 sm:w-[90%] md:w-[75%] lg:w-[50%] flex flex-col gap-3 justify-center items-center">
          <div id="row1" className='text-white flex gap-2 flex-col justify-center items-center w-3/4' >
            <h1 className='text-3xl font-semibold flex gap-3  items-center '>
              <BsFillClipboardDataFill />
              <span>
                Academic 360
              </span>
            </h1>
            <h2 className='flex gap-7 items-center text-center'>Fast & Easy Student-Data Management</h2>
          </div>
          <div id="row2" className='my-7'>
            <h3 className='text-2xl font-medium text-white'>Welcome Back!</h3>
          </div>
          <div id="row3" className='w-full flex flex-col gap-4 '>
            <form className='w-full flex flex-col gap-4' onSubmit={handleSubmit}>
              <div className="email w-full ">
                <label htmlFor="email" className='text-white my-2'>Email</label>
                <input type="email" name='email' id='email' onChange={handleChange} placeholder='Enter your email...!' className='w-full my-2 px-4 py-2 rounded-md' />
              </div>
              <div className="password w-full ">
                <label htmlFor="password" className='text-white my-2'>Password</label>
                <input type="password" name='password' id='password' onChange={handleChange} placeholder='Enter your password...!' className='w-full my-2 px-4 py-2 rounded-md' />
              </div>
              <div className="btn w-full flex justify-center items-center ">
                <button className='px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 font-medium '>Login</button>
              </div>
            </form>
          </div>
          <div id="row4" className='my-7 mt-10'>
            <h3 className='text-white font-medium text-xl my-3 text-center'>Or continue with</h3>
            <div className='flex justify-center items-center'>
              <GoogleLogin

                onSuccess={(credentialResponse) => {
                  handleSuccess(credentialResponse)
                }}
                onError={() => {
                  alert('Login Failed');
                }}
              />;
            </div>
          </div>
        </div>



      </div>
    </>
  )
}

export default Home
