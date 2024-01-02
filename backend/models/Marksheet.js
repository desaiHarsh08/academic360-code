import mongoose from 'mongoose';
const { Schema } = mongoose;

// const subjectSchema = new Schema({
//   subjectName: {
//     type: String,
//     default: '',
//   },
//   year1: {
//     type: Number,
//     default: (new Date()).getFullYear()
//   },
//   fullMarks: {
//     type: Number,
//     default: 100
//   },
//   year2: {
//     type: Number
//   },
//   practicalMarks: {
//     type: Number,
//     default: 0
//   },
//   internalMarks: {
//     type: Number,
//     default: 0
//   },
//   theoryMarks: {
//     type: Number,
//     default: 0
//   },
//   letterGrade: {
//     type: String,
//     default: ''
//   },
//   credit: {
//     type: Number,
//     default: 0
//   },
//   tgp: {
//     type: Number,
//     default: 0
//   },
//   status: {
//     type: String,
//     default: 'F'
//   },
//   total: {
//     type: Number,
//     default: 0
//   },
//   ngp: {
//     type: Number,
//     default: 0
//   },
// });

const MarksheetSchema = new Schema({
  
  name: {
    type: String,
    
  },
  year: {
    type: Number
  },
  year2: {
    type: Number
  },
  rollNo: {
    type: String,
    
  },
  registrationNo: {
    type: String,
    
  },
  stream: {
    type: String,
    
  },
  course: {
    type: String,
    
  },
  semester: {
    type: Number,
    
  },
  sgpa: {
    type: Number,
    
  },
  remarks: {
    type: String,
    
  },
  classification: {
    type: String,
    
  },
  cgpa: {
    type: Number,
    
  },
  totalCredit: {
    type: Number,
    
  },
  subjects: {
    type: [
      
    ],
    
  },
  totalMarksObtained: {
    type: Number
  },
  fullMarksSum: {
    type: Number
  },
  UID: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  }
});

const Marksheet = mongoose.model('marksheet', MarksheetSchema);

export default Marksheet;