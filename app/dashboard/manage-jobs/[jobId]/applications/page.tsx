"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabaseBrowser } from "@/lib/supabase"
import { User, Mail, Phone, FileText, Briefcase, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useParams } from "next/navigation"

type UserInfo = {
  id: string
  name: string
  email: string
  phone: string
  resume_url?: string
}

type JobInfo = {
  id: string
  title: string
  company: string
}

type Applicant = {
  id: string
  user: UserInfo
  job: JobInfo
  status: "pending" | "reviewed" | "shortlisted" | "rejected"
  created_at: string
  resume_link?: string
  cover_letter?: string
}

export default function JobApplications() {
  const { user } = useAuth()
  const { jobId } = useParams()
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Applicant["status"] | "all">("all")
  const [job, setJob] = useState<JobInfo | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !jobId) {
        console.log("Missing user or jobId:", { user, jobId })
        return
      }

      try {
        // Get job details
        console.log("Fetching job details for jobId:", jobId)
        const { data: jobData, error: jobError } = await supabaseBrowser
          .from("jobs")
          .select("id, title, company")
          .eq("id", jobId)
          .eq("posted_by", user.id)
          .single()

        if (jobError) {
          console.error("Error fetching job:", {
            message: jobError.message,
            details: jobError.details,
            hint: jobError.hint,
            code: jobError.code
          })
          throw jobError
        }
        if (!jobData) {
          console.error("Job not found or not authorized")
          return
        }

        console.log("Job data found:", jobData)
        setJob(jobData)

        // Get applications for this job
        console.log("Fetching applications for jobId:", jobId)
        try {
          const { data: applicationsData, error: applicationsError } = await supabaseBrowser
            .from("applications")
            .select("*")
            .eq("job_id", jobId)

          if (applicationsError) {
            console.error("Supabase error:", applicationsError)
            setApplicants([])
            setLoading(false)
            return
          }

          console.log("Applications data:", applicationsData)

          if (!applicationsData || applicationsData.length === 0) {
            console.log("No applications found")
            setApplicants([])
            setLoading(false)
            return
          }

          // Get user details for all applications
          const userIds = applicationsData.map(app => app.user_id)
          console.log("User IDs to fetch:", userIds)

          const { data: usersData, error: usersError } = await supabaseBrowser
            .from("users")
            .select("*")
            .in("id", userIds)

          if (usersError) {
            console.error("Error fetching users:", usersError)
            setApplicants([])
            setLoading(false)
            return
          }

          console.log("Users data:", usersData)

          // Combine the data
          const combinedData: Applicant[] = applicationsData.map(app => {
            const user = usersData?.find(u => u.id === app.user_id)
            return {
              id: app.id,
              status: "pending" as const,
              created_at: app.created_at,
              resume_link: app.resume_link,
              cover_letter: app.cover_letter,
              user: {
                id: user?.id || "",
                name: user?.name || "Unknown User",
                email: user?.email || "",
                phone: user?.phone || "",
                resume_url: app.resume_link || ""
              },
              job: {
                id: app.job_id,
                title: jobData.title,
                company: jobData.company
              }
            }
          })

          console.log("Combined data:", combinedData)
          setApplicants(combinedData)
        } catch (error) {
          console.error("Error in applications fetch:", error)
          setApplicants([])
        } finally {
          setLoading(false)
        }
      } catch (error: any) {
        console.error("Error in fetchData:", {
          message: error?.message || "Unknown error",
          details: error?.details || "No details available",
          hint: error?.hint || "No hint available",
          code: error?.code || "No error code",
          error: error
        })
      }
    }

    fetchData()
  }, [user, jobId])

  const updateApplicationStatus = async (applicationId: string, status: Applicant["status"]) => {
    try {
      const { error } = await supabaseBrowser
        .from("applications")
        .update({ status })
        .eq("id", applicationId)

      if (error) throw error

      setApplicants(applicants.map(applicant => 
        applicant.id === applicationId 
          ? { ...applicant, status }
          : applicant
      ))
    } catch (error) {
      console.error("Error updating application status:", error)
    }
  }

  const filteredApplicants = filter === "all" 
    ? applicants 
    : applicants.filter(applicant => applicant.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-2xl font-bold">Job Not Found</h2>
        <p className="text-muted-foreground">The job you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button asChild>
          <Link href="/dashboard/manage-jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications for {job.title}</h1>
          <p className="text-muted-foreground">
            Review and manage applications for this job listing
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/manage-jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Pending
        </Button>
        <Button
          variant={filter === "shortlisted" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("shortlisted")}
        >
          Shortlisted
        </Button>
        <Button
          variant={filter === "rejected" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("rejected")}
        >
          Rejected
        </Button>
      </div>

      {filteredApplicants.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No applications found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {filter === "all" 
                  ? "No one has applied for this job yet."
                  : `No ${filter} applications found.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredApplicants.map((applicant) => (
            <Card key={applicant.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{applicant.user.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Applied for {applicant.job.title}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      applicant.status === "shortlisted" ? "default" :
                      applicant.status === "rejected" ? "destructive" :
                      "secondary"
                    }>
                      {applicant.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant={applicant.status === "shortlisted" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateApplicationStatus(applicant.id, "shortlisted")}
                      >
                        Shortlist
                      </Button>
                      <Button
                        variant={applicant.status === "rejected" ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => updateApplicationStatus(applicant.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{applicant.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{applicant.user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {applicant.resume_link ? (
                      <Link 
                        href={applicant.resume_link}
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        View Resume
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">No resume available</span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Applied on {new Date(applicant.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 