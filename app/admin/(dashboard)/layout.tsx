"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AdminBottomNav } from "@/components/admin/admin-bottom-nav"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userEmail, setUserEmail] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/admin/login")
      } else {
        setUserEmail(user.email || "")
        setLoading(false)
      }
    })
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background pb-20">
      <AdminBottomNav userEmail={userEmail} />
      <main>{children}</main>
    </div>
  )
}
