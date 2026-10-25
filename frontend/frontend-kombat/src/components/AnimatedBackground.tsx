import { useEffect, useState, type ReactNode } from "react"

interface Props {
  src: string
  alt?: string
  children: ReactNode
  className?: string
  overlayClassName?: string
  imageClassName?: string
}

export default function AnimatedBackground({
  src,
  alt = "background",
  children,
  className = "",
  overlayClassName = "bg-black/40",
  imageClassName = "",
}: Props) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setOffset({ x, y })
    }

    window.addEventListener("mousemove", handleMove)
    return () => window.removeEventListener("mousemove", handleMove)
  }, [])

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 animate-drift will-change-transform"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      >
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover animate-cinematic ${imageClassName}`}
          draggable={false}
        />
      </div>

      <div className={`absolute inset-0 pointer-events-none ${overlayClassName}`} />

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  )
}
