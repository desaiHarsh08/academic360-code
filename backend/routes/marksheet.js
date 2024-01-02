import express from 'express';
import fetchuser from '../middleware/fetchuser.js'
import Marksheet from '../models/Marksheet.js';
import { body, validationResult } from 'express-validator';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { count, error } from 'console';
import csv from 'csv-parser'
import { fail } from 'assert';



(async () => {
    try {
        console.log('Fired!');
        const result = await Marksheet.updateMany({ stream: 'bcom' }, { $set: { stream: 'BCOM' } });
        // console.log('Total documents matched:', result.n);
        // console.log('Total documents modified:', result.nModified);
    } catch (error) {
        console.error(error);
    } finally {
        // Close the connection after the operation is complete
        // mongoose.disconnect();
    }
})();






// // Adding UID to the Marksheets
// (async () => {

//     // Function to read CSV file
//     function readCsvFile(filePath) {
//         return new Promise((resolve, reject) => {
//             const data = [];

//             fs.createReadStream(filePath)
//                 .pipe(csv())
//                 .on('data', (row) => {
//                     data.push(row);
//                 })
//                 .on('end', () => {
//                     resolve(data);
//                 })
//                 .on('error', (error) => {
//                     reject(error);
//                 });
//         });
//     }

//     // Example usage
//     const csvFilePath = './routes/Book1 uid for Academic 260.xlsx - UID 17, 18, 19, 20, 21, 22.csv';

//     readCsvFile(csvFilePath)
//         .then(async (data) => {
//             // console.log('CSV Data:', data);
//             for(let i = 0; i < data.length; i++) {
//                 console.log(i, "Getting data...")
//                 const marksheet = await Marksheet.findOne({registrationNo: data[i].registration_no});
//                 if(!marksheet) { continue; }
//                 console.log(i, "saving uid...")
//                 marksheet.UID = data[i]["Code"];
//                 await marksheet.save();
//             }
//         })
//         .catch((error) => {
//             console.error('Error reading CSV file:', error);
//         });

// })();






function getLetterGrade(subjectPercent) {
    if (subjectPercent >= 90 && subjectPercent <= 100) { return "A++"; }
    if (subjectPercent >= 80 && subjectPercent < 90) { return "A+"; }
    if (subjectPercent >= 70 && subjectPercent < 80) { return "A"; }
    if (subjectPercent >= 60 && subjectPercent < 70) { return "B+"; }
    if (subjectPercent >= 50 && subjectPercent < 60) { return "B" }
    if (subjectPercent >= 40 && subjectPercent < 50) { return "C+"; }
    if (subjectPercent >= 30 && subjectPercent < 40) { return "C"; }
    if (subjectPercent >= 0 && subjectPercent < 30) { return "F"; }
}

async function getClassification(cgpa, marksheetList) {
    let isClearedSemester = false;
    for (let i = 0; i < 6; i++) {
        const marksheetObj = marksheetList.find(marksheet => marksheet.semester == i + 1);
        if (!marksheetObj) {
            isClearedSemester = false;
            break;
        }
        isClearedSemester = true;
    }

    if (!isClearedSemester) {
        return "Previous Semester not cleared";
    }
    else {
        if (cgpa >= 9 && cgpa <= 10) {
            return "Outstanding";
        }
        else if (cgpa >= 8 && cgpa < 9) {
            return "Excellent";
        }
        else if (cgpa >= 7 && cgpa < 8) {
            return "Very Good";
        }
        else if (cgpa >= 6 && cgpa < 7) {
            return "Good";
        }
        else if (cgpa >= 5 && cgpa < 6) {
            return "Average";
        }
        else if (cgpa >= 4 && cgpa < 5) {
            return "Fair";
        }
        else if (cgpa >= 3 && cgpa < 4) {
            return "Satisfactory";
        }
        else if (cgpa >= 0 && cgpa < 3) {
            return "Fail";
        }
    }
}

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




function calculateCGPA(marksheetList) {
    let sgpa_totalcredit = 0, creditSumAllSem = 0;
    for (let i = 0; i < 6; i++) {
        const marksheet = marksheetList.find(obj => obj.semester == i + 1);
        if (!marksheet) {
            return -1;
        }
        sgpa_totalcredit += marksheet["sgpa"] * marksheet["totalCredit"]
        creditSumAllSem += marksheet["totalCredit"];
    }

    // Return the cgpa
    return (sgpa_totalcredit / creditSumAllSem).toFixed(3);
}

function handleSemester6(marksheetList) {
    // Fetch semester 6 marksheet
    const marksheetSem6 = marksheetList.find(obj => obj.semester == 6);
    console.log("List: ", marksheetSem6);
    if (marksheetSem6 == undefined) { return null; }
    // Set cgpa and classification for the marksheet having semester as 6
    marksheetSem6.cgpa = calculateCGPA(marksheetList);
    marksheetSem6.classification = getClassification(marksheetSem6.cgpa, marksheetList);

    console.log("In handle semester6, marksheetSem6: ", marksheetSem6)
    return marksheetSem6;

}


async function processMarksheet(marksheet) {
    let ngp_credit = 0, creditSum = 0;
    for (let i = 0; i < marksheet.subjects.length; i++) {
        // Calculate total for every subject
        let internalMarks = isNaN((Number(marksheet.subjects[i].internalMarks))) ? 0 : Number(marksheet.subjects[i].internalMarks);
        let theoryMarks = isNaN((Number(marksheet.subjects[i].theoryMarks))) ? 0 : Number(marksheet.subjects[i].theoryMarks);
        if (marksheet.stream.toUpperCase() !== "BCOM") {
            let practicalMarks = isNaN((Number(marksheet.subjects[i].practicalMarks))) ? 0 : Number(marksheet.subjects[i].practicalMarks);
            marksheet.subjects[i]["total"] = internalMarks + practicalMarks + theoryMarks;
        }
        else {
            marksheet.subjects[i]["total"] = internalMarks + theoryMarks;
        }

        // Calculate totalMarksObtained and fullMarksSum
        marksheet.totalMarksObtained += marksheet.subjects[i]["total"];
        marksheet.fullMarksSum += marksheet.subjects[i].fullMarks

        // Calculate NGP for each subject as % marks / 10 for each subject
        let subjectPercent = (marksheet.subjects[i]["total"] * 100) / marksheet.subjects[i].fullMarks;
        marksheet.subjects[i]["ngp"] = (subjectPercent / 10);

        // Calculate sum of product of NGP and Credit
        ngp_credit += marksheet.subjects[i].ngp * marksheet.subjects[i].credit;

        // Calculate sum of all credits
        creditSum += marksheet.subjects[i].credit;

        // Mark the letterGrade for each subject
        marksheet.subjects[i]["letterGrade"] = getLetterGrade(subjectPercent);

        // Set the status - todo
        if (subjectPercent < 30) {
            marksheet.subjects[i]["status"] = "F";
        }
        else {
            marksheet.subjects[i]["status"] = "P";
        }

    }

    // Set totalCredit for the marksheet
    marksheet.totalCredit = creditSum;

    let marksheetPercent = (marksheet.totalMarksObtained * 100) / marksheet.fullMarksSum;

    // Mark status and sgpa for the marksheet
    if (marksheetPercent < 30) { // For failed marksheet
        // marksheet["status"] = "F";
        marksheet["sgpa"] = 0;
    }
    else { // For passed marksheet
        // marksheet["status"] = "P";
        marksheet["sgpa"] = (ngp_credit / creditSum).toFixed(3);
    }

    // Set the remarks for the marksheet
    marksheet.remarks = getRemarks(marksheetPercent, marksheet.stream, marksheet.course, marksheet.semester, marksheet.subjects);

    return marksheet;
}


// Function to handle the given marksheet
function handleMarksheet({
    name, rollNo, registrationNo, stream, course, semester, sgpa, remarks, classification, cgpa, status, totalCredit, subjects, year
}, marksheetList) {

    // Create a new marksheet
    let marksheet = new Marksheet({
        name, rollNo, registrationNo, stream, course, semester, sgpa, remarks, classification, cgpa, totalCredit, subjects, year, totalMarksObtained: 0, fullMarksSum: 0
    });

    // Process the given marksheet
    marksheet = processMarksheet(marksheet);

    console.log(marksheet);
    return marksheet;

}




