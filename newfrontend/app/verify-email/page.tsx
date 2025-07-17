"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { authService } from "@/services"
import { useToast } from "@/hooks/use-toast"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>('loading')
  const [message, setMessage] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. No token provided.')
      return
    }
    
    verifyEmail(token)
  }, [searchParams])
  
  const verifyEmail = async (token: string) => {
    try {
      const response = await authService.verifyEmail(token)
      
      if (response.success) {
        if (response.data.alreadyVerified) {
          setStatus('already-verified')
          setMessage('Email was already verified')
        } else {
          setStatus('success')
          setMessage('Email verified successfully!')
        }
        
        toast({
          title: "Email verified",
          description: "You can now login to your account.",
        })
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(response.message || 'Verification failed')
      }
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Verification link is invalid or expired')
      
      toast({
        title: "Verification failed",
        description: error.message || "The verification link is invalid or expired.",
        variant: "destructive",
      })
    }
  }
  
  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      case 'success':
      case 'already-verified':
        return <CheckCircle className="w-8 h-8 text-green-600" />
      case 'error':
        return <XCircle className="w-8 h-8 text-red-600" />
    }
  }
  
  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying your email...'
      case 'success':
        return 'Email verified successfully!'
      case 'already-verified':
        return 'Email already verified'
      case 'error':
        return 'Verification failed'
    }
  }
  
  const getDescription = () => {
    switch (status) {
      case 'loading':
        return 'Please wait while we verify your email address.'
      case 'success':
        return 'Your email has been verified successfully. You can now login to your account.'
      case 'already-verified':
        return 'Your email was already verified. You can login to your account.'
      case 'error':
        return message
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
              {getIcon()}
            </div>
            <CardTitle className="text-2xl">{getTitle()}</CardTitle>
            <CardDescription className="text-center">
              {getDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'loading' && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  This may take a few moments...
                </p>
              </div>
            )}
            
            {(status === 'success' || status === 'already-verified') && (
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    Redirecting to login page in a few seconds...
                  </p>
                </div>
                
                <Button asChild className="w-full">
                  <Link href="/login">
                    Go to Login
                  </Link>
                </Button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="text-center space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    The verification link may be invalid or expired. Please try registering again or contact support.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/signup">
                      Register Again
                    </Link>
                  </Button>
                  
                  <Button asChild className="w-full">
                    <Link href="/login">
                      Back to Login
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
