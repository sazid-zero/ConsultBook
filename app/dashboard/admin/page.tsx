"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar, User, FileText, CheckCircle, XCircle, Eye, LogOut, ExternalLink, Database } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Certificate {
  id: string
  filename: string
  originalName: string
  url: string
}

interface ConsultantApplication {
  uid: string
  name: string
  email: string
  phone: string
  specialty: string
  address: string
  qualifications: string
  certificates: Certificate[]
  profilePhoto?: string
  createdAt: string
  approved: boolean
}

export default function AdminDashboard() {
  const router = useRouter()
  const [applications, setApplications] = useState<ConsultantApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<ConsultantApplication | null>(null)

  useEffect(() => {
    // Check if admin is logged in
    const adminSession = localStorage.getItem("adminSession")
    if (!adminSession) {
      router.push("/login")
      return
    }

    fetchConsultantApplications()
  }, [router])

  const fetchConsultantApplications = async () => {
    try {
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("role", "==", "consultant"))
      const querySnapshot = await getDocs(q)

      const applicationsList: ConsultantApplication[] = []
      querySnapshot.forEach((doc) => {
        applicationsList.push({ ...doc.data() } as ConsultantApplication)
      })

      setApplications(applicationsList)
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast.error("Failed to fetch applications")
    } finally {
      setLoading(false)
    }
  }

  const handleApproveApplication = async (uid: string) => {
    try {
      await setDoc(
        doc(db, "users", uid),
        {
          approved: true,
          approvedAt: new Date().toISOString(),
        },
        { merge: true },
      )

      setApplications(applications.map((app) => (app.uid === uid ? { ...app, approved: true } : app)))
      toast.success("Consultant Approved", {
        description: "The consultant can now log in and provide services."
      })
    } catch (error) {
      console.error("Error approving application:", error)
      toast.error("Approval Failed")
    }
  }

  const handleRejectApplication = async (uid: string) => {
    try {
      await deleteDoc(doc(db, "users", uid))
      setApplications(applications.filter((app) => app.uid !== uid))
      toast.success("Consultant Rejected", {
        description: "The application has been removed."
      })
    } catch (error) {
      console.error("Error rejecting application:", error)
      toast.error("Rejection Failed")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminSession")
    toast.success("Logged out successfully")
    router.push("/")
  }

  const pendingApplications = applications.filter((app) => !app.approved)
  const approvedConsultants = applications.filter((app) => app.approved)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">ConsultBook Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Admin Panel</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Logout Confirmation</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to log out of the admin panel?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingApplications.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Consultants</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedConsultants.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Applications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Consultant Applications</CardTitle>
            <CardDescription>Review and approve consultant registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingApplications.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending applications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApplications.map((application) => (
                  <div key={application.uid} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{application.name}</h4>
                        <p className="text-sm text-gray-600">{application.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{application.specialty}</Badge>
                          <span className="text-sm text-gray-500">{application.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedApplication(application)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Review Application
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Consultant Application Review</DialogTitle>
                            <DialogDescription>Detailed information for   {selectedApplication?.name}</DialogDescription>
                          </DialogHeader>
                          {selectedApplication && (
                            <div className="space-y-6 pt-4">
                              <div className="flex items-center space-x-4">
                                {selectedApplication.profilePhoto ? (
                                  <img
                                    src={selectedApplication.profilePhoto}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                                  />
                                ) : (
                                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <h3 className="text-xl font-bold">{selectedApplication.name}</h3>
                                  <Badge>{selectedApplication.specialty}</Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                                <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                                  <p className="text-sm text-gray-900 font-medium">{selectedApplication.email}</p>
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                                  <p className="text-sm text-gray-900 font-medium">{selectedApplication.phone}</p>
                                </div>
                                <div className="col-span-2">
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</label>
                                  <p className="text-sm text-gray-900 font-medium">{selectedApplication.address}</p>
                                </div>
                              </div>

                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Qualifications</label>
                                <div className="mt-1 p-3 bg-blue-50 text-blue-900 text-sm rounded-md italic">
                                  "{selectedApplication.qualifications}"
                                </div>
                              </div>

                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Uploaded Certificates</label>
                                <div className="grid grid-cols-1 gap-3">
                                  {selectedApplication.certificates?.map((cert) => (
                                    <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                                      <div className="flex items-center space-x-3">
                                        <FileText className="h-5 w-5 text-blue-500" />
                                        <span className="text-sm font-medium truncate max-w-[200px]">{cert.originalName}</span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => window.open(cert.url, "_blank")}
                                      >
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        View File
                                      </Button>
                                    </div>
                                  )) || <p className="text-sm text-gray-500 italic">No certificates found</p>}
                                </div>
                              </div>
                              
                              <DialogFooter className="gap-2 sm:gap-0 border-t pt-4 mt-6">
                                <Button
                                  variant="destructive"
                                  onClick={() => handleRejectApplication(selectedApplication.uid)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                                <Button
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleApproveApplication(selectedApplication.uid)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve Consultant
                                </Button>
                              </DialogFooter>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved Consultants */}
        <Card>
          <CardHeader>
            <CardTitle>Approved Consultants</CardTitle>
            <CardDescription>Currently active consultants on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {approvedConsultants.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No approved consultants yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedConsultants.map((consultant) => (
                  <div key={consultant.uid} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div className="flex items-center space-x-4">
                      {consultant.profilePhoto ? (
                        <img src={consultant.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold">{consultant.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-[10px]">{consultant.specialty}</Badge>
                          <span className="text-[10px] text-gray-500">Active</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500">
                        Since {new Date(consultant.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
