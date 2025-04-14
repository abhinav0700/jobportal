"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabaseBrowser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

export default function PostJobPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    job_type: "full-time",
    description: "",
    requirements: "",
    salary_min: "",
    salary_max: "",
    experience_min: "",
    experience_max: "",
    is_remote: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to post a job",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabaseBrowser.from("jobs").insert([
        {
          title: formData.title,
          company: formData.company,
          location: formData.location,
          job_type: formData.job_type,
          description: formData.description,
          requirements: formData.requirements,
          salary_min: formData.salary_min ? Number.parseInt(formData.salary_min) : null,
          salary_max: formData.salary_max ? Number.parseInt(formData.salary_max) : null,
          experience_min: formData.experience_min ? Number.parseInt(formData.experience_min) : null,
          experience_max: formData.experience_max ? Number.parseInt(formData.experience_max) : null,
          is_remote: formData.is_remote,
          posted_by: user.id,
          is_active: true,
        },
      ])

      if (error) throw error

      toast({
        title: "Success",
        description: "Job posted successfully",
      })

      router.push("/dashboard/manage-jobs")
    } catch (error) {
      console.error("Error posting job:", error)
      toast({
        title: "Error",
        description: "Failed to post job",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Post a New Job</h1>
        <p className="text-muted-foreground">Create a new job listing to find the perfect candidate</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Fill in the details of the job you want to post</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Frontend Developer"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="e.g. Acme Inc."
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g. New York, NY"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_type">Job Type</Label>
                <Select value={formData.job_type} onValueChange={(value) => handleSelectChange("job_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salary_min">Minimum Salary (USD)</Label>
                <Input
                  id="salary_min"
                  name="salary_min"
                  type="number"
                  placeholder="e.g. 50000"
                  value={formData.salary_min}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary_max">Maximum Salary (USD)</Label>
                <Input
                  id="salary_max"
                  name="salary_max"
                  type="number"
                  placeholder="e.g. 80000"
                  value={formData.salary_max}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="experience_min">Minimum Experience (years)</Label>
                <Input
                  id="experience_min"
                  name="experience_min"
                  type="number"
                  placeholder="e.g. 2"
                  value={formData.experience_min}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience_max">Maximum Experience (years)</Label>
                <Input
                  id="experience_max"
                  name="experience_max"
                  type="number"
                  placeholder="e.g. 5"
                  value={formData.experience_max}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_remote"
                  checked={formData.is_remote}
                  onCheckedChange={(checked) => handleSwitchChange("is_remote", checked)}
                />
                <Label htmlFor="is_remote">Remote Position</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the job role, responsibilities, and benefits"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                placeholder="List the skills, qualifications, and experience required"
                value={formData.requirements}
                onChange={handleChange}
                rows={6}
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting Job..." : "Post Job"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
