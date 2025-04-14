import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Briefcase, Search, Building2, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            Blot<span className="text-yellow-300">Jobs</span>
          </Link>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-white text-primary hover:bg-gray-100">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Find Your Dream Job Today</h1>
              <p className="text-xl mb-8">
                Connect with top employers and discover opportunities that match your skills and aspirations.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col md:flex-row gap-4">
                <div className="flex-grow relative">
                  <Search className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  Search Jobs
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose BlotJobs?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Thousands of Jobs</h3>
                <p className="text-gray-600">
                  Access thousands of job listings from top companies across various industries.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Top Employers</h3>
                <p className="text-gray-600">
                  Connect with leading companies looking for talented professionals like you.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
                <p className="text-gray-600">
                  Find opportunities that align with your career goals and help you grow professionally.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Whether you're looking for your next career move or seeking top talent for your company, we've got you
              covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register?role=job_seeker">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  Find Jobs
                </Button>
              </Link>
              <Link href="/auth/register?role=employer">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BlotJobs</h3>
              <p className="text-gray-300">Connecting talent with opportunity.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/jobs" className="text-gray-300 hover:text-white">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/companies" className="text-gray-300 hover:text-white">
                    Companies
                  </Link>
                </li>
                <li>
                  <Link href="/career-advice" className="text-gray-300 hover:text-white">
                    Career Advice
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/post-job" className="text-gray-300 hover:text-white">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-300 hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="text-gray-300 hover:text-white">
                    Resources
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-300 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} BlotJobs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
