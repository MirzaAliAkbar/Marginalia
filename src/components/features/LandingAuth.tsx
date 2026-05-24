'use client'

import { useState, useEffect } from 'react'
import { AuthModal } from './AuthModal'

export function LandingAuth() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search)
      if (params.get('auth') === 'required') {
        setOpen(true)
      }
    }, 0)

    const handleGetStarted = () => setOpen(true)
    const btn1 = document.getElementById('get-started-btn')
    const btn2 = document.getElementById('nav-get-started')
    btn1?.addEventListener('click', handleGetStarted)
    btn2?.addEventListener('click', handleGetStarted)
    return () => {
      clearTimeout(timer)
      btn1?.removeEventListener('click', handleGetStarted)
      btn2?.removeEventListener('click', handleGetStarted)
    }
  }, [])

  return <AuthModal open={open} onClose={() => setOpen(false)} />
}
