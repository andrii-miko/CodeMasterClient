"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProblems } from "@/context/problems-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Play,
  Save,
  Star,
  XCircle,
} from "lucide-react";
import CodeEditor from "@/components/code-editor";
import Markdown from "@/components/markdown";
import { tasksApi } from "@/lib/api";
import { runJavaScriptCode } from "@/lib/code-runner";
import type { TaskResponseDTO } from "@/types";

type TestResult = {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
};

export default function ProblemPage() {
  const params = useParams();
  const router = useRouter();
  const { submitSolution, rateProblem } = useProblems();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [problem, setProblem] = useState<TaskResponseDTO | null>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const firstTestResult = testResults.slice(0, 1);

  const problemId = params.id as string;

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setIsLoading(true);
        const data = await tasksApi.getTaskById(problemId);
        setProblem(data);

        const starterCode = `// Write your solution for "${data.title}" here\n\nfunction solution(input) {\n  // Your code here\n  \n  // Return your answer\n  return null;\n}\n`;
        setCode(starterCode);
      } catch (error) {
        console.error("Failed to fetch problem:", error);
        toast({
          title: "Problem not found",
          description: "The problem you're looking for doesn't exist.",
          variant: "destructive",
        });
        router.push("/problems");
      } finally {
        setIsLoading(false);
      }
    };

    if (problemId) {
      fetchProblem();
    }
  }, [problemId, router, toast]);

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!problem) {
    return null;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-500";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500";
      case "hard":
        return "bg-red-500/10 text-red-500";
      default:
        return "";
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before running.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setOutput("Running code...");
    setTestResults([]);

    try {
      const results = await runJavaScriptCode(code, problem.testCases);
      setTestResults(results);

      let outputText = "Test Results:\n\n";

      let passedCount = 0;
      results.forEach((result, index) => {
        if (result.passed) passedCount++;

        outputText += `Test Case ${index + 1}:\n`;
        outputText += `Input: ${result.input}\n`;
        outputText += `Expected Output: ${result.expectedOutput}\n`;
        outputText += `Your Output: ${result.actualOutput}\n`;
        outputText += `Status: ${result.passed ? "PASSED ✓" : "FAILED ✗"}\n`;

        if (result.error) {
          outputText += `Error: ${result.error}\n`;
        }

        outputText += "\n";
      });

      outputText += `Summary: ${passedCount} of ${results.length} test cases passed.`;

      setOutput(outputText);
    } catch (error) {
      setOutput(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit your solution.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const results = await runJavaScriptCode(code, problem.testCases);

      const allPassed = results.every((result) => result.passed);

      if (!allPassed) {
        toast({
          title: "Solution not ready",
          description:
            "Your solution doesn't pass all test cases. Please fix the errors before submitting.",
          variant: "destructive",
        });

        let outputText = "Test Results:\n\n";

        let passedCount = 0;
        results.forEach((result, index) => {
          if (result.passed) passedCount++;

          outputText += `Test Case ${index + 1}:\n`;
          outputText += `Input: ${result.input}\n`;
          outputText += `Expected Output: ${result.expectedOutput}\n`;
          outputText += `Your Output: ${result.actualOutput}\n`;
          outputText += `Status: ${result.passed ? "PASSED ✓" : "FAILED ✗"}\n`;

          if (result.error) {
            outputText += `Error: ${result.error}\n`;
          }

          outputText += "\n";
        });

        outputText += `Summary: ${passedCount} of ${results.length} test cases passed.`;

        setOutput(outputText);
        setTestResults(results);
        setIsSubmitting(false);
        return;
      }

      const result = await submitSolution(problemId, code);

      if (result.successful) {
        toast({
          title: "Success!",
          description: "Your solution has been accepted and saved.",
        });
      } else {
        toast({
          title: "Solution not accepted",
          description:
            "Your solution did not pass all test cases on the server.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your solution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please sign in to rate this problem.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    setUserRating(rating);
    try {
      await rateProblem(problemId, rating);
    } catch (error) {
      console.error("Rating error:", error);
    }
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <Badge
              className={getDifficultyColor(problem.difficulty)}
              variant="outline"
            >
              {problem.difficulty}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center">
              <span className="font-medium mr-1">Rate:</span>
              <div className="ml-2 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 cursor-pointer ${
                      star <= userRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                    onClick={() => handleRating(star)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <Markdown content={problem.description} />

            {problem.inputDescription && (
              <>
                <h3>Input Description</h3>
                <Markdown content={problem.inputDescription} />
              </>
            )}

            {problem.outputDescription && (
              <>
                <h3>Output Description</h3>
                <Markdown content={problem.outputDescription} />
              </>
            )}

            {problem.testCases && problem.testCases.length > 0 && (
              <>
                <h3>Example Test Cases</h3>
                {problem.testCases.slice(0, 2).map((testCase, index) => (
                  <div key={index} className="mb-4">
                    <h4>Example {index + 1}</h4>
                    <div className="bg-muted p-3 rounded-md mb-2">
                      <p className="font-medium">Input:</p>
                      <pre className="whitespace-pre-wrap">
                        {testCase.input}
                      </pre>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="font-medium">Expected Output:</p>
                      <pre className="whitespace-pre-wrap">
                        {testCase.expectedOutput}
                      </pre>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="lg:w-1/2 space-y-4">
          <Tabs defaultValue="code">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
            </TabsList>
            <TabsContent
              value="code"
              className="h-[calc(100vh-300px)] min-h-[400px]"
            >
              <CodeEditor
                value={code}
                onChange={setCode}
                language="javascript"
              />
            </TabsContent>
            <TabsContent
              value="output"
              className="h-[calc(100vh-300px)] min-h-[400px]"
            >
              <div className="h-full flex flex-col">
                {testResults.length > 0 && (
                  <div className="mb-4 p-4 border rounded-md">
                    <h3 className="text-lg font-medium mb-2">Test Results</h3>
                    <div className="space-y-3">
                      {firstTestResult.map((result, index) => (
                        <div key={index} className="p-3 border rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">
                              Test Case {index + 1}
                            </span>
                            {result.passed ? (
                              <div className="flex items-center text-green-500">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span>Passed</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-500">
                                <XCircle className="h-4 w-4 mr-1" />
                                <span>Failed</span>
                              </div>
                            )}
                          </div>
                          {result.error ? (
                            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-red-600 dark:text-red-400 text-sm flex items-start">
                              <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                              <span>{result.error}</span>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <p className="font-medium">Input:</p>
                                  <pre className="bg-muted p-2 rounded-md whitespace-pre-wrap overflow-auto max-h-20">
                                    {result.input}
                                  </pre>
                                </div>
                                <div>
                                  <p className="font-medium">
                                    Expected Output:
                                  </p>
                                  <pre className="bg-muted p-2 rounded-md whitespace-pre-wrap overflow-auto max-h-20">
                                    {result.expectedOutput}
                                  </pre>
                                </div>
                              </div>
                              <div className="mt-2 text-sm">
                                <p className="font-medium">Your Output:</p>
                                <pre className="bg-muted p-2 rounded-md whitespace-pre-wrap overflow-auto max-h-20">
                                  {result.actualOutput}
                                </pre>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-sm font-medium">
                      Summary: {testResults.filter((r) => r.passed).length} of{" "}
                      {testResults.length} test cases passed
                    </div>
                  </div>
                )}
                <div className="flex-1 p-4 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap overflow-auto">
                  {output || "Run your code to see output here..."}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2">
            <Button onClick={runCode} disabled={isRunning} className="flex-1">
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Code
                </>
              )}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
