import React, { useEffect, useState } from 'react'
import Loading from './Loading';
import { json, useNavigate } from 'react-router-dom';
import EditSubjectRow from './EditSubjectRow';
import Swal from 'sweetalert2';

const EditMarksheet = () => {

    const host = process.env.REACT_APP_BACKEND_URL;
    const authToken = localStorage.getItem('auth-token');
    const report = JSON.parse(localStorage.getItem('report'));

    const [loading, setLoading] = useState(false);
    const [marksheet, setMarksheet] = useState(report);
    const [subjectArrayJSX, setSubjectArrayJSX] = useState([]);

    let navigate = useNavigate();






    // Return to home page for invalid access
    useEffect(() => {
        if (!authToken) {
            navigate('/', { replace: true });
        }


    }, [authToken, navigate, report]);



    useEffect(() => {
        // Fetch the marksheet data
        setMarksheet(report)

        // console.log("outside the f", marksheet)
        const createSubjectsJSX = () => {
            // console.log(marksheet)
            const tmpArr = [];
            const subjectArr = marksheet?.subjects;

            for (let i = 0; i < subjectArr.length; i++) {
                let subjectObj = subjectArr[i];

                // Calculate the total marks
                let im = !isNaN(Number(subjectObj.internalMarks)) ? Number(subjectObj.internalMarks) : 0
                let tm = !isNaN(Number(subjectObj.theoryMarks)) ? Number(subjectObj.theoryMarks) : 0
                if (subjectObj.practicalMarks) {
                    subjectObj["total"] = im + tm + subjectObj.practicalMarks;
                }
                else {
                    subjectObj["total"] = im + tm;
                }

                subjectObj["ngp"] = (subjectObj.total / 10);
                if ((subjectObj.total * 100) / subjectObj.fullMarks < 30) {
                    subjectObj["status"] = 'F';
                }
                else {
                    subjectObj["status"] = 'P';

                }

                tmpArr.push(
                    <tr className={`text-xs ${i === subjectArr.length ? 'border-2 border-black' : ''}`} key={i}>
                        <EditSubjectRow
                            subjectObj={subjectObj}
                            index={i}
                            arrayLength={subjectArr.length}
                            handleSubjectChange={handleSubjectChange}
                            semester={marksheet.semester}
                            stream={marksheet.stream}
                            course={marksheet.course}
                        />
                    </tr>
                );
            }

            setSubjectArrayJSX(tmpArr);
        };

        createSubjectsJSX();
    }, []);

    useEffect(() => {
        if (marksheet) {
            document.title = `${marksheet.year}_${marksheet.stream}_${marksheet.semester}_${marksheet.rollNo}  `;
        }
    }, [marksheet]);


    function getRemarks(marksheetPercent, stream, course, semester, subjects) {

        // Firstly check if all the subjects are got cleared, if not then return "Semester not cleared."
        for (let i = 0; i < subjects.length; i++) {
            let percentMarks = (subjects[i].total * 100) / subjects[i].fullMarks;
            if (percentMarks < 30) {
                return "Semester not cleared.";
            }
        }


        // Get the remarks by total_marks percentage 
        if (marksheetPercent < 30) { // For failed marksheet
            return "Semester not cleared.";
        }
        else { // For passed marksheet
            if (semester != 6) { // For semester: 1, 2, 3, 4, 5
                return "Semester cleared.";
            }
            else { // For semester: 6
                if (stream.toUpperCase() !== "BCOM") { // For BA & BSC
                    return "Qualified with Honours.";
                }
                else { // For BCOM
                    if (course.toLowerCase() === "honours") { // For honours
                        return "Semester cleared with honours."
                    }
                    else { // For general
                        return "Semester cleared with general.";
                    }
                }
            }
        }
    }

    const calculateMarksheetPercent = (subjects) => {
        let total = 0;
        for (let i = 0; i < subjects.length; i++) {
            total += subjects[i].total;
        }
        return total;
    }

    const handleSubjectChange = (index, subjectObj) => {
        // console.log(index, subjectObj);

        // Create a copy of the subjects array
        const updatedSubjects = [...marksheet.subjects];

        // Update the subject at the specified index
        updatedSubjects[index] = subjectObj;

        // Update the remarks
        // marksheetPercent, stream, course, semester, subjects
        let marksheetPercent = calculateMarksheetPercent(updatedSubjects);
        let remarks = getRemarks(marksheetPercent, marksheet.stream, marksheet.course, marksheet.semester, updatedSubjects);

        // Update the marksheet state
        setMarksheet(prev => ({ ...prev, subjects: updatedSubjects, remarks: remarks }));
    }


    const handleEdit = async () => {
        console.log("marksheet: ", marksheet);
        setLoading(true);
        const res = await fetch(`${host}/api/marksheet/update`, {
            method: 'POST',
            headers: {
                'auth-token': localStorage.getItem('auth-token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(marksheet)
        });
        setLoading(false);
        const data = await res.json();
        if(data) {
            Swal.fire({
                title: 'Alert',
                text: "Marksheet got updated...!",
                icon: 'success', // Options: 'success', 'error', 'warning', 'info'
            });
        }
        else {
            Swal.fire({
                title: 'Alert',
                text: "Some error occured!",
                icon: 'error', // Options: 'success', 'error', 'warning', 'info'
            });
        }
        
    }

    useEffect(() => {
        console.log(marksheet)
    }, [marksheet]);
    const handleChange = (e) => {
        console.log("fired change");
        const { name, value } = e.target;
        setMarksheet((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <>
            {/* Loading Bar */}
            {loading === true ?
                <div className='absolute top-0 right-0 z-10 w-full'>
                    <Loading />
                </div> : ''
            }
            {/* Edit Student */}
            <div id="view-student" className='m-3 py-5'>
                {/* Heading */}
                <div id='heading'>
                    <h1 className='text-3xl font-semibold border-b-2 border-b-blue-600 py-2 '>Edit Marksheet</h1>
                </div>

                {/* Information */}
                <div className="w-full overflow-auto my-20">
                    <div className='w-full border-2 border-blue-500 min-w-[1240px]  '>
                        {/* <span className='mx-2'>#student-marksheet</span> */}
                        <div className='rows w-full p-3 my-3   '>
                            <div className="row flex gap-7 ">
                                <div id="name-field" className='flex gap-3 items-center  my-1 w-1/2'>
                                    <div className='w-[15%]'>
                                        <label htmlFor="name">Name</label>
                                    </div>
                                    <div>
                                        <input type="text" name="name" onChange={handleChange} value={marksheet?.name} className='border-2 border-slate-700 px-4 py-1 rounded-md' />
                                    </div>
                                </div>
                                <div className='flex gap-3 items-center border my-1 invisible'>
                                    <div className=''>
                                        <label htmlFor="">Registration No.</label>
                                    </div>
                                    <div>
                                        <input type="text" className='bg-slate-300 border-2 border-slate-700 px-4 py-1 rounded-md' />
                                    </div>
                                </div>
                            </div>
                            <div className="row flex gap-7 ">
                                <div id="rollno-field" className='flex gap-3 items-center  my-1 w-1/2'>
                                    <div className='w-[15%]'>
                                        <label htmlFor="rollNo">Roll No.</label>
                                    </div>
                                    <div>
                                        <input type="text" name="rollNo" value={marksheet?.rollNo} className='bg-slate-300 border-2 border-slate-700 px-4 py-1 rounded-md' />
                                    </div>
                                </div>
                                <div id="registrationno-field" className='flex gap-3 items-center  my-1 '>
                                    <div className=''>
                                        <label htmlFor="registrationNo">Registration No.</label>
                                    </div>
                                    <div>
                                        <input type="text" name="registrationNo" value={marksheet?.registrationNo} readOnly className='bg-slate-300 border-2 border-slate-700 px-4 py-1 rounded-md' />
                                    </div>
                                </div>
                            </div>

                            <div className="row flex gap-7 ">
                                <div id="UID" className='flex gap-3 items-center  my-1 w-1/2'>
                                    <div className='w-[15%]'>
                                        <label htmlFor="UID">UID</label>
                                    </div>
                                    <div>
                                        <input type="text" name="UID" value={marksheet.UID} onChange={handleChange} className='border-2 border-slate-700 px-4 py-1 rounded-md' />
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
                                        <select name="stream" id="stream" value={marksheet?.stream} className='bg-slate-300 border-2 border-slate-700 w-full px-4 py-1 rounded-md'>
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
                                        <select name="course" id="course" value={marksheet?.course} className='bg-slate-300 border-2 border-slate-700 w-full px-4 py-1 rounded-md'>
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
                                        <input type="number" name="semester" value={marksheet?.semester} className='bg-slate-300 border-2 border-slate-700 px-4 py-1 rounded-md' />
                                    </div>
                                </div>
                                <div id="year-field" className='flex gap-3 items-center my-1 w-1/4'>
                                    <div className=''>
                                        <label htmlFor="year">Year</label>
                                    </div>
                                    <div>
                                        <input type="number" name="year" value={marksheet?.year} readOnly className='bg-slate-300 border-2 border-slate-700 px-4 py-1 rounded-md' />
                                    </div>
                                </div>
                            </div>
                            <hr className='my-9 border-slate-300' />


                            <div className="row w-full">
                                <div className="w-full flex justify-between items-center ">
                                    <h3 className='text-xl font-medium my-2'>Semester: {marksheet?.semester}</h3>
                                    {/* <div>
                                        <button className='px-4 py-2 bg-blue-500 text-white font-medium rounded-md' onClick={handleViewSubjects}>View Subjects</button>
                                    </div> */}
                                </div>

                                {/* Edit Subject */}
                                <div className='w-full'>
                                    <table className='w-full border-2 border-black'>
                                        <thead className='w-full bg-slate-100'>
                                            <td className='border-2 border-black text-center font-medium py-3 w-[8.3%]'>Subject</td>
                                            <td className='border-2 border-black text-center font-medium py-3 w-[8.3%]'>Full Marks</td>
                                            <td className='border-2 border-black text-center font-medium py-3 w-[8.3%]'>Year1</td>
                                            <td className='border-2 border-black text-center font-medium py-3 w-[8.3%]'>Internal M</td>
                                            {marksheet?.stream?.toUpperCase() === "BCOM" ?
                                                <td className='border-2 border-black text-center font-medium py-3 w-[8.3%]'>Year2</td> :
                                                <td className='border-2 border-black text-center font-medium py-3 w-[8.3%]'>Practical M</td>
                                            }
                                            <td className='border-2 border-black text-center font-medium py-3 w-[8.3%]'>Theory M</td>
                                            <td className='border-2 border-black text-center font-medium py-3 w-[8.3%]'>Total</td>
                                            <td className='border-2 border-black text-center font-medium py-3 w-[8.3%]'>Grade</td>
                                            <td className='border-2 border-black text-center font-medium py-3 w-[8.3%]'>NGP</td>
                                            <td className='border-2 border-black text-center font-medium py-3 w-[8.3%]'>Credit</td>
                                            <td className='border-2 border-black text-center font-medium py-3 w-[8.3%]'>TGP</td>
                                            <td className='border-2 border-black text-center font-medium py-3 w-[8.3%]'>Status</td>
                                            {/* <td className='border-2 border-black text-center font-medium py-3 w-[8.3%]'>Actions</td> */}
                                        </thead>
                                        <tbody className='border-2 border-black'>

                                            {/* Display all the subjects */}
                                            {subjectArrayJSX}

                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* <hr className='my-2  border-slate-300' /> */}
                            <div className={`my-4 p-2 rounded-md ${!(marksheet?.remarks.includes("not") || (marksheet?.remarks.includes("Not"))) ? "bg-green-300" : "bg-red-300"
                                }`}>
                                <h3 className='text-[18px] flex gap-2 items-center'><span className='font-medium '>REMARKS:</span> {marksheet?.remarks}</h3>
                            </div>


                            <div className='mt-9'>
                                <button onClick={handleEdit} className='bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-md px-4 py-2'>Edit</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default EditMarksheet
