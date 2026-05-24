'use client'

import { useEffect, useRef } from 'react'

export function useAutoSave(
  key: string,
  data: { title?: string; body?: string; bookId?: string },
  delay: number = 30000
) {
  const prevData = useRef(data)

  useEffect(() => {
    const timer = setInterval(() => {
      if (
        data.title !== prevData.current.title ||
        data.body !== prevData.current.body ||
        data.bookId !== prevData.current.bookId
      ) {
        localStorage.setItem(`draft:${key}`, JSON.stringify(data))
        prevData.current = { ...data }
      }
    }, delay)

    return () => clearInterval(timer)
  }, [key, data, delay])
}

export function loadDraft(key: string): { title?: string; body?: string; bookId?: string } | null {
  try {
    const stored = localStorage.getItem(`draft:${key}`)
    if (stored) return JSON.parse(stored)
  } catch {}
  return null
}

export function clearDraft(key: string) {
  localStorage.removeItem(`draft:${key}`)
}
