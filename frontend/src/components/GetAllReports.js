import React, { useEffect, useState } from 'react'
import Loading from './Loading';
import SemesterReportRow from './SemesterReportRow';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const GetAllReports = () => {

    const host = process.env.REACT_APP_BACKEND_URL;

    const [loading, setLoading] = useState(false);

    const [reportArr, setReportArr] = useState([]);

    const [data, setData] = useState([]);

    const menues = localStorage.getItem("menues");

    let navigate = useNavigate();
  
    useEffect(()=>{
      if(!menues.includes("get-reports")) {
        navigate("/dashboard", {replace: true});
      }
    }, []);

    const [search, setSearch] = useState({
        stream: 'BCOM',
        year: 2023,
    })

    const downloadExcel = (data, filename) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');
        XLSX.writeFile(wb, filename);
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearch((prev) => ({ ...prev, [name]: value }));
    }

    const getReports = async (e) => {
        e.preventDefault();
        setLoading(true);
        // console.log(search)
        try {
            const res = await fetch(`${host}/api/marksheet/get-all-reports`, {
                method: 'POST',
                headers: {
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ stream: search.stream, year: search.year })
            });
            if (!res.ok) {
                Swal.fire({
                    title: 'Alert',
                    text: 'Data not found...!',
                    icon: 'error', // Options: 'success', 'error', 'warning', 'info'
                  });
                setLoading(false);
                return;
            }
            const jsonData = await res.json();
            if (jsonData.length > 0) {
                setLoading(false);
                // setData(jsonData);
               
                const element = [];
                let tmp = [];
                for (let i = 0; i < jsonData.length; i++) {
                    for (let j = 0; j < jsonData[i].marksheetReportArr.length; j++) {
                        element.push(
                            <SemesterReportRow
                                key={`${jsonData[i].rollNo}__${i + 1}`}
                                report={jsonData[i].marksheetReportArr[j]}
                            />
                        )
                        tmp.push(jsonData[i].marksheetReportArr[j]);
                        setData(tmp);
                    }
                }
                setReportArr(element);
                handleDownload(tmp);
            }
        } catch (error) {
            Swal.fire({
                title: 'Alert',
                // text: 'Data not found...!',
                icon: 'error', // Options: 'success', 'error', 'warning', 'info'
              });
        }
    }

    const handleDownload = (data) => {
        // console.log(data)
        downloadExcel(data, `${search.stream.toUpperCase()}-${search.year}.xlsx`);
    }

    return (
        <>
            {/* Loading Bar */}
            {loading === true ?
                <div className='absolute top-0 right-0 z-10 w-full'>
                    <Loading />
                </div> : ''
            }

            <div id='get-reports' className='m-3 py-5 '>
                <div id='heading'>
                    <h1 className='text-3xl font-semibold border-b-2 border-b-blue-600 py-2 '>Get All Reports</h1>
                </div>

                {/* Fields */}
                <div className='mt-9'>
                    <form className='my-3 ' onSubmit={getReports}>
                        <div className='my-3 flex gap-2 items-center'>

                            <div className="stream w-full">
                                <label htmlFor="stream">Stream</label>
                                <select name="stream" id="stream" value={search.stream} onChange={handleChange} className='border-2 border-slate-700 w-full px-4 py-1 rounded-md'>
                                    <option value="BCOM">BCOM</option>
                                    <option value="BA">BA</option>
                                    <option value="BSC">BSC</option>
                                    <option value="BBA">BBA</option>
                                    <option value="M.A">M.A</option>
                                    <option value="M.COM">M.COM</option>
                                </select>
                            </div>
                            <div className="semester w-full">
                                <label htmlFor="year">Year</label>
                                <input type="number" name="year" id="year" value={search.year} onChange={handleChange} className='border-2 px-4 py-2 rounded-md border-slate-300 block' required />
                            </div>
                        </div>
                        <div className="btn flex gap-3">
                            <div>
                                <button className='px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-md'>Get Report</button>
                            </div>
                            {/* <div>
                                <button disabled={data.length===0} onClick={handleDownload} className={`px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md ${data.length===0?'bg-blue-400':''} `}>Download</button>
                            </div> */}
                        </div>
                    </form>
                </div>

                {/* Display the table */}
                {data.length!==0? <div className='w-full my-9 min-w-[1240px] overflow-x-scroll'>
                    <table className='w-full border-2 border-black'>
                        <thead className='bg-slate-100'>
                            <tr>
                                <td className='border-2 border-black text-center font-medium py-3 w-[8%]'>Roll No.</td>
                                <td className='border-2 border-black text-center font-medium py-3 w-[8%]'>Semester</td>
                                <td className='border-2 border-black text-center font-medium py-3 w-[8%]'>Year</td>
                                <td className='border-2 border-black text-center font-medium py-3 w-[8%]'>Full Marks</td>
                                <td className='border-2 border-black text-center font-medium py-3 w-[8%]'>Marks Obtained</td>
                                <td className='border-2 border-black text-center font-medium py-3 w-[8%]'>Semester Credit</td>
                                <td className='border-2 border-black text-center font-medium py-3 w-[8%]'>SGPA</td>
                                <td className='border-2 border-black text-center font-medium py-3 w-[8%]'>Cummulative Credit</td>
                                <td className='border-2 border-black text-center font-medium py-3 w-[8%]'>CGPA</td>
                                <td className='border-2 border-black text-center font-medium py-3 w-[8%]'>Letter Grade</td>
                                <td className='border-2 border-black text-center font-medium py-3 w-[8%]'>Remarks</td>
                                <td className='border-2 border-black text-center font-medium py-3 w-[8%]'>Action</td>
                            </tr>
                        </thead>
                        <tbody >
                            {reportArr}
                        </tbody>
                    </table>
                </div>:''}
            </div>
        </>
    )
}

export default GetAllReports
