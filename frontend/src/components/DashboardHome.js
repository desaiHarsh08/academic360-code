import React, { useEffect, useState } from 'react'
import Loading from './Loading'
import SubjectDisplay from './SubjectDisplay';
import StudentList from './StudentList';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

const DashboardHome = () => {

  const host = process.env.REACT_APP_BACKEND_URL;

  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({});

  const [filterStudents, setFilterStudents] = useState({
    stream: 'bcom',
    course: 'honours',
    semester: 1,
    year: 2023
  });

  const [subjectList, setSubjectList] = useState([]);
  const [studentList, setStudentList] = useState([]);


  const authToken = localStorage.getItem('auth-token');

  // Fetch the stats from the db
  useEffect(() => {
    if (authToken) {
      const fetchStats = async () => {
        const res = await fetch(`${host}/api/marksheet/stats`, {
          method: 'GET',
          headers: {
            'auth-token': authToken
          }
        });
        if (!res.ok) {
          Swal.fire({
            title: 'Alert',
            text: 'Internal Server Error!',
            icon: 'error', // Options: 'success', 'error', 'warning', 'info'
          });
        }
        return await res.json();
      }


      fetchStats().then((jsonData) => {
        if (jsonData) {
          setStats(jsonData)
          localStorage.setItem('totalMarksheets', JSON.stringify(jsonData.totalMarksheets));
          localStorage.setItem('bcom', JSON.stringify(jsonData.bcom));
          localStorage.setItem('ba', JSON.stringify(jsonData.ba));
          localStorage.setItem('bsc', JSON.stringify(jsonData.bsc));
          localStorage.setItem('bsc', JSON.stringify(jsonData.bsc));
          localStorage.setItem('bba', JSON.stringify(jsonData.bba));
          localStorage.setItem('ma', JSON.stringify(jsonData["m.a"]));
          localStorage.setItem('mcom', JSON.stringify(jsonData["m.com"]));
        }
      }).catch((error) => {
        console.error(error);
      })
    }
  }, []);

  // Fetch the subject list from the db
  useEffect(() => {
    const fetchSubjects = async () => {
      const res = await fetch(`${host}/api/subjects/fetch-all`, {
        method: 'GET',
        headers: {
          'auth-token': authToken
        }
      });
      if (!res.ok) {
        Swal.fire({
          title: 'Alert',
          text: 'Internal Server Error!',
          icon: 'error', // Options: 'success', 'error', 'warning', 'info'
        });
      }
      return await res.json();
    }


    fetchSubjects().then((subjectsObj) => {
      if (subjectsObj == undefined) { return; }
      // console.log(subjectsObj)
      localStorage.setItem('subjectObj', JSON.stringify(subjectsObj));

      let subjectList = [];
      let keys = [];
      let k;
      let count = 0;
      for (let course in subjectsObj[0]) {
        let i = 0;
        if (course.toLowerCase() === 'bcom' || course.toLowerCase() === 'ba' || course.toLowerCase() === 'bsc') {
          // let count = 0;
          for (let sem in subjectsObj[0][course]) {
            count += 1;
            // k = Math.random
            if (i > 0) {
              // console.log(sem, subjectsObj[0][course][sem].common, subjectsObj[0][course][sem].honours, subjectsObj[0][course][sem].general, subjectsObj[0][course][sem].elective)
              subjectList.push(
                <SubjectDisplay
                  key={count}
                  course={''}
                  sem={sem}
                  common={subjectsObj[0][course][sem].common}
                  honours={subjectsObj[0][course][sem].honours}
                  general={subjectsObj[0][course][sem].general}
                  elective={subjectsObj[0][course][sem].elective}
                />
              )
            }
            else {
              subjectList.push(
                <SubjectDisplay
                  key={count}
                  i={i}
                  course={course}
                  sem={sem}
                  common={subjectsObj[0][course][sem].common}
                  honours={subjectsObj[0][course][sem].honours}
                  general={subjectsObj[0][course][sem].general}
                  elective={subjectsObj[0][course][sem].elective}
                />
              )
            }

            // console.log(element)
            i += 1;
          }
        }


      }
      // console.log(element)
      setSubjectList(subjectList);
    }).catch((error) => {
      console.error(error);
    })

    // console.log(subjectList)

  }, []);


  const downloadExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');
    XLSX.writeFile(wb, filename);
};

