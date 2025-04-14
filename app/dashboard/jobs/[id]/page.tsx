"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabaseBrowser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { BookmarkPlus, Briefcase, Building2, Calendar, MapPin, Share2 } from "lucide-react"

type Job = {
  id: string
  title: string
  company: string
  location: string
  job_type: string
  description: string
  requirements: string
  salary_min: number | null
  salary_max: number | null
  experience_min: number | null
  experience_max: number | null
  posted_at: string
  is_remote: boolean
  is_saved?: boolean
  has_applied?: boolean
}

export default function JobDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [resumeLink, setResumeLink] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!user || !id) return

      try {
        // Fetch job details
        const { data: jobData, error } = await supabaseBrowser.from("jobs").select("*").eq("id", id).single()

        if (error) throw error

        // Check if job is saved
        const { data: savedJob } = await supabaseBrowser
          .from("saved_jobs")
          .select("*")
          .eq("user_id", user.id)
          .eq("job_id", id)
          .maybeSingle()

        // Check if user has already applied
        const { data: application } = await supabaseBrowser
          .from("applications")
          .select("*")
          .eq("user_id", user.id)
          .eq("job_id", id)
          .maybeSingle()

        setJob({
          ...jobData,
          is_saved: !!savedJob,
          has_applied: !!application,
        })
      } catch (error) {
        console.error("Error fetching job details:", error)
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchJobDetails()
  }, [id, user, toast])

  const handleSaveJob = async () => {
    if (!user || !job) return

    try {
      if (job.is_saved) {
        // Remove from saved jobs
        await supabaseBrowser.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", job.id)

        toast({
          title: "Job removed",
          description: "Job removed from saved jobs",
        })
      } else {
        // Add to saved jobs
        await supabaseBrowser.from("saved_jobs").insert([
          {
            user_id: user.id,
            job_id: job.id,
          },
        ])

        toast({
          title: "Job saved",
          description: "Job saved for later",
        })
      }

      // Update the UI
      setJob({
        ...job,
        is_saved: !job.is_saved,
      })
    } catch (error) {
      console.error("Error saving job:", error)
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive",
      })
    }
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !job) return

    if (job.has_applied) {
      toast({
        title: "Already applied",
        description: "You have already applied to this job",
      })
      return
    }

    setApplying(true)

    try {
      const { error } = await supabaseBrowser.from("applications").insert([
        {
          job_id: job.id,
          user_id: user.id,
          resume_link: resumeLink,
          cover_letter: coverLetter,
          status: "pending",
        },
      ])

      if (error) throw error

      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully",
      })

      setJob({
        ...job,
        has_applied: true,
      })
    } catch (error) {
      console.error("Error applying for job:", error)
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      })
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Job not found</h2>
        <p className="text-muted-foreground mt-2">The job you're looking for doesn't exist or has been removed</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard/jobs")}>
          Browse Jobs
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="capitalize">{job.job_type.replace("-", " ")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSaveJob}
                className={job.is_saved ? "text-yellow-500" : ""}
              >
                <BookmarkPlus className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Salary and Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Salary Range</h3>
              <p className="text-lg font-semibold">
                {job.salary_min && job.salary_max
                  ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                  : "Not specified"}
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Experience Required</h3>
              <p className="text-lg font-semibold">
                {job.experience_min && job.experience_max
                  ? `${job.experience_min} - ${job.experience_max} years`
                  : job.experience_min
                    ? `${job.experience_min}+ years`
                    : "Not specified"}
              </p>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Job Description</h3>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{job.description}</p>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Requirements</h3>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{job.requirements}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Form */}
      {user?.role === "job_seeker" && !job.has_applied && (
        <Card>
          <CardHeader>
            <CardTitle>Apply for this position</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleApply} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume">Resume Link</Label>
                <Input
                  id="resume"
                  placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                  value={resumeLink}
                  onChange={(e) => setResumeLink(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverLetter">Cover Letter</Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Write a brief cover letter explaining why you're a good fit for this role"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  required
                />
              </div>
              <Button type="submit" disabled={applying}>
                {applying ? "Submitting Application..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Already Applied Notice */}
      {user?.role === "job_seeker" && job.has_applied && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center flex-col text-center py-4">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Application Submitted</h3>
              <p className="text-muted-foreground">
                You have already applied for this position. You can check the status in your applications.
              </p>
              <Button className="mt-4" variant="outline" onClick={() => router.push("/dashboard/applications")}>
                View My Applications
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
