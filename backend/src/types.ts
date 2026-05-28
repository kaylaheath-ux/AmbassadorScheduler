// represents a single student
export interface Student {
  id: string; // ncsu unity id, email is unityid@ncsu.edu
  name: string;
  majors: string[];
  minors: string[];
}

export interface StudentsData {
  students: Student[];
}
