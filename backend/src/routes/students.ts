import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';

// create a router for communication
// creates a mini-app that can be attached to main server to handle
// a subset of requests
const router = Router();

// GET /students — return every student.
// Handlers are now async because talking to the database returns a Promise:
// prisma.student.findMany() runs `SELECT * FROM "Student"` and we await the rows.
router.get('/', async (_req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany();
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch students' });
  }
});

// GET /students/:id — return one student by unity id.
// findUnique looks the row up by primary key and returns null if there's no match.
router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  // Express types the param as string | string[] | undefined; the DB lookup
  // needs a single string, so narrow it before querying.
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'invalid id' });
  }
  try {
    const student = await prisma.student.findUnique({ where: { id } });
    // if no student, 404 not found and error as json format for response
    if (!student) {
      return res.status(404).json({ error: `student with id ${id} not found` });
    }
    return res.json(student);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to fetch student' });
  }
});

// exporting the router
export default router;
