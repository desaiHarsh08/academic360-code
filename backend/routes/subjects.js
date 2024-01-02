import fetchuser from '../middleware/fetchuser.js';
import Subjects from '../models/Subjects.js';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// Fetch default subjects
var defaultSubjects;
const currentModuleURL = import.meta.url;
const currentModulePath = fileURLToPath(currentModuleURL);
const absolutePathToFile = path.join(path.dirname(currentModulePath), '..', 'default_subjects.json');
fs.readFile(absolutePathToFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file:', err);
    return;
  }

  try {
    const jsonData = JSON.parse(data);
    defaultSubjects = jsonData;
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
  }
});


// Load the default subjects to the database
(async () => {
    // Check for default subjects already exist
    const subjectsArr = await Subjects.find();
    if (subjectsArr.length === 0) {
        // Create a new Subjects document if none exists
        const subjects = new Subjects(defaultSubjects);
        const savedSubjects = await subjects.save();
        console.log(savedSubjects)
    }

})();


// Instantiate router
const router = express.Router();


// Routes for subjects: -

// ROUTE 1: Get all the subjects using: GET "/api/subjects/fetch-all". Login required
router.get('/fetch-all', fetchuser, async (req, res) => {
    const subjectList = await Subjects.find()
    // console.log(subjectList[0].bcom.sem1)
    res.json(subjectList);
});


// ROUTE 2: Add or update the subjects using: POST "/api/subjects/add_update". Login required
router.post('/add_update', fetchuser, async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: "Bad request!" });
        }
        console.log(req.body.bcom.sem1.common[0]);

        const subjectsArr = await Subjects.find();

        if (subjectsArr.length < 1) {
            // Create a new Subjects document if none exists
            const subjects = new Subjects(req.body);
            const savedSubjects = await subjects.save();
            return res.status(200).json(savedSubjects);
        } else {
            // Update the existing Subjects document with the new data
            const existingSubjects = subjectsArr[0];
            existingSubjects.set(req.body);
            const updatedSubjects = await existingSubjects.save();
            return res.status(200).json(updatedSubjects);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server error!" });
    }
})


export default router;