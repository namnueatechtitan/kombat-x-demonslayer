export type MinionType =
  | "FIGHTER"
  | "ASSASSIN"
  | "DPS"
  | "TANK"
  | "SUPPORT"

export interface MinionData {
  type: MinionType
  name: string
  image: string
  preview: string
  strategy?: string
  defenseFactor?: number
}