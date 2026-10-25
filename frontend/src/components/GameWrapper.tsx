import { useEffect, useState } from "react"

const BASE_WIDTH = 1920
const BASE_HEIGHT = 1024

interface Props {
  children: React.ReactNode
  overlay?: React.ReactNode
}

export default function GameWrapper({ children, overlay }: Props) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const handleResize = () => {
      const scaleX = window.innerWidth / BASE_WIDTH
      const scaleY = window.innerHeight / BASE_HEIGHT

      // ใช้ Math.max เพื่อให้เต็มจอแบบ cover
      setScale(Math.max(scaleX, scaleY))
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">

      {/* 🎮 Game Layer (โดน scale) */}
      <div
        style={{
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>

      {/* 🧭 UI Overlay Layer (ไม่โดน scale) */}
      {overlay && (
        <div className="absolute inset-0 pointer-events-none">
          {overlay}
        </div>
      )}
    </div>
  )
}
