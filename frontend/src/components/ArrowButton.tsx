import { playClickSfx } from "../utils/sfx"

interface Props {
  direction: "left" | "right"
  onClick: () => void
  className?: string
}

export default function ArrowButton({
  direction,
  onClick,
  className = "",
}: Props) {
  const isLeft = direction === "left"
  function handleClick() {
    playClickSfx()
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      className={`fixed z-50 ${className}`}
    >
      <div
        className="
          w-10 h-10
          rounded-full
          bg-[linear-gradient(90deg,#FF8C00,#FFC107)]
          flex items-center justify-center
          shadow-[0_0_12px_rgba(255,140,0,0.6)]
          hover:scale-110
          hover:shadow-[0_0_20px_rgba(255,180,0,0.9)]
          active:scale-95
          transition-all duration-200
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-black"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          {isLeft ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          )}
        </svg>
      </div>
    </button>
  )
}
