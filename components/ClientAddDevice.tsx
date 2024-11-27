'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from "@/components/ui/skeleton"

const AddDevice = dynamic(
  () => import('./AddDevice'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full space-y-4">
        <Skeleton className="h-[40px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }
)

export default AddDevice 