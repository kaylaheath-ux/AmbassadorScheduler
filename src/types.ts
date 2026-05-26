export interface Student {
  id: number;
  name: string;
  hometown: string;
  year: string;
  majors: string[];
  minors: string[];
  bio: string;
}

export interface StudentsData {
  students: Student[];
}
