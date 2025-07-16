"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Plus } from "lucide-react"
import Link from "next/link"

export function ClubSpaceEmptyState() {
  return (
    <div className="h-screen bg-gray-100 flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chưa tham gia câu lạc bộ nào</h2>
            <p className="text-gray-600">
              Bạn chưa tham gia câu lạc bộ nào. Hãy khám phá và tham gia các câu lạc bộ để bắt đầu!
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/clubs">
                <Plus className="h-4 w-4 mr-2" />
                Khám phá câu lạc bộ
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/">Quay về trang chủ</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
