"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Trophy, Loader2 } from "lucide-react";
import { usersApi } from "@/lib/api";
import type { UserResponseDto } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const data = await usersApi.getLeaderboard();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        toast({
          title: "Error",
          description:
            "Failed to load leaderboard data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [toast]);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-amber-700";
      default:
        return "text-muted-foreground";
    }
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col items-center mb-8">
        <Trophy className="h-12 w-12 text-primary mb-2" />
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Top programmers ranked by points earned from solving challenges
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="relative mb-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Programmers</CardTitle>
            <CardDescription>
              Users ranked by total points earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`font-bold text-lg ${getRankColor(index + 1)}`}
                    >
                      #{index + 1}
                    </div>
                    <Avatar>
                      <AvatarImage
                        src={`/placeholder.svg?height=40&width=40&text=${getInitials(
                          user.username
                        )}`}
                      />
                      <AvatarFallback>
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.roles.includes("ADMIN")
                          ? "Administrator"
                          : "User"}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-primary">
                    {user.totalPoints} points
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    No users found matching "{searchTerm}"
                  </p>
                </div>
              )}

              {users.length === 0 && !isLoading && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    No users have earned points yet. Be the first!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
