"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getProduct, submitProductReview } from "@/app/actions/library"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

export default function ProductReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const id = params.id as string

  const [product, setProduct] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      const res = await getProduct(id)
      if (res.success) {
        setProduct(res.data)
      } else {
        toast.error("Product not found")
        router.push("/library")
      }
    }
    loadProduct()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("You must be logged in to leave a review")
      return
    }

    setSubmitting(true)
    const res = await submitProductReview({
      productId: id,
      clientId: user.uid,
      rating,
      comment
    })

    setSubmitting(false)
    if (res.success) {
      toast.success("Thank you for your review!")
      router.push(`/library/${id}`)
    } else {
      toast.error(res.error || "Failed to submit review")
    }
  }

  if (!product) return null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-xl w-full rounded-[32px] shadow-2xl border-none">
        <CardHeader className="p-8 pb-4">
          <Link href={`/library/${id}`} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-blue-600 mb-6 uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" />
            Back to Item
          </Link>
          <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">Review "{product.title}"</CardTitle>
          <p className="text-gray-500 font-medium">Share your experience with this resource.</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star 
                      className={`h-10 w-10 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Thoughts</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think of this product?"
                className="w-full h-40 p-6 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-700 resize-none"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all hover:scale-[1.02]"
            >
              {submitting ? "Posting..." : (
                <span className="flex items-center gap-2 justify-center">
                  Submit Review <Send className="h-5 w-5" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
