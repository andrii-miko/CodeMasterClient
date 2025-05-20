"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthForms } from "@/components/auth-forms";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/profile");
    }
  }, [user, router]);

  return (
    <div className="container py-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to CodeMaster</h1>
        <p className="text-muted-foreground">
          Sign in or create an account to track your progress
        </p>
      </div>

      <AuthForms />
    </div>
  );
}
