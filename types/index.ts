export type LoginDTO = {
  email: string;
  password: string;
};

export type RegisterDTO = {
  username: string;
  email: string;
  password: string;
};

export type UserResponseDto = {
  id: string;
  username: string;
  email: string;
  roles: string[];
  totalPoints: number;
  solvedProblems: TaskResponseDTO[];
};

// Task types
export type TestCaseDTO = {
  input: string;
  expectedOutput: string;
};

export type TaskResponseDTO = {
  id: string;
  title: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
  difficulty: "easy" | "medium" | "hard";
  testCases: TestCaseDTO[];
};

export type TaskRequestDTO = {
  title: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  testCases: TestCaseDTO[];
};

export type SolutionResponseDto = {
  id: string;
  code: string;
  language: string;
  successful: boolean;
  userId: string;
  taskId: string;
};

export type SolutionRequestDto = {
  taskId: string;
  code: string;
  language: string;
};

export type UserRatingResponseDto = {
  id: string;
  rating: number;
  userId: string;
  taskId: string;
};

export type UserRatingRequestDto = {
  rating: number;
  taskId: string;
};
