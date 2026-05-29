import express from 'express';
import studentsRouter from './routes/students.js';

// creates the main server that receives all requests
const app = express();
const PORT = 3000;

// let's use the studentRouter for requests w/ /students
app.use('/students', studentsRouter);

// listen for requests
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
