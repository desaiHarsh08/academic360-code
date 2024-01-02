import React, { useEffect } from 'react'

const SubjectDisplay = (props) => {
    // console.log(props)
    // useEffect(()=> {console.log(props)}, [])


    return (
        // <>


        <div className='px-2 min-w-[1242.08px]'>
            <div className={`${props.i === 0 ? 'flex mt-7' : 'hidden'} w-full justify-between items-center p-3 my-1 `}>
                <div className='flex justify-center items-center'>

                    <h1 className={` text-xl font-medium`}>{props?.course?.toUpperCase()}</h1>
                </div>
            </div>
            <div id={`my-table-${props.i}`} className='my_table w-full border transition-all '>
                {props.i === 0 ? <div className='my_table_head flex border-2 border-black font-medium '>
                    <div className="my_th px-4 py-2 w-[20%] border-r-2 border-black flex justify-center items-center ">
                        <span>Semester / Course(Division)</span>
                    </div>
                    <div className="my_th px-4 py-2 w-[20%] border-r-2 border-black flex justify-center items-center ">
                        <span>Common</span>
                    </div>
                    <div className="my_th px-4 py-2 w-[20%] border-r-2 border-black flex justify-center items-center ">
                        <span>Honours</span>
                    </div>
                    <div className="my_th px-4 py-2 w-[20%] border-r-2 border-black flex justify-center items-center ">
                        <span>General</span>
                    </div>
                    <div className="my_th px-4 py-2 w-[20%] flex justify-center items-center ">
                        <span>Elective</span>
                    </div>
                </div> : ''}
                <div className='my_table_body'>
                    <div className="my_table_row flex  ">
                        <div className='my_table_td border-r-2 px-4 py-2 w-[20%] flex justify-center items-center'>
                            <span>{props.sem}</span>
                        </div>
                        <div className='my_table_td border-r-2 px-4 py-2 w-[20%] flex flex-col justify-center items-center'>
                            {props.common ?
                                props.common.map((element, index) => (
                                    <span>{element}</span>
                                ))
                                : ''}

                        </div>
                        <div className='my_table_td border-r-2 px-4 py-2 w-[20%] flex flex-col justify-center items-center'>
                            {props.honours ?
                                props.honours.map((element, index) => (
                                    <span>{element}</span>
                                ))
                                : ''}
                        </div>
                        <div className='my_table_td border-r-2 px-4 py-2 w-[20%] flex flex-col justify-center items-center'>
                            {props.general ?
                                props.general.map((element, index) => (
                                    <span>{element}</span>
                                ))
                                : ''}
                        </div>
                        <div className='my_table_td px-4 py-2 w-[20%] flex flex-col justify-center items-center'>
                            {props.elective ?
                                props.elective.map((element, index) => (
                                    <span>{element}</span>
                                ))
                                : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>


    )
}

export default SubjectDisplay
