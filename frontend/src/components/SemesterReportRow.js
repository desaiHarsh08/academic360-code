import React from 'react'
import Swal from 'sweetalert2';

const SemesterReportRow = (props) => {
    // console.log(props.report);
    const host = process.env.REACT_APP_BACKEND_URL;

    const handleEdit = ()=> {
        localStorage.setItem("report", JSON.stringify(props.report));
        window.open('/edit', '_blank');
    }

    // TODO: API fileName
    const handleView = async ()=> {
        // console.log('View');
        const res = await fetch(`${host}/api/marksheet/get-pdf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('auth-token')
            },
            body: JSON.stringify({
                rollNo: props.report.rollNo,
                semester: props.report.semester,
                year: props.report.year,
                stream: "BCOM",
            })
        });
        if (res.ok) {
            // Handle the response here (e.g., display the PDF to the user)
            const blob = await res.blob();

            // Create a URL for the PDF blob
            const pdfUrl = window.URL.createObjectURL(blob);

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
        <tr>
            <td className='border-2 border-black text-center font-medium py-2 w-[9%]'>
                {props.report.rollNo}
            </td>
            <td className='border-2 border-black text-center font-medium py-2 w-[9%]'>
                {props.report.semester}
            </td>
            <td className='border-2 border-black text-center font-medium py-2 w-[9%]'>
            {props.report.year}
            </td>
            <td className='border-2 border-black text-center font-medium py-2 w-[9%]'>
            {props.report.fullMarks}
            </td>
            <td className='border-2 border-black text-center font-medium py-2 w-[9%]'>
            {props.report.totalMarks}
            </td>
            <td className='border-2 border-black text-center font-medium py-2 w-[9%]'>
            {props.report.credit}
            </td>
            <td className='border-2 border-black text-center font-medium py-2 w-[9%]'>
            {props.report.sgpa}
            </td>
            <td className='border-2 border-black text-center font-medium py-2 w-[9%]'>
            {props.report.cummulativeCredit}
            </td>
            <td className='border-2 border-black text-center font-medium py-2 w-[9%]'>
            {props.report.cgpa===0?'':props.report.cgpa}
            </td>
            <td className='border-2 border-black text-center font-medium py-2 w-[9%]'>
            {props.report.letterGrade}
            </td>
            <td className='border-2 border-black text-center font-medium py-2 w-[9%]'>
                {props.report.remarks}
            </td>
            <td className='border border-black text-center font-medium py-3 flex gap-1 h-full '>
                <button onClick={handleEdit} className='px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md'>Edit</button>
                <button onClick={handleView} className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md'>View</button>
            </td>
        </tr>
    )
}

export default SemesterReportRow
