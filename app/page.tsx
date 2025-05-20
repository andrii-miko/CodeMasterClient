import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Code, Trophy, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <section className="py-12 md:py-24 lg:py-32 flex flex-col items-center text-center">
        <div className="container px-4 md:px-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Improve Your Programming Skills
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Solve coding challenges, compete with others, and track your progress to become a better programmer.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button asChild size="lg">
              <Link href="/problems">
                Start Coding <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/leaderboard">View Leaderboard</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 lg:py-32 bg-muted/50 rounded-lg">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <Card>
              <CardHeader>
                <Code className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Coding Challenges</CardTitle>
                <CardDescription>
                  Practice with a variety of programming challenges ranging from easy to hard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Our platform offers hundreds of coding problems across different difficulty levels and topics. Write,
                  test, and submit your solutions in our integrated code editor.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="/problems">Browse Challenges</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <Trophy className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Compete & Earn Points</CardTitle>
                <CardDescription>Earn points for each solved problem and climb the leaderboard.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Each challenge awards points based on difficulty. Track your progress, earn badges, and compete with
                  other programmers to reach the top of the leaderboard.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="/leaderboard">View Leaderboard</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Community</CardTitle>
                <CardDescription>Join a community of programmers learning and growing together.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Connect with other programmers, share your solutions, and learn from others. Our community is a great
                  place to improve your skills and make connections.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="/profile">Create Profile</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
