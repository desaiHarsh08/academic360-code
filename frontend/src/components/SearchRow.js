import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Loading from './Loading';

const SearchRow = (props) => {
    const { year, arr, rollNo } = props;
    // console.log(props);
    const host = process.env.REACT_APP_BACKEND_URL;
    let navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const handleEdit = async (semester) => {
        setLoading(true);
        const res = await fetch(`${host}/api/marksheet/get_marksheet_data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('auth-token')
            },
            body: JSON.stringify({
                rollNo: rollNo,
                semester: semester,
                year: year
            })
        });
        setLoading(false);
        const report = await res.json();
        console.log(report)
        if (!report) {
            Swal.fire({
                title: 'Alert',
                text: "The given marksheet data doesn't exist!",
                icon: 'error', // Options: 'success', 'error', 'warning', 'info'
            });
            return;
        }
        localStorage.setItem("report", JSON.stringify(report));
        // window.open('/edit', '_blank');
        // navigate('/edit', { replace: true, target: '_blank' });
        const newTab = window.open('#/edit', '_blank');
        if (newTab) {
            newTab.focus();
        }
    }

    // TODO: API fileName
    const handleView = async (semester) => {
        // console.log('fired');
        // console.log('View');
        setLoading(true);
        const res = await fetch(`${host}/api/marksheet/get-pdf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('auth-token')
            },
            body: JSON.stringify({
                rollNo: rollNo,
                semester: semester,
                year: year,
                stream: arr[0].stream,
            })
        });
        setLoading(false);
        if (res.ok) {
            // Handle the response here (e.g., display the PDF to the user)
            const blob = await res.blob();
            // Create a URL for the PDF blob
            const pdfUrl = URL.createObjectURL(blob);

            // Open the PDF in a new tab or download it
            window.open(pdfUrl, '_blank');
        } else {
            Swal.fire({
                title: 'Alert',
                text: "Marksheet does not exist!",
                icon: 'error', // Options: 'success', 'error', 'warning', 'info'
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


            <tr className=' '>
                <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>{year}</td>
                <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>
                    {
                        arr.some((ele) => ele.semester === 1) ?
                            <div className='flex gap-1 justify-center items-center'>
                                <button onClick={() => { handleEdit(1) }} className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md'>Edit</button>
                                <button onClick={() => { handleView(1) }} className='px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md'>View</button>
                            </div>
                            : ''
                    }
                </td>
                <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>
                    {arr.some((ele) => ele.semester === 2) ?
                        <div className='flex gap-1 justify-center items-center'>
                            <button onClick={() => { handleEdit(2) }} className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md'>Edit</button>
                            <button onClick={() => { handleView(2) }} className='px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md'>View</button>
                        </div>
                        : ''}
                </td>
                <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>
                    {
                        arr.some((ele) => ele.semester === 3) ?
                            <div className='flex gap-1 justify-center items-center'>
                                <button onClick={() => { handleEdit(3) }} className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md'>Edit</button>
                                <button onClick={() => { handleView(3) }} className='px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md'>View</button>
                            </div>
                            : ''
                    }
                </td>
                <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>
                    {
                        arr.some((ele) => ele.semester === 4) ?
                            <div className='flex gap-1 justify-center items-center'>
                                <button onClick={() => { handleEdit(4) }} className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md'>Edit</button>
                                <button onClick={() => { handleView(4) }} className='px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md'>View</button>
                            </div>
                            : ''
                    }
                </td>
                <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>
                    {arr.some((ele) => ele.semester === 5) ?
                        <div className='flex gap-1 justify-center items-center'>
                            <button onClick={() => { handleEdit(5) }} className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md'>Edit</button>
                            <button onClick={() => { handleView(5) }} className='px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md'>View</button>
                        </div>
                        : ''}
                </td>
                <td className='border-2 border-black text-center font-medium py-3 w-[9%]'>
                    {
                        arr.some((ele) => ele.semester === 6) ?
                            <div className='flex gap-1 justify-center items-center'>
                                <button onClick={() => { handleEdit(6) }} className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md'>Edit</button>
                                <button onClick={() => { handleView(6) }} className='px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md'>View</button>
                            </div>
                            : ''
                    }
                </td>
            </tr>
        </>
    )
}

export default SearchRow
