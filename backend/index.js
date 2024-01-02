import connectToMongo from "./db.js";
import auth from "./routes/auth.js";
import marksheet from "./routes/marksheet.js";
import subjects from "./routes/subjects.js";
import express from "express";
import cors from "cors";
import bodyParser  from "body-parser";
 
// Connected to MongoDB
connectToMongo(); 

const app = express()
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
// app.use(bodyParser.json({ limit: '5000mb' }));
// app.use(bodyParser.urlencoded({ extended: true, limit: '10000000000mb' }));
// app.use(bodyParser.text({ type: 'text/*', limit: '10000000000mb' }));


// Default endpoint for the backend-app
app.get('/', (req, res) => {
  res.send('This is iAcademin360 - Backend!');
})

// Available routes
app.use('/api/auth', auth);
app.use('/api/marksheet', marksheet);
app.use('/api/subjects', subjects);


app.listen(port, () => {
  console.log(`Server is live and listening on port http://localhost:${port}`)
})