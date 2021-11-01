import './App.css';
import React from 'react';

import ChessTable from './components/chess-table';
import Menu from './components/menu';
import Bee from './providers/bee';
import { useContext, useState } from 'react';
import { Context as ChessContext } from './providers/chess-engine';
import { setSwarmHashToUrl, uploadString } from './utils/swarm-game-data';
import { Context as BeeContext, zeroPostageId } from './providers/bee';

import ChessEngine from './providers/chess-engine';
import AiChecked from './providers/ai-checked'


function App() {
  const { game } = useContext(ChessContext)
  const [stateHash, setStateHash] = useState('')
  const [stateUrl, setStateUrl] = useState('')
  const { bee } = useContext(BeeContext)

  async function uploadToSwarm() {
    if (!bee) return

    const resp = await bee.uploadData(zeroPostageId, uploadString(game.fen(), game.history()))
    setStateUrl(setSwarmHashToUrl(resp.reference))
    setStateHash(resp.reference)
  }
  return (
    <div className="App">
      <Bee>
        <AiChecked>
          <ChessEngine>
          <Menu></Menu>
            <ChessTable></ChessTable>
          </ChessEngine>
        </AiChecked>
      </Bee>
    </div>
  );
}

export default App
