"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { eventService } from "@/services/event.service"
import { useToast } from "@/hooks/use-toast"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { CheckCircle, XCircle, Loader2, QrCode } from "lucide-react"

export default function EventCheckInPage() {
  const params = useParams()
  const { toast } = useToast()
  const eventId = params.event_id as string
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [scanning, setScanning] = useState(false)
  const [resultText, setResultText] = useState<string>("")
  const [lastSuccessAt, setLastSuccessAt] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null
    let codeReader: BrowserMultiFormatReader | null = null

    const start = async () => {
      try {
        const constraints = { video: { facingMode: { ideal: "environment" } }, audio: false }
        stream = await navigator.mediaDevices.getUserMedia(constraints)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        codeReader = new BrowserMultiFormatReader()
        setScanning(true)
        await codeReader.decodeFromVideoDevice(undefined, videoRef.current!, async (result, err) => {
          if (result?.getText()) {
            await handleScan(result.getText())
          } else if (err && err.name !== 'NotFoundException') {
            // ignore non-not-found errors
            console.log('Scan error:', err)
          }
        })
      } catch (e: any) {
        toast({ title: "Không thể mở camera", description: e?.message || "Kiểm tra quyền truy cập camera", variant: 'destructive' })
      }
    }
    start()

    return () => {
      if (codeReader) {
        try { 
          // Stop scanning by stopping the video stream
          if (stream) stream.getTracks().forEach(t => t.stop())
        } catch {}
      }
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])

  const handleScan = async (text: string) => {
    // Debounce successful scans
    if (Date.now() - lastSuccessAt < 2000) return
    if (isProcessing) return // Prevent multiple simultaneous requests
    
    setIsProcessing(true)
    try {
      console.log('Scanning QR code:', text.substring(0, 20) + '...')
      const res = await eventService.checkInWithToken(eventId, text)
      if (res.success) {
        const successMessage = `Đã điểm danh thành công! ID: ${res.data.registration_id}`
        setResultText(successMessage)
        setLastSuccessAt(Date.now())
        
        // Show success toast with more details
        toast({ 
          title: "✅ Điểm danh thành công!", 
          description: `Đã xác thực mã QR và điểm danh người tham gia. Thời gian: ${new Date().toLocaleTimeString('vi-VN')}`,
          duration: 5000
        })
        
        // Add visual feedback
        setTimeout(() => {
          setResultText("")
        }, 5000)
      }
    } catch (e: any) {
      const errorMessage = e?.message || "Mã QR không hợp lệ hoặc đã hết hạn"
      setResultText(errorMessage)
      toast({ 
        title: "❌ Lỗi điểm danh", 
        description: errorMessage, 
        variant: 'destructive',
        duration: 5000
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Quét mã QR - Điểm danh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <video ref={videoRef} className="w-full rounded-lg bg-black" muted playsInline />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="bg-white p-4 rounded-lg flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="text-sm font-medium">Đang xử lý...</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Status Display */}
              <div className="space-y-2">
                {isProcessing && (
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-700">Đang xử lý mã QR...</span>
                  </div>
                )}
                
                {resultText && !isProcessing && (
                  <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                    resultText.includes('thành công') 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {resultText.includes('thành công') ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${
                      resultText.includes('thành công') ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {resultText}
                    </span>
                  </div>
                )}
                
                {!resultText && !isProcessing && (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <QrCode className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {scanning ? "Đang quét mã QR..." : "Sẵn sàng quét mã QR"}
                    </span>
                  </div>
                )}
              </div>
              
              <Separator />
              <div className="flex gap-2">
                <Button onClick={() => setResultText("")} disabled={isProcessing}>
                  Xóa kết quả
                </Button>
                <Badge variant="outline" className="ml-auto">
                  {scanning ? "Đang quét" : "Sẵn sàng"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


