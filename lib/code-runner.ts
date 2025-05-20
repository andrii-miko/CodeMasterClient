type TestResult = {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
};

export async function runJavaScriptCode(
  code: string,
  testCases: { input: string; expectedOutput: string }[]
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  let wrappedCode = "";

  try {
    if (
      code.includes("function solution(") ||
      code.includes("const solution =") ||
      code.includes("let solution =")
    ) {
      wrappedCode = `
        ${code}
        return solution;
      `;
    } else {
      wrappedCode = `
        function solution(input) {
          ${code}
        }
        return solution;
      `;
    }

    const createSolutionFunction = new Function(wrappedCode);
    const solutionFunction = createSolutionFunction();

    for (const testCase of testCases) {
      try {
        let parsedInput;
        try {
          if (
            (testCase.input.startsWith("[") && testCase.input.endsWith("]")) ||
            (testCase.input.startsWith("{") && testCase.input.endsWith("}"))
          ) {
            parsedInput = JSON.parse(testCase.input);
          } else if (testCase.input.includes(",")) {
            parsedInput = testCase.input.split(",").map((item) => {
              const trimmed = item.trim();
              if (!isNaN(Number(trimmed))) {
                return Number(trimmed);
              }
              if (
                (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
                (trimmed.startsWith("'") && trimmed.endsWith("'"))
              ) {
                return trimmed.substring(1, trimmed.length - 1);
              }
              return trimmed;
            });
          } else {
            parsedInput = !isNaN(Number(testCase.input))
              ? Number(testCase.input)
              : testCase.input;
          }
        } catch (e) {
          parsedInput = testCase.input;
        }

        const output = solutionFunction(parsedInput);

        const outputStr =
          typeof output === "object" ? JSON.stringify(output) : String(output);

        const cleanExpected = testCase.expectedOutput
          .trim()
          .replace(/^["']|["']$/g, "");
        const cleanActual = outputStr.trim().replace(/^["']|["']$/g, "");

        const passed = cleanActual === cleanExpected;

        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: outputStr,
          passed,
        });
      } catch (error) {
        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: "",
          passed: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    for (const testCase of testCases) {
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: "",
        passed: false,
        error: `Syntax error: ${errorMessage}`,
      });
    }
  }

  return results;
}
