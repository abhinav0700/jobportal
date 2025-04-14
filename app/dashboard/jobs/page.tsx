"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { supabaseBrowser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookmarkPlus, Briefcase, Building2, MapPin } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Job = {
  id: string
  title: string
  company: string
  location: string
  job_type: string
  salary_min: number | null
  salary_max: number | null
  posted_at: string
  is_saved?: boolean
}

export default function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [jobType, setJobType] = useState<string>("")
  const [location, setLocation] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return

      try {
        // Fetch all active jobs
        let query = supabaseBrowser
          .from("jobs")
          .select("*")
          .eq("is_active", true)
          .order("posted_at", { ascending: false })

        // Apply filters if they exist
        if (searchTerm) {
          query = query.or(
            `title.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
          )
        }

        if (jobType) {
          query = query.eq("job_type", jobType)
        }

        if (location) {
          query = query.ilike("location", `%${location}%`)
        }

        const { data: jobsData, error } = await query

        if (error) throw error

        // Fetch saved jobs for the current user
        const { data: savedJobs } = await supabaseBrowser.from("saved_jobs").select("job_id").eq("user_id", user.id)

        const savedJobIds = savedJobs?.map((job) => job.job_id) || []

        // Mark jobs as saved if they are in the user's saved jobs
        const jobsWithSavedStatus =
          jobsData?.map((job) => ({
            ...job,
            is_saved: savedJobIds.includes(job.id),
          })) || []

        setJobs(jobsWithSavedStatus)
      } catch (error) {
        console.error("Error fetching jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [user, searchTerm, jobType, location])

  const handleSaveJob = async (jobId: string) => {
    if (!user) return

    try {
      const jobToUpdate = jobs.find((job) => job.id === jobId)

      if (jobToUpdate?.is_saved) {
        // Remove from saved jobs
        await supabaseBrowser.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", jobId)

        toast({
          title: "Job removed",
          description: "Job removed from saved jobs",
        })
      } else {
        // Add to saved jobs
        await supabaseBrowser.from("saved_jobs").insert([
          {
            user_id: user.id,
            job_id: jobId,
          },
        ])

        toast({
          title: "Job saved",
          description: "Job saved for later",
        })
      }

      // Update the UI
      setJobs(jobs.map((job) => (job.id === jobId ? { ...job, is_saved: !job.is_saved } : job)))
    } catch (error) {
      console.error("Error saving job:", error)
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browse Jobs</h1>
        <p className="text-muted-foreground">Find and apply to the best jobs that match your skills</p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search jobs, companies, or keywords"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">No jobs found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters to find more jobs</p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="capitalize">{job.job_type.replace("-", " ")}</div>
                      {job.salary_min && job.salary_max && (
                        <div>
                          ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Posted {new Date(job.posted_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSaveJob(job.id)}
                      className={job.is_saved ? "text-yellow-500" : ""}
                    >
                      <BookmarkPlus className="h-5 w-5" />
                    </Button>
                    <Link href={`/dashboard/jobs/${job.id}`}>
                      <Button>View Details</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
