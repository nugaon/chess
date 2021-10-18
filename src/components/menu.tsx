import type { Bee } from '@ethersphere/bee-js';
import type { ChessInstance, Move } from 'chess-types';
import { useContext, useState } from 'react';
import { Context as BeeContext } from '../providers/bee';
import { Context as ChessContext } from '../providers/chess-engine';
import { uploadString } from '../utils/swarm-game-data';

const zeroPostageId = '0000000000000000000000000000000000000000000000000000000000000000'

function printHistory(history: Move[]): string {
  return JSON.stringify(history, )
}

export default function Menu() {
  const { bee } = useContext(BeeContext)
  const { game } = useContext(ChessContext)
  const [stateHash, setStateHash] = useState('')
  const [stateUrl, setStateUrl] = useState('')

  async function uploadToSwarm(bee: Bee, game: ChessInstance) {
    const resp = await bee.uploadData(zeroPostageId, uploadString(game.fen()))
    const urlSearchParams = new URLSearchParams(window.location.search)
    const url = window.location.href.split('?')[0];
    urlSearchParams.set('base', resp.reference)
    setStateUrl(`${url}?${urlSearchParams}`)
    setStateHash(resp.reference)
  }

  return (
  <div>
    <div>
      <button onClick={() => uploadToSwarm(bee, game)}>Upload to Swarm</button>
    </div>
    <div>
      <button onClick={() => alert(printHistory(game.history({verbose: true})))}>History</button>
    </div>
    <div hidden={!stateHash}>
      State of the game has been uploaded with reference: {stateHash} <br/>
      `You can load the game by <a href={stateUrl}>this URL</a>
    </div>
  </div>
  )
}
