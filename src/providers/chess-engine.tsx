import { ChessInstance } from 'chess-types'
import * as Chess from 'chess.js'
import { createContext, ReactChild, ReactElement, useContext, useEffect, useState } from 'react'
import { getSwarmHashFromUrl, SwarmGameData } from '../utils/swarm-game-data'
import { Context as BeeContext } from './bee'

interface ContextInterface {
  game: ChessInstance,
  startingFen: string
}

const initialValues: ContextInterface = {
  game: new Chess(),
  startingFen: ''
}

export const Context = createContext<ContextInterface>(initialValues)
export const Consumer = Context.Consumer

interface Props {
  children: ReactChild | ReactChild[]
}

export function Provider({ children }: Props): ReactElement {
  const [game] = useState<ChessInstance>(initialValues.game)
  const [startingFen, setStartingFen] = useState<string>(initialValues.startingFen)
  const { bee } = useContext(BeeContext)

  const loadGameFromSwarm = async (hash: string) => {
    const data = await bee.downloadData(hash)
    try {
      const starting: SwarmGameData = data.json() as unknown as SwarmGameData
      for (const el of starting.history) {
        game.move(el)
      }
      if(game.fen() !== starting.fen) throw Error
      setStartingFen(game.fen())
    } catch(e) {
      alert(`The loaded data "${data.text()}" does not have a correct format`)
    }
  }

  useEffect(() => {
    const baseSwarmHash = getSwarmHashFromUrl()
    if(baseSwarmHash) {
      loadGameFromSwarm(baseSwarmHash)
    }
    else {
      setStartingFen(game.fen())
    }
  }, [game])

  return (
    <Context.Provider value={{ game, startingFen }}>
      {children}
    </Context.Provider>
  )
}

export default Provider
