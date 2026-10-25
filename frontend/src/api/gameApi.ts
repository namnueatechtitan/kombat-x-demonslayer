const DEFAULT_BACKEND_ORIGIN = "https://backend-kombat68.onrender.com"

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "")

const resolveApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  if (configured) {
    return trimTrailingSlash(configured)
  }

  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return `${window.location.protocol}//${window.location.hostname}:8080/api/game`
  }

  return `${DEFAULT_BACKEND_ORIGIN}/api/game`
}

const BASE_URL = resolveApiBaseUrl()

type Character = "HUMAN" | "DEMON"
type GameMode = "DUEL" | "SOLITAIRE" | "AUTO"

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
}

const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const { body, headers, ...rest } = options

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${path}`)
  }

  const contentType = res.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return (await res.json()) as T
  }

  return (await res.text()) as T
}

export const setCharacter = (playerId: number, character: Character) =>
  apiRequest<Record<string, unknown>>("/character", {
    method: "POST",
    body: { playerId, character },
  })

export const setMode = (mode: GameMode) =>
  apiRequest<Record<string, unknown>>("/mode", {
    method: "POST",
    body: { mode },
  })

export const getConfig = <T = Record<string, number>>() => apiRequest<T>("/config")

export const saveConfig = <T extends object>(config: T) =>
  apiRequest<Record<string, unknown>>("/config", {
    method: "POST",
    body: config,
  })

export interface SetupMinionPayload {
  type: string
  name: string
  defenseFactor: number
  strategy: string
}

export const setupFull = (playerId: number, minions: SetupMinionPayload[]) =>
  apiRequest<CommandResponse>(`/setup/full/${playerId}`, {
    method: "POST",
    body: minions,
  })

export const getSetupSummary = () => apiRequest<Record<string, unknown>>("/setup")

export const startGame = () =>
  apiRequest<CommandResponse>("/start", {
    method: "POST",
  })

export interface SpawnableHex {
  row: number
  col: number
  ownerId: number
}

export type TurnPhase = "FREE_SPAWN" | "PLAYER_ACTION" | "EXECUTION" | "END"

export interface GameMinion {
  ownerId: number
  type: string
  kindName?: string
  hp?: number
  x: number
  y: number
}

export interface GameStateDto {
  turnNumber: number
  phase: TurnPhase
  minions: GameMinion[]
  budget: number
  spawnsLeft: number
}

export interface PlayerEconomyDto {
  playerId: number
  budget: number
  spawnsLeft: number
  lastInterest: number
}

export interface GameStatus {
  currentPlayer: number
  gameOver: boolean
  winner: string
  gameState: GameStateDto
  spawnableHexes: SpawnableHex[]
  buyableHexes: SpawnableHex[]
  actionLogs: string[]
  playerEconomy?: Record<string, PlayerEconomyDto>
  availableTypes: string[]
}

export interface SpawnResponse {
  success: boolean
  phase: TurnPhase
  currentPlayer: number
  turn: number
}

export interface BuyHexResponse {
  success: boolean
  phase: TurnPhase
}

export interface CommandResponse {
  message: string
  phase?: string
}

export const getGameStatus = () => apiRequest<GameStatus>("/status")

export const spawnMinion = (type: string, row: number, col: number) =>
  apiRequest<SpawnResponse>("/spawn", {
    method: "POST",
    body: { type, row, col },
  })

export const buyHex = (row: number, col: number) =>
  apiRequest<BuyHexResponse>("/buy-hex", {
    method: "POST",
    body: { row, col },
  })

export const endTurn = () =>
  apiRequest<CommandResponse>("/end-turn", {
    method: "POST",
  })

export const resetGame = () =>
  apiRequest<string>("/reset", {
    method: "POST",
  })