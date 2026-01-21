"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Calendar, User, FileText, CheckCircle, XCircle, Eye, LogOut, ExternalLink, Database, Award, History } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { getAdminDashboardData, approveConsultant, rejectConsultant } from "@/app/actions/admin"

interface ConsultantApplication {
  uid: string
  name: string
  email: string
  phone: string | null
  profilePhoto: string | null
  createdAt: Date
  consultantProfile?: {
      specializations: string[] | null
      city: string | null
      country: string | null
  } | null
  qualifications?: any[]
}

interface RejectedConsultant {
    id: string
    uid: string
    name: string
    email: string
    rejectionReason: string | null
    rejectedAt: Date | null
}

export default function AdminDashboard() {
  const router = useRouter()
  const [pendingApplications, setPendingApplications] = useState<ConsultantApplication[]>([])
  const [approvedConsultants, setApprovedConsultants] = useState<ConsultantApplication[]>([])
  const [rejectedHistory, setRejectedHistory] = useState<RejectedConsultant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<ConsultantApplication | null>(null)
  const [activeTab, setActiveTab] = useState("applications")
  
  // Rejection Dialog State
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [consultantToReject, setConsultantToReject] = useState<string | null>(null)

  useEffect(() => {
    // Check if admin is logged in (Simple check for now, ideally server-side verified)
    const adminSession = localStorage.getItem("adminSession")
    if (!adminSession) {
      router.push("/login")
      return
    }

    loadData()
  }, [router])

  const loadData = async () => {
    setLoading(true)
    try {
        const data = await getAdminDashboardData()
        setPendingApplications(data.pending as any[]) // Type assertion for now due to joins
        setApprovedConsultants(data.approved as any[])
        setRejectedHistory(data.rejected as any[])
    } catch (error) {
        toast.error("Failed to load dashboard data")
    } finally {
        setLoading(false)
    }
  }

  const handleApproveApplication = async (uid: string) => {
    try {
      const result = await approveConsultant(uid)
      if (result.success) {
          toast.success("Consultant Approved", {
            description: "The consultant can now log in and provide services."
          })
          // Optimistic update or reload
          loadData() // Reload seems safer to move lists correctly
          setSelectedApplication(null) // Close dialog
      } else {
          toast.error("Approval Failed")
      }
    } catch (error) {
      console.error("Error approving application:", error)
      toast.error("Approval Failed")
    }
  }

  const openRejectDialog = (uid: string) => {
      setConsultantToReject(uid)
      setRejectionReason("")
      setRejectDialogOpen(true)
  }

  const handleConfirmReject = async () => {
    if (!consultantToReject || !rejectionReason.trim()) return

    try {
        console.log("[Client] Confirming rejection for:", consultantToReject)
        const result = await rejectConsultant(consultantToReject, rejectionReason)
        
        if (result.success) {
            toast.success("Consultant Rejected", {
                description: "The application has been removed and user notified."
            })
            loadData()
            setRejectDialogOpen(false)
            setSelectedApplication(null) // Close review dialog if open
        } else {
            toast.error("Rejection Failed: " + result.error)
        }
    } catch (error) {
      console.error("Error rejecting application:", error)
      toast.error("Rejection Failed (Exception)")
    }
  }

  // Removed handleRejectApplication in favor of Dialog flow

  const handleLogout = () => {
    localStorage.removeItem("adminSession")
    toast.success("Logged out successfully")
    router.push("/")
  }

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
              <CardTitle className="text-sm font-medium">Rejected History</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedHistory.length}</div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Application</DialogTitle>
                    <DialogDescription>
                        Please provide a reason for rejecting this application. This specific reason will be saved in the history.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <textarea 
                        className="w-full min-h-[100px] p-3 border rounded-md text-sm"
                        placeholder="Enter rejection reason..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleConfirmReject}
                        disabled={!rejectionReason.trim()}
                    >
                        Confirm Rejection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">
              Pending Applications <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">{pendingApplications.length}</span>
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{approvedConsultants.length}</span>
            </TabsTrigger>
             <TabsTrigger value="rejected">
              Rejected History <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{rejectedHistory.length}</span>
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
                              {/* <Badge variant="outline">{application.consultantProfile?.specializations?.[0] || 'General'}</Badge> */}
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
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full">
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
                                      <p className="text-sm text-gray-500">Member since {new Date(selectedApplication.createdAt).toLocaleDateString()}</p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                                      <p className="text-sm text-gray-900 font-medium">{selectedApplication.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                                      <p className="text-sm text-gray-900 font-medium">{selectedApplication.phone || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</label>
                                      <p className="text-sm text-gray-900 font-medium">
                                          {[selectedApplication.consultantProfile?.city, selectedApplication.consultantProfile?.country].filter(Boolean).join(", ")}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Specializations</label>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedApplication.consultantProfile?.specializations?.map((spec, idx) => (
                                        <Badge key={idx} variant="outline">{spec}</Badge>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Qualifications</label>
                                    <div className="grid grid-cols-1 gap-3">
                                      {Array.isArray(selectedApplication.qualifications) && selectedApplication.qualifications.length > 0 ? (
                                        selectedApplication.qualifications.map((qual) => (
                                          <div key={qual.id} className="flex items-start justify-between p-3 border rounded-lg bg-white shadow-sm">
                                            <div className="flex-1">
                                              <p className="font-medium">{qual.name}</p>
                                              {qual.certificateUrl && <p className="text-xs text-gray-500 mt-1">{qual.certificateFilename}</p>}
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
                                      onClick={() => openRejectDialog(selectedApplication.uid)}
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
                              {/* <Badge variant="secondary" className="text-[10px]">{consultant.role}</Badge> */}
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

           {/* Rejected History Tab */}
            <TabsContent value="rejected" className="mt-6">
            <Card>
                <CardHeader>
                <CardTitle>Rejected Applications History</CardTitle>
                <CardDescription>Record of previous applications that were not approved</CardDescription>
                </CardHeader>
                <CardContent>
                {rejectedHistory.length === 0 ? (
                    <div className="text-center py-8">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No rejection history</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                    {rejectedHistory.map((rejected) => (
                        <div key={rejected.id} className="flex items-start justify-between p-4 border rounded-lg bg-red-50/50">
                        <div>
                            <h4 className="font-semibold text-gray-900">{rejected.name}</h4>
                            <p className="text-sm text-gray-600">{rejected.email}</p>
                            <p className="text-xs text-red-600 mt-2 font-medium">Reason: {rejected.rejectionReason}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-gray-500">
                            Rejected on {rejected.rejectedAt ? new Date(rejected.rejectedAt).toLocaleDateString() : 'N/A'}
                            </span>
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

