export interface Task {
  _id?: string;
  unitTestLabel: string;
  tags: string[];
  description: string;
  testCases: string[];
  notes?: string;
  attachedImages?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateTaskRequest {
  unitTestLabel: string;
  tags: string[];
  description: string;
  testCases: string[];
  notes?: string;
  attachedImages?: string[];
}

export interface UpdateTaskRequest extends CreateTaskRequest {
  _id: string;
}

export interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (task: CreateTaskRequest) => Promise<void>;
  getTasks: () => Promise<void>;
  updateTask: (id: string, task: CreateTaskRequest) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Promise<Task | null>;
  uploadImages: (files: FileList) => Promise<string[]>;
}