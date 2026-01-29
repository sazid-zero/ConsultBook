export const dynamic = 'force-dynamic'

import { getProduct } from "@/app/actions/library"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Video, 
  FileText, 
  ArrowLeft, 
  Star, 
  ShoppingCart,
  CheckCircle2,
  Calendar,
  Globe,
  Share2
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AddToCartButton } from "@/components/cart/AddToCartButton"
import { ProductPurchaseActions } from "@/components/marketplace/ProductPurchaseActions"
import { notFound } from "next/navigation"
import { ScrollFix } from "@/components/scroll-fix"

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getProduct(id)
  
  if (!result.success || !result.data) {
    notFound()
  }

  const product = result.data as any
  const reviews = product.reviews || []

  return (
    <div className="min-h-screen bg-white">
      <ScrollFix />
      {/* Top Navigation Bar (Sub) */}
      <div className="border-b border-gray-100 bg-gray-50/50 sticky top-16 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/library" className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition-all uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="h-8 text-gray-400 hover:text-blue-600">
               <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Left Column: Product Info */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <Badge className="mb-4 bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {product.type.replace('_', ' ')}
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 leading-tight">
                {product.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-gray-900">{product.averageRating || "5.0"}</span>
                  <span className="text-gray-400">({reviews.length} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                   <Calendar className="h-4 w-4" />
                   <span>Updated {new Date(product.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                   <Globe className="h-4 w-4" />
                   <span>English</span>
                </div>
              </div>
            </div>

            {/* Thumbnail / Cover */}
            <div className="aspect-video rounded-3xl overflow-hidden bg-gray-100 mb-12 shadow-2xl shadow-blue-500/5 group relative border border-gray-100">
               {product.thumbnailUrl ? (
                 <img 
                  src={product.thumbnailUrl} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                 />
               ) : (
                 <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-20">
                   <div className="text-center">
                     <BookOpen className="h-24 w-24 text-white/20 mx-auto mb-6" />
                     <p className="text-white/60 font-bold max-w-xs">{product.title}</p>
                   </div>
                 </div>
               )}
            </div>

            {/* Description Section */}
            <div className="prose prose-blue max-w-none mb-16">
               <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tight">Product Description</h2>
               <div className="text-gray-600 leading-relaxed text-lg space-y-4">
                 {product.description.split('\n').map((para: string, i: number) => (
                   <p key={i}>{para}</p>
                 ))}
               </div>
            </div>

            {/* What's Included */}
            <div className="bg-gray-50 rounded-3xl p-8 mb-16 border border-gray-100">
               <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
                 <CheckCircle2 className="h-6 w-6 text-blue-600" />
                 What's Included
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   "Lifetime access to content",
                   "Downloadable resources & files",
                   "Expert-curated insights",
                   "Mobile & Desktop optimized",
                   "Certificate of Completion (for courses)",
                   "Community Support access"
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-3 text-gray-600 font-medium bg-white p-3 rounded-xl border border-gray-100">
                     <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                     {item}
                   </div>
                 ))}
               </div>
            </div>

            {/* Consultant Info */}
            <div className="border border-gray-100 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-start mb-16 shadow-sm">
               <Avatar className="h-24 w-24 ring-4 ring-gray-50 shadow-md">
                 <AvatarImage src={product.consultant?.profilePhoto} className="object-cover" />
                 <AvatarFallback className="text-2xl font-black bg-blue-100 text-blue-600 uppercase">
                    {product.consultant?.name?.charAt(0)}
                 </AvatarFallback>
               </Avatar>
               <div className="flex-1">
                 <div className="flex items-center gap-3 mb-2">
                   <h3 className="text-2xl font-black text-gray-900">Author: {product.consultant?.name}</h3>
                   <Badge className="bg-green-100 text-green-700 border-none font-bold uppercase text-[9px]">Verified Expert</Badge>
                 </div>
                 <p className="text-gray-500 mb-6 leading-relaxed">
                   {product.consultant?.bio || "A top-tier consultant dedicated to helping others succeed through specialized knowledge and high-impact resources."}
                 </p>
                 <Link href={`/consultant/${product.consultantId}/profile`}>
                   <Button variant="outline" className="rounded-xl border-gray-200 font-bold hover:bg-gray-100">
                     View Full Profile
                   </Button>
                 </Link>
               </div>
            </div>

            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Reviews ({reviews.length})</h2>
                <Link href={`/library/${product.id}/review`} className="text-sm font-bold text-blue-600 hover:text-blue-700">Write a review</Link>
              </div>
              
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((rev: any) => (
                    <div key={rev.id} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-10 w-10">
                             <AvatarImage src={rev.client?.profilePhoto} />
                             <AvatarFallback className="font-bold bg-gray-100 text-gray-400">
                                {rev.client?.name?.charAt(0)}
                             </AvatarFallback>
                           </Avatar>
                           <div>
                             <p className="font-bold text-gray-900">{rev.client?.name}</p>
                             <div className="flex text-yellow-500">
                               {[1, 2, 3, 4, 5].map((s) => (
                                 <Star key={s} className={`h-3 w-3 ${s <= rev.rating ? "fill-current" : "text-gray-200"}`} />
                               ))}
                             </div>
                           </div>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-600 text-sm italic">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 py-12 px-6 rounded-2xl text-center border-2 border-dashed border-gray-100">
                   <p className="text-gray-400 font-bold italic">No reviews yet for this product. Be the first to share your experience!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Checkout Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-40">
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-2xl shadow-gray-200/50">
                 <div className="mb-8">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">One-time payment</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-5xl font-black text-gray-900">${(product.price / 100).toFixed(2)}</span>
                       <span className="text-lg text-gray-400 line-through font-bold">${(product.price * 1.2 / 100).toFixed(2)}</span>
                    </div>
                 </div>

                 <ProductPurchaseActions 
                    product={{
                      id: product.id,
                      title: product.title,
                      price: product.price,
                      type: product.type.replace('_', ' '),
                      consultantId: product.consultantId,
                      consultantName: product.consultant?.name || "Consultant",
                      fileUrl: product.fileUrl
                    }}
                 />

                 <div className="space-y-6 pt-6 border-t border-gray-50">
                   <div className="flex items-center gap-3 text-sm font-bold text-gray-900">
                     <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                        <FileText className="h-4 w-4" />
                     </div>
                     Digital Download Enabled
                   </div>
                   <div className="flex items-center gap-3 text-sm font-bold text-gray-900">
                     <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                        <Star className="h-4 w-4" />
                     </div>
                     Money Back Guarantee
                   </div>
                 </div>

                 <div className="mt-8 p-4 bg-gray-50 rounded-2xl text-[10px] text-gray-400 leading-relaxed font-medium">
                   Enjoy immediate access after purchase. For any issues, contact support@consultbook.com or message the author directly.
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
