"use client";

import type React from "react";
import type {
  TaskResponseDTO,
  SolutionResponseDto,
  SolutionRequestDto,
  UserRatingRequestDto,
} from "@/types";

import { createContext, useContext, useState, useEffect } from "react";
import { tasksApi, solutionsApi, ratingsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./auth-context";

export type Difficulty = "easy" | "medium" | "hard";

type ProblemsContextType = {
  problems: TaskResponseDTO[];
  submissions: SolutionResponseDto[];
  isLoading: boolean;
  getProblem: (id: string) => TaskResponseDTO | undefined;
  submitSolution: (
    problemId: string,
    code: string
  ) => Promise<SolutionResponseDto>;
  rateProblem: (problemId: string, rating: number) => Promise<void>;
};

const ProblemsContext = createContext<ProblemsContextType | undefined>(
  undefined
);

export function ProblemsProvider({ children }: { children: React.ReactNode }) {
  const [problems, setProblems] = useState<TaskResponseDTO[]>([]);
  const [submissions, setSubmissions] = useState<SolutionResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { token } = useAuth();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        const data = await tasksApi.getAllTasks();
        setProblems(data);
      } catch (error) {
        console.error("Failed to fetch problems:", error);
        toast({
          title: "Error",
          description: "Failed to load problems. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, [toast]);

  const getProblem = (id: string) => {
    return problems.find((problem) => problem.id === id);
  };

  const submitSolution = async (
    problemId: string,
    code: string
  ): Promise<SolutionResponseDto> => {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit your solution.",
        variant: "destructive",
      });
      throw new Error("Authentication required");
    }

    try {
      const solutionData: SolutionRequestDto = {
        taskId: problemId,
        code,
        language: "JAVASCRIPT",
      };

      const response = await solutionsApi.submitSolution(solutionData);
      setSubmissions((prev) => [response, ...prev]);

      if (response.successful) {
        toast({
          title: "Success!",
          description: "Your solution has been accepted.",
        });
      } else {
        toast({
          title: "Solution not accepted",
          description: "Your solution did not pass all test cases.",
          variant: "destructive",
        });
      }

      return response;
    } catch (error) {
      console.error("Failed to submit solution:", error);
      toast({
        title: "Error",
        description: "Failed to submit your solution. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const rateProblem = async (
    problemId: string,
    rating: number
  ): Promise<void> => {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please sign in to rate this problem.",
        variant: "destructive",
      });
      return;
    }

    try {
      const ratingData: UserRatingRequestDto = {
        taskId: problemId,
        rating,
      };

      await ratingsApi.addRating(ratingData);

      toast({
        title: "Rating submitted",
        description: "Thank you for rating this problem!",
      });
    } catch (error) {
      console.error("Failed to submit rating:", error);
      toast({
        title: "Error",
        description: "Failed to submit your rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <ProblemsContext.Provider
      value={{
        problems,
        submissions,
        isLoading,
        getProblem,
        submitSolution,
        rateProblem,
      }}
    >
      {children}
    </ProblemsContext.Provider>
  );
}

export function useProblems() {
  const context = useContext(ProblemsContext);
  if (context === undefined) {
    throw new Error("useProblems must be used within a ProblemsProvider");
  }
  return context;
}
