import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Loading from './Loading';
import Swal from 'sweetalert2';

const Settings = () => {

  const host = process.env.REACT_APP_BACKEND_URL;

  const [loading, setLoading] = useState(false);

  let location = useLocation();

  let navigate = useNavigate();
  const menues = localStorage.getItem("menues");

  
   

  const authToken = localStorage.getItem('auth-token');

  const [addSubject, setAddSubject] = useState({
    stream: 'bcom',
    course: 'honours',
    semester: 1,
    subjectName: ''
  });

  const [deleteSubject, setDeleteSubject] = useState({
    stream: 'bcom',
    course: 'honours',
    semester: 1,
    subjectName: ''
  });

  // Return to home page for invalid access
  useEffect(() => {
    if (!authToken) {
      navigate('/', { replace: true });
    }
  }, []);


  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  }

  const updateSubject = async (obj) => {


    // console.log('updated', subjectObj[0][obj?.stream.toLowerCase()][`sem${obj?.semester}`][obj?.course])

    setLoading(true);
    const res = await fetch(`${host}/api/subjects/add_update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('auth-token')
      },
      body: JSON.stringify(obj)
    });
    setLoading(false);
    const data = await res.json();
    console.log(data);
    Swal.fire({
      title: 'Alert',
      text: "Updated!",
      icon: 'success', // Options: 'success', 'error', 'warning', 'info'
    });


  }


  const prepareAddSubject = () => {
    const subjectObj = JSON.parse(localStorage.getItem('subjectObj'));
    if(addSubject?.subjectName==='') {
      Swal.fire({
        title: 'Alert',
        text: "Invalid Subject...!",
        icon: 'error', // Options: 'success', 'error', 'warning', 'info'
      });
      return;
    }
    if (!subjectObj[0][addSubject?.stream.toLowerCase()][`sem${addSubject?.semester}`][addSubject?.course].includes(addSubject?.subjectName)) {
      subjectObj[0][addSubject?.stream.toLowerCase()][`sem${addSubject?.semester}`][addSubject?.course].push(addSubject?.subjectName)
      updateSubject(subjectObj[0]);
    }
    else {
      Swal.fire({
        title: 'Alert',
        text: "Subject is already present",
        icon: 'warning', // Options: 'success', 'error', 'warning', 'info'
      });
    }

  }

  const prepareDeleteSubject = () => {
    const subjectObj = JSON.parse(localStorage.getItem('subjectObj'));
    if(addSubject?.subjectName==='') {
      Swal.fire({
        title: 'Alert',
        text: "Invalid Subject...!",
        icon: 'error', // Options: 'success', 'error', 'warning', 'info'
      });
      return;
    }
    if (!subjectObj[0][deleteSubject?.stream.toLowerCase()][`sem${deleteSubject?.semester}`][deleteSubject?.course].includes(deleteSubject?.subjectName)) {
      // subjectObj[0][obj?.stream.toLowerCase()][`sem${obj?.semester}`][obj?.course].push(obj?.subjectName)
      // updateSubject(subjectObj[0]);
      Swal.fire({
        title: 'Alert',
        text: "Subject does not exist!",
        icon: 'error', // Options: 'success', 'error', 'warning', 'info'
      });
    }
    else {
      const index = subjectObj[0][deleteSubject?.stream.toLowerCase()][`sem${deleteSubject?.semester}`][deleteSubject?.course].indexOf(deleteSubject?.subjectName);
      subjectObj[0][deleteSubject?.stream.toLowerCase()][`sem${deleteSubject?.semester}`][deleteSubject?.course].splice(index, 1);
      // console.log(subjectObj[0])
      updateSubject(subjectObj[0]);
    }
  }


  const handleAddChange = (event) => {
    const { name, value } = event.target;
    setAddSubject((prev) => ({ ...prev, [name]: value }));
    // console.log(addSubject)
  }

  const handleDeleteChange = (event) => {
    const { name, value } = event.target;
    setDeleteSubject((prev) => ({ ...prev, [name]: value }));
    // console.log(deleteSubject)
  }

  const handleChangePassword = async () => {
    const email = localStorage.getItem('email');
    const newPassword = document.getElementById('newpassword').value;
    const cPassword = document.getElementById('cpassword').value;

    if (newPassword === '') {
      Swal.fire({
        title: 'Alert',
        text: "Password cannot be blank!",
        icon: 'warning', // Options: 'success', 'error', 'warning', 'info'
      });
      return;
    }

    if (newPassword !== cPassword) {
      Swal.fire({
        title: 'Alert',
        text: "New Password and confirm password doesn't match",
        icon: 'error', // Options: 'success', 'error', 'warning', 'info'
      });
      return;
    }
    // console.log(email, newPassword, cPassword);

    setLoading(true);
// console.log(`${host}/api/auth/update`)
    const res = await fetch(`${host}/api/auth/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('auth-token')
      },
      body: JSON.stringify({
        email: email,
        password: cPassword
      })
    });

    setLoading(false);
    const data = await res.json();
    // console.log(data);
    if (data.message) {
      Swal.fire({
        title: 'Alert',
        text: "Password Updated!",
        icon: 'success', // Options: 'success', 'error', 'warning', 'info'
      });
    }

  }


  return (
    <>
      {/* Loading bar */}
      {loading ? <Loading /> : ''}

      <div id="settings" className=' '>
        <div id="row1" className='bg-slate-100 py-5 px-2'>
          {/* Breadcrumb */}
          <div id="breadcrumb" className=' px-2 text-purple-600 font-medium'>
            <Link to={"/dashboard"}>Back</Link>
            &nbsp;
            &nbsp;
            <span>/</span>
            &nbsp;
            &nbsp;
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div id="row2" className='bg-slate-100 py-5 px-2 flex flex-col gap-2 items-center justify-center'>
          <div>
            <img src={localStorage.getItem('picture')} alt="picture" className='rounded-full' />
          </div>
          <div>
            <span className='text-2xl font-medium'>{localStorage.getItem('name')}</span>
          </div>
        </div>
        <div className="container flex flex-col items-center justify-center">
          {/* Add Subject */}
          {(
            localStorage.getItem("email")==="office@datachef.in" ||
            localStorage.getItem("email")==="desaiharsh183@gmail.com" ||
            localStorage.getItem("email")==="minesh.maniar@thebges.edu.in"
          )?  <div id="add-subject">
            <h1 className='text-2xl font-medium mt-7 my-3 '>Add Subjects</h1>

            <div className='flex gap-3 md:items-center flex-col md:flex-row  '>
              <div className='stream'>
                <label htmlFor="stream">Stream</label>
                <select name="stream" value={addSubject.stream} onChange={handleAddChange} className='border-2 px-4 py-2 rounded-md border-slate-700 w-full '>
                  <option value="bcom">BCOM</option>
                  <option value="ba">BA</option>
                  <option value="bsc">BSC</option>
                </select>
              </div>
              <div className='course'>
                <label htmlFor="course">Course</label>
                <select name="course" value={addSubject.stream.toLowerCase() !== 'bcom' ? 'honours' : addSubject.course} onChange={handleAddChange} className='border-2 border-slate-700 w-full px-4 py-2 rounded-md'>
                  <option value="honours">honours</option>
                  <option value="general">general</option>
                </select>
              </div>
              <div className='semester flex flex-col'>
                <label htmlFor="semester">Semester</label>
                <input type="number" name="semester" value={addSubject.semester} onChange={handleAddChange} className='border-2 px-4 py-2 rounded-md' />
              </div>
              <div className='subject flex flex-col'>
                <label htmlFor="subject">Subject</label>
                <input type="text" name="subjectName" value={addSubject.subjectName} onChange={handleAddChange} className='border-2 px-4 py-2 rounded-md' />
              </div>
              <div className='button flex flex-col '>
                <button onClick={prepareAddSubject} className='px-4 py-2 sm:w-1/4 md:w-auto bg-blue-500 text-white rounded-md font-semibold'>Add</button>
              </div>
            </div>
          </div> :''}

          {/* Delete Subject */}
         {
         (
          localStorage.getItem("email")==="office@datachef.in" ||
          localStorage.getItem("email")==="desaiharsh183@gmail.com" ||
          localStorage.getItem("email")==="minesh.maniar@thebges.edu.in"
        )?
         <div id="row2" className='my-7 py-7'>
            <h1 className='text-2xl font-medium mt-7 my-3 '>Delete Subjects</h1>

            <div className='flex gap-3 md:items-center flex-col md:flex-row  '>
              <div className='stream'>
                <label htmlFor="stream">Stream</label>
                <select name="stream" value={deleteSubject.stream} onChange={handleDeleteChange} className='border-2 px-4 py-2 rounded-md border-slate-700 w-full '>
                  <option value="bcom">BCOM</option>
                  <option value="ba">BA</option>
                  <option value="bsc">BSC</option>
                </select>
              </div>
              <div className='course'>
                <label htmlFor="course">Course</label>
                <select name="course" value={deleteSubject.stream.toLowerCase() !== 'bcom' ? 'honours' : deleteSubject.course} onChange={handleDeleteChange} className='border-2 border-slate-700 w-full px-4 py-2 rounded-md'>
                  <option value="honours">honours</option>
                  <option value="general">general</option>
                </select>
              </div>
              <div className='semester flex flex-col'>
                <label htmlFor="semester">Semester</label>
                <input type="number" name="semester" value={deleteSubject.semester} onChange={handleDeleteChange} className='border-2 px-4 py-2 rounded-md' />
              </div>
              <div className='subject flex flex-col'>
                <label htmlFor="subject">Subject</label>
                <input type="text" name="subjectName" value={deleteSubject.subjectName} onChange={handleDeleteChange} className='border-2 px-4 py-2 rounded-md' />
              </div>
              <div className='button flex flex-col'>
                <button onClick={prepareDeleteSubject} className='px-4 sm:w-1/4 md:w-auto py-2 bg-blue-500 text-white rounded-md font-semibold'>Delete</button>
              </div>
            </div>
          </div> : ''}

          {/* Change Password */}
          <div className='container flex justify-center border'>

            <div id="row3" className='my-14 border container flex flex-col items-center'>
              <h1 className='text-2xl font-medium mt-7 my-3 '>Change Password</h1>
              <div className="email flex flex-col w-full items-center">
                {/* <label htmlFor="email">Email</label> */}
                <input type="email" name="email" value={localStorage.getItem('email')} id="email" className=' outline-none px-4 py-2 border-2 bg-slate-100  rounded-md md:w-1/2' />
              </div>
              <div className="newpassword flex flex-col my-4 w-full items-center">
                {/* <label htmlFor="newpassword">New Password</label> */}
                <input type="password" name="newpassword" placeholder='Enter the new password' id="newpassword" className='px-4 py-2 border border-slate-400 rounded-md md:w-1/2' />
              </div>
              <div className="cpassword flex flex-col my-4 w-full items-center">
                {/* <label htmlFor="cpassword">Confirm Password</label> */}
                <input type="password" name="cpassword" placeholder='Confirm Password' id="cpassword" className='px-4 py-2 border border-slate-400 rounded-md md:w-1/2' />
              </div>
              <div className="cpassword flex flex-col my-4">
                <div>

                  <button onClick={handleChangePassword} className='px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md'>Save</button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default Settings
