"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  MapPin, 
  Video, 
  Calendar, 
  Clock, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2,
  ExternalLink,
  Search,
  BookOpen,
  X,
  Upload
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { getWorkshops, getWorkshop, createWorkshop, updateWorkshop, deleteWorkshop } from "@/app/actions/workshops"
import { toast } from "sonner"
import Link from "next/link"

export default function ConsultantWorkshopsPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [workshops, setWorkshops] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDataLoading, setIsDataLoading] = useState(true)
  
  // Workshop Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedWorkshop, setSelectedWorkshop] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [workshopToDelete, setWorkshopToDelete] = useState<string | null>(null)
  
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    duration: 60,
    price: 0,
    mode: "online",
    location: "",
    maxParticipants: 20,
    thumbnailUrl: ""
  })

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "consultant")) {
      router.push("/login")
      return
    }

    if (user) {
      loadWorkshops()
    }
  }, [user, userData, loading, router])

  const loadWorkshops = async () => {
    setIsDataLoading(true)
    try {
      const result = await getWorkshops({ consultantId: user!.uid })
      if (result.success) {
        setWorkshops(result.data || [])
      }
    } catch (error) {
      console.error("Error loading workshops:", error)
      toast.error("Failed to load workshops")
    } finally {
      setIsDataLoading(false)
      setIsLoading(false)
    }
  }

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append("file", file)
    
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "duj3kbfhm"
    
    if (!uploadPreset) {
      console.error("Cloudinary upload preset not configured")
      return null
    }
    
    formData.append("upload_preset", uploadPreset)
    formData.append("folder", `consultbook/${user?.uid}/workshops`)

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error?.message || "Upload failed")
      
      return data.secure_url
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error)
      toast.error("Failed to upload image")
      return null
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      if (url) {
        setFormData(prev => ({ ...prev, thumbnailUrl: url }))
        toast.success("Image uploaded successfully")
      }
    } finally {
      setUploading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.title || !formData.description || !formData.startDate || !formData.startTime) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      // Create date object from date and time
      const dateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      
      const result = await createWorkshop({
        consultantId: user!.uid,
        title: formData.title,
        description: formData.description,
        startDate: dateTime,
        duration: Number(formData.duration),
        price: Number(formData.price) * 100, // Convert to cents
        mode: formData.mode as "online" | "offline",
        location: formData.location,
        maxParticipants: Number(formData.maxParticipants),
        thumbnailUrl: formData.thumbnailUrl,
        isPublished: true
      })

      if (result.success) {
        toast.success("Workshop created successfully!")
        setIsCreateOpen(false)
        resetForm()
        loadWorkshops()
      } else {
        toast.error(result.error || "Failed to create workshop")
      }
    } catch (error) {
      console.error("Error creating workshop:", error)
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
     if (!selectedWorkshop) return

     setIsSubmitting(true)
     try {
       const dateTime = new Date(`${formData.startDate}T${formData.startTime}`)
       
       const result = await updateWorkshop(selectedWorkshop.id, {
         title: formData.title,
         description: formData.description,
         startDate: dateTime,
         duration: Number(formData.duration),
         price: Number(formData.price) * 100,
         mode: formData.mode as "online" | "offline",
         location: formData.location,
         maxParticipants: Number(formData.maxParticipants),
         thumbnailUrl: formData.thumbnailUrl,
       })
 
       if (result.success) {
         toast.success("Workshop updated successfully!")
         setIsEditOpen(false)
         resetForm()
         loadWorkshops()
       } else {
         toast.error(result.error || "Failed to update workshop")
       }
     } catch (error) {
       console.error("Error updating workshop:", error)
       toast.error("An error occurred")
     } finally {
       setIsSubmitting(false)
     }
  }

  const confirmDelete = async () => {
    if (!workshopToDelete) return

    setIsSubmitting(true)
    try {
      const result = await deleteWorkshop(workshopToDelete)
      if (result.success) {
        toast.success("Workshop deleted successfully")
        loadWorkshops()
      } else {
        toast.error(result.error || "Failed to delete workshop")
      }
    } catch (error) {
      console.error("Error deleting workshop:", error)
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
      setIsDeleteDialogOpen(false)
      setWorkshopToDelete(null)
    }
  }

  const handleDeleteTrigger = (id: string) => {
    setWorkshopToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const openEdit = (workshop: any) => {
    const date = new Date(workshop.startDate)
    setSelectedWorkshop(workshop)
    setFormData({
      title: workshop.title,
      description: workshop.description,
      startDate: date.toISOString().split('T')[0],
      startTime: date.toTimeString().slice(0, 5),
      duration: workshop.duration,
      price: workshop.price / 100,
      mode: workshop.mode,
      location: workshop.location || "",
      maxParticipants: workshop.maxParticipants || 20,
      thumbnailUrl: workshop.thumbnailUrl || ""
    })
    setIsEditOpen(true)
  }

  const openParticipants = async (workshop: any) => {
    setSelectedWorkshop(workshop)
    setIsParticipantsOpen(true)
    setParticipantsLoading(true)
    
    try {
      const result = await getWorkshop(workshop.id)
      if (result.success && result.data) {
        setParticipants(result.data.registrations || [])
      } else {
        toast.error("Failed to load participants")
      }
    } catch (error) {
      console.error("Error loading participants:", error)
      toast.error("Error loading participants")
    } finally {
      setParticipantsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      startTime: "",
      duration: 60,
      price: 0,
      mode: "online",
      location: "",
      maxParticipants: 20,
      thumbnailUrl: ""
    })
    setSelectedWorkshop(null)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workshops & Sessions</h1>
              <p className="text-gray-500 text-sm mt-1">Manage your workshops, masterclasses, and group sessions</p>
            </div>
            <div className="flex gap-3">
               <Link href="/dashboard/consultant">
                <Button variant="outline">Back to Dashboard</Button>
               </Link>
               <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all hover:scale-105" onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workshop
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Workshop</DialogTitle>
                    <DialogDescription>
                      Set up a new workshop or group session for your clients.
                    </DialogDescription>
                  </DialogHeader>
                    <WorkshopForm 
                    formData={formData} 
                    setFormData={setFormData}
                    onSubmit={handleCreate}
                    isSubmitting={isSubmitting}
                    uploading={uploading}
                    onImageUpload={handleImageUpload}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isDataLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
           </div>
        ) : workshops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((workshop) => (
              <Card key={workshop.id} className="border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
                <div className="relative h-48 bg-gray-900 overflow-hidden">
                   {workshop.thumbnailUrl ? (
                      <img src={workshop.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-900">
                         <Users className="h-12 w-12 text-white/30" />
                      </div>
                   )}
                   <div className="absolute top-3 left-3">
                      <Badge className="bg-white/90 text-gray-900 hover:bg-white backdrop-blur-sm border-none shadow-sm font-bold">
                         {workshop.mode.toUpperCase()}
                      </Badge>
                   </div>
                   <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuItem onClick={() => openEdit(workshop)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openParticipants(workshop)}>
                            <Users className="h-4 w-4 mr-2" />
                            View Participants
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDeleteTrigger(workshop.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Workshop
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                   </div>
                </div>

                <CardContent className="p-5">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{workshop.title}</h3>
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-sm">
                        ${(workshop.price / 100).toFixed(2)}
                      </span>
                   </div>
                   
                   <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
                      {workshop.description}
                   </p>

                   <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                         <Calendar className="h-4 w-4 text-gray-400" />
                         {new Date(workshop.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                         <Clock className="h-4 w-4 text-gray-400" />
                         {new Date(workshop.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {workshop.duration} mins
                      </div>
                      <div className="flex items-center gap-2">
                         <Users className="h-4 w-4 text-gray-400" />
                         {workshop.registrations?.length || 0} / {workshop.maxParticipants} Registered
                      </div>
                   </div>

                   <Link href={`/sessions/${workshop.id}`}>
                      <Button variant="outline" className="w-full border-gray-200 hover:bg-gray-50 text-gray-700">
                         View Public Page
                         <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                   </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
             <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-500" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-1">No Workshops Created</h3>
             <p className="text-gray-500 mb-6 max-w-md mx-auto">Create your first workshop to start accepting registrations for group sessions or masterclasses.</p>
             <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                <Plus className="h-4 w-4 mr-2" />
                Create First Workshop
             </Button>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Workshop</DialogTitle>
            <DialogDescription>Update the details for this workshop.</DialogDescription>
          </DialogHeader>
          <WorkshopForm 
             formData={formData} 
             setFormData={setFormData}
             onSubmit={handleUpdate}
             isSubmitting={isSubmitting}
             isEdit
             uploading={uploading}
             onImageUpload={handleImageUpload}
          />
        </DialogContent>
      </Dialog>
      
      {/* Participants Dialog */}
      <Dialog open={isParticipantsOpen} onOpenChange={setIsParticipantsOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Registered Participants</DialogTitle>
            <DialogDescription>Viewing participants for "{selectedWorkshop?.title}"</DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
             {participantsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading participants...</div>
             ) : participants.length > 0 ? (
                <div className="space-y-4">
                   {participants.map((reg, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                               {reg.client?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                               <p className="font-bold text-gray-900">{reg.client?.name || "Unknown User"}</p>
                               <p className="text-xs text-gray-500">{reg.client?.email}</p>
                            </div>
                         </div>
                         <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                            Paid
                         </Badge>
                      </div>
                   ))}
                   <div className="pt-4 text-center text-xs text-gray-400">
                      Total: {participants.length} participants
                   </div>
                </div>
             ) : (
                <div className="text-center py-8">
                   <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                   <p className="text-gray-500">No participants registered yet.</p>
                </div>
             )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the workshop and all of its associated data including registrations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Workshop"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function WorkshopForm({ formData, setFormData, onSubmit, isSubmitting, isEdit = false, uploading, onImageUpload }: any) {
  return (
    <div className="space-y-4 py-4">
       <div className="space-y-2">
         <Label>Cover Image</Label>
         <div className="relative h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors group">
           {formData.thumbnailUrl ? (
             <>
               <img 
                 src={formData.thumbnailUrl} 
                 alt="Cover" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <p className="text-white font-medium flex items-center">
                   <Upload className="h-4 w-4 mr-2" />
                   Change Image
                 </p>
               </div>
             </>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-gray-400">
               <Upload className="h-8 w-8 mb-2" />
               <p className="text-sm font-medium">Click to upload cover image</p>
             </div>
           )}
           
           <input 
             type="file" 
             accept="image/*"
             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
             onChange={onImageUpload}
             disabled={uploading}
           />
           
           {uploading && (
             <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             </div>
           )}
         </div>
       </div>
       <div className="space-y-2">
         <Label htmlFor="title">Workshop Title</Label>
         <Input 
           id="title" 
           value={formData.title} 
           onChange={(e) => setFormData({...formData, title: e.target.value})}
           placeholder="e.g. Advanced Strategy Masterclass"
         />
       </div>

       <div className="space-y-2">
         <Label htmlFor="description">Description</Label>
         <Textarea 
           id="description" 
           value={formData.description} 
           onChange={(e) => setFormData({...formData, description: e.target.value})}
           placeholder="What will participants learn?"
           rows={4}
         />
       </div>

       <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Date</Label>
            <Input 
              id="startDate" 
              type="date"
              value={formData.startDate} 
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Time</Label>
            <Input 
              id="startTime" 
              type="time"
              value={formData.startTime} 
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
            />
          </div>
       </div>

       <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (mins)</Label>
            <Input 
              id="duration" 
              type="number"
              value={formData.duration} 
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input 
              id="price" 
              type="number"
              value={formData.price} 
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>
       </div>

       <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mode">Mode</Label>
            <Select value={formData.mode} onValueChange={(v) => setFormData({...formData, mode: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online (Virtual)</SelectItem>
                <SelectItem value="offline">Offline (In-Person)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
             <Label htmlFor="maxParticipants">Max Participants</Label>
             <Input 
              id="maxParticipants" 
              type="number"
              value={formData.maxParticipants} 
              onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
            />
          </div>
       </div>

       <div className="space-y-2">
         <Label htmlFor="location">Location / Link</Label>
         <Input 
           id="location" 
           value={formData.location} 
           onChange={(e) => setFormData({...formData, location: e.target.value})}
           placeholder={formData.mode === 'online' ? "Zoom/Meet Link" : "Physical Address"}
         />
       </div>

       <DialogFooter className="pt-4">
          <Button type="submit" disabled={isSubmitting} onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
             {isSubmitting ? "Saving..." : isEdit ? "Update Workshop" : "Create Workshop"}
          </Button>
       </DialogFooter>
    </div>
  )
}
