"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabaseBrowser } from "@/lib/supabase"
import { Briefcase, MapPin, DollarSign, Trash2 } from "lucide-react"
import Link from "next/link"

type Job = {
  id: string
  title: string
  company: string
  location: string
  salary: string
  description: string
  is_active: boolean
}

type SavedJob = {
  id: string
  job: Job
}

export default function SavedJobs() {
  const { user } = useAuth()
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        console.log("Fetching saved jobs for user:", user.id)
        const { data: savedJobsData, error: savedJobsError } = await supabaseBrowser
          .from("saved_jobs")
          .select(`
            id,
            job_id
          `)
          .eq("user_id", user.id)
          .order("job_id", { ascending: false })

        if (savedJobsError) {
          console.error("Error fetching saved jobs:", {
            message: savedJobsError?.message || "Unknown error",
            details: savedJobsError?.details || "No details available",
            hint: savedJobsError?.hint || "No hint available",
            code: savedJobsError?.code || "No error code",
            error: savedJobsError
          })

          // Check if the error is due to table not existing
          if (savedJobsError?.message?.includes("relation") && savedJobsError?.message?.includes("does not exist")) {
            console.error("The 'saved_jobs' table does not exist in the database")
            setSavedJobs([])
            setLoading(false)
            return
          }

          setSavedJobs([])
          setLoading(false)
          return
        }

        console.log("Saved jobs data:", savedJobsData)

        if (!savedJobsData || savedJobsData.length === 0) {
          console.log("No saved jobs found")
          setSavedJobs([])
          setLoading(false)
          return
        }

        // Get job details for all saved jobs
        const jobIds = savedJobsData.map(savedJob => savedJob.job_id)
        console.log("Fetching job details for jobIds:", jobIds)

        const { data: jobsData, error: jobsError } = await supabaseBrowser
          .from("jobs")
          .select("*")
          .in("id", jobIds)

        if (jobsError) {
          console.error("Error fetching jobs:", {
            message: jobsError?.message || "Unknown error",
            details: jobsError?.details || "No details available",
            hint: jobsError?.hint || "No hint available",
            code: jobsError?.code || "No error code",
            error: jobsError
          })
          setSavedJobs([])
          setLoading(false)
          return
        }

        console.log("Jobs data:", jobsData)

        // Combine the data
        const combinedData = savedJobsData.map(savedJob => {
          const job = jobsData?.find(j => j.id === savedJob.job_id)
          return {
            id: savedJob.id,
            job: job || {
              id: "",
              title: "Unknown Job",
              company: "Unknown Company",
              location: "",
              salary: "",
              description: "",
              is_active: false
            }
          }
        })

        console.log("Combined data:", combinedData)
        setSavedJobs(combinedData)
      } catch (error) {
        console.error("Error in fetchSavedJobs:", {
          message: error instanceof Error ? error.message : "Unknown error",
          error: error
        })
        setSavedJobs([])
      } finally {
        setLoading(false)
      }
    }

    fetchSavedJobs()
  }, [user?.id])

  const removeSavedJob = async (savedJobId: string) => {
    try {
      const { error } = await supabaseBrowser
        .from("saved_jobs")
        .delete()
        .eq("id", savedJobId)

      if (error) throw error

      setSavedJobs(savedJobs.filter(job => job.id !== savedJobId))
    } catch (error) {
      console.error("Error removing saved job:", error)
    }
  }

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
        <h1 className="text-2xl font-bold tracking-tight">Saved Jobs</h1>
        <p className="text-muted-foreground">
          View and manage your saved job listings
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No saved jobs</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven't saved any jobs yet. Browse jobs and save the ones you're interested in.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/jobs">
                  Browse Jobs
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {savedJobs.map((savedJob) => (
            <Card key={savedJob.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{savedJob.job.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {savedJob.job.company}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSavedJob(savedJob.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{savedJob.job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{savedJob.job.salary}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    {savedJob.job.description}
                  </p>
                </div>
                <div className="mt-4">
                  
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 