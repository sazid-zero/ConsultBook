import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 space-y-4">
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-4 w-[500px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden">
             <Skeleton className="aspect-video w-full" />
             <div className="p-8 space-y-6">
                <div className="flex justify-between">
                   <Skeleton className="h-6 w-32 rounded-full" />
                   <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-8 w-full" />
                <div className="space-y-3">
                   <Skeleton className="h-4 w-full flex items-center gap-2" />
                   <Skeleton className="h-4 w-full flex items-center gap-2" />
                </div>
                <div className="flex items-center gap-3 pt-4">
                   <Skeleton className="h-10 w-10 rounded-full" />
                   <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-14 w-full rounded-2xl" />
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}