const handleDownload = (data) => {
  // console.log(data)
  downloadExcel(data, `${filterStudents.year}-${filterStudents.stream.toUpperCase()}-${filterStudents.semester}-${filterStudents.course}.xlsx`);
}



  const handleSubjectDisplay = () => {
    // console.log('fired');
    document.getElementById('list-container').classList.toggle('hidden');
  }

  const handleOnChange = (event) => {
    const { name, value } = event.target;

    // Update filterStudents based on the input field's name
    setFilterStudents((prevFilter) => ({
      ...prevFilter,
      [name]: value,
    }));
    filterStudents.semester = Number(document.getElementById('semester').value)
    // console.log(filterStudents);
  };

  const handleStudentFilter = async () => {
    setLoading(true);
    const course = (filterStudents.stream.toUpperCase()!=="M.A" || filterStudents.stream.toUpperCase()!=="M.COM")? filterStudents.course : '';
    const res = await fetch(`${host}/api/marksheet/filter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': authToken
      },
      body: JSON.stringify({
        stream: filterStudents.stream.toUpperCase(),
        course: course,
        semester: filterStudents.semester,
        year: filterStudents.year,

      })
    });
    const data = await res.json();
    setLoading(false);
    // console.log(data, data.length);
    if(data.length===0) {
      Swal.fire({
        title: 'Alert',
        text: 'No data found!',
        icon: 'warning', // Options: 'success', 'error', 'warning', 'info'
      });
      return;
    }

    // if(filterStudents.stream.toUpperCase()==="BCOM") {
      handleDownload(data);
    // }

    const element = [];
    for (let i = 0; i < data.length; i++) {
      // console.log(i);
      element.push(
        <StudentList
          key={i}
          data={data[i]}
        />
      );
      setStudentList(element);
    }
    // }
  }


  return (
    <>
      {loading === true ? <Loading /> : ''}

      <div id='dashboard-home' className='text-black m-2 flex flex-col gap-5'>
        {/* Display all the stats */}
        <div id="display-stats" className='w-full flex flex-col sm:flex-row gap-2  '>
          <div className='border flex flex-col justify-center items-center h-32 sm:w-[25%] bg-red-500 text-white text-2xl font-medium rounded-md'>
            <span>Total</span>
            <span>{localStorage.getItem('totalMarksheets') ? localStorage.getItem('totalMarksheets') : '...'}</span>
          </div>
          <div className='border flex gap-2 flex-col justify-center items-center h-32 sm:w-[25%] bg-blue-500 text-white text-2xl font-medium rounded-md'>
            <span>BA</span>
            <span>{localStorage.getItem('ba') ? localStorage.getItem('ba') : '...'}</span>
          </div>
          <div className='border flex gap-2 flex-col justify-center items-center h-32 sm:w-[25%] bg-yellow-400 text-white text-2xl font-medium rounded-md'>
            <span>BCOM</span>
            <span>{localStorage.getItem('bcom') ? localStorage.getItem('bcom') : '...'}</span>
          </div>
          <div className='border flex gap-2 flex-col justify-center items-center h-32 sm:w-[25%] bg-green-500 text-white text-2xl font-medium rounded-md'>
            <span>BSC</span>
            <span>{localStorage.getItem('bsc') ? localStorage.getItem('bsc') : '...'}</span>
          </div>
          <div className='border flex gap-2 flex-col justify-center items-center h-32 sm:w-[25%] bg-fuchsia-500 text-white text-2xl font-medium rounded-md'>
            <span>BBA</span>
            <span>{localStorage.getItem('bba') ? localStorage.getItem('bba') : '...'}</span>
          </div>
          <div className='border flex gap-2 flex-col justify-center items-center h-32 sm:w-[25%] bg-orange-500 text-white text-2xl font-medium rounded-md'>
            <span>M.A</span>
            <span>{localStorage.getItem('ma') ? localStorage.getItem('ma') : '...'}</span>
          </div>
          <div className='border flex gap-2 flex-col justify-center items-center h-32 sm:w-[25%] bg-[#4b7878] text-white text-2xl font-medium rounded-md'>
            <span>M.COM</span>
            <span>{localStorage.getItem('mcom') ? localStorage.getItem('mcom') : '...'}</span>
          </div>
        </div>

        {/* Display all the subjects */}
        <div id="display-subjects" className='pt-7 '>
          <div className='w-full flex justify-between border p-2 items-center'>
            <h3 className='text-2xl font-semibold '>Subject List</h3>
            <div>
              <button onClick={handleSubjectDisplay} className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md'>View</button>
            </div>
          </div>

          <div className='w-full overflow-x-auto hidden transition-all' id='list-container' >
            {subjectList}
          </div>
        </div>

        {/* Display the filtered data list */}
        <div id="display-filtered-data" className='px-2'>
          <h3 className='text-2xl font-semibold '>Filter Students</h3>
          <div className='w-full  my-1 '>
            <div className="rows w-full  ">


              <hr className='my-9 border-slate-300' />
              <div className="row flex flex-col sm:flex-row gap-1 md:gap-7  ">
                <div id="stream-field" className='flex gap-3 flex-col sm:items-center my-1 sm:w-1/4'>
                  <div className=''>
                    <label htmlFor="stream">Stream</label>
                  </div>
                  <div className='w-full'>
                    <select name="stream" onChange={handleOnChange} value={filterStudents.stream.toLowerCase()} id="stream" className='border-2 border-slate-700 w-full px-4 py-1 rounded-md'>
                      <option value="bcom">BCOM</option>
                      <option value="ba">BA</option>
                      <option value="bsc">BSC</option>
                      <option value="bba">BBA</option>
                      <option value="m.a">M.A</option>
                      <option value="m.com">M.COM</option>
                    </select>
                  </div>
                </div>
                <div id="course-field" className='flex gap-3 flex-col sm:items-center my-1 sm:w-1/4'>
                  <div className=''>
                    <label htmlFor="course">Course</label>
                  </div>
                  <div className='w-full'>
                    <select name="course" onChange={handleOnChange} value={filterStudents.stream.toLowerCase() !== 'bcom' ? 'honours' : filterStudents.course} id="course" className='border-2 border-slate-700 w-full px-4 py-1 rounded-md'>
                      <option value="honours">honours</option>
                      <option value="general">general</option>
                    </select>
                  </div>
                </div>
                <div id="semester-field" className='flex gap-3 flex-col sm:items-center my-1 sm:w-1/4'>
                  <div className=''>
                    <label htmlFor="semester">Semester</label>
                  </div>
                  <div className='w-full'>
                    <input type="number" name="semester" id="semester" value={filterStudents.semester} onChange={handleOnChange} className='w-full border-2 border-slate-700 px-4 py-1 rounded-md' />
                  </div>
                </div>
                <div id="year-field" className='flex gap-3 flex-col sm:items-center my-1 sm:w-1/4'>
                  <div className=''>
                    <label htmlFor="year">Year</label>
                  </div>
                  <div className='w-full'>
                    <input type="number" name="year" id="year" value={filterStudents.year} onChange={handleOnChange} className='w-full border-2 border-slate-700 px-4 py-1 rounded-md' />
                  </div>
                </div>
              </div>
              <hr className='my-9 border-slate-300' />
              <div className='row my-3 '>
                <button onClick={handleStudentFilter} className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 '>Filter</button>
              </div>
              <hr className='my-9 border-slate-300' />
            </div>
          </div>


          {/* Display the list */}
          {
            studentList.length > 0 ?
              <div id="display-table" className='w-full my-5 overflow-x-scroll'>
                <table className="border-2 border-black min-w-[3800px] ">
                  <thead className='w-[3800px]   '>
                    <tr className='bg-slate-100 w-[3800px] '>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>Registration No.</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>Stream</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>Course</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>Semester</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>Name</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>SGPA</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>Remarks</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>Full Marks</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>Year1</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>Practical M</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>NGP</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>Credit</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>TGP</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>Internal M</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>Theory M</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>Total</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>Status</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>Grade</th>
                      <th className='p-3 border-r-2 border-black w-[200px] text-center '>Roll No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentList}
                  </tbody>
                </table>
              </div> : ''
          }







        </div>


      </div>

    </>
  )
}

export default DashboardHome
