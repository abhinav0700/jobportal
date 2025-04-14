"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Briefcase, Building2, LogOut, Menu, Search, User, BookmarkPlus, FileText, Home, Bell } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isEmployer = user.role === "employer"
  const isJobSeeker = user.role === "job_seeker"
  const isAdmin = user.role === "admin"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col h-full">
                  <div className="py-4 border-b">
                    <Link href="/" className="text-xl font-bold text-primary">
                      Blot<span className="text-yellow-500">Jobs</span>
                    </Link>
                  </div>
                  <nav className="flex-1 py-4">
                    <ul className="space-y-1">
                      <li>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                        >
                          <Home className="h-5 w-5" />
                          Dashboard
                        </Link>
                      </li>
                      {isJobSeeker && (
                        <>
                          <li>
                            <Link
                              href="/dashboard/jobs"
                              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                            >
                              <Briefcase className="h-5 w-5" />
                              Browse Jobs
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/dashboard/saved-jobs"
                              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                            >
                              <BookmarkPlus className="h-5 w-5" />
                              Saved Jobs
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/dashboard/applications"
                              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                            >
                              <FileText className="h-5 w-5" />
                              Applications
                            </Link>
                          </li>
                        </>
                      )}
                      {isEmployer && (
                        <>
                          <li>
                            <Link
                              href="/dashboard/post-job"
                              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                            >
                              <Briefcase className="h-5 w-5" />
                              Post a Job
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/dashboard/manage-jobs"
                              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                            >
                              <Building2 className="h-5 w-5" />
                              Manage Jobs
                            </Link>
                          </li>
                        </>
                      )}
                      {isAdmin && (
                        <>
                          <li>
                            <Link
                              href="/dashboard/admin/users"
                              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                            >
                              <User className="h-5 w-5" />
                              Manage Users
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/dashboard/admin/jobs"
                              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                            >
                              <Briefcase className="h-5 w-5" />
                              Manage Jobs
                            </Link>
                          </li>
                        </>
                      )}
                    </ul>
                  </nav>
                  <div className="py-4 border-t">
                    <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/" className="text-xl font-bold text-primary">
              Blot<span className="text-yellow-500">Jobs</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user.role.replace("_", " ")}</div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Desktop Only */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav>
                <ul className="space-y-1">
                  <li>
                    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
                      <Home className="h-5 w-5" />
                      Dashboard
                    </Link>
                  </li>
                  {isJobSeeker && (
                    <>
                      <li>
                        <Link
                          href="/dashboard/jobs"
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                        >
                          <Briefcase className="h-5 w-5" />
                          Browse Jobs
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/dashboard/saved-jobs"
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                        >
                          <BookmarkPlus className="h-5 w-5" />
                          Saved Jobs
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/dashboard/applications"
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                        >
                          <FileText className="h-5 w-5" />
                          Applications
                        </Link>
                      </li>
                    </>
                  )}
                  {isEmployer && (
                    <>
                      <li>
                        <Link
                          href="/dashboard/post-job"
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                        >
                          <Briefcase className="h-5 w-5" />
                          Post a Job
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/dashboard/manage-jobs"
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                        >
                          <Building2 className="h-5 w-5" />
                          Manage Jobs
                        </Link>
                      </li>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <li>
                        <Link
                          href="/dashboard/admin/users"
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                        >
                          <User className="h-5 w-5" />
                          Manage Users
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/dashboard/admin/jobs"
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                        >
                          <Briefcase className="h-5 w-5" />
                          Manage Jobs
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </nav>
              <div className="mt-6 pt-6 border-t">
                <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