async function handleOldOperation(marksheet) {
    let ngp_credit = 0, creditSum = 0;
    marksheet["totalMarksObtained"] = 0;
    marksheet["fullMarksSum"] = 0;
    for (let i = 0; i < marksheet.subjects.length; i++) {
        let internalMarks = isNaN((Number(marksheet.subjects[i].internalMarks))) ? 0 : Number(marksheet.subjects[i].internalMarks);
        let theoryMarks = isNaN((Number(marksheet.subjects[i].theoryMarks))) ? 0 : Number(marksheet.subjects[i].theoryMarks);
        if (marksheet.stream.toUpperCase() !== "BCOM") {
            let practicalMarks = isNaN((Number(marksheet.subjects[i].practicalMarks))) ? 0 : Number(marksheet.subjects[i].practicalMarks);
            marksheet.subjects[i]["total"] = internalMarks + practicalMarks + theoryMarks;
        }
        else {
            marksheet.subjects[i]["total"] = internalMarks + theoryMarks;
        }


        // Calculate totalMarksObtained and fullMarksSum
        marksheet["totalMarksObtained"] += Number(marksheet.subjects[i]["total"]);
        marksheet["fullMarksSum"] += Number(marksheet.subjects[i].fullMarks)

        // Calculate NGP for each subject as % marks / 10 for each subject
        let subjectPercent = (marksheet.subjects[i]["total"] * 100) / marksheet.subjects[i].fullMarks;
        marksheet.subjects[i]["ngp"] = (subjectPercent / 10);

        // Calculate sum of product of NGP and Credit
        ngp_credit += Number(marksheet.subjects[i].ngp) * Number(marksheet.subjects[i].credit);

        // Calculate sum of all credits
        creditSum += Number(marksheet.subjects[i].credit);

        // Mark the letterGrade for each subject
        marksheet.subjects[i]["letterGrade"] = getLetterGrade(subjectPercent);

        // Set the status
        // if(marksheet.subjects[i].status!=="INC") {
        //     if (marksheet.stream.toUpperCase() === "BCOM") { // For "BCOM"
        //         if (subjectPercent < 30) {
        //             marksheet.subjects[i]["status"] = "F";
        //         }
        //         else {
        //             marksheet.subjects[i]["status"] = "P";
        //         }
        //     }
        //     else { // For BA & BSC
        //         let pm = isNaN(Number(marksheet.subjects[i]["practicalMarks"]))?0: Number(marksheet.subjects[i]["practicalMarks"])
        //         let tm = isNaN(Number(marksheet.subjects[i]["theoryMarks"]))?0: Number(marksheet.subjects[i]["theoryMarks"])
        //         if(tm === 0) {
        //             marksheet.subjects[i]["status"] = "F(TH)";
        //         }
        //         if(pm === 0) {
        //             marksheet.subjects[i]["status"] = "F(PR)";
        //         }
        //         if (subjectPercent < 30) {
        //             marksheet.subjects[i]["status"] = "F";
        //         }
        //         else {
        //             marksheet.subjects[i]["status"] = "P";
        //         }
        //     }
        // }
        // marksheet.subjects[i].status = 

    }

    // Set totalCredit for the marksheet
    marksheet.totalCredit = creditSum;

    let marksheetPercent = (marksheet.totalMarksObtained * 100) / marksheet.fullMarksSum;

    // Set sgpa for the marksheet
    if (marksheetPercent < 30) { // For failed marksheet
        // marksheet["status"] = "F";
        marksheet["sgpa"] = 0;
    }
    else { // For passed marksheet
        // marksheet["status"] = "P";
        marksheet["sgpa"] = (ngp_credit / creditSum).toFixed(3);
    }

    // Set the remarks for the marksheet
    marksheet.remarks = getRemarks(marksheetPercent, marksheet.stream, marksheet.course, marksheet.semester, marksheet.subjects);

    // marksheet.save();
    return marksheet;

    // }
}





















// Instantiate router
const router = express.Router();

// Routes for marksheet: -

// ROUTE 1: Get all the marksheets using: GET "/api/marksheet". Login required
router.get('/fetch-all-sem-marksheets', fetchuser, async (req, res) => {

    const marksheetList = await Marksheet.find().lean();
    console.log(marksheetList.length)
    for (let i = 0; i < marksheetList.length; i++) {
        marksheetList[i] = await handleOldOperation(marksheetList[i]);

    }
    // console.log(marksheetList)
    res.status(200).json(marksheetList);
})

// router.get()


// ROUTE 2: Add a marksheet using: POST "/api/marksheet/add-marksheet". Login required
router.post('/add-marksheet', fetchuser, async (req, res) => {
    // await handleOldOperation();
    try {
        const {
            year, year2, name, rollNo, registrationNo, stream, course, semester, sgpa, remarks, classification, cgpa, status, totalCredit, subjects, phone, UID
        } = req.body;

        let marksheet = new Marksheet({
            year, name, rollNo, registrationNo, stream, course, semester, sgpa, remarks, classification, cgpa, status, totalCredit, subjects
        });


        // Fetch all marksheets having Roll No. as "rollNo" and with passed status
        let marksheetList = await Marksheet.find({ rollNo });

        // Check for marksheet already exist, return if exist
        const isMarksheetExist = marksheetList.find(obj => (obj.rollNo === rollNo && obj.semester == semester && obj.year == year && obj.year2 == year2))
        // console.log(isMarksheetExist)
        if (isMarksheetExist !== undefined) {
            return res.status(400).json({ error: "Student's marksheet already exist." })
        }



        // Handle marksheet for new data
        if (year > 2023) {
            marksheet = await handleMarksheet({
                name, rollNo, registrationNo, stream, course, semester, sgpa, remarks, classification, cgpa, status, totalCredit, subjects, year
            }, marksheetList);
        }
        else {
            marksheet = await handleOldOperation(marksheet);
        }
        var processedMarksheet = new Marksheet(marksheet);

        // console.log('Processed Marksheet: ', processedMarksheet)

        // Save the marksheet to the database
        const savedMarksheet = await processedMarksheet.save();

        // Get the updated marksheetList and with passed status
        marksheetList = await Marksheet.find({ rollNo, status: "P" });

        // Handle semester 6 marksheet
        if (year > 2023) {
            let marksheetSem6 = new Marksheet();
            marksheetSem6 = handleSemester6(marksheetList);
            // console.log("In main, sem6: ", marksheetSem6);
            if (marksheetSem6 != null) {
                await marksheetSem6.save();
            }
        }
        console.log("Saved: ", savedMarksheet.year, savedMarksheet.stream, savedMarksheet.semester, savedMarksheet.rollNo);
        return res.status(200).json(savedMarksheet);
        // return res.status(200).json(processMarksheet);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message });
    }
})



// TODO: -
// ROUTE 3: Update a given marksheet using: POST "/api/marksheet/edit". Login required
router.post('/update', fetchuser, async (req, res) => {
    // const { rollNo, semester, year } = req.body;

    // await handleOldOperation();
    try {
        // console.log(req.body);
        // const { 
        //     year, year2, name, rollNo, registrationNo, stream, course, semester, sgpa, remarks, classification, cgpa, status, totalCredit, subjects, UID, phone
        // } = req.body;

        // let marksheet = new Marksheet({
        //     year, year2, name, rollNo, registrationNo, stream, course, semester, sgpa, remarks, classification, cgpa, status, totalCredit, subjects, UID, phone
        // });

        // Fetched the marksheet
        let marksheetFromDB = await Marksheet.findOne({ _id: req.body._id });

        if (marksheetFromDB) {
            Object.assign(marksheetFromDB, req.body);
            console.log("marksheetFromDB: ", marksheetFromDB);

            try {
                console.log("saving");
                const savedMarksheet = await marksheetFromDB.save();
                console.log("saved");
                return res.status(200).json(savedMarksheet);
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: "Internal Server Error" });
            }
        } else {
            return res.status(404).json({ error: "Marksheet not found" });
        }
        // Fetch all marksheets having Roll No. as "rollNo" and with passed status
        // let allMarksheets = await Marksheet.find({ rollNo });

        // marksheet = await handleMarksheet({
        //     name, rollNo, registrationNo, stream, course, semester, sgpa, remarks, classification, cgpa, status, totalCredit, subjects, year
        // }, allMarksheets);

        // var processedMarksheet = new Marksheet(marksheet);

        // console.log('Processed Marksheet: ', processedMarksheet)

        // Save the marksheet to the database
        // const savedMarksheet = await processedMarksheet.save();

        // Get the updated marksheetList and with passed status
        // const marksheetList = await Marksheet.find({ rollNo, status: "P" });


        // Handle semester 6 marksheet
        // let marksheetSem6 = new Marksheet();
        // marksheetSem6 = handleSemester6(marksheetList);
        // if (marksheetSem6 != null) {
        //     await marksheetSem6.save();
        // }


        return res.status(200).json(savedMarksheet);

    } catch (error) {
        console.log(error);
    }

})




// ROUTE 4: Delete the existing marksheet using: DELETE "/api/marksheet/delete". Login required
router.delete('/delete', fetchuser, async (req, res) => {
    // await handleOldOperation();
    const { rollNo, semester, year } = req.body;
    let marksheet = await Marksheet.findOne({ rollNo, semester, year });
    if (!marksheet) {
        return res.status(404).json({ error: "The marksheet for given data not exist!" });
    }

    marksheet = await Marksheet.deleteOne({ rollNo, semester, year });

    // Fetch all marksheets having Roll No. as "rollNo" and with passed status
    const marksheetList = await Marksheet.find({ rollNo, status: "P" });
    const marksheetSem6 = await handleSemester6(marksheetList);

    if (marksheetSem6 !== null) {
        marksheet = new Marksheet(marksheetSem6);
        await marksheet.save();
    }


    return res.status(200).json({ message: "Student marksheet deleted!" });
})



// ROUTE 5: Get all marksheets for the particular student using: POST "/api/marksheet/search". Login required
router.post('/search-all', fetchuser, async (req, res) => {
    // await handleOldOperation();
    const { rollNo } = req.body;

    if (rollNo === null) {
        return res.status(400).json({ error: "Please provide rollNo!" });
    }

    let marksheetsObj = {
        all_sem: [],
        cleared: [],
        not_cleared: []
    };


    let marksheetArr = await Marksheet.find({ rollNo });

    if (marksheetArr.length === 0) {
        return res.status(404).json({ error: "Student data not found!" });
    }

    for (let i = 0; i < marksheetArr.length; i++) {
        if (marksheetArr[i]["status"] === 'P') { // For passed marksheet
            marksheetsObj.cleared.push(marksheetArr[i]);
        }
        else { // For failed marksheet
            marksheetsObj.not_cleared.push(marksheetArr[i]);
        }
    }

    marksheetsObj["all_sem"] = marksheetArr;

    return res.status(200).json(marksheetsObj);
})



// ROUTE 6: Get all the filter marksheets using: POST "/api/marksheet/filter". Login required
router.post('/filter', fetchuser, async (req, res) => {
    const { stream, course, semester, year } = req.body;
    console.log(stream, course, semester, year)
    // await handleOldOperation();
    try {
        let marksheetList = [];
        // if (stream.toUpperCase() === 'BCOM') {
        //     marksheetList = await Marksheet.find({ course, semester, year });
        //     marksheetList = marksheetList.filter(element => element.stream.toLowerCase() === stream.toLowerCase());
        // }
        // else {
        //     marksheetList = await Marksheet.find({ stream: stream.toUpperCase(), semester });
        // }
        if (stream.toUpperCase() !== 'M.A' && stream.toUpperCase() !== 'M.COM' && stream.toUpperCase() !== 'BBA') {
            marksheetList = await Marksheet.find({ course, semester, year, stream });
        }
        else {
            console.log("yes")
            marksheetList = await Marksheet.find({ semester, year, stream });

        }
        console.log(marksheetList.length);



        // Separate the entries
        const separateEntriesArr = [];
        for (let i = 0, c = 0; i < marksheetList.length; i++) {
            console.log(marksheetList[i]);
            // const marksheet = await handleOldOperation(marksheetList[i]);
            const marksheet = marksheetList[i];
            for (let j = 0; j < marksheet.subjects.length; j++) {
                let element = {
                    uniqueIdentifier: marksheet.registrationNo + marksheet.subjects[j].subjectName,
                    registrationNo: marksheet.registrationNo,
                    stream: marksheet.stream,
                    course: marksheet.course,
                    semester: marksheet.semester,
                    name: marksheet.name,
                    sgpa: marksheet.sgpa,
                    remarks: marksheet.remarks,
                    subject: marksheet.subjects[j].subjectName,
                    year1: marksheet.subjects[j].year1,
                    fullMarks: marksheet.subjects[j].fullMarks,
                    year2: marksheet.subjects[j].year2,
                    practicalMarks: marksheet.subjects[j].practicalMarks,
                    ngp: marksheet.subjects[j].ngp,
                    credit: marksheet.subjects[j].credit,
                    tgp: marksheet.subjects[j].tgp,
                    internalMarks: marksheet.subjects[j].internalMarks,
                    theoryMarks: marksheet.subjects[j].theoryMarks,
                    total: marksheet.subjects[j].total,
                    status: marksheet.status,
                    rollNo: marksheet.rollNo,
                    totalMarksObtained: marksheet.totalMarksObtained,
                    fullMarksSum: marksheet.fullMarksSum,
                    totalCredit: marksheet.totalCredit
                }
                // if (marksheet.stream.toUpperCase() === "BCOM") {
                //     element["year2"] = marksheet.subjects[j].year2;
                //     // element["total"] = marksheet.subjects[j].internalMarks + marksheet.subjects[j].theoryMarks;
                // }
                // else {
                //     element["practicalMarks"] = marksheet.subjects[j].practicalMarks;
                //     // element["total"] = marksheet.subjects[j].internalMarks + marksheet.subjects[j].theoryMarks + marksheet.subjects[j].practicalMarks;
                // }
                // element["ngp"] = element.total / 10;
                // let percent = (element.total * 100) / element.fullMarks;
                // element["status"] = percent > 30 ? 'P' : 'F';

                // let fullMarkssum = 0;
                // let totalMarksObtained = 0;
                // console.log(marksheet);
                // for (let j = 0; j < marksheet.subjects.length; j++) {
                //     console.log(c++);
                //     fullMarkssum += marksheet.subjects[j].fullMarks;
                //     totalMarksObtained += marksheet.subjects[j].total;
                //     // if (marksheet.stream.toUpperCase() === "BCOM") {
                //     //     totalMarksObtained += marksheet.subjects[j].total;
                //     // }
                //     // else {
                //     //     totalMarksObtained += marksheet.subjects[j].internalMarks + marksheet.subjects[j].theoryMarks + marksheet.subjects[j].practicalMarks;
                //     // }
                // }
                // let marksheetPercent = (totalMarksObtained * 100) / fullMarkssum;

                // element["remarks"] = getRemarks(marksheetPercent, element.stream, element.course, element.semester, marksheet.subjects);
                // element["letterGrade"] = getLetterGrade((element.total * 100) / element.fullMarks)
                console.log(element)
                // const isDuplicate = separateEntriesArr.some((item) => item.uniqueIdentifier === element.uniqueIdentifier);
                // if (!isDuplicate) {
                    separateEntriesArr.push(element);
                // }
                // else {
                //     continue;
                // }
            }
        }

        console.log(separateEntriesArr.length)
console.log(marksheetList[0])

        return res.status(200).json(separateEntriesArr);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})



// ROUTE 7: Get all stats. using: GET "/api/student/stats". Login required
router.get('/stats', fetchuser, async (req, res) => {
    // await handleOldOperation();
    // try {
    //     console.log('fetching all')
    //     let marksheetArr = await Marksheet.find();
    //     console.log('fetched');
    //     // console.log(marksheetArr)
    //     const obj = {
    //         totalMarksheets: marksheetArr.length,
    //         bcom: 0,
    //         ba: 0,
    //         bsc: 0,
    //         bba: 0,
    //         ma: 0,
    //         mcom: 0,
    //     };

    //     for (let i = 0; i < marksheetArr.length; i++) {
    //         if (marksheetArr[i].stream.toUpperCase() === "BCOM") { // For BCOM
    //             obj.bcom += 1;
    //         }
    //         else if (marksheetArr[i].stream.toUpperCase() === "BA") { // For BA 
    //             obj.ba += 1;
    //         }
    //         else if (marksheetArr[i].stream.toUpperCase() === "BSC") { // For BSC
    //             obj.bsc += 1;
    //         }
    //         else if (marksheetArr[i].stream.toUpperCase() === "BBA") { // For BBA
    //             obj.bba += 1;
    //         }
    //         else if (marksheetArr[i].stream.toUpperCase() === "M.A") { // For M.A
    //             obj.ma += 1;
    //         }
    //         else if (marksheetArr[i].stream.toUpperCase() === "M.COM") { // For M.COM
    //             obj.mcom += 1;
    //         }
    //         console.log(i + 1);
    //     }

    //     return res.status(200).json(obj);

    // } catch (error) {
    //     console.log(error);
    //     return res.status(500).json({ error: 'Internal Server Error' });
    // }


    try {
        console.log('fetching all');

        const streamCounts = await Marksheet.aggregate([
            {
                $group: {
                    _id: "$stream",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    stream: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);

        console.log('fetched');

        const obj = {
            totalMarksheets: streamCounts.reduce((total, stream) => total + stream.count, 0)
        };

        streamCounts.forEach(stream => {
            obj[stream.stream.toLowerCase()] = stream.count;
        });


        console.log(obj)
        return res.status(200).json(obj);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

})



// ROUTE 7: Save all special subjects. using: GET "/api/marksheet/special-subjects". Login required
router.get('/special-subjects', fetchuser, async (req, res) => {

    const { rollNo, stream, course, semester, fullMarks, year1, year2, credit, tgp, subjectName, internalMarks, total } = req.body;
    // await handleOldOperation();

    try {

        let specialSubjectObj = {
            rollNo, stream, course, semester, fullMarks, year1, year2, credit, tgp, subjectName, internalMarks, total
        };

        specialSubjectObj["ngp"] = total / 10;

        if (((total * 100) / fullMarks) > 30) {
            specialSubjectObj["status"] = "P";
        }
        else {
            specialSubjectObj["status"] = "F";
        }
        specialSubjectObj["letterGrade"] = getLetterGrade((total * 100) / fullMarks);

        const marksheet = await Marksheet.findOne({ rollNo });
        marksheet["specialSubject"] = specialSubjectObj;

        const savedMarksheet = await marksheet.save();
        return res.status(200).json(savedMarksheet);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error!" });
    }

})


async function getFormatedDataForSearch(year, stream, sem, rollNo, uid, phone, name, registrationNo) {

    const currentModuleURL = import.meta.url;
    const currentModulePath = fileURLToPath(currentModuleURL);
// console.log(year, stream, sem, rollNo, uid, phone, name, registrationNo)
// console.log(rollNo)

    

    let filePath = path.join(path.dirname(currentModulePath), '..', '..', '..', '.', 'data', `${year}`, `${stream}`, `${sem}`, `${rollNo}.pdf`);
    console.log(filePath);
    try {
        let obj = { rollNo, year: year, stream: stream, semester: sem, uid: uid, phone: phone, name: name, registrationNo: registrationNo };

        // Check if the file exists
        if (fs.existsSync(filePath)) {
            console.log(rollNo, sem, year, stream, uid);
            obj["pdf"] = true;
        } else {
            obj["pdf"] = false;
        }

        return obj;

    } catch (error) {
        console.log(error);
    }

}


// ROUTE 8: Get all the marksheets for the given rollNo using: POST "/api/marksheet/search". Login required
router.post('/search', [
    body('rollNo', 'Enter a valid rollNo').exists()
], fetchuser, async (req, res) => {

    // If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rollNo } = req.body;
    // await handleOldOperation();

    try {
        let searchString = rollNo;
        // const marksheetList = await Marksheet.find({ rollNo });
        const marksheetList = await Marksheet.find({
            $or: [
                { rollNo: { $regex: searchString, $options: 'i' } },
                { registrationNo: { $regex: searchString, $options: 'i' } },
                { UID: { $regex: searchString, $options: 'i' } }
            ]
        });
        console.log(marksheetList[0], marksheetList.length);
        if (!marksheetList) {
            return res.status(404).json({ error: "Marksheet data not found!" });
        }

        // Format the data accordingly to the frontend requires
        const marksheetArr = [];
        for (let i = 0; i < marksheetList.length; i++) {
            for (let y = 2017; y <= (new Date).getFullYear(); y++) {
                for (let s = 1; s <= 6; s++) {
                    let obj = await getFormatedDataForSearch(y, marksheetList[0].stream.toUpperCase(), s, marksheetList[0].rollNo, marksheetList[0].UID, marksheetList[0].phone, marksheetList[0].name, marksheetList[0].registrationNo);
                    // if (!marksheetList.some((ele)=>( ele.year===obj.year && ele.semester===obj.semester ))) { continue; }
                    if(obj.pdf===false) {continue}; 
                    marksheetArr.push(obj);
                }
            }
        }
        console.log(marksheetArr.length);



        return res.status(200).json(marksheetArr);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error!" });
    }
})


// ROUTE 9: Get all the reports using: Get "/api/marksheet/get-all-reports". Login required
router.post('/get-all-reports', fetchuser, async (req, res) => {
    // await handleOldOperation();
    const { stream, year } = req.body;
    console.log(stream, Number(year));
    try {
        console.log("loading data...");
        let marksheetList = await Marksheet.find({ year, stream });
        marksheetList = marksheetList.filter(element => element.stream.toLowerCase() === stream.toLowerCase());

        console.log(marksheetList.length)
        if (marksheetList.length === 0) {
            return res.status(404).json({ error: "Data not found!" });
        }

        const allMarksheetsReportArr = [];
        for (let i = 0; i < marksheetList.length; i++) {
            // Skip the iteration, if already processed rollNo: marksheetList[i].rollNo
            const isExist = allMarksheetsReportArr.filter((element) => (element.rollNo === marksheetList[i].rollNo && element.year === marksheetList[i].year));
            if (isExist.length > 0) { continue; }



            // Fetch marksheets for rollNo: marksheetList[i].rollNo having status as 'P'
            const allSemesterMarksheets = marksheetList.filter(
                (element) => (element.rollNo === marksheetList[i].rollNo && element.sgpa > 3)
            );

            // Create the semester report for rollNo: marksheetList[i].rollNo
            let marksheetReportArr = [];
            for (let sem = 1; sem <= 6; sem++) {
                // Fetch the semester: sem
                let marksheet = allSemesterMarksheets.find(element => element.semester === sem);
                // Skip for the marksheet for a particular semester if not found
                if (!marksheet) { continue; }
                // marksheet = await handleOldOperation(marksheet);
                console.log(marksheet)
                // Create the semester report
                let semesterReportObj = { 
                    rollNo: marksheet.rollNo,
                    semester: marksheet.semester,
                    year: marksheet.year,
                    fullMarks: marksheet.fullMarksSum,
                    totalMarks: marksheet.totalMarksObtained,
                    credit: marksheet.totalCredit,
                    sgpa: marksheet.sgpa,
                    cgpa: marksheet.cgpa,
                    cummulativeCredit: marksheet.cummulativeCredit,
                    letterGrade: getLetterGrade((marksheet.totalMarksObtained * 100)/marksheet.fullMarksSum),
                    remarks: marksheet.remarks,
                    _id: marksheet._id
                }

                if (semesterReportObj.semester !== 6) {
                    semesterReportObj.cgpa = 0;
                }

                // Add the report to the report array
                marksheetReportArr.push(semesterReportObj);
            }

            // Add the semester report array for rollNo: marksheetList[i].rollNo to the array
            allMarksheetsReportArr.push({ marksheetReportArr, rollNo: marksheetList[i].rollNo });
            console.log(allMarksheetsReportArr.length);
        }
 console.log(" here ",allMarksheetsReportArr.length)
        return res.status(200).json(allMarksheetsReportArr);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error!" });
    }
}) 



// ROUTE 11: Get the scanned marksheet using: POST "/api/marksheet/get-pdf". Login required
router.post('/get-pdf', fetchuser, async (req, res) => {

    const currentModuleURL = import.meta.url;
    const currentModulePath = fileURLToPath(currentModuleURL);


    // Construct the absolute path to the PDF file based on the directory structure
    // const absolutePathToFile = path.join(path.dirname(currentModulePath), '..', '..', 'data', 'Chapter 0.pdf');


    const { rollNo, semester, year, stream } = req.body;
    console.log(rollNo, semester, year, stream);

    let filePath = path.join(path.dirname(currentModulePath), '..', '..', '..', '.', 'data', `${year}`, `${stream.toUpperCase()}`, `${semester}`, `${rollNo}.pdf`);
    console.log(filePath);
    try {
        // Check if the file exists
        if (fs.existsSync(filePath)) {
            const fileStream = fs.createReadStream(filePath);
            res.setHeader('Content-Type', 'application/pdf');
            fileStream.pipe(res);
        } else {
            res.status(404).send('File not found');
        }

    } catch (error) {
        console.log(error);
        return res.status(200).json({ error: "Internal Server Error!" });
    }
})







// ROUTE 12: Add multiple marksheet using: POST "/api/marksheet/add-all". Login required
router.post('/add-all', fetchuser, async (req, res) => {
    // await handleOldOperation();
    try {


        const marksheetArr = req.body;
        for (let i = 0; i < marksheetArr.length; i++) {
            const {
                year, name, rollNo, registrationNo, stream, course, semester, sgpa, remarks, classification, cgpa, status, totalCredit, subjects
            } = marksheetArr[i];

            let marksheet = new Marksheet({
                year, name, rollNo, registrationNo, stream, course, semester, sgpa, remarks, classification, cgpa, status, totalCredit, subjects, user: req.user.id,
            });

            // Fetch all marksheets having Roll No. as "marksheetArr[i].rollNo" and with passed status
            let marksheetList = await Marksheet.find({ rollNo });

            // Check for marksheet already exist, return if exist
            const isMarksheetExist = marksheetList.find(obj => (obj.rollNo === rollNo && obj.semester == semester && obj.year == year))
            console.log(isMarksheetExist)
            if (isMarksheetExist !== undefined) {
                return res.status(400).json({ error: "Student's marksheet already exist." })
            }

            // Handle marksheet for new data
            if (year > 2023) {
                marksheet = await handleMarksheet({
                    name, rollNo, registrationNo, stream, course, semester, sgpa, remarks, classification, cgpa, status, totalCredit, subjects, year
                }, marksheetList);
            }
            var processedMarksheet = new Marksheet(marksheet);

            console.log('Processed Marksheet: ', processedMarksheet)

            // Save the marksheet to the database
            const savedMarksheet = await processedMarksheet.save();

            // Get the updated marksheetList and with passed status
            marksheetList = await Marksheet.find({ rollNo, status: "P" });

            // TODO: Handle semester 6 marksheet
            if (year > 2023) {
                let marksheetSem6 = new Marksheet();
                marksheetSem6 = handleSemester6(marksheetList);
                console.log("In main, sem6: ", marksheetSem6);
                if (marksheetSem6 != null) {
                    await marksheetSem6.save();
                }
            }

        }




        return res.status(200).json({ message: true });
        // return res.status(200).json(processMarksheet);

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message });
    }
})



// ROUTE 3: Get the marksheet by given rollNo, year and semester : POST "/api/marksheet/get_marksheet_data". Login required
router.post('/get_marksheet_data', fetchuser, async (req, res) => {
    const { rollNo, year, semester } = req.body;
    console.log(rollNo, year, semester)
    // await handleOldOperation();
    try {

        // Fetch the marksheets 
        let marksheet = await Marksheet.findOne({ rollNo, year, semester });
        console.log(marksheet)
        return res.status(200).json(marksheet);

    } catch (error) {
        console.log(error);
    }

})



export default router;