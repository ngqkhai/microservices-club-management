"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { eventService } from "@/services/event.service"
import { useToast } from "@/hooks/use-toast"

export default function EventCheckInPage() {
  const params = useParams()
  const { toast } = useToast()
  const eventId = params.event_id as string
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [scanning, setScanning] = useState(false)
  const [resultText, setResultText] = useState<string>("")
  const [lastSuccessAt, setLastSuccessAt] = useState<number>(0)

  useEffect(() => {
    let stream: MediaStream | null = null
    let frameTimer: number | null = null
    let barcodeDetector: any = null

    const start = async () => {
      try {
        // Prefer environment-facing camera
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        // Use BarcodeDetector if available
        // @ts-ignore
        if (window.BarcodeDetector) {
          // @ts-ignore
          barcodeDetector = new window.BarcodeDetector({ formats: ["qr_code"] })
          setScanning(true)
          const scanFrame = async () => {
            if (!videoRef.current) return
            try {
              const detections = await barcodeDetector.detect(videoRef.current)
              if (detections && detections.length > 0) {
                const raw = detections[0].rawValue || detections[0].raw || ''
                if (raw) {
                  await handleScan(raw)
                }
              }
            } catch {}
            frameTimer = requestAnimationFrame(scanFrame)
          }
          frameTimer = requestAnimationFrame(scanFrame)
        } else {
          setScanning(false)
          toast({ title: "Thiếu hỗ trợ quét QR", description: "Trình duyệt không hỗ trợ BarcodeDetector." })
        }
      } catch (e: any) {
        toast({ title: "Không thể mở camera", description: e?.message || "Kiểm tra quyền truy cập camera" , variant: 'destructive'})
      }
    }
    start()

    return () => {
      if (frameTimer) cancelAnimationFrame(frameTimer)
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])

  const handleScan = async (text: string) => {
    // Debounce successful scans
    if (Date.now() - lastSuccessAt < 2000) return
    try {
      const res = await eventService.checkInWithToken(eventId, text)
      if (res.success) {
        setResultText(`Đã điểm danh: ${res.data.registration_id}`)
        setLastSuccessAt(Date.now())
        toast({ title: "Thành công", description: "Đã xác thực mã QR và điểm danh" })
      }
    } catch (e: any) {
      setResultText(e?.message || "Mã không hợp lệ")
      toast({ title: "Lỗi", description: e?.message || "Mã không hợp lệ", variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Quét mã QR - Điểm danh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <video ref={videoRef} className="w-full rounded-lg bg-black" muted playsInline />
              <div className="text-sm text-gray-600">{resultText || (scanning ? "Đang quét..." : "Không quét được")}</div>
              <Separator />
              <div className="flex gap-2">
                <Button onClick={() => setResultText("")}>Xóa kết quả</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


