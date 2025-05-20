"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Award, Code, Loader2, Trophy } from "lucide-react";
import { tasksApi } from "@/lib/api";
import type { TaskResponseDTO } from "@/types";

export default function ProfilePage() {
  const { user, login, isLoading } = useAuth();
  const [isLoadingProblems, setIsLoadingProblems] = useState(false);

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => login("test@example.com", "password")}
              className="w-full"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalProblems = 100;
  const solvedCount = Array.isArray(user.solvedProblems)
    ? user.solvedProblems.length
    : 0;

  const solvedPercentage = Math.round((solvedCount / totalProblems) * 100) || 0;

  const solvedByDifficulty = {
    easy: Array.isArray(user.solvedProblems)
      ? user.solvedProblems.filter((p) => p.difficulty === "easy").length
      : 0,
    medium: Array.isArray(user.solvedProblems)
      ? user.solvedProblems.filter((p) => p.difficulty === "medium").length
      : 0,
    hard: Array.isArray(user.solvedProblems)
      ? user.solvedProblems.filter((p) => p.difficulty === "hard").length
      : 0,
  };

  return (
    <div className="flex justify-center py-10">
      <div className="container max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-2">
                  <AvatarImage
                    src={`/placeholder.svg?height=96&width=96&text=${user.username
                      .slice(0, 2)
                      .toUpperCase()}`}
                  />
                  <AvatarFallback className="text-2xl">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{user.username}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Points</span>
                    <span className="font-bold text-primary">
                      {user.totalPoints}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Problems Solved</span>
                    <span className="font-bold">
                      {solvedCount} / {totalProblems}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span>Progress</span>
                      <span>{solvedPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${solvedPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="solved">
              <TabsList className="flex justify-evenly w-full">
                <TabsTrigger value="solved" className="w-80 text-base">
                  <Code className="h-5 w-5 mr-2" />
                  Solved Problems
                </TabsTrigger>
                <TabsTrigger value="stats" className="w-80 text-base">
                  <Trophy className="h-5 w-5 mr-2" />
                  Statistics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="solved" className="space-y-4 mt-6">
                <h3 className="text-lg font-medium">Your Solved Problems</h3>
                {isLoadingProblems ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : solvedCount > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {user.solvedProblems.map((problem) => (
                      <Card key={problem.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">
                              {problem.title}
                            </CardTitle>
                            <Badge
                              className={
                                problem.difficulty === "easy"
                                  ? "bg-green-500/10 text-green-500"
                                  : problem.difficulty === "medium"
                                  ? "bg-yellow-500/10 text-yellow-500"
                                  : "bg-red-500/10 text-red-500"
                              }
                              variant="outline"
                            >
                              {problem.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="mt-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/problems/${problem.id}`}>
                                View Problem
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-6 text-center">
                      <p className="text-muted-foreground mb-4">
                        You haven't solved any problems yet.
                      </p>
                      <Button asChild>
                        <Link href="/problems">Browse Problems</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="stats" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Problem Solving Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-3">
                          Problems by Difficulty
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                              <span>Easy</span>
                            </div>
                            <span>{solvedByDifficulty.easy}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                              <span>Medium</span>
                            </div>
                            <span>{solvedByDifficulty.medium}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                              <span>Hard</span>
                            </div>
                            <span>{solvedByDifficulty.hard}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-3">
                          Overall Progress
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">
                              {solvedCount}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Problems Solved
                            </div>
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">
                              {user.totalPoints}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Total Points
                            </div>
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">
                              {solvedPercentage}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Completion
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
