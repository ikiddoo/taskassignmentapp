export interface Skill {
  id: number;
  name: string;
  createdAt: string;
}

export interface Developer {
  id: number;
  name: string;
  createdAt: string;
  skills: Skill[];
}

export interface Task {
  id: number;
  title: string;
  status: 'To-do' | 'In Progress' | 'Done';
  createdAt: string;
  updatedAt: string;
  requiredSkills: Skill[];
  assignedDeveloper: Developer | null;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}
