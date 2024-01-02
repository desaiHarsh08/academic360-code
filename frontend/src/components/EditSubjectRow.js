import React, { useEffect, useState } from 'react'

const EditSubjectRow = ({ subjectObj, index, arrayLength, handleSubjectChange, course, semester, stream }) => {


    const [subjectObjState, setSubjectObjState] = useState(subjectObj);

    useEffect(() => {
        handleSubjectChange(index, subjectObjState);
        console.log(subjectObj)
    }, [index, subjectObjState, handleSubjectChange]);


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


    // Todo
    const handleChange = (e) => {
        let { name, value } = e.target;

        // Create the copy of subjectObjState
        const tmpObj = {
            subjectName: subjectObjState.subjectName,
            fullMarks: subjectObjState.fullMarks,
            year1: subjectObjState.year1,
            internalMarks: subjectObjState.internalMarks,
            theoryMarks: subjectObjState.theoryMarks,
            total: subjectObjState.total,
            letterGrade: subjectObjState.letterGrade,
            ngp: subjectObjState.ngp,
            credit: subjectObjState.credit,
            tgp: subjectObjState.tgp,
            status: subjectObjState.status
        };


        if (stream.toUpperCase() === "BCOM") {
            tmpObj["year2"] = subjectObjState.year2
        }
        else {
            tmpObj["practicalMarks"] = !isNaN(Number(subjectObjState.practicalMarks)) ? Number(subjectObjState.practicalMarks) : 0
        }
        
        tmpObj[name] = value;

            // Calculate the total marks
            let im = !isNaN(Number(tmpObj.internalMarks)) ? Number(tmpObj.internalMarks) : 0
            let tm = !isNaN(Number(tmpObj.theoryMarks)) ? Number(tmpObj.theoryMarks) : 0
            if (stream.toUpperCase()==="BCOM") {
                console.log("in cal bcom total: ", im, tm);
                tmpObj.total = im + tm;
                console.log("total: ", tmpObj.total);
            }
            else {
                console.log("in cal non-bcom total: ", im, tm);
                let pm = !isNaN(Number(tmpObj.practicalMarks))?Number(tmpObj.practicalMarks): 0
                tmpObj.total = im + tm + pm;
                console.log("total: ", tmpObj.total);
            }

        tmpObj.letterGrade = getLetterGrade((tmpObj.total * 100) / tmpObj.fullMarks);
        tmpObj.ngp = (tmpObj.total / 10);

        // Set the status
        if ((tmpObj.total * 100) / tmpObj.fullMarks < 30) {
            tmpObj.status = 'F';
        }
        else {
            tmpObj.status = 'P';
        }


        // let remarks = getRemarks()

        console.log("cal tmpObj: ", tmpObj)


        // Update the state subjectObjState 
        setSubjectObjState(tmpObj);




        // Call the callback function to inform the parent component about the change
        handleSubjectChange(index, { ...subjectObjState, [name]: value });
    }

    return (
        <>
            <td className={` border-r-2  border-black text-center font-medium py-3 w-[7.7%] `}>
                {/* {console.log(subjectObjState)} */}
                <input
                    name={`subjectName`}
                    readOnly
                    type="text"
                    value={subjectObjState.subjectName}
                    id={`subjectName-${subjectObjState.subjectName}`}
                    className={`w-[95%] py-2 rounded-md border border-slate-500 text-center bg-slate-300`}
                />
            </td>
            <td className={` border-r-2  border-black text-center font-medium py-3 w-[7.7%] `}>
                <input
                    name={`fullMarks`}
                    type="number"
                    value={subjectObjState.fullMarks}
                    id={`fullMarks-${subjectObjState.subjectName}`}
                    className={`w-[95%] py-2 rounded-md border border-slate-500 text-center `}
                    onChange={handleChange}
                />
            </td>
            <td className={` border-r-2  border-black text-center font-medium py-3 w-[7.7%] `}>
                <input
                    readOnly
                    name={`year1`}
                    type="number"
                    value={subjectObjState.year1}
                    id={`year1-${subjectObjState.subjectName}`}
                    className={`w-[95%] py-2 rounded-md border border-slate-500 bg-slate-300 text-center `}
                />
            </td>
            <td className={` border-r-2  border-black text-center font-medium py-3 w-[7.7%] `}>
                <input
                    name={`internalMarks`}
                    type="number"
                    value={subjectObjState.internalMarks}
                    id={`internalMarks-${subjectObjState.subjectName}`}
                    className={`w-[95%] py-2 rounded-md border border-slate-500 text-center `}
                    onChange={handleChange}
                />
            </td>
            {
                stream.toUpperCase()==="BCOM"?
                <td className={` border-r-2  border-black text-center font-medium py-3 w-[7.7%] `}>
                    <input
                        name={`year2`}
                        readOnly
                        type="number"
                        value={subjectObjState.year2}
                        id={`year2-${subjectObjState.subjectName}`}
                        className={`w-[95%] py-2 rounded-md border border-slate-500 text-center bg-slate-300 `}
                    />
                </td>
                : 
                <td className={` border-r-2  border-black text-center font-medium py-3 w-[7.7%] `}>
                    <input
                        name={`practicalMarks`}
                        readOnly
                        type="number"
                        value={subjectObjState.practicalMarks}
                        id={`practicalMarks-${subjectObjState.subjectName}`}
                        className={`w-[95%] py-2 rounded-md border border-slate-500 text-center bg-slate-300 `}
                    />
                </td>
            }
            <td className={` border-r-2  border-black text-center font-medium py-3 w-[7.7%] `}>
                <input
                    name={`theoryMarks`}
                    type="number"
                    value={subjectObjState.theoryMarks}
                    id={`theoryMarks-${subjectObjState.subjectName}`}
                    className={`w-[95%] py-2 rounded-md border border-slate-500 text-center `}
                    onChange={handleChange}
                />
            </td>
            <td className={` border-r-2  border-black text-center font-medium py-3 w-[7.7%] `}>
                <input
                    name={`total`}
                    readOnly
                    type="number"
                    value={subjectObjState.total}
                    id={`total-${subjectObjState.subjectName}`}
                    className={`w-[95%] py-2 rounded-md border border-slate-500 text-center bg-blue-200 `}
                    onChange={handleChange}
                />
            </td>
            <td className={`border-r-2  border-black text-center font-medium py-3 w-[7.7%] `}>
                <input
                    name={`letterGrade`}
                    readOnly
                    type="text"
                    value={subjectObjState.letterGrade}
                    id={`letterGrade-${subjectObjState.subjectName}`}
                    className={`w-[95%] py-2 rounded-md border border-slate-500 text-center bg-blue-200 `}
                    onChange={handleChange}
                />
            </td>
            <td className={`border-r-2  border-black text-center font-medium py-3 w-[7.7%] `}>
                <input
                    name={`ngp`}
                    readOnly
                    type="number"
                    value={subjectObjState.ngp}
                    id={`ngp-${subjectObjState.subjectName}`}
                    className={`w-[95%] py-2 rounded-md border border-slate-500 text-center bg-blue-200 `}
                    onChange={handleChange}
                />
            </td>
            <td className={` border-r-2  border-black text-center font-medium py-3 w-[7.7%] `}>
                <input
                    name={`credit`}
                    readOnly
                    type="number"
                    value={subjectObjState.credit}
                    id={`credit-${subjectObjState.subjectName}`}
                    className={`w-[95%] py-2 rounded-md border border-slate-500 text-center bg-blue-200`}
                    onChange={handleChange}
                />
            </td>
            <td className={` border-r-2  border-black text-center font-medium py-3 w-[7.7%] `}>
                <input
                    name={`tgp`}
                    type="number"
                    value={subjectObjState.tgp}
                    id={`tgp-${subjectObjState.subjectName}`}
                    className={`w-[95%] py-2 rounded-md border border-slate-500 text-center `}
                    onChange={handleChange}
                />
            </td>
            <td className={` border-r-2  border-black text-center font-medium py-3 w-[7.7%] `}>
                <input
                    readOnly
                    name={`status`}
                    type="text"
                    value={subjectObjState.status}
                    id={`status-${subjectObjState.subjectName}`}
                    className={`w-[95%] py-2 rounded-md border border-slate-500 text-center bg-blue-200 `}
                    onChange={handleChange}
                />
            </td>
        </>
    )
}

export default EditSubjectRow
