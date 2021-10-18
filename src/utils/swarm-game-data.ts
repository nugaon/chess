
export interface SwarmGameData {
  fen: string,
  history: string[],
}

export function uploadString(fen: string, history: string[]): string {
  return JSON.stringify({
    fen,
    history,
  })
}

export function getSwarmHashFromUrl(): string | null {
  const urlSearchParams = new URLSearchParams(window.location.search)
  return urlSearchParams.get('base')
}

export function setSwarmHashToUrl(hash: string): string {
  const urlSearchParams = new URLSearchParams(window.location.search)
  const url = window.location.href.split('?')[0];
  urlSearchParams.set('base', hash)

  return `${url}?${urlSearchParams}`
}
