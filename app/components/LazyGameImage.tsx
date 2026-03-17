"use client"

import { useState } from "react"
import Image from "next/image"

type LazyGameImageProps = {
  src: string
  fallbackSrc: string
  alt: string
  className?: string
  width?: number
  height?: number
}

export default function LazyGameImage({
  src,
  fallbackSrc,
  alt,
  className,
  width = 1200,
  height = 800
}: LazyGameImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)

  return (
    <Image
      loading="lazy"
      src={currentSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      unoptimized
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc)
        }
      }}
    />
  )
}
