"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

type LazyGameImageProps = {
  src: string
  fallbackSrc: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  onFallback?: () => void
}

export default function LazyGameImage({
  src,
  fallbackSrc,
  alt,
  className,
  width = 1200,
  height = 800,
  priority = false,
  onFallback
}: LazyGameImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)

  useEffect(() => {
    setCurrentSrc(src)
  }, [src])

  return (
    <Image
      loading={priority ? undefined : "lazy"}
      src={currentSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      priority={priority}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc)
          onFallback?.()
        }
      }}
    />
  )
}
