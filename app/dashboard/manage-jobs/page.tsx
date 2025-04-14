"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { supabaseBrowser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Briefcase, Calendar, Edit, Eye, MoreVertical, Plus, Trash2, Users } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Job = {
  id: string
  title: string
  company: string
  location: string
  job_type: string
  posted_at: string
  is_active: boolean
  applications_count: number
}

export default function ManageJobsPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return

      try {
        // Fetch all jobs posted by the current user
        const { data, error } = await supabaseBrowser
          .from("jobs")
          .select(`
            id, 
            title, 
            company, 
            location, 
            job_type, 
            posted_at, 
            is_active
          `)
          .eq("posted_by", user.id)
          .order("posted_at", { ascending: false })

        if (error) throw error

        // For each job, get the count of applications
        const jobsWithApplications = await Promise.all(
          data.map(async (job) => {
            const { count } = await supabaseBrowser
              .from("applications")
              .select("*", { count: "exact", head: true })
              .eq("job_id", job.id)

            return {
              ...job,
              applications_count: count || 0,
            }
          }),
        )

        setJobs(jobsWithApplications)
      } catch (error) {
        console.error("Error fetching jobs:", error)
        toast({
          title: "Error",
          description: "Failed to load jobs",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [user, toast])

  const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabaseBrowser.from("jobs").update({ is_active: !currentStatus }).eq("id", jobId)

      if (error) throw error

      // Update the job status in the UI
      setJobs(jobs.map((job) => (job.id === jobId ? { ...job, is_active: !currentStatus } : job)))

      toast({
        title: "Success",
        description: `Job ${!currentStatus ? "activated" : "deactivated"} successfully`,
      })
    } catch (error) {
      console.error("Error toggling job status:", error)
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      })
    }
  }

  const deleteJob = async () => {
    if (!jobToDelete) return

    try {
      const { error } = await supabaseBrowser.from("jobs").delete().eq("id", jobToDelete)

      if (error) throw error

      // Remove the job from the UI
      setJobs(jobs.filter((job) => job.id !== jobToDelete))

      toast({
        title: "Success",
        description: "Job deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting job:", error)
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      })
    } finally {
      setJobToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Jobs</h1>
          <p className="text-muted-foreground">View and manage your job listings</p>
        </div>
        <Link href="/dashboard/post-job">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold">No jobs posted yet</h3>
            <p className="text-muted-foreground mb-4">Start by posting your first job listing</p>
            <Link href="/dashboard/post-job">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Post a Job
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className={job.is_active ? "" : "opacity-70"}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`bg-primary/10 p-2 rounded-md ${!job.is_active && "bg-gray-200"}`}>
                        <Briefcase className={`h-5 w-5 ${job.is_active ? "text-primary" : "text-gray-500"}`} />
                      </div>
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      {!job.is_active && (
                        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">Inactive</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div>{job.company}</div>
                      <div>{job.location}</div>
                      <div className="capitalize">{job.job_type.replace("-", " ")}</div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{job.applications_count} applications</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/jobs/${job.id}`}>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/manage-jobs/${job.id}/applications`}>
                      <Button variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        View Applications
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/manage-jobs/${job.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleJobStatus(job.id, job.is_active)}>
                          {job.is_active ? (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => setJobToDelete(job.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job listing and all associated
              applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteJob} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
