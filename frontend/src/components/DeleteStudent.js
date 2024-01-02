import React, { useEffect, useState } from 'react'
import Loading from './Loading';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const DeleteStudent = () => {

  const host = process.env.REACT_APP_BACKEND_URL;

  const [loading, setLoading] = useState(false);

  const menues = localStorage.getItem("menues");

  let navigate = useNavigate();

  useEffect(()=>{
    if(!menues.includes("delete")) {
      navigate("/dashboard", {replace: true});
    }
  }, []);

  const handleDelete = async ()=> {
    let obj = {
      rollNo: document.getElementById('rollNo').value,
      semester: Number(document.getElementById('semester').value),
      year: document.getElementById('year').value,
    }
    // console.log(obj);

    if(obj.rollNo==='' || obj.semester==='' || obj.year==='') {
      Swal.fire({
        title: 'Alert',
        text: 'Please enter valid fields...!',
        icon: 'warning', // Options: 'success', 'error', 'warning', 'info'
      });
      return;
    }
    setLoading(true);
    const res = await fetch(`${host}/api/marksheet/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('auth-token')
      },
      body: JSON.stringify(obj)
    });
    const data = await res.json();
    setLoading(false);
    // console.log(data);
    if(data?.message) {
      Swal.fire({
        title: 'Alert',
        text: data?.message,
        icon: 'info', // Options: 'success', 'error', 'warning', 'info'
      });
    }
    else {
      Swal.fire({
        title: 'Alert',
        text: "Given marksheet data not found!",
        icon: 'info', // Options: 'success', 'error', 'warning', 'info'
      });
    }

  }



  return (
    <>
      {/* Loading Bar */}
      {loading === true ?
        <div className='absolute top-0 right-0 z-10 w-full'>
          <Loading />
        </div> : ''}

      {/* Delete Student */}
      <div id="delete-student" className='m-3 py-5'>
        <div id='heading'>
          <h1 className='text-3xl font-semibold border-b-2 border-b-blue-600 py-2 '>Delete Student</h1>
        </div>
        <div className='w-full  my-5 '>
        <div className="rows w-full p-3 my-3 mt-9">
          
          <div className="row flex flex-col lg:flex-row gap-7 ">
            <div id="rollno-field" className='flex gap-3 w-full lg:w-auto my-1 flex-col'>
              <div className=''>
                <label htmlFor="roll_no">Roll No.</label>
              </div>
              <div>
                <input type="text" name="rollNo" id="rollNo" className='border-2 w-full lg:w-auto border-slate-700 px-4 py-1 rounded-md' />
              </div>
            </div>
            
            <div id="semester-field" className='flex gap-3 flex-col my-1 w-full lg:w-auto '>
              <div className=''>
                <label htmlFor="semester">Semester</label>
              </div>
              <div>
                <input type="number" name="semester" id="semester" className='border-2 w-full lg:w-auto border-slate-700 px-4 py-1 rounded-md' />
              </div>
            </div>
            <div id="year-field" className='flex gap-3 flex-col my-1  w-full lg:w-auto'>
              <div className=''>
                <label htmlFor="year">Year</label>
              </div>
              <div>
                <input type="number" name="year" id="year" className='border-2 w-full lg:w-auto border-slate-700 px-4 py-1 rounded-md' />
              </div>
            </div>
          </div>

          
          <hr className='my-9 border-slate-300' />
          <div className='row my-3 '>
            <button onClick={handleDelete} className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 '>Delete</button>
       
          </div>
         
        </div>
      </div>
      </div>
    </>
  )
}

export default DeleteStudent
