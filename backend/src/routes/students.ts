import { Router, type Request, type Response } from 'express';
import studentsData from '../data/students.json' with { type: 'json' };
import type { Student, StudentsData } from '../types.js';

// converts json data to StudentsData object and gets the 
// array of students
const students: Student[] = (studentsData as StudentsData).students;

// create a router for communication
// creates a mini-app that can be attached to main server to handle
// a subset of requests
const router = Router();

// declaring the first API endpoint, GET
// defining HTTP GET route on the root path, /
// the second parameter, the handler runs whenever a client sends a
// get request to that URL. 
// req and res, the two parameters for the handler, represent the
// incoming request and outgoing response
// no request data is needed, so req unused
// the handler sends the student array in json format as the response
router.get('/', (_req: Request, res: Response) => {
  res.json(students);
});

// second API endpoint - when a user specifies and id to search up
router.get('/:id', (req: Request, res: Response) => {
  // saving the id parameter from the request
  const id = req.params.id;
  // finds the student with the matching id
  const student = students.find((s) => s.id === id);
  // if no student, 404 not found and error as json format for response
  if (!student) {
    // return to exit cleanly because of 2 branches
    return res.status(404).json({ error: `student with id ${id} not found` });
  }
  // return the student in json format
  return res.json(student);
});

// exporting the router
export default router;