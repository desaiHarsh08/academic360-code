import mongoose from 'mongoose';
const { Schema } = mongoose;

const SubjectsSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  bcom: {
    sem1: {
        common: [],
        honours: [],
        general: [],
        elective: []
    },
    sem2: {
        common: [],
        honours: [],
        general: [],
        elective: []
    },
    sem3: {
        common: [],
        honours: [],
        general: [],
        elective: []
    },
    sem4: {
        common: [],
        honours: [],
        general: [],
        elective: []
    },
    sem5: {
        common: [],
        honours: [],
        general: [],
        elective: []
    },
    sem6: {
        common: [],
        honours: [],
        general: [],
        elective: []
    }
  },
  ba: {
    sem1: {
        common: [],
        honours: [],
        general: [],
        elective: []
    },
    sem2: {
        common: [],
        honours: [],
        general: [],
        elective: []
    },
    sem3: {
        common: [],
        honours: [],
        general: [],
        elective: []
    },
    sem4: {
        common: [],
        honours: [],
        general: [],
        elective: []
    },
    sem5: {
        common: [],
        honours: [],
        general: [],
        elective: []
    },
    sem6: {
        common: [],
        honours: [],
        general: [],
        elective: []
    }
  },
  bsc: {
    sem1: {
        common: [],
        honours: [],
        general: [],
        elective: []
    },
    sem2: {
        common: [],
        honours: [],
        general: [],
        elective: []
    },
    sem3: {
        common: [],
        honours: [],
        general: [],
        elective: []
    },
    sem4: {
        common: [],
        honours: [],
        general: [],
        elective: []
    },
    sem5: {
        common: [],
        honours: [],
        general: [],
        elective: []
    },
    sem6: {
        common: [],
        honours: [],
        general: [],
        elective: []
    }
  }  
  
});

const Subjects = mongoose.model('subjects', SubjectsSchema);

export default Subjects;