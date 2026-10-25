import type { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export default function ConfigBoard({ children }: Props) {
  return (
    <div className="relative w-full px-3 md:px-0">
      <div className="pointer-events-none absolute inset-x-10 top-3 h-20 bg-[radial-gradient(circle_at_top,rgba(255,128,24,0.18),rgba(255,128,24,0.03)_42%,transparent_76%)] blur-xl" />
      <div className="pointer-events-none absolute inset-x-20 top-5 h-[2px] bg-gradient-to-r from-transparent via-[#b44b12] to-transparent shadow-[0_0_10px_rgba(180,75,18,0.35)]" />

      <div className="relative overflow-hidden rounded-[28px] border border-[#6b1f0c] bg-[linear-gradient(180deg,rgba(42,8,4,0.94),rgba(24,6,10,0.97))] shadow-[0_0_22px_rgba(170,64,10,0.14),0_20px_44px_rgba(0,0,0,0.4)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,150,40,0.08),transparent_22%),radial-gradient(circle_at_18%_100%,rgba(140,25,0,0.08),transparent_28%),radial-gradient(circle_at_82%_100%,rgba(110,0,50,0.08),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-[12px] rounded-[22px] border border-[#7a2a12]" />
        <div className="pointer-events-none absolute inset-[24px] rounded-[18px] border border-[#4a1208] shadow-[inset_0_0_18px_rgba(0,0,0,0.24)]" />

        <div className="pointer-events-none absolute left-6 top-6 h-5 w-11 rounded-tl-md border-l-2 border-t-2 border-[#8b5418]" />
        <div className="pointer-events-none absolute right-6 top-6 h-5 w-11 rounded-tr-md border-r-2 border-t-2 border-[#8b5418]" />
        <div className="pointer-events-none absolute left-6 bottom-6 h-5 w-11 rounded-bl-md border-l-2 border-b-2 border-[#8b5418]" />
        <div className="pointer-events-none absolute right-6 bottom-6 h-5 w-11 rounded-br-md border-r-2 border-b-2 border-[#8b5418]" />

        <div className="relative z-10 px-7 py-7 md:px-10 md:py-10">
          <div className="rounded-[20px] border border-[#3f1108] bg-[linear-gradient(180deg,rgba(60,4,10,0.18),rgba(22,0,18,0.12))] px-6 py-6 md:px-9 md:py-9 backdrop-blur-[1px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
