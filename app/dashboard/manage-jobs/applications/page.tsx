"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabaseBrowser } from "@/lib/supabase"
import { User, Mail, Phone, FileText, Briefcase } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

type UserInfo = {
  id: string
  name: string
  email: string
  phone: string
  resume_url: string
}

type JobInfo = {
  id: string
  title: string
}

type Applicant = {
  id: string
  user: UserInfo
  job: JobInfo
  status: "pending" | "reviewed" | "shortlisted" | "rejected"
  created_at: string
}

export default function ManageApplicants() {
  const { user } = useAuth()
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Applicant["status"] | "all">("all")

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!user) return

      try {
        // First, get all jobs posted by the employer
        const { data: jobsData, error: jobsError } = await supabaseBrowser
          .from("jobs")
          .select("id")
          .eq("posted_by", user.id)

        if (jobsError) throw jobsError

        const jobIds = jobsData?.map(job => job.id) || []

        if (jobIds.length === 0) {
          setApplicants([])
          setLoading(false)
          return
        }

        // Then, get all applications for these jobs
        const { data: applicationsData, error: applicationsError } = await supabaseBrowser
          .from("applications")
          .select(`
            id,
            status,
            created_at,
            user_id,
            job_id
          `)
          .in("job_id", jobIds)
          .order("created_at", { ascending: false })

        if (applicationsError) throw applicationsError

        if (!applicationsData || applicationsData.length === 0) {
          setApplicants([])
          setLoading(false)
          return
        }

        // Get user details for all applications
        const userIds = applicationsData.map(app => app.user_id)
        const { data: usersData, error: usersError } = await supabaseBrowser
          .from("users")
          .select("id, name, email, phone, resume_url")
          .in("id", userIds)

        if (usersError) throw usersError

        // Get job details for all applications
        const { data: jobsDetailsData, error: jobsDetailsError } = await supabaseBrowser
          .from("jobs")
          .select("id, title")
          .in("id", jobIds)

        if (jobsDetailsError) throw jobsDetailsError

        // Combine all the data
        const combinedData = applicationsData.map(application => {
          const user = usersData?.find(u => u.id === application.user_id)
          const job = jobsDetailsData?.find(j => j.id === application.job_id)

          return {
            id: application.id,
            status: application.status,
            created_at: application.created_at,
            user: user || {
              id: "",
              name: "Unknown User",
              email: "",
              phone: "",
              resume_url: ""
            },
            job: job || {
              id: "",
              title: "Unknown Job"
            }
          }
        })

        setApplicants(combinedData)
      } catch (error) {
        console.error("Error fetching applicants:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplicants()
  }, [user])

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manage Applicants</h1>
        <p className="text-muted-foreground">
          Review and manage applications for your job listings
        </p>
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
                  ? "You haven't received any applications for your job listings yet."
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
                    <Link 
                      href={applicant.user.resume_url} 
                      target="_blank"
                      className="text-primary hover:underline"
                    >
                      View Resume
                    </Link>
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