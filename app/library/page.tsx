"use client"

import { useState, useEffect } from "react"
import { getProducts } from "@/app/actions/library"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { 
  BookOpen, 
  Video, 
  FileText, 
  ArrowRight, 
  Star, 
  ShoppingCart,
  Filter,
  Search
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AddToCartButton } from "@/components/cart/AddToCartButton"
import { useAuth } from "@/lib/auth-context"

export default function LibraryPage() {
  const { userData } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      const result = await getProducts({ publishedOnly: true })
      if (result.success) {
        setProducts(result.data || [])
        setFilteredProducts(result.data || [])
      }
      setLoading(false)
    }
    loadProducts()
  }, [])

  useEffect(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.type === selectedCategory)
    }

    // Filter by category (Heuristic)
    if (selectedCategory !== "all") {
      const cat = selectedCategory.toLowerCase()
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(cat) || 
        p.description.toLowerCase().includes(cat) ||
        p.type.toLowerCase().includes(cat)
      )
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      )
    }

    setFilteredProducts(filtered)
  }, [searchQuery, selectedCategory, products])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 pt-16 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Knowledge Hub
            </Badge>
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
              Premium Resources from <span className="text-blue-600">Top Consultants.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Unlock expertise through curated books, deep-dive courses, and specialized digital assets designed to accelerate your growth.
            </p>
            <div className="flex items-center gap-4">
               <Link href="#explore">
                 <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl shadow-lg shadow-blue-200 font-bold group">
                   Explore Library
                   <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                 </Button>
               </Link>
               {userData?.role === 'consultant' && (
                 <Link href="/dashboard/consultant/library">
                   <Button variant="outline" size="lg" className="h-12 px-8 rounded-xl border-gray-200 font-bold">
                     Sell Your Work
                   </Button>
                 </Link>
               )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="explore" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-2">
            <Button 
              variant={selectedCategory === "all" ? "default" : "ghost"}
              onClick={() => setSelectedCategory("all")}
              className={`rounded-xl ${selectedCategory === "all" ? "bg-blue-600 text-white shadow-sm" : "border border-gray-100 bg-white text-gray-600"} font-medium`}
            >
              <Filter className="h-4 w-4 mr-2" />
              All Content
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedCategory("book")}
              className={`rounded-xl font-medium ${selectedCategory === "book" ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-blue-600"}`}
            >
              Books
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedCategory("course")}
              className={`rounded-xl font-medium ${selectedCategory === "course" ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-blue-600"}`}
            >
              Courses
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedCategory("digital_asset")}
              className={`rounded-xl font-medium ${selectedCategory === "digital_asset" ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-blue-600"}`}
            >
              Assets
            </Button>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
            />
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product: any) => (
              <Link key={product.id} href={`/library/${product.id}`} className="group">
                <Card className="h-full border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col bg-white">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {product.thumbnailUrl ? (
                      <img 
                        src={product.thumbnailUrl} 
                        alt={product.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-white/40" />
                      </div>
                    )}
                    <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-gray-900 border-none shadow-sm font-bold uppercase text-[10px] tracking-widest px-3 py-1">
                      {product.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <CardHeader className="p-5 pb-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-6 w-6 ring-2 ring-white">
                        <AvatarImage src={product.consultant?.profilePhoto} />
                        <AvatarFallback className="text-[10px] bg-blue-100 text-blue-600 font-bold">
                          {product.consultant?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{product.consultant?.name}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>
                  </CardHeader>
                  
                  <CardContent className="p-5 pt-3 flex-1">
                    <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="p-5 pt-0 border-t border-gray-50 mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-400 line-through">${(product.price * 1.2 / 100).toFixed(2)}</span>
                      <span className="text-2xl font-black text-gray-900">${(product.price / 100).toFixed(2)}</span>
                    </div>
                    <AddToCartButton 
                      item={{
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        type: product.type.replace('_', ' '),
                        consultantName: product.consultant?.name || "Consultant"
                      }}
                      variant="icon"
                      className="h-12 w-12 rounded-xl bg-gray-900 hover:bg-blue-600 shadow-lg transition-all group-hover:translate-x-1"
                      disabled={userData?.uid === product.consultantId}
                    />
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              Our consultants are currently preparing high-quality resources for the library. Check back soon!
            </p>
            <Link href="/dashboard/consultant/library">
              <Button variant="outline" className="rounded-xl border-gray-200">Start Selling as Consultant</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
