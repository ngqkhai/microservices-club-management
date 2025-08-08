"use client"

import { useEffect, useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { eventService } from "@/services/event.service"
import ReactQRCode from "react-qr-code"

type Props = {
  eventId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventQrModal({ eventId, open, onOpenChange }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [expiresAt, setExpiresAt] = useState<string>("")
  const [remainingSec, setRemainingSec] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const refreshTimer = useRef<any>(null)

  const loadTicket = async () => {
    setLoading(true)
    try {
      const res = await eventService.getEventTicket(eventId)
      if (res.success && res.data?.qr_token) {
        setQrDataUrl(res.data.qr_token)
        setExpiresAt(res.data.expires_at)
        // Initialize countdown
        const rem = Math.max(0, Math.floor((new Date(res.data.expires_at).getTime() - Date.now()) / 1000))
        setRemainingSec(rem)

        // Refresh token a bit before expiry (e.g., 10s early)
        if (refreshTimer.current) clearTimeout(refreshTimer.current)
        const ttlMs = Math.max(new Date(res.data.expires_at).getTime() - Date.now() - 10000, 15000)
        refreshTimer.current = setTimeout(loadTicket, ttlMs)
      }
    } catch (_) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadTicket()
    }
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, eventId])

  // Tick countdown every second while open
  useEffect(() => {
    if (!open || !expiresAt) return
    const id = setInterval(() => {
      const rem = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setRemainingSec(rem)
    }, 1000)
    return () => clearInterval(id)
  }, [open, expiresAt])

  const formatMMSS = (s: number) => {
    const mm = Math.floor(s / 60)
    const ss = s % 60
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vé / Mã QR</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : qrDataUrl ? (
            <div className="flex flex-col items-center">
              <div className="bg-white p-2 rounded">
                <ReactQRCode value={qrDataUrl} size={240} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Hết hạn sau: {formatMMSS(remainingSec)}</p>
              <Button className="mt-3" onClick={loadTicket}>Làm mới</Button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Không thể tải vé. Thử lại sau.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


