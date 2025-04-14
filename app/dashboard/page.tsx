"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, FileText, Users } from "lucide-react"
import { supabaseBrowser } from "@/lib/supabase"

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    savedJobs: 0,
    activeJobs: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        if (user.role === "job_seeker") {
          // Get applications count
          const { count: applicationsCount } = await supabaseBrowser
            .from("applications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)

          // Get saved jobs count
          const { count: savedJobsCount } = await supabaseBrowser
            .from("saved_jobs")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)

          // Get total jobs count
          const { count: totalJobsCount } = await supabaseBrowser
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true)

          setStats({
            totalJobs: totalJobsCount || 0,
            totalApplications: applicationsCount || 0,
            savedJobs: savedJobsCount || 0,
            activeJobs: 0,
          })
        } else if (user.role === "employer") {
          // Get active jobs count
          const { count: activeJobsCount } = await supabaseBrowser
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .eq("posted_by", user.id)
            .eq("is_active", true)

          // Get total applications for employer's jobs
          const { count: totalApplicationsCount } = await supabaseBrowser
            .from("applications")
            .select("id", { count: "exact", head: true })
            .in("job_id", 
              (await supabaseBrowser
                .from("jobs")
                .select("id")
                .eq("posted_by", user.id)
              ).data?.map(job => job.id) || []
            )

          setStats({
            totalJobs: 0,
            totalApplications: totalApplicationsCount || 0,
            savedJobs: 0,
            activeJobs: activeJobsCount || 0,
          })
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">
          Here's an overview of your {user?.role === "job_seeker" ? "job search" : "recruitment"} activity
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {user?.role === "job_seeker" && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalJobs}</div>
                <p className="text-xs text-muted-foreground">Jobs matching your profile</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">Jobs you've applied to</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saved Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.savedJobs}</div>
                <p className="text-xs text-muted-foreground">Jobs you've saved for later</p>
              </CardContent>
            </Card>
          </>
        )}

        {user?.role === "employer" && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeJobs}</div>
                <p className="text-xs text-muted-foreground">Currently active job listings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">Candidates who applied to your jobs</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>
              Your recent {user?.role === "job_seeker" ? "job search" : "recruitment"} activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* This would be populated with actual activity data */}
              <p className="text-muted-foreground text-center py-8">No recent activity to display</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
