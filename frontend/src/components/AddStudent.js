import React, { useEffect, useState } from 'react'
import Loading from './Loading'
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';


const AddStudent = () => {

  const host = process.env.REACT_APP_BACKEND_URL;

  const [loading, setLoading] = useState(false);

  const menues = localStorage.getItem("menues");

  let navigate = useNavigate();

  useEffect(()=>{
    if(!menues.includes("add")) {
      navigate("/dashboard", {replace: true});
    }
  }, []);

  const [excelData, setExcelData] = useState([]);
  const [marksheet, setMarksheet] = useState({
    name: '',
    rollNo: '',
    registrationNo: '',
    stream: 'bcom',
    course: 'honours',
    semester: 1,
    year: (new Date()).getFullYear(),
    year2: (new Date()).getFullYear(),
    UID: '',
    phone: '',
    subjects: [],
  })

  const [progress, setProgress] = useState(0);

  const [addSubjectRow, setAddSubjectRow] = useState([]);

  const handleFileInput = (e) => {
    setLoading(true);
    const progressBox = document.getElementById('progressBox');
    progressBox.classList.remove('hidden');
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataFromFile = e.target.result;
        const workbook = XLSX.read(dataFromFile, { type: 'array' });
        const sheetName = workbook.SheetNames[0]; // Assumes the first sheet
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { raw: true });
        setExcelData(data);
        document.getElementById('status').innerHTML = "Scanning the file...";
        
        
        console.log(data)
      };
      reader.readAsArrayBuffer(file);
    }
    setLoading(false);
    document.getElementById('status').innerHTML = "Ready for upload!";
    // progressBox.classList.toggle('hidden');
  }

  function fetchByStream(data, stream) {
    return data.filter(element => element.stream.toUpperCase() === stream.toUpperCase());
  }

  function fetchByYear(data, year, stream) {
    if (stream.toUpperCase() === "BCOM") {
      return data.filter(element => element.year2 == year);
    }
    else {
      return data.filter(element => element.year1 == year);
    }
  }

  function fetchBySemester(data, sem) {
    return data.filter(element => element.semester == sem);
  }

  function fetchByStudentRollNo(data, rollNo) {
    return data.filter(element => element.roll_no == rollNo);
  }

  function createMarksheet(marksheetData) {
    // Create the marksheet object 
    let marksheetObj = {
      name: marksheetData[0].name,
      rollNo: marksheetData[0].roll_no,
      registrationNo: marksheetData[0].registration_no,
      stream: marksheetData[0].stream,
      course: marksheetData[0].course,
      year: marksheetData[0].year,
      year2: marksheetData[0].year2,
      semester: marksheetData[0].semester,
      sgpa: marksheetData[0].sgpa,
      remarks: marksheetData[0].remarks,
      classification: '',
      cgpa: 0,
      status: marksheetData[0].status,
      totalCredit: 0,
      year: marksheetData[0].year,
      UID: marksheetData[0].UID || '',
      phone: marksheetData[0].phone || '',
      subjects: []
    };

    // Handle the marksheet subjects
    let uniqueSubjects = new Set();
    for (let j = 0; j < marksheetData.length; j++) {
      let subjectName = marksheetData[j].subject;
      if (uniqueSubjects.has(subjectName + marksheetData[0])) { continue; }
      uniqueSubjects.add(subjectName + marksheetData[0].roll_No);
      marksheetObj.subjects.push({
        subjectName: marksheetData[j].subject,
        year1: Number(marksheetData[j].year1),
        fullMarks: Number(marksheetData[j].full_marks),

        year2: marksheetObj.stream.toUpperCase() == "BCOM" ? Number(marksheetData[j].year2) : -1,
        practicalMarks: marksheetObj.stream.toUpperCase() !== "BCOM" ? Number(marksheetData[j].year2) : 0,
        internalMarks: Number(marksheetData[j].internal_marks),
        theoryMarks: Number(marksheetData[j].theory_marks),
        letterGrade: marksheetData[j].grade,
        credit: Number(marksheetData[j].credit),
        tgp: Number(marksheetData[j].tgp)
      });
      marksheetObj.year2 = marksheetObj.stream.toUpperCase() == "BCOM" ? Number(marksheetData[j].year2) : -1
    }
    // console.log("marksheetObj: ", marksheetObj);
    return marksheetObj;


  }

  const processAndUpdate = async ()=> {
    
  }

  const handleUpload = async () => {

    if (excelData?.length === 0) {
      Swal.fire({
        title: 'Alert',
        text: 'No data got scanned!',
        icon: 'warning', // Options: 'success', 'error', 'warning', 'info'
      });
      return;
    }
    // console.log('fired');

    const progressBox = document.getElementById('progressBox');
    // progressBox.classList.toggle('hidden');
    setLoading(true);
    document.getElementById('status').innerHTML = "Resolving the data!";
    if (document.getElementById('status').innerHTML !== "Resolving the data!") { return; }

    const allData = [];
    const streamArr = ["BA", "BSC", "BCOM", "M.A", "M.COM"];
    const yearArr = [2017, 2018, 2019, 2020, 2021, 2022, 2023];
    if (!yearArr.includes((new Date).getFullYear())) {
      yearArr.push(yearArr.push((new Date).getFullYear()));
    }
    // console.log(yearArr);


    for (let s = 0; s < streamArr.length; s++) {
      document.getElementById('status').innerHTML = "Resolving the data!";
      // Fetch the data by stream
      let streamFilteredData = fetchByStream(excelData, streamArr[s]);
      // Now perform operation on the data year wise
      for (let y = 0; y < yearArr.length; y++) {
        let yearFilteredData = fetchByYear(streamFilteredData, yearArr[y], streamArr[s]);
        // Now perform operation on the data by semester wise
        for (let sem = 1; sem <= 6; sem++) {
          let semFilteredData = fetchBySemester(yearFilteredData, sem);
          // Now perform operation on the data by "roll_no" wise
          for (let r = 0; r < semFilteredData.length; r++) {
            // Skip if the roll_no already processed
            // TODO
            // if (allData.some(element => (element.rollNo == semFilteredData[r].roll_no && element.yea r))) { continue; }
            if (allData.some(element => (
              (element.rollNo + element.semester + element.year + element.year2  + element.stream.toUpperCase()) ===
              (semFilteredData[r].roll_no + semFilteredData[r].semester + semFilteredData[r].year + semFilteredData[r].year2 + semFilteredData[r].stream.toUpperCase())
            ))) { continue; }

            // Fetch the rollNo: semFilteredData[r].roll_no
            let rollNoFilteredData = fetchByStudentRollNo(semFilteredData, semFilteredData[r].roll_no);

            // Create the marksheetObj
            let marksheetObj = createMarksheet(rollNoFilteredData);
            // Add the marksheetObj to the allData[]
            allData.push(marksheetObj);

            // semFilteredData = markAsProcessed(semFilteredData, semFilteredData[r].roll_no);
          }
          console.log(`${yearArr[y]}, ${streamArr[s]}, Sem-${sem}, ${allData.length}`)
        }
        console.log()
      }

    }

    document.getElementById('status').innerHTML = "Uploading the data...";

    // Upload the data
    for (let i = 0; i < allData.length; i++) {
      const res = await fetch(`${host}/api/marksheet/add-marksheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('auth-token')
        },
        body: JSON.stringify(allData[i])
      })
      // const data = await res.json();
      if (res.ok) {
        setProgress((((i + 1) * 100) / allData.length).toFixed(2));
      }
    }
    setLoading(false);
    document.getElementById('status').innerHTML = "Done!";
    progressBox.classList.add('hidden');

  }



  const handleChange = (event) => {
    const { name, value } = event.target;
    setMarksheet((prev) => ({ ...prev, [name]: value }));
    
    setAddSubjectRow([]);
  }

  const handleAdd = async () => {
    // TODO
    let tmp = marksheet;
    tmp.year2 = tmp.subjects[0].year2;
    setMarksheet(tmp);


    setLoading(true);
    // console.log(marksheet);
    const res = await fetch(`${host}/api/marksheet/add-marksheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('auth-token')
      },
      body: JSON.stringify(marksheet)
    })
    const data = await res.json();
    setLoading(false);
    if (data.error) {
      Swal.fire({
        title: 'Alert',
        text: 'Marksheet data already exist...!',
        icon: 'info', // Options: 'success', 'error', 'warning', 'info'
      });
    }
    else if (data) {
      Swal.fire({
        title: 'Alert',
        text: 'Marksheet data got uploaded!',
        icon: 'success', // Options: 'success', 'error', 'warning', 'info'
      });
    }

  }

  const extractSubjects = (data, stream, semester, course) => {
    let subjectArr = [];
    // Loop through the keys of the data object
    for (let key in data) {
      if (key === stream) {
        for (let key2 in data[key]) {
          if (key2 === `sem${semester}`) {
            for (let key3 in data[key][key2]) {
              if (key3 === course) {
                for (let i = 0; i < data[key][key2]["common"].length; i++) {
                  if (!subjectArr.includes(data[key][key2]["common"][i]))
                    subjectArr.push(data[key][key2]["common"][i]);
                }

                // Add subject based on course
                // console.log(data[key][key2][key3].length)
                for (let i = 0; i < data[key][key2][key3].length; i++) {
                  if (!subjectArr.includes(data[key][key2][key3][i]))
                    subjectArr.push(data[key][key2][key3][i]);
                }

                // Add elective subjects
                for (let i = 0; i < data[key][key2]["elective"].length; i++) {
                  if (!subjectArr.includes(data[key][key2]["elective"][i]))
                    subjectArr.push(data[key][key2]["elective"][i]);
                }


              }
            }

          }
        }
      }
    }
    // console.log(subjectArr);
    return subjectArr;
  }

  const getLetterGrade = (subjectPercent) => {
    if (subjectPercent >= 90 && subjectPercent <= 100) { return "A++"; }
    if (subjectPercent >= 80 && subjectPercent < 90) { return "A+"; }
    if (subjectPercent >= 70 && subjectPercent < 80) { return "A"; }
    if (subjectPercent >= 60 && subjectPercent < 70) { return "B+"; }
    if (subjectPercent >= 50 && subjectPercent < 60) { return "B" }
    if (subjectPercent >= 40 && subjectPercent < 50) { return "C+"; }
    if (subjectPercent >= 30 && subjectPercent < 40) { return "C"; }
    if (subjectPercent >= 0 && subjectPercent < 30) { return "F"; }
  }

  const handleSubjectEdit = (subjectName) => {
    // console.log(subjectName);

    let obj = {
      subjectName: document.getElementById(`subjectName-${subjectName}`).value,
      fullMarks: Number(document.getElementById(`fullMarks-${subjectName}`).value),
      year1: Number(document.getElementById(`year1-${subjectName}`).value),
      internalMarks: Number(document.getElementById(`internalMarks-${subjectName}`).value),
      theoryMarks: Number(document.getElementById(`theoryMarks-${subjectName}`).value),
      credit: Number(document.getElementById(`credit-${subjectName}`).value),
      tgp: Number(document.getElementById(`tgp-${subjectName}`).value),
    };

    // Handle the year2 or practicalMarks and total
    if (marksheet.stream.toUpperCase() === "BCOM") {
      obj["year2"] = Number(document.getElementById(`year2-${subjectName}`).value);
      obj["total"] = obj.internalMarks + obj.theoryMarks;
    }
    else {
      obj["practicalMarks"] = Number(document.getElementById(`practicalMarks-${subjectName}`).value);
      obj["total"] = obj.internalMarks + obj.theoryMarks + obj.practicalMarks;
    }
    document.getElementById(`total-${subjectName}`).value = obj["total"]
    obj["ngp"] = obj.total / 10;
    document.getElementById(`ngp-${subjectName}`).value = obj["ngp"];

    obj["letterGrade"] = getLetterGrade((obj.total * 100) / obj.fullMarks)
    document.getElementById(`letterGrade-${subjectName}`).value = obj["letterGrade"];

    if (((obj.total * 100) / obj.fullMarks) > 30) {
      obj["status"] = "P";
      document.getElementById(`status-${subjectName}`).value = "P";
    }
    else {
      obj["status"] = "F";
      document.getElementById(`status-${subjectName}`).value = "F";
    }

    // console.log("obj: ", obj);
    // console.log("marksheet: ", marksheet);

    const index = marksheet.subjects.findIndex(element => element.subjectName === obj.subjectName);
    marksheet.subjects[index] = obj;

  }

  const handleDeleteSubject = (subjectName) => {
    // Remove from the view
    document.getElementById(`${subjectName}`).style.display = 'none';
    const updatedAddSubjectRow = addSubjectRow.filter((subject) => subject.key !== subjectName);
    // console.log(updatedAddSubjectRow)
    // console.log("key: ", addSubjectRow)
    //  for(let i = 0; i < addSubjectRow.length; i++) {
    //   console.log("key: ", addSubjectRow[i].id)
    //  }

    // setAddSub/jectRow(updatedAddSubjectRow);


    // Delete the subject from the array
    marksheet.subjects = marksheet.subjects.filter(obj => obj.subjectName !== subjectName);

    // setAddSubjectRow()

    // console.log(marksheet.subjects);
  }

  const handleAddSubjectRow = () => {
    setAddSubjectRow([]);
    const subjectObject = JSON.parse(localStorage.getItem('subjectObj'));
    const subjectArr = extractSubjects(subjectObject[0], marksheet.stream, marksheet.semester, marksheet.course);

    const element = [];
    for (let i = 0; i < subjectArr.length; i++) {
      // Create the jsx
      element.push(
        <tr className='text-xs' key={i} id={`${subjectArr[i]}`}>
          <td className={`border-2 ${i === subjectArr.length - 1 ? '' : 'border-b-transparent'} border-black text-center font-medium py-3 w-[7.7%] `}>
            <input type="text" readOnly value={subjectArr[i]} name={`subjectName-${subjectArr[i]}`} id={`subjectName-${subjectArr[i]}`} className='w-[95%] py-2 rounded-md border border-slate-500 text-center' />
          </td>
          <td className={`border-2 ${i === subjectArr.length - 1 ? '' : 'border-b-transparent'} border-black text-center font-medium py-3 w-[7.7%] `}>
            <input type="number" name={`fullMarks-${subjectArr[i]}`} value={100} onChange={() => { handleSubjectEdit(subjectArr[i]) }} id={`fullMarks-${subjectArr[i]}`} className=' w-[95%] py-2 rounded-md border border-slate-500 text-center' />
          </td>
          <td className={`border-2 ${i === subjectArr.length - 1 ? '' : 'border-b-transparent'} border-black text-center font-medium py-3 w-[7.7%] `}>
            <input type="number" readOnly value={marksheet.year} name={`year1-${subjectArr[i]}`} id={`year1-${subjectArr[i]}`} className=' w-[95%] py-2 rounded-md border border-slate-500 text-center' />
          </td>
          <td className={`border-2 ${i === subjectArr.length - 1 ? '' : 'border-b-transparent'} border-black text-center font-medium py-3 w-[7.7%] `}>
            <input type="number" onChange={() => { handleSubjectEdit(subjectArr[i]) }} name={`internalMarks-${subjectArr[i]}`} id={`internalMarks-${subjectArr[i]}`} className=' w-[95%] py-2 rounded-md border border-slate-500 text-center' />
          </td>
          {
            marksheet.stream.toUpperCase() === "BCOM" ? <td className={`border-2 ${i === subjectArr.length - 1 ? '' : 'border-b-transparent'} border-black text-center font-medium py-3 w-[7.7%] `}>
              <input type="number" onChange={() => { handleSubjectEdit(subjectArr[i]) }} name={`year2-${subjectArr[i]}`} id={`year2-${subjectArr[i]}`} className=' w-[95%] py-2 rounded-md border border-slate-500 text-center' />
            </td> :
              <td className={`border-2 ${i === subjectArr.length - 1 ? '' : 'border-b-transparent'} border-black text-center font-medium py-3 w-[7.7%] `}>
                <input type="number" onChange={() => { handleSubjectEdit(subjectArr[i]) }} name={`practicalMarks-${subjectArr[i]}`} id={`practicalMarks-${subjectArr[i]}`} className=' w-[95%] py-2 rounded-md border border-slate-500 text-center' />
              </td>
          }
          <td className={`border-2 ${i === subjectArr.length - 1 ? '' : 'border-b-transparent'} border-black text-center font-medium py-3 w-[7.7%] `}>
            <input type="number" onChange={() => { handleSubjectEdit(subjectArr[i]) }} name={`theoryMarks-${subjectArr[i]}`} id={`theoryMarks-${subjectArr[i]}`} className=' w-[95%] py-2 rounded-md border border-slate-500 text-center' />
          </td>
          <td className={`border-2 ${i === subjectArr.length - 1 ? '' : 'border-b-transparent'} border-black text-center font-medium py-3 w-[7.7%] `}>
            <input type="number" readOnly name={`total-${subjectArr[i]}`} id={`total-${subjectArr[i]}`} className=' w-[95%] py-2 rounded-md border border-slate-500 text-center' />
          </td>
          <td className={`border-2 ${i === subjectArr.length - 1 ? '' : 'border-b-transparent'} border-black text-center font-medium py-3 w-[7.7%] `}>
            <input type="text" readOnly name={`letterGrade-${subjectArr[i]}`} id={`letterGrade-${subjectArr[i]}`} className=' w-[95%] py-2 rounded-md border border-slate-500 text-center' />
          </td>
          <td className={`border-2 ${i === subjectArr.length - 1 ? '' : 'border-b-transparent'} border-black text-center font-medium py-3 w-[7.7%] `}>
            <input type="number" readOnly name={`ngp-${subjectArr[i]}`} id={`ngp-${subjectArr[i]}`} className=' w-[95%] py-2 rounded-md border border-slate-500 text-center' />
          </td>
          <td className={`border-2 ${i === subjectArr.length - 1 ? '' : 'border-b-transparent'} border-black text-center font-medium py-3 w-[7.7%] `}>
            <input type="number" onChange={() => { handleSubjectEdit(subjectArr[i]) }} name={`credit-${subjectArr[i]}`} id={`credit-${subjectArr[i]}`} className=' w-[95%] py-2 rounded-md border border-slate-500 text-center' />
          </td>
          <td className={`border-2 ${i === subjectArr.length - 1 ? '' : 'border-b-transparent'} border-black text-center font-medium py-3 w-[7.7%] `}>
            <input type="number" onChange={() => { handleSubjectEdit(subjectArr[i]) }} name={`tgp-${subjectArr[i]}`} id={`tgp-${subjectArr[i]}`} className=' w-[95%] py-2 rounded-md border border-slate-500 text-center' />
          </td>
          <td className={`border-2 ${i === subjectArr.length - 1 ? '' : 'border-b-transparent'} border-black text-center font-medium py-3 w-[7.7%] `}>
            <input type="text" readOnly name={`status-${subjectArr[i]}`} id={`status-${subjectArr[i]}`} className=' w-[95%] py-2 rounded-md border border-slate-500 text-center' />
          </td>
          <td className={`border-2 ${i === subjectArr.length - 1 ? '' : 'border-b-transparent'} border-black text-center font-medium py-3 w-[7.7%] `}>
            <button disabled={subjectArr.length===1} className='px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md text-white font-medium ' onClick={() => { handleDeleteSubject(subjectArr[i]) }}>Delete</button>
          </td>
        </tr>
      );

      // Add the subject to the marksheet's "subjects" array
      let obj = {
        subjectName: subjectArr[i],
        fullMarks: 100,
        year1: marksheet.year,
        internalMarks: 0,
        // year2: 2023,
        theoryMarks: 0,
        total: 0,
        letterGrade: 0,
        ngp: 0,
        credit: 0,
        tgp: 0,
        status: 0,
      };

      if (marksheet.stream.toUpperCase() === "BCOM") {
        obj["year2"] = marksheet.year;
      }
      else {
        obj["practicalMarks"] = marksheet.year;
      }

      marksheet.subjects.push(obj);

    }

    setAddSubjectRow(element);

  }


  return (
    <>
      {/* Loading Bar */}
      {loading === true ?
        <div className='absolute top-0 right-0 z-10 w-full'>
          <Loading />
        </div> : ''}

      {/* Add Student */}
      <div id="add-students" className='m-3 py-5 '>
        {/* Heading */}
        <div id='heading'>
          <h1 className='text-3xl font-semibold border-b-2 border-b-blue-600 py-2 '>Add Students</h1>
        </div>

        {/* Add multiple student at a time */}
        <div className='mt-7 my-3'>
          <p>To efficiently add multiple students to the database in one go, please upload an Excel file containing the student records.</p>
          <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileInput} className='my-2' />
          <button disabled={excelData.length === 0} className='px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md' onClick={handleUpload}>Upload</button>
          <p className='text-center my-7'>---------- Or ----------</p>
          <p>Add a marksheet data</p>
        </div>


        {/* Add single student at a time */}
        <div className="w-full overflow-auto">
          <div className='w-full border-2 border-blue-500 min-w-[1240px]  '>
            {/* <span className='mx-2'>#student-marksheet</span> */}
            <div className='rows w-full p-3 my-3   '>
              <div className="row flex gap-7 ">
                <div id="name-field" className='flex gap-3 items-center  my-1 w-1/2'>
                  <div className='w-[15%]'>
                    <label htmlFor="name">Name</label>
                  </div>
                  <div>
                    <input type="text" name="name" value={marksheet.name} onChange={handleChange} className='border-2 border-slate-700 px-4 py-1 rounded-md' />
                  </div>
                </div>
                <div className='flex gap-3 items-center border my-1 invisible'>
                  <div className=''>
                    <label htmlFor="">Registration No.</label>
                  </div>
                  <div>
                    <input type="text" className='border-2 border-slate-700 px-4 py-1 rounded-md' />
                  </div>
                </div>
              </div>
              <div className="row flex gap-7 ">
                <div id="rollno-field" className='flex gap-3 items-center  my-1 w-1/2'>
                  <div className='w-[15%]'>
                    <label htmlFor="rollNo">Roll No.</label>
                  </div>
                  <div>
                    <input type="text" name="rollNo" onChange={handleChange} className='border-2 border-slate-700 px-4 py-1 rounded-md' />
                  </div>
                </div>
                <div id="registrationno-field" className='flex gap-3 items-center  my-1 '>
                  <div className=''>
                    <label htmlFor="registrationNo">Registration No.</label>
                  </div>
                  <div>
                    <input type="text" name="registrationNo" value={marksheet.registrationNo} onChange={handleChange} className='border-2 border-slate-700 px-4 py-1 rounded-md' />
                  </div>
                </div>
              </div>

              <div className="row flex gap-7 ">
                <div id="UID" className='flex gap-3 items-center  my-1 w-1/2'>
                  <div className='w-[15%]'>
                    <label htmlFor="UID">UID</label>
                  </div>
                  <div>
                    <input type="text" name="UID" onChange={handleChange} className='border-2 border-slate-700 px-4 py-1 rounded-md' />
                  </div>
                </div>
                <div id="registrationno-field" className='flex gap-3 items-center  my-1 '>
                  <div className=''>
                    <label htmlFor="phone">Phone &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                  </div>
                  <div>
                    <input type="text" name="phone" value={marksheet.phone} onChange={handleChange} className='border-2 border-slate-700 px-4 py-1 rounded-md' />
                  </div>
                </div>
              </div>

              <hr className='my-9 border-slate-300' />
              <div className="row flex gap-7  ">
                <div id="stream-field" className='flex gap-3 items-center  my-1 w-1/4'>
                  <div className=''>
                    <label htmlFor="stream">Stream</label>
                  </div>
                  <div className='w-full'>
                    <select name="stream" id="stream" value={marksheet.stream} onChange={handleChange} className='border-2 border-slate-700 w-full px-4 py-1 rounded-md'>
                      <option value="bcom">BCOM</option>
                      <option value="ba">BA</option>
                      <option value="bsc">BSC</option>
                    </select>
                  </div>
                </div>
                <div id="course-field" className='flex gap-3 items-center my-1 w-1/4'>
                  <div className=''>
                    <label htmlFor="course">Course</label>
                  </div>
                  <div className='w-full'>
                    <select name="course" id="course" value={marksheet.course} onChange={handleChange} className='border-2 border-slate-700 w-full px-4 py-1 rounded-md'>
                      <option value="honours">honours</option>
                      <option value="general">general</option>
                    </select>
                  </div>
                </div>
                <div id="semester-field" className='flex gap-3 items-center my-1 w-1/4'>
                  <div className=''>
                    <label htmlFor="semester">Semester</label>
                  </div>
                  <div>
                    <input type="number" name="semester" value={marksheet.semester} onChange={handleChange} className='border-2 border-slate-700 px-4 py-1 rounded-md' />
                  </div>
                </div>
                <div id="year-field" className='flex gap-3 items-center my-1 w-1/4'>
                  <div className=''>
                    <label htmlFor="year">Year</label>
                  </div>
                  <div>
                    <input type="number" name="year" value={marksheet.year} onChange={handleChange} className='border-2 border-slate-700 px-4 py-1 rounded-md' />
                  </div>
                </div>
              </div>
              <hr className='my-9 border-slate-300' />


              <div className="row w-full">
                <div className="w-full flex justify-between items-center ">
                  <div>

                    <h3 className='text-xl font-medium my-2'>Current Semesters</h3>
                  </div>
                  <div>
                    <button onClick={handleAddSubjectRow} className='bg-purple-500 text-white px-4 py-1 font-medium rounded-md'>Fetch Subject</button>
                  </div>
                </div>

                {/* Add Subject */}
                <div className='w-full'>
                  <table className='w-full border-2 border-black'>
                    <thead className='w-full bg-slate-100'>
                      <tr>
                        <td className='border-2 border-black text-center font-medium py-3 w-[7.7%]'>Subject</td>
                        <td className='border-2 border-black text-center font-medium py-3 w-[7.7%]'>Full Marks</td>
                        <td className='border-2 border-black text-center font-medium py-3 w-[7.7%]'>Year1</td>
                        <td className='border-2 border-black text-center font-medium py-3 w-[7.7%]'>Internal M</td>
                        {marksheet.stream.toUpperCase() === "BCOM" ?
                          <td className='border-2 border-black text-center font-medium py-3 w-[7.7%]'>Year2</td> :
                          <td className='border-2 border-black text-center font-medium py-3 w-[7.7%]'>Practical M</td>
                        }
                        <td className='border-2 border-black text-center font-medium py-3 w-[7.7%]'>Theory M</td>
                        <td className='border-2 border-black text-center font-medium py-3 w-[7.7%]'>Total</td>
                        <td className='border-2 border-black text-center font-medium py-3 w-[7.7%]'>Grade</td>
                        <td className='border-2 border-black text-center font-medium py-3 w-[7.7%]'>NGP</td>
                        <td className='border-2 border-black text-center font-medium py-3 w-[7.7%]'>Credit</td>
                        <td className='border-2 border-black text-center font-medium py-3 w-[7.7%]'>TGP</td>
                        <td className='border-2 border-black text-center font-medium py-3 w-[7.7%]'>Status</td>
                        <td className='border-2 border-black text-center font-medium py-3 w-[7.7%]'>Actions</td>
                      </tr>
                    </thead>
                    <tbody className='border-2 border-black'>
                      {addSubjectRow}
                    </tbody>
                  </table>
                </div>
              </div>

              <hr className='my-9 border-slate-300' />



              <div>
                <button onClick={handleAdd} className='bg-green-500 hover:bg-green-600 text-white font-medium rounded-md px-4 py-2'>Add</button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Progress */}
      <div id='progressBox' className='absolute hidden bg-slate-600 text-white font-medium bottom-1 right-0 w-[20%] h-20 p-3 '>
        <div className='flex gap-2'>
          <span>Status:</span>
          <span id='status'></span>
        </div>
        <div id='uploadProgress' className='flex gap-2 text-slate-400'>
          <span>Uploaded:</span>
          <span>{progress}%</span>
        </div>
      </div>

    </>
  )
}

export default AddStudent
