import { useEffect, useState } from "react"
import ConfirmButton from "../components/ConfirmButton"
import ConfigBoard from "../components/ConfigBoard"
import AnimatedBackground from "../components/AnimatedBackground"
import bg from "../assets/images/background-config.png"
import logo from "../assets/images/logo.png"
import { getConfig, saveConfig } from "../api/gameApi.ts"

export interface GameConfig {
  spawnCost: number
  hexPurchaseCost: number
  initBudget: number
  initHp: number
  turnBudget: number
  maxBudget: number
  interestPct: number
  maxTurns: number
  maxSpawns: number
}

interface Props {
  onBack: () => void
  onConfirm: (config: GameConfig) => void | Promise<void>
  initialConfig?: GameConfig | null
  mode?: "global" | "room"
}

export default function ConfigPage({ onConfirm, initialConfig, mode = "global" }: Props) {
  const [config, setConfig] = useState<GameConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig)
      setLoading(false)
      return
    }

    getConfig<GameConfig>()
      .then((data) => {
        setConfig(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load config:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-2xl">
        Loading...
      </div>
    )
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-xl">
        Failed to load config
      </div>
    )
  }

  return (
    <AnimatedBackground src={bg} alt="config background" overlayClassName="bg-black/10">
      <div className="w-full h-full flex flex-col items-center">

        {/* Logo */}
        <img
          src={logo}
          alt="logo"
          className="mt-[20px] w-[120px] md:w-[160px] select-none"
          draggable={false}
        />

        {/* Title */}
        <h1
          className="
            text-4xl md:text-5xl
            font-extrabold
            tracking-widest
            bg-[radial-gradient(circle,#FFFFFF_0%,#FFB300_60%,#FFB300_100%)]
            bg-clip-text
            text-transparent
            drop-shadow-[0_0_12px_rgba(255,179,0,0.6)]
            mt-5 mb-4
          "
        >
          {mode === "room" ? "ROOM CONFIG" : "CONFIG"}
        </h1>

        {/* Config Board */}
        <div className="w-[95%] max-w-[750px]">
          <ConfigBoard>
            <div className="text-yellow-400 text-base md:text-xl space-y-3 font-medium">

              {Object.entries(config).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <label className="capitalize">{key}</label>

                  <input
                    type="number"
                    value={value}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        [key]: Number(e.target.value),
                      } as GameConfig)
                    }
                    className="
                      ml-4
                      w-28
                      text-right
                      px-3 py-1.5
                      rounded-md
                      bg-black/60
                      text-white
                      border border-orange-500/70
                      focus:outline-none
                      focus:ring-2 focus:ring-orange-400
                      focus:border-orange-300
                      hover:shadow-[0_0_10px_rgba(255,140,0,0.7)]
                      transition-all duration-200
                      shadow-[0_0_6px_rgba(255,120,0,0.4)]
                    "
                  />
                </div>
              ))}

            </div>
          </ConfigBoard>
        </div>

        {/* Confirm Button */}
        <div className="mt-4 mb-10">
          <ConfirmButton
            onClick={async () => {
              try {
                setSaving(true)
                if (mode === "global") {
                  await saveConfig(config)
                }
                await onConfirm(config)
              } catch (err) {
                console.error(err)
                alert(mode === "room" ? "Failed to update room config" : "Failed to save config")
              } finally {
                setSaving(false)
              }
            }}
            disabled={saving}
          />
        </div>
      </div>
    </AnimatedBackground>
  )
}
