import { useMemo } from "react"
import assasinDemonImage from "../assets/images/Minion_gameplay/demon/assasindemon.png"
import dpsDemonImage from "../assets/images/Minion_gameplay/demon/dpsdemon.png"
import fighterDemonImage from "../assets/images/Minion_gameplay/demon/figtherdemon.png"
import supportDemonImage from "../assets/images/Minion_gameplay/demon/supportdemon.png"
import tankDemonImage from "../assets/images/Minion_gameplay/demon/tankdemon.png"
import assasinHumanImage from "../assets/images/Minion_gameplay/human/assasinhuman.png"
import dpsHumanImage from "../assets/images/Minion_gameplay/human/dpshuman.png"
import fighterHumanImage from "../assets/images/Minion_gameplay/human/figtherhuman.png"
import supportHumanImage from "../assets/images/Minion_gameplay/human/supporthuman.png"
import tankHumanImage from "../assets/images/Minion_gameplay/human/tankhuman.png"

export interface BoardMinion {
  ownerId: number
  type: string
  hp?: number
  hpPercent?: number
  runtimeId?: string
  row?: number
  col?: number
  x?: number
  y?: number
}

interface Props {
  minions: BoardMinion[]
  shakingMinionIds?: string[]
  playerCharacters?: Record<number, "HUMAN" | "DEMON">
  dyingMinions?: Array<{
    id: string
    ownerId: number
    type: string
    row: number
    col: number
  }>
  hexWidth: number
  hexHeight: number
  verticalSpacing: number
  hexGap: number
  boardPadding: number
}

interface PositionedMinion {
  key: string
  runtimeId: string
  type: string
  ownerId: number
  hp?: number
  hpPercent?: number
  x: number
  y: number
  stackIndex: number
  stackSize: number
}

const MINION_IMAGE_BY_TYPE: Record<string, string> = {
  assasindemon: assasinDemonImage,
  assasinhuman: assasinHumanImage,
  dpsdemon: dpsDemonImage,
  dpshuman: dpsHumanImage,
  figtherdemon: fighterDemonImage,
  figtherhuman: fighterHumanImage,
  supportdemon: supportDemonImage,
  supporthuman: supportHumanImage,
  tankdemon: tankDemonImage,
  tankhuman: tankHumanImage,
  // aliases
  assassindemon: assasinDemonImage,
  assassinhuman: assasinHumanImage,
  fighterdemon: fighterDemonImage,
  fighterhuman: fighterHumanImage,
}

const DEMON_CLASS_COLOR_BY_ROLE: Record<string, string> = {
  fighter: "#AFAFAF",
  assassin: "#720066",
  dps: "#001311",
  tank: "#D42828",
  support: "#372026",
}

const HUMAN_CLASS_COLOR_BY_ROLE: Record<string, string> = {
  fighter: "#195A45",
  assassin: "#7B140D",
  dps: "#0139C9",
  tank: "#BD3431",
  support: "#FFB300",
}

