import React from 'react'

const StudentList = (props) => {
  // console.log(props.data)
  return (
    <tr className=' border-2 border-black '>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.registrationNo}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.stream}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.course}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.semester}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.name}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.sgpa}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.remarks}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.fullMarks}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.year1}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.practicalMarks}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.ngp}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.credit}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.tgp}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.internalMarks}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.theoryMarks}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.total}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{  props.data.status}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.letterGrade}</td>
      <td className='p-3 border-r-2 border-black w-[200px] text-center '>{props.data.rollNo}</td>
    </tr>
  )
}

export default StudentList
