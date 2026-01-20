"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Calendar, User, FileText, CheckCircle, XCircle, Eye, LogOut, ExternalLink, Database, Award } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { ConsultantProfile, Qualification } from "@/lib/types"

interface ConsultantApplication {
  uid: string
  name: string
  email: string
  phone: string
  consultantType: string
  specializations: string[]
  address: string
  qualifications: Qualification[]
  profilePhoto?: string
  createdAt: string
  approved: boolean
}

export default function AdminDashboard() {
  const router = useRouter()
  const [applications, setApplications] = useState<ConsultantApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<ConsultantApplication | null>(null)
  const [activeTab, setActiveTab] = useState("applications")

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

  const handleApproveQualification = async (uid: string, qualId: string) => {
    try {
      const userRef = doc(db, "users", uid)
      const userSnap = await getDocs(query(collection(db, "users"), where("uid", "==", uid)))
      
      if (!userSnap.empty) {
        const userData = userSnap.docs[0].data() as ConsultantProfile
        const updatedQuals = userData.qualifications.map(q =>
          q.id === qualId ? { ...q, status: "approved" as const, reviewedAt: new Date().toISOString() } : q
        )

        await setDoc(userRef, { qualifications: updatedQuals }, { merge: true })
        
        setApplications(
          applications.map(app =>
            app.uid === uid
              ? {
                  ...app,
                  qualifications: app.qualifications.map(q =>
                    q.id === qualId ? { ...q, status: "approved" as const } : q
                  ),
                }
              : app
          )
        )

        toast.success("Qualification Approved", {
          description: "Qualification has been approved and is now visible on the consultant's profile."
        })
      }
    } catch (error) {
      console.error("Error approving qualification:", error)
      toast.error("Failed to approve qualification")
    }
  }

  const handleRejectQualification = async (uid: string, qualId: string, reason: string) => {
    try {
      const userRef = doc(db, "users", uid)
      const userSnap = await getDocs(query(collection(db, "users"), where("uid", "==", uid)))
      
      if (!userSnap.empty) {
        const userData = userSnap.docs[0].data() as ConsultantProfile
        const updatedQuals = userData.qualifications.map(q =>
          q.id === qualId 
            ? { 
                ...q, 
                status: "rejected" as const, 
                reviewedAt: new Date().toISOString(),
                rejectionReason: reason 
              } 
            : q
        )

        await setDoc(userRef, { qualifications: updatedQuals }, { merge: true })
        
        setApplications(
          applications.map(app =>
            app.uid === uid
              ? {
                  ...app,
                  qualifications: app.qualifications.map(q =>
                    q.id === qualId ? { ...q, status: "rejected" as const } : q
                  ),
                }
              : app
          )
        )

        toast.success("Qualification Rejected", {
          description: "The consultant has been notified about the rejection."
        })
      }
    } catch (error) {
      console.error("Error rejecting qualification:", error)
      toast.error("Failed to reject qualification")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminSession")
    toast.success("Logged out successfully")
    router.push("/")
  }

  const pendingApplications = applications.filter((app) => !app.approved)
  const approvedConsultants = applications.filter((app) => app.approved)
  
  // Get qualifications pending review
  const pendingQualifications = applications.flatMap(app => {
    const quals = app.qualifications
    if (!Array.isArray(quals)) return []
    return quals
      .filter(q => q.status === "pending")
      .map(q => ({ ...q, consultantUid: app.uid, consultantName: app.name, consultantEmail: app.email }))
  })

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Pending Qualifications</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{pendingQualifications.length}</div>
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">
              Pending Applications <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">{pendingApplications.length}</span>
            </TabsTrigger>
            <TabsTrigger value="qualifications">
              Qualifications <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{pendingQualifications.length}</span>
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{approvedConsultants.length}</span>
            </TabsTrigger>
          </TabsList>

          {/* Pending Applications Tab */}
          <TabsContent value="applications" className="mt-6">
            <Card>
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
                              <Badge variant="outline">{application.consultantType}</Badge>
                              <span className="text-sm text-gray-500">{application.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedApplication(application)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Consultant Application Review</DialogTitle>
                                <DialogDescription>Detailed information for {selectedApplication?.name}</DialogDescription>
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
                                      <Badge>{selectedApplication.consultantType}</Badge>
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
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Specializations</label>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedApplication.specializations.map((spec, idx) => (
                                        <Badge key={idx} variant="outline">{spec}</Badge>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Qualifications for Review</label>
                                    <div className="grid grid-cols-1 gap-3">
                                      {Array.isArray(selectedApplication.qualifications) && selectedApplication.qualifications.length > 0 ? (
                                        selectedApplication.qualifications.map((qual) => (
                                          <div key={qual.id} className="flex items-start justify-between p-3 border rounded-lg bg-white shadow-sm">
                                            <div className="flex-1">
                                              <p className="font-medium">{qual.name}</p>
                                              <Badge className={qual.status === "pending" ? "bg-yellow-100 text-yellow-800" : qual.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                                {qual.status}
                                              </Badge>
                                              {qual.certificateUrl && <p className="text-xs text-gray-500 mt-1">{qual.certificateUrl}</p>}
                                            </div>
                                            <a
                                              href={qual.certificateUrl || "#"}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className={`ml-2 px-3 py-1.5 rounded text-sm font-medium inline-flex items-center gap-1 ${
                                                qual.certificateUrl
                                                  ? "text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer border border-blue-200"
                                                  : "text-gray-400 bg-gray-50 cursor-not-allowed opacity-50 border border-gray-200"
                                              }`}
                                              onClick={(e) => {
                                                if (!qual.certificateUrl) {
                                                  e.preventDefault()
                                                }
                                              }}
                                            >
                                              <ExternalLink className="h-4 w-4" />
                                              View Cert
                                            </a>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-sm text-gray-500 italic">No qualifications found</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <DialogFooter className="gap-2 sm:gap-0 border-t pt-4 mt-6">
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleRejectApplication(selectedApplication.uid)}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject Application
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
          </TabsContent>

          {/* Qualifications Tab */}
          <TabsContent value="qualifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Qualifications & Certifications Review</CardTitle>
                <CardDescription>Review and approve consultant qualifications</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingQualifications.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No pending qualifications to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingQualifications.map((qual) => (
                      <div key={`${qual.consultantUid}-${qual.id}`} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Award className="h-5 w-5 text-purple-600" />
                            <div>
                              <h4 className="font-semibold">{qual.name}</h4>
                              <p className="text-sm text-gray-600">{qual.consultantName} ({qual.consultantEmail})</p>
                            </div>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
                        </div>
                        <div className="flex space-x-2">
                          <a
                            href={qual.certificateUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-3 py-1.5 rounded text-sm font-medium inline-flex items-center gap-1 ${
                              qual.certificateUrl
                                ? "text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer border border-blue-200"
                                : "text-gray-400 bg-gray-50 cursor-not-allowed opacity-50 border border-gray-200"
                            }`}
                            onClick={(e) => {
                              if (!qual.certificateUrl) {
                                e.preventDefault()
                              }
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Certificate
                          </a>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const reason = prompt("Enter rejection reason:")
                              if (reason) {
                                handleRejectQualification(qual.consultantUid, qual.id, reason)
                              }
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                            onClick={() => handleApproveQualification(qual.consultantUid, qual.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approved Consultants Tab */}
          <TabsContent value="approved" className="mt-6">
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
                              <Badge variant="secondary" className="text-[10px]">{consultant.consultantType}</Badge>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

