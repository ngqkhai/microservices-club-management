"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, Users } from "lucide-react"

interface Recruitment {
  recruitment_id: string
  title: string
  description: string
  criteria: string[]
  deadline: string
  status: string
}

interface RecruitmentCardProps {
  recruitment: Recruitment
  onApply: () => void
}

export function RecruitmentCard({ recruitment, onApply }: RecruitmentCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isDeadlineSoon = () => {
    const deadline = new Date(recruitment.deadline)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  return (
    <Card className="border-l-4 border-l-blue-600">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              {recruitment.title}
            </CardTitle>
            <CardDescription className="mt-2">{recruitment.description}</CardDescription>
          </div>
          <Badge
            variant={recruitment.status === "open" ? "default" : "secondary"}
            className={recruitment.status === "open" ? "bg-green-600" : ""}
          >
            {recruitment.status === "open" ? "Open" : "Closed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Requirements */}
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-2">Requirements:</h4>
            <ul className="space-y-1">
              {recruitment.criteria.map((criterion, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                  {criterion}
                </li>
              ))}
            </ul>
          </div>

          {/* Deadline */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Deadline: {formatDate(recruitment.deadline)}</span>
              {isDeadlineSoon() && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  Soon
                </Badge>
              )}
            </div>
            <Button
              onClick={onApply}
              disabled={recruitment.status !== "open"}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
