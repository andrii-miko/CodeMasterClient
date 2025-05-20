"use client";

import { useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { useTheme } from "next-themes";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  language = "javascript",
  readOnly = false,
}: CodeEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        theme: theme === "dark" ? "vs-dark" : "light",
      });
    }
  }, [theme]);

  return (
    <div className="h-full border rounded-md overflow-hidden">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(value) => onChange(value || "")}
        theme={theme === "dark" ? "vs-dark" : "light"}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          readOnly,
          wordWrap: "on",
          automaticLayout: true,
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
}
