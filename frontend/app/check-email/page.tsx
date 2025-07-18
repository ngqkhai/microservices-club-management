"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle, Loader2 } from "lucide-react"
import { authService } from "@/services"
import { useToast } from "@/hooks/use-toast"

export default function CheckEmailPage() {
  const [isResending, setIsResending] = useState(false)
  const { toast } = useToast()

  const handleResendEmail = async () => {
    // Trong thực tế, bạn có thể lưu email trong localStorage hoặc pass qua URL params
    const email = localStorage.getItem('registrationEmail')
    
    if (!email) {
      toast({
        title: "Email not found",
        description: "Please register again to receive verification email.",
        variant: "destructive",
      })
      return
    }

    setIsResending(true)
    
    try {
      const response = await authService.resendVerification(email)
      
      if (response.success) {
        toast({
          title: "Email sent",
          description: "Verification email has been sent again. Please check your inbox.",
        })
      } else {
        toast({
          title: "Failed to resend",
          description: response.message || "Could not resend verification email.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription className="text-center text-gray-600">
              We've sent a verification link to your email address. Please check your email and click the verification link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">What's next?</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Check your email inbox (and spam folder)</li>
                    <li>• Click the verification link</li>
                    <li>• Return to login with your credentials</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleResendEmail}
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend verification email'
                  )}
                </Button>
                
                <Button asChild className="w-full">
                  <Link href="/login">
                    Back to Login
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
