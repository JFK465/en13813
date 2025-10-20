"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

interface PointerHighlightProps {
  children: React.ReactNode
  rectangleClassName?: string
  pointerClassName?: string
  containerClassName?: string
}

export function PointerHighlight({
  children,
  rectangleClassName = "bg-blue-50",
  pointerClassName = "text-blue-500",
  containerClassName,
}: PointerHighlightProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (ref.current && isInView) {
      const rect = ref.current.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })
    }
  }, [isInView])

  return (
    <span ref={ref} className={cn("relative inline-block", containerClassName)}>
      {/* Background Rectangle */}
      {isInView && (
        <motion.span
          className={cn(
            "absolute inset-0 rounded-md -z-10",
            rectangleClassName
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          style={{
            left: "-4px",
            right: "-4px",
            top: "-2px",
            bottom: "-2px",
          }}
        />
      )}

      {/* Pointer Dot */}
      {isInView && dimensions.width > 0 && (
        <motion.span
          className={cn(
            "absolute w-2 h-2 rounded-full -z-10",
            pointerClassName.replace("text-", "bg-")
          )}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: 0.1,
            ease: [0.68, -0.55, 0.265, 1.55],
          }}
          style={{
            left: `${dimensions.width + 8}px`,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      )}

      {/* Content */}
      <span className="relative z-10">{children}</span>
    </span>
  )
}
