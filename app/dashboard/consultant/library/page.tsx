"use client"

import { useState, useEffect } from "react"
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/app/actions/library"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  ShoppingBag, 
  TrendingUp, 
  Users,
  BookOpen,
  Video,
  FileDigit,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ConsultantLibraryDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isLaunchOpen, setIsLaunchOpen] = useState(false)
  
  // Form State
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    type: "book" as "book" | "course" | "digital_asset",
    price: "",
    thumbnailUrl: "",
    fileUrl: "",
    isPublished: true
  })

  useEffect(() => {
    if (user) {
      fetchProducts()
    }
  }, [user])

  async function fetchProducts() {
    setLoading(true)
    const result = await getProducts({ consultantId: user?.uid })
    if (result.success) {
      setProducts(result.data)
    }
    setLoading(false)
  }

  async function handleLaunch() {
    if (!newProduct.title || !newProduct.price) {
      toast.error("Title and Price are required")
      return
    }

    const priceInCents = Math.round(parseFloat(newProduct.price) * 100)
    
    const result = await createProduct({
      consultantId: user!.uid,
      title: newProduct.title,
      description: newProduct.description,
      type: newProduct.type,
      price: priceInCents,
      thumbnailUrl: newProduct.thumbnailUrl,
      fileUrl: newProduct.fileUrl,
      isPublished: newProduct.isPublished
    })

    if (result.success) {
      toast.success(`${newProduct.title} launched successfully!`)
      setIsLaunchOpen(false)
      fetchProducts()
      setNewProduct({
        title: "",
        description: "",
        type: "book",
        price: "",
        thumbnailUrl: "",
        fileUrl: "",
        isPublished: true
      })
    } else {
      toast.error("Failed to launch product")
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this product?")) {
      const result = await deleteProduct(id)
      if (result.success) {
        toast.success("Product deleted")
        fetchProducts()
      }
    }
  }

  const stats = [
    { label: "Total Revenue", value: `$${(products.reduce((acc, p) => acc + (p.salesCount * p.price), 0) / 100).toFixed(2)}`, icon: TrendingUp, color: "text-blue-600" },
    { label: "Products Sold", value: products.reduce((acc, p) => acc + p.salesCount, 0), icon: ShoppingBag, color: "text-green-600" },
    { label: "Avg. Rating", value: "4.9", icon: Users, color: "text-purple-600" },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">My Library</h1>
          <p className="text-gray-500 font-medium">Manage and publish your digital knowledge assets.</p>
        </div>
        
        <Dialog open={isLaunchOpen} onOpenChange={setIsLaunchOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-2xl shadow-xl shadow-blue-200 font-bold flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Launch New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-3xl border-none p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
               <DialogTitle className="text-2xl font-black mb-2">Launch New Product</DialogTitle>
               <DialogDescription className="text-white/70 font-medium">Ready to share your expertise? Fill in the details to publish your resource.</DialogDescription>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-gray-700">Product Title</label>
                    <Input 
                      placeholder="e.g. Masterclass in Business Strategy" 
                      className="rounded-xl border-gray-100 bg-gray-50/50"
                      value={newProduct.title}
                      onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-bold text-gray-700">Type</label>
                      <Select value={newProduct.type} onValueChange={(val: any) => setNewProduct({...newProduct, type: val})}>
                        <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50 h-10">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="book">E-Book</SelectItem>
                          <SelectItem value="course">Video Course</SelectItem>
                          <SelectItem value="digital_asset">Digital Asset</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-bold text-gray-700">Price (USD)</label>
                      <Input 
                        type="number" 
                        placeholder="29.99" 
                        className="rounded-xl border-gray-100 bg-gray-50/50"
                        value={newProduct.price}
                        onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-gray-700">Description</label>
                    <Textarea 
                      placeholder="What makes this product special?" 
                      className="rounded-xl border-gray-100 bg-gray-50/50 min-h-[120px]"
                      value={newProduct.description}
                      onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-gray-700">Thumbnail URL</label>
                    <Input 
                      placeholder="https://..." 
                      className="rounded-xl border-gray-100 bg-gray-50/50"
                      value={newProduct.thumbnailUrl}
                      onChange={e => setNewProduct({...newProduct, thumbnailUrl: e.target.value})}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-gray-700">Digital Asset Link (Access File)</label>
                    <Input 
                      placeholder="Cloudinary link or Google Drive" 
                      className="rounded-xl border-gray-100 bg-gray-50/50"
                      value={newProduct.fileUrl}
                      onChange={e => setNewProduct({...newProduct, fileUrl: e.target.value})}
                    />
                  </div>
                </div>
            </div>
            <DialogFooter className="p-8 bg-gray-50 border-t border-gray-100">
               <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setIsLaunchOpen(false)}>Cancel</Button>
               <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-10 font-bold" onClick={handleLaunch}>Launch Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, i) => (
          <Card key={i} className="rounded-3xl border-none shadow-sm bg-white overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl bg-gray-50 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Products List */}
      <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-50 p-6">
          <CardTitle className="text-xl font-black">All Assets</CardTitle>
          <CardDescription>View, edit, and keep track of your published resources.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
             <div className="py-20 text-center animate-pulse">
                <p className="font-bold text-gray-400">Loading your assets...</p>
             </div>
          ) : products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product: any) => (
                <div key={product.id} className="flex flex-col md:flex-row items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50/50 transition-all group">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="h-16 w-16 rounded-xl bg-blue-100 flex items-center justify-center overflow-hidden shrink-0 border border-white shadow-sm">
                      {product.thumbnailUrl ? (
                         <img src={product.thumbnailUrl} className="h-full w-full object-cover" />
                      ) : (
                         <div className="bg-blue-600 w-full h-full flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-white/50" />
                         </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">{product.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase py-0 border-gray-200 text-gray-400">{product.type}</Badge>
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                          <ShoppingBag className="h-3 w-3" />
                          {product.salesCount} Sales
                        </span>
                        {product.isPublished ? (
                          <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Live
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link href={`/library/${product.id}`} className="flex-1 md:flex-none">
                      <Button variant="ghost" size="sm" className="w-full md:w-auto h-10 px-4 rounded-xl font-bold flex items-center gap-2 text-gray-500 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-gray-400 hover:text-blue-600">
                       <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-gray-400 hover:text-red-600" onClick={() => handleDelete(product.id)}>
                       <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
               <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileDigit className="h-8 w-8 text-gray-300" />
               </div>
               <p className="text-gray-500 font-bold">You haven't launched any products yet.</p>
               <p className="text-sm text-gray-400 mb-6 font-medium">Start monetizing your knowledge today.</p>
               <Button variant="outline" className="rounded-xl border-gray-200 h-10 font-bold" onClick={() => setIsLaunchOpen(true)}>Launch First Product</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
