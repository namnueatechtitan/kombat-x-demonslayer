import { useMemo } from "react"
import type { TurnPhase } from "../api/gameApi"
import SpawnedMinionsLayer, { type BoardMinion } from "./SpawnedMinionsLayer"

interface SpawnableHex {
  row: number
  col: number
  ownerId: number
}

interface DyingMinionEffect {
  id: string
  ownerId: number
  type: string
  row: number
  col: number
}

interface Props {
  spawnableHexes: SpawnableHex[]
  buyableHexes: SpawnableHex[]
  minions: BoardMinion[]
  shakingMinionIds?: string[]
  dyingMinions?: DyingMinionEffect[]
  currentPlayer: number
  playerCharacters?: Record<number, "HUMAN" | "DEMON">
  phase: TurnPhase
  onHexClick: (
    row: number,
    col: number,
    clientX: number,
    clientY: number
  ) => void
}

type SpawnGlowClass = "spawnable-glow-human" | "spawnable-glow-demon"

export default function GameBoard({
  spawnableHexes,
  buyableHexes,
  minions,
  shakingMinionIds = [],
  dyingMinions = [],
  currentPlayer,
  playerCharacters = { 1: "HUMAN", 2: "DEMON" },
  phase,
  onHexClick,
}: Props) {

  const characterHexStroke: Record<"HUMAN" | "DEMON", string> = {
    HUMAN: "#B1202B",
    DEMON: "#6E3C82",
  }
  const characterHexTint: Record<"HUMAN" | "DEMON", string> = {
    HUMAN: "rgba(177,32,43,0.18)",
    DEMON: "rgba(110,60,130,0.18)",
  }
  const getCharacter = (ownerId: number): "HUMAN" | "DEMON" =>
    playerCharacters[ownerId] ?? (ownerId === 1 ? "HUMAN" : "DEMON")

  const GOLD = "#FFD700"

  const hexSize = 45
  const hexGap = 6
  const hexWidth = Math.sqrt(3) * hexSize
  const hexHeight = 2 * hexSize
  const verticalSpacing = hexSize * 1.5
  const rows = 8
  const cols = 8
  const boardPadding = 12

  const boardWidth =
    (cols - 1) * (hexWidth + hexGap) +
    (hexWidth + hexGap) / 2 +
    hexWidth +
    boardPadding * 2
  const boardHeight =
    (rows - 1) * (verticalSpacing + hexGap) + hexHeight + boardPadding * 2

  const spawnMap = useMemo(() => {
    const map: Record<string, number> = {}
    spawnableHexes.forEach((h) => {
      map[`${h.row}-${h.col}`] = h.ownerId
    })
    return map
  }, [spawnableHexes])

  const buyableMap = useMemo(() => {
    const map: Record<string, number> = {}
    buyableHexes.forEach((h) => {
      map[`${h.row}-${h.col}`] = h.ownerId
    })
    return map
  }, [buyableHexes])

  const isBuyable = (row: number, col: number) => {
    if (phase !== "PLAYER_ACTION") return false
    return buyableMap[`${row}-${col}`] === currentPlayer
  }

  const isCurrentPlayerSpawnable = (row: number, col: number) =>
    spawnMap[`${row}-${col}`] === currentPlayer

  const currentPlayerBuyableCount = useMemo(
    () => buyableHexes.filter((hex) => hex.ownerId === currentPlayer).length,
    [buyableHexes, currentPlayer],
  )
  const dimBuyableHighlight = currentPlayerBuyableCount >= 6

  const paths = useMemo(() => {
    const arr: { d: string; row: number; col: number }[] = []

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const xOffset =
          col * (hexWidth + hexGap) +
          (row % 2 ? (hexWidth + hexGap) / 2 : 0) +
          boardPadding

        const yOffset = row * (verticalSpacing + hexGap) + boardPadding

        const points = [
          [xOffset + hexWidth / 2, yOffset],
          [xOffset + hexWidth, yOffset + hexHeight / 4],
          [xOffset + hexWidth, yOffset + (3 * hexHeight) / 4],
          [xOffset + hexWidth / 2, yOffset + hexHeight],
          [xOffset, yOffset + (3 * hexHeight) / 4],
          [xOffset, yOffset + hexHeight / 4],
        ]

        arr.push({
          d: "M" + points.map((p) => p.join(",")).join(" L") + " Z",
          row,
          col,
        })
      }
    }

    return arr
  }, [boardPadding, cols, hexGap, hexHeight, hexWidth, rows, verticalSpacing])

  // ✅ พื้นต้องคงที่
  const getFillColor = (row: number, col: number) => {
    const owner = spawnMap[`${row}-${col}`]
    if (phase === "FREE_SPAWN" && owner === currentPlayer) {
      return characterHexTint[getCharacter(currentPlayer)]
    }
    return "#1E1E1E"
  }

  const getHexOpacity = (row: number, col: number) => {
    if (phase !== "FREE_SPAWN") return 1
    return isCurrentPlayerSpawnable(row, col) ? 1 : 0.62
  }

  // ✅ เงื่อนไขกรอบใหม่
  const getStrokeConfig = (row: number, col: number) => {
    const key = `${row}-${col}`

    // FREE_SPAWN: เน้นเฉพาะช่องที่ผู้เล่นปัจจุบัน spawn ได้
    if (phase === "FREE_SPAWN" && isCurrentPlayerSpawnable(row, col)) {
      const currentCharacter = getCharacter(currentPlayer)
      const glowClass: SpawnGlowClass =
        currentCharacter === "HUMAN" ? "spawnable-glow-human" : "spawnable-glow-demon"
      return {
        stroke: characterHexStroke[currentCharacter],
        strokeWidth: 5,
        strokeOpacity: 1,
        className: `cursor-pointer ${glowClass}`,
      }
    }

    // Spawn = ขอบหนา สีตาม owner
    if (spawnMap[key]) {
      const ownerId = spawnMap[key]
      return {
        stroke: characterHexStroke[getCharacter(ownerId)],
        strokeWidth: 5,
        className: "cursor-pointer",
      }
    }

    // Buyable = ทอง + กระพริบ
    if (isBuyable(row, col)) {
      return {
        stroke: GOLD,
        strokeWidth: 4,
        strokeOpacity: dimBuyableHighlight ? 0.85 : 1,
        className: `cursor-pointer ${dimBuyableHighlight ? "buyable-pulse-dim" : "buyable-pulse"}`,
      }
    }

    // ปกติ
    return {
      stroke: "#2A2A2A",
      strokeWidth: 2,
      strokeOpacity: 1,
      className: "cursor-pointer",
    }
  }

  return (
    <div className="flex justify-center w-full max-w-full overflow-x-auto">
      <svg
        width={boardWidth}
        height={boardHeight}
        viewBox={`0 0 ${boardWidth} ${boardHeight}`}
        className="select-none"
      >
        <defs>
          <style>
            {`
              @keyframes buyablePulse {
                0% { opacity: 1; }
                50% { opacity: 0.45; }
                100% { opacity: 1; }
              }

              .buyable-pulse {
                animation: buyablePulse 1.2s infinite;
              }

              @keyframes buyablePulseDim {
                0% { opacity: 0.85; }
                50% { opacity: 0.38; }
                100% { opacity: 0.85; }
              }

              .buyable-pulse-dim {
                animation: buyablePulseDim 1.2s infinite;
              }

              @keyframes spawnGlowPulseP1 {
                0% {
                  opacity: 0.9;
                  filter: drop-shadow(0 0 4px rgba(239,68,68,0.6));
                }
                50% {
                  opacity: 1;
                  filter: drop-shadow(0 0 10px rgba(239,68,68,0.85));
                }
                100% {
                  opacity: 0.9;
                  filter: drop-shadow(0 0 4px rgba(239,68,68,0.6));
                }
              }

              @keyframes spawnGlowPulseP2 {
                0% {
                  opacity: 0.9;
                  filter: drop-shadow(0 0 4px rgba(168,85,247,0.6));
                }
                50% {
                  opacity: 1;
                  filter: drop-shadow(0 0 10px rgba(168,85,247,0.85));
                }
                100% {
                  opacity: 0.9;
                  filter: drop-shadow(0 0 4px rgba(168,85,247,0.6));
                }
              }

              @keyframes spawnInnerPulse {
                0% { fill-opacity: 0.16; }
                50% { fill-opacity: 0.28; }
                100% { fill-opacity: 0.16; }
              }

              .spawnable-glow-human,
              .spawnable-glow-demon {
                animation-duration: 1.4s, 1.4s;
                animation-timing-function: ease-in-out, ease-in-out;
                animation-iteration-count: infinite, infinite;
              }

              .spawnable-glow-human {
                animation-name: spawnGlowPulseP1, spawnInnerPulse;
              }

              .spawnable-glow-demon {
                animation-name: spawnGlowPulseP2, spawnInnerPulse;
              }

              @keyframes minionShake {
                0%, 100% { transform: translate(0, 0); }
                20% { transform: translate(-2px, -1px); }
                40% { transform: translate(2px, 1px); }
                60% { transform: translate(-2px, 1px); }
                80% { transform: translate(2px, -1px); }
              }

              .minion-shake {
                animation: minionShake 0.35s ease-in-out 2;
                transform-box: fill-box;
                transform-origin: center;
              }

              @keyframes minionAuraPulse {
                0% { opacity: 0.28; transform: scale(0.94); }
                50% { opacity: 0.52; transform: scale(1.03); }
                100% { opacity: 0.28; transform: scale(0.94); }
              }

              @keyframes minionAuraSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }

              @keyframes minionAuraSpinReverse {
                0% { transform: rotate(360deg); }
                100% { transform: rotate(0deg); }
              }

              @keyframes hpRingBeat {
                0% { opacity: 0.78; }
                50% { opacity: 1; }
                100% { opacity: 0.78; }
              }

              .minion-aura-pulse {
                animation: minionAuraPulse 1.8s ease-in-out infinite;
                transform-box: fill-box;
                transform-origin: center;
              }

              .minion-aura-spin {
                animation: minionAuraSpin 7s linear infinite;
                transform-box: fill-box;
                transform-origin: center;
              }

              .minion-aura-spin-reverse {
                animation: minionAuraSpinReverse 9s linear infinite;
                transform-box: fill-box;
                transform-origin: center;
              }

              .minion-aura-spark {
                filter: drop-shadow(0 0 5px currentColor);
              }

              .minion-hp-ring {
                animation: hpRingBeat 1.2s ease-in-out infinite;
                transition: stroke-dashoffset 0.28s ease-out;
              }

              @keyframes minionHitFlash {
                0% { opacity: 0.78; transform: scale(0.75); }
                100% { opacity: 0; transform: scale(1.18); }
              }

              @keyframes minionHitSpark {
                0% { opacity: 1; transform: scale(0.4); }
                100% { opacity: 0; transform: scale(1.45); }
              }

              .minion-hit-flash {
                animation: minionHitFlash 0.24s ease-out forwards;
                transform-box: fill-box;
                transform-origin: center;
              }

              .minion-hit-spark {
                animation: minionHitSpark 0.28s ease-out forwards;
                transform-box: fill-box;
                transform-origin: center;
                filter: drop-shadow(0 0 5px rgba(253, 186, 116, 0.9));
              }

              @keyframes minionDeathBurst {
                0% { opacity: 0.98; transform: scale(0.78); }
                100% { opacity: 0; transform: scale(1.62); }
              }

              @keyframes minionDeathRing {
                0% { opacity: 0.95; transform: scale(0.65); }
                100% { opacity: 0; transform: scale(2.35); }
              }

              @keyframes minionDeathSpark {
                0% { opacity: 1; transform: scale(0.5); }
                100% { opacity: 0; transform: scale(1.8); }
              }

              @keyframes minionDeathFlash {
                0% { opacity: 1; transform: scale(0.68); }
                70% { opacity: 0.35; transform: scale(1.42); }
                100% { opacity: 0; transform: scale(1.55); }
              }

              @keyframes minionDeathScorch {
                0% { opacity: 0; transform: scale(0.6); }
                30% { opacity: 0.65; transform: scale(1); }
                100% { opacity: 0; transform: scale(1.2); }
              }

              @keyframes minionDeathFade {
                0% { opacity: 1; transform: scale(1); filter: saturate(1); }
                100% { opacity: 0; transform: scale(0.6); filter: saturate(0.1) brightness(0.5); }
              }

              @keyframes minionDeathShard {
                0% { opacity: 1; transform: translate(0, 0) scale(1); }
                100% { opacity: 0; transform: translate(0, -26px) scale(0.4); }
              }

              @keyframes minionDeathCore {
                0% { opacity: 1; transform: scale(0.55); filter: blur(0.5px); }
                100% { opacity: 0; transform: scale(1.95); filter: blur(2px); }
              }

              @keyframes minionDeathWave {
                0% { opacity: 0.95; transform: scale(0.58); }
                100% { opacity: 0; transform: scale(2.55); }
              }

              .minion-death-burst {
                animation: minionDeathBurst 1.15s ease-out forwards;
                transform-box: fill-box;
                transform-origin: center;
              }

              .minion-death-ring {
                animation: minionDeathRing 1.15s ease-out forwards;
                transform-box: fill-box;
                transform-origin: center;
              }

              .minion-death-spark {
                animation: minionDeathSpark 1.1s ease-out forwards;
                transform-box: fill-box;
                transform-origin: center;
                filter: drop-shadow(0 0 8px rgba(255, 228, 130, 0.95));
              }

              .minion-death-flash {
                animation: minionDeathFlash 0.62s ease-out forwards;
                transform-box: fill-box;
                transform-origin: center;
              }

              .minion-death-scorch {
                animation: minionDeathScorch 0.9s ease-out forwards;
                transform-box: fill-box;
                transform-origin: center;
              }

              .minion-death-fade {
                animation: minionDeathFade 1.1s ease-out forwards;
                transform-box: fill-box;
                transform-origin: center;
              }

              .minion-death-shard {
                animation: minionDeathShard 1.1s ease-out forwards;
                transform-box: fill-box;
                transform-origin: center;
              }

              .minion-death-core {
                animation: minionDeathCore 0.85s ease-out forwards;
                transform-box: fill-box;
                transform-origin: center;
              }

              .minion-death-wave {
                animation: minionDeathWave 1.1s ease-out forwards;
                transform-box: fill-box;
                transform-origin: center;
              }
            `}
          </style>
        </defs>

        {paths.map(({ d, row, col }) => {
          const key = `${row}-${col}`
          const strokeConfig = getStrokeConfig(row, col)

          return (
            <path
              key={key}
              d={d}
              fill={getFillColor(row, col)}
              fillOpacity={getHexOpacity(row, col)}
              stroke={strokeConfig.stroke}
              strokeWidth={strokeConfig.strokeWidth}
              strokeOpacity={(strokeConfig.strokeOpacity ?? 1) * getHexOpacity(row, col)}
              className={strokeConfig.className}
              onClick={(e) => onHexClick(row, col, e.clientX, e.clientY)}
            />
          )
        })}

        <SpawnedMinionsLayer
          minions={minions}
          shakingMinionIds={shakingMinionIds}
          playerCharacters={playerCharacters}
          dyingMinions={dyingMinions}
          hexWidth={hexWidth}
          hexHeight={hexHeight}
          verticalSpacing={verticalSpacing}
          hexGap={hexGap}
          boardPadding={boardPadding}
        />
      </svg>
    </div>
  )
}