export default function SpawnedMinionsLayer({
  minions,
  shakingMinionIds = [],
  playerCharacters = { 1: "HUMAN", 2: "DEMON" },
  dyingMinions = [],
  hexWidth,
  hexHeight,
  verticalSpacing,
  hexGap,
  boardPadding,
}: Props) {
  const getCharacter = (ownerId: number): "HUMAN" | "DEMON" =>
    playerCharacters[ownerId] ?? (ownerId === 1 ? "HUMAN" : "DEMON")

  const positionedMinions = useMemo(() => {
    const minionsByHex: Record<string, BoardMinion[]> = {}

    minions.forEach((minion) => {
      const row = minion.row ?? minion.x
      const col = minion.col ?? minion.y

      if (row === undefined || col === undefined) return

      const key = `${row}-${col}`
      if (!minionsByHex[key]) {
        minionsByHex[key] = []
      }

      minionsByHex[key].push(minion)
    })

    const result: PositionedMinion[] = []

    Object.entries(minionsByHex).forEach(([hexKey, hexMinions]) => {
      const [rowText, colText] = hexKey.split("-")
      const row = Number(rowText)
      const col = Number(colText)

      if (Number.isNaN(row) || Number.isNaN(col)) return

      const xOffset =
        col * (hexWidth + hexGap) +
        (row % 2 ? (hexWidth + hexGap) / 2 : 0) +
        boardPadding
      const yOffset = row * (verticalSpacing + hexGap) + boardPadding
      const centerX = xOffset + hexWidth / 2
      const centerY = yOffset + hexHeight / 2

      hexMinions.forEach((minion, index) => {
        const runtimeId = minion.runtimeId ?? `${hexKey}-${minion.type}-${index}`
        result.push({
          key: runtimeId,
          runtimeId,
          type: minion.type,
          ownerId: minion.ownerId,
          hp: minion.hp,
          hpPercent: minion.hpPercent,
          x: centerX,
          y: centerY,
          stackIndex: index,
          stackSize: hexMinions.length,
        })
      })
    })

    return result
  }, [boardPadding, hexGap, hexHeight, hexWidth, minions, verticalSpacing])

  const shakingSet = useMemo(
    () => new Set(shakingMinionIds),
    [shakingMinionIds],
  )

  const resolveImageByType = (type: string, ownerId: number) => {
    const normalized = type.toLowerCase().replace(/[_\s-]/g, "")

    const direct = MINION_IMAGE_BY_TYPE[normalized]
    if (direct) return direct

    const roleToCharacterVariant: Record<string, { HUMAN: string; DEMON: string }> = {
      fighter: { HUMAN: fighterHumanImage, DEMON: fighterDemonImage },
      figther: { HUMAN: fighterHumanImage, DEMON: fighterDemonImage },
      assassin: { HUMAN: assasinHumanImage, DEMON: assasinDemonImage },
      assasin: { HUMAN: assasinHumanImage, DEMON: assasinDemonImage },
      assasinn: { HUMAN: assasinHumanImage, DEMON: assasinDemonImage },
      dps: { HUMAN: dpsHumanImage, DEMON: dpsDemonImage },
      support: { HUMAN: supportHumanImage, DEMON: supportDemonImage },
      tank: { HUMAN: tankHumanImage, DEMON: tankDemonImage },
    }

    const byRole = roleToCharacterVariant[normalized]
    if (byRole) {
      return byRole[getCharacter(ownerId)]
    }

    return undefined
  }

  const resolveRoleByType = (type: string) => {
    const normalized = type.toLowerCase().replace(/[_\s-]/g, "")

    if (normalized.includes("fight")) return "fighter"
    if (normalized.includes("assass")) return "assassin"
    if (normalized.includes("dps")) return "dps"
    if (normalized.includes("tank")) return "tank"
    return "support"
  }

  const resolveHpPercent = (minion: PositionedMinion) => {
    if (typeof minion.hpPercent === "number") {
      return Math.max(0, Math.min(100, minion.hpPercent))
    }
    if (typeof minion.hp === "number") {
      const fallback = minion.hp <= 100 ? minion.hp : 100
      return Math.max(0, Math.min(100, fallback))
    }
    return 100
  }

  return (
    <>
      {dyingMinions.map((minion) => {
        const imageSrc = resolveImageByType(minion.type, minion.ownerId)
        if (!imageSrc) return null

        const role = resolveRoleByType(minion.type)
        const ownerCharacter = getCharacter(minion.ownerId)
        const classColorMap =
          ownerCharacter === "DEMON"
            ? DEMON_CLASS_COLOR_BY_ROLE
            : HUMAN_CLASS_COLOR_BY_ROLE
        const auraColor = classColorMap[role]
        const auraColorStrong = `${auraColor}cc`

        const xOffset =
          minion.col * (hexWidth + hexGap) +
          (minion.row % 2 ? (hexWidth + hexGap) / 2 : 0) +
          boardPadding
        const yOffset = minion.row * (verticalSpacing + hexGap) + boardPadding
        const centerX = xOffset + hexWidth / 2
        const centerY = yOffset + hexHeight / 2

        const size = 74
        const clipId = `death-clip-${minion.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`

        return (
          <g key={minion.id} pointerEvents="none">
            <circle
              cx={centerX}
              cy={centerY}
              r={size / 2 + 16}
              fill="#fff4d6"
              className="minion-death-core"
            />

            <circle
              cx={centerX}
              cy={centerY}
              r={size / 2 + 12}
              fill="none"
              stroke={auraColorStrong}
              strokeWidth={6}
              className="minion-death-wave"
            />

            <ellipse
              cx={centerX}
              cy={centerY + 18}
              rx={size / 2 + 8}
              ry={10}
              fill="rgba(8,6,8,0.85)"
              className="minion-death-scorch"
            />

            <circle
              cx={centerX}
              cy={centerY}
              r={size / 2 + 10}
              fill="rgba(255,244,214,0.95)"
              className="minion-death-flash"
            />

            <circle
              cx={centerX}
              cy={centerY}
              r={size / 2 + 6}
              fill="rgba(255,245,235,0.9)"
              className="minion-death-burst"
            />

            <circle
              cx={centerX}
              cy={centerY}
              r={size / 2 + 2}
              fill="none"
              stroke={auraColorStrong}
              strokeWidth={4}
              className="minion-death-ring"
            />

            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
              const rad = (angle * Math.PI) / 180
              const sx = centerX + Math.cos(rad) * (size / 2 + 2)
              const sy = centerY + Math.sin(rad) * (size / 2 + 2)
              return (
                <rect
                  key={`${minion.id}-death-shard-${angle}`}
                  x={sx - 1.5}
                  y={sy - 6}
                  width={3.5}
                  height={16}
                  rx={1.2}
                  fill={auraColorStrong}
                  transform={`rotate(${angle} ${sx} ${sy})`}
                  className="minion-death-shard"
                />
              )
            })}

            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const rad = (angle * Math.PI) / 180
              const px = centerX + Math.cos(rad) * (size / 2 + 20)
              const py = centerY + Math.sin(rad) * (size / 2 + 20)
              return (
                <circle
                  key={`${minion.id}-death-spark-${angle}`}
                  cx={px}
                  cy={py}
                  r={2.8}
                  fill="#fff1a8"
                  className="minion-death-spark"
                />
              )
            })}

            <clipPath id={clipId}>
              <circle cx={centerX} cy={centerY} r={size / 2} />
            </clipPath>

            <image
              href={imageSrc}
              x={centerX - size / 2}
              y={centerY - size / 2}
              width={size}
              height={size}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
              className="minion-death-fade"
            />
          </g>
        )
      })}

      {positionedMinions.map((minion) => {
        const imageSrc = resolveImageByType(minion.type, minion.ownerId)
        if (!imageSrc) return null
        const isShaking = shakingSet.has(minion.runtimeId)
        const hpPercent = resolveHpPercent(minion)
        const role = resolveRoleByType(minion.type)
        const ownerCharacter = getCharacter(minion.ownerId)
        const classColorMap =
          ownerCharacter === "DEMON"
            ? DEMON_CLASS_COLOR_BY_ROLE
            : HUMAN_CLASS_COLOR_BY_ROLE
        const auraColor = classColorMap[role]
        const auraColorSoft = `${auraColor}55`
        const auraColorStrong = `${auraColor}cc`
        const hpColor = auraColor
        const hpColorSoft = `${auraColor}55`

        const size = 62
        const outerRing = size / 2.3 + 10
        const progressRadius = size / 2 + 1
        const progressCircumference = 2 * Math.PI * progressRadius
        const dashOffset =
          progressCircumference - (hpPercent / 100) * progressCircumference
        const offsetStep = 10
        const offset =
          (minion.stackIndex - (minion.stackSize - 1) / 2) * offsetStep
        const centerX = minion.x + offset
        const centerY = minion.y
        const clipId = `clip-${minion.runtimeId.replace(/[^a-zA-Z0-9_-]/g, "-")}`

        return (
          <g
            key={minion.key}
            className={isShaking ? "minion-shake" : undefined}
            pointerEvents="none"
          >
            {isShaking && (
              <>
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={size / 2 + 8}
                  fill="#fff7ed"
                  className="minion-hit-flash"
                />
                <g>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                    const rad = (angle * Math.PI) / 180
                    const sparkRadius = size / 2 + 14
                    const px = centerX + Math.cos(rad) * sparkRadius
                    const py = centerY + Math.sin(rad) * sparkRadius
                    return (
                      <circle
                        key={`${minion.key}-hit-${angle}`}
                        cx={px}
                        cy={py}
                        r={2.1}
                        fill="#fde68a"
                        className="minion-hit-spark"
                      />
                    )
                  })}
                </g>
              </>
            )}

            <circle
              cx={centerX}
              cy={centerY}
              r={outerRing + 6}
              fill={auraColorSoft}
              className="minion-aura-pulse"
            />

            <circle
              cx={centerX}
              cy={centerY}
              r={outerRing}
              fill="none"
              stroke={auraColorStrong}
              strokeWidth={5}
              className="minion-aura-spin"
            />

            <circle
              cx={centerX}
              cy={centerY}
              r={outerRing + 2}
              fill="none"
              stroke={auraColorSoft}
              strokeWidth={1.2}
              strokeDasharray="6 8"
              className="minion-aura-spin-reverse"
            />

            <g className="minion-aura-spin">
              {[0, 72, 144, 216, 288].map((angle) => {
                const rad = (angle * Math.PI) / 180
                const px = centerX + Math.cos(rad) * (outerRing + 4)
                const py = centerY + Math.sin(rad) * (outerRing + 4)
                return (
                  <circle
                    key={`${minion.key}-spark-${angle}`}
                    cx={px}
                    cy={py}
                    r={1.8}
                    fill={auraColorStrong}
                    className="minion-aura-spark"
                  />
                )
              })}
            </g>

            <circle
              cx={centerX}
              cy={centerY}
              r={progressRadius}
              fill="none"
              stroke="rgba(20,20,20,0.85)"
              strokeWidth={10}
            />
///
            <circle
              cx={centerX}
              cy={centerY}
              r={progressRadius}
              fill="none"
              stroke={hpColor}
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={progressCircumference}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${centerX} ${centerY})`}
              className="minion-hp-ring"
              style={{
                filter: `drop-shadow(0 0 6px ${hpColorSoft})`,
              }}
            />

            <clipPath id={clipId}>
              <circle cx={centerX} cy={centerY} r={size / 2} />
            </clipPath>

            <image
              href={imageSrc}
              x={centerX - size / 2}
              y={centerY - size / 2}
              width={size}
              height={size}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
            />

            <circle
              cx={centerX}
              cy={centerY}
              r={size / 2}
              fill="none"
              stroke={auraColorStrong}
              strokeWidth={1.5}
            />

            <rect
              x={centerX - 22}
              y={centerY + size / 2 - 6}
              width={44}
              height={16}
              rx={8}
              fill="rgba(0,0,0,0.7)"
              stroke={auraColorStrong}
              strokeWidth={1}
            />
            <text
              x={centerX}
              y={centerY + size / 2 + 6}
              textAnchor="middle"
              fontSize={10}
              fontWeight={800}
              fill="#fef3c7"
              className="select-none"
              style={{ textShadow: `0 0 8px ${auraColorStrong}` }}
            >
              {Math.round(hpPercent)}%
            </text>
          </g>
        )
      })}
    </>
  )
}
