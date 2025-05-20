import axios from "axios";
import type {
  LoginDTO,
  RegisterDTO,
  UserResponseDto,
  TaskResponseDTO,
  TaskRequestDTO,
  SolutionRequestDto,
  SolutionResponseDto,
  UserRatingRequestDto,
  UserRatingResponseDto,
} from "@/types";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (loginData: LoginDTO) => {
    const response = await api.post<{ token: string; user: UserResponseDto }>(
      "/auth/login",
      loginData
    );
    return response.data;
  },
  register: async (registerData: RegisterDTO) => {
    const response = await api.post<{ token: string; user: UserResponseDto }>(
      "/auth/register",
      registerData
    );
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get<{
      User: UserResponseDto;
      Email: string;
      Authorities: any[];
    }>("/auth/profile");
    return response.data;
  },
};

export const tasksApi = {
  getAllTasks: async () => {
    const response = await api.get<TaskResponseDTO[]>("/tasks");
    return response.data;
  },
  getTaskById: async (id: string) => {
    const response = await api.get<TaskResponseDTO>(`/tasks/${id}`);
    return response.data;
  },
  createTask: async (taskData: TaskRequestDTO) => {
    const response = await api.post<TaskResponseDTO>("/tasks", taskData);
    return response.data;
  },
  updateTask: async (id: string, taskData: TaskRequestDTO) => {
    const response = await api.patch<TaskResponseDTO>(`/tasks/${id}`, taskData);
    return response.data;
  },
  deleteTask: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  },
};

export const solutionsApi = {
  submitSolution: async (solutionData: SolutionRequestDto) => {
    const response = await api.post<SolutionResponseDto>(
      "/solutions",
      solutionData
    );
    return response.data;
  },
};

export const ratingsApi = {
  addRating: async (ratingData: UserRatingRequestDto) => {
    const response = await api.post<UserRatingResponseDto>(
      "/user-ratings",
      ratingData
    );
    return response.data;
  },
};

export const usersApi = {
  getLeaderboard: async () => {
    const response = await api.get<UserResponseDto[]>("/users/leaderboard");
    return response.data;
  },
};

export default api;
