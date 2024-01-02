import React, { useEffect, useState } from 'react'
import Loading from './Loading';
import { Link, useNavigate } from 'react-router-dom';
import SemesterReportRow from './SemesterReportRow';
import SearchRow from './SearchRow';
import Swal from 'sweetalert2';


const SearchStudent = () => {

  const host = process.env.REACT_APP_BACKEND_URL;

  const [loading, setLoading] = useState(false);

  const [rollNo, setRollNo] = useState('');
  const [data, setData] = useState(null);

  const [semArr, setSemArr] = useState([]);

  const menues = localStorage.getItem("menues");

  let navigate = useNavigate();

  useEffect(() => {
    if (!menues.includes("search")) {
      navigate("/dashboard", { replace: true });
    }
  }, []);


  const handleChange = (event) => {
    setRollNo(event.target.value);
  }

  // TODO: Result Display
  const handleSearch = async () => {
    setData(null);
    setLoading(true);
    // console.log(rollNo)
    const res = await fetch(`${host}/api/marksheet/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('auth-token')
      },
      body: JSON.stringify({ rollNo })
    });
    const data = await res.json();
    setLoading(false);
    console.log(data);

    if (data?.length === 0) {
      Swal.fire({
        title: 'Alert',
        text: "Student not found!",
        icon: 'error', // Options: 'success', 'error', 'warning', 'info'
      });
      return;
    }
    if (data?.length >= 1) {
      setData({
        name: data[0]?.name,
        uid: data[0]?.uid,
        registrationNo: data[0]?.registrationNo,
        phone: data[0]?.phone
      })
      const element = [];

      for (let y = 2017; y <= (new Date).getFullYear(); y++) {
        let yearArr = [];
        yearArr = data.filter((ele) => ele.year === y);
        if (yearArr.length === 0) { continue; }
        element.push(
          <SearchRow
            key={y}
            arr={yearArr}
            year={y}
            rollNo={data[0].rollNo}
            se
          />
        );
      }





      // for (let i = 0; i < data.length; i++) {
      //   element.push(
      //     <SearchRow
      //       key={i + 1}
      //       obj={data[i]}
      //       rollNo={rollNo}
      //     />
      //   );
      // }
      setSemArr(element);
    }

  }



  return (
    <>
      {/* Loading Bar */}
      {loading === true ?
        <div className='absolute top-0 right-0 z-10 w-full'>
          <Loading />
        </div> : ''}

      {/* Search Student */}
      <div id="search-student" className='my-3 py-5 w-full '>
        <div id='heading' className='px-2'>
          <h1 className='text-3xl  font-semibold border-b-2 border-b-blue-600 py-2 '>Search Student</h1>
        </div>
        <div className='w-full  my-5  '>
          <div className="rows w-full p-3 my-3 mt-9">

            <p>Roll No. / Registration No. / UID</p>
            <div className="row flex flex-col lg:items-center lg:flex-row gap-7 ">
              <div id="rollno-field" className='flex items-center gap-3 w-full lg:w-auto my-1 '>

                <div className=''>
                  <label htmlFor="roll_no"></label>
                </div>
                <div>
                  <input type="text" name="rollNo" id="rollNo" value={rollNo} onChange={handleChange} className='border-2 w-full lg:w-auto border-slate-700 px-4 py-1 rounded-md' />
                </div>
              </div>
              <div className='row my-3 '>
                <button onClick={handleSearch} className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 '>Search</button>

              </div>
            </div>


            <hr className='my-9 border-slate-300' />

            {/* Display the table */}
            {
              data !== null ?
                <div className='w-full overflow-x-scroll'>
                  <table className='min-w-[1234px]  border-2 border-black '>
                    <thead className='bg-slate-100 '>
                      <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>Name</td>
                      <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>UID</td>
                      <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>Registration No.</td>
                      <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>Phone</td>
                    </thead>
                    <tbody >
                      <tr>
                        <td className='border-2 border-black text-center font-medium py-2 w-[9%]'>
                          {data.name}
                        </td>
                        <td className='border-2 border-black text-center font-medium py-2 w-[9%]'>
                          {data.uid}
                        </td>
                        <td className='border-2 border-black text-center font-medium py-2 w-[9%]'>
                          {data.registrationNo}
                        </td>
                        <td className='border-2 border-black text-center font-medium py-2 w-[9%]'>
                          {data.phone}
                        </td>
                      </tr>
                      {/* {reportArr} */}
                    </tbody>
                  </table>


                  <div className='my-20 w-full flex flex-col gap-2'>
                    <span className='text-xl font-medium my-3'>Marksheets: -</span>
                    <table className='min-w-[1234px] border-2 border-black '>
                      <thead className='bg-slate-100 '>
                        <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>Year / Semester</td>
                        <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>Semester 1</td>
                        <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>Semester 2</td>
                        <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>Semester 3</td>
                        <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>Semester 4</td>
                        <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>Semester 5</td>
                        <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>Semester 6</td>
                      </thead>
                      <tbody >
                        {semArr}
                      </tbody>
                    </table>
                  </div>


                </div> : ''}

          </div>
        </div>
      </div>
    </>
  )
}

export default SearchStudent
