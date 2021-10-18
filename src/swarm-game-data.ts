export interface SwarmGameData {
  fen: string
}

export function uploadString(fen: string): string {
  return JSON.stringify({
    fen
  })
}
