import { useEffect, useRef } from "react"

interface Props {
  logs: string[]
}

export default function ActionLog({ logs }: Props) {

  const logRef = useRef<HTMLDivElement>(null)

  // 🔥 Auto scroll ลงล่างสุดเมื่อ logs เปลี่ยน
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="w-full rounded-xl border border-yellow-400/20 bg-[linear-gradient(180deg,rgba(5,5,8,0.92),rgba(8,8,12,0.96))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,220,140,0.08)]">
      <div className="mb-2 flex items-center justify-between gap-3 border-b border-yellow-500/15 pb-2">
        <h3 className="text-yellow-300 font-extrabold tracking-wide flex items-center gap-2">
          <span className="action-log-pulse-dot" />
          Action Log
        </h3>
        <span className="text-[11px] tracking-[0.14em] text-yellow-200/60">
          {logs.length} EVENT{logs.length === 1 ? "" : "S"}
        </span>
      </div>

      <div
        ref={logRef}
        className="action-log-scroll h-[96px] overflow-y-auto pr-2 text-sm space-y-1"
      >
        {logs.length === 0 && (
          <div className="pt-1 text-slate-400/80">
            No actions yet...
          </div>
        )}

        {logs.map((log, index) => {
          const isLatest = index === logs.length - 1
          return (
            <div
              key={`${index}-${log}`}
              className={`action-log-line ${isLatest ? "action-log-line-latest" : ""}`}
            >
              {log}
            </div>
          )
        })}
      </div>
    </div>
  )
}
