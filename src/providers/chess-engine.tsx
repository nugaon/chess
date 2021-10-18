import { ChessInstance } from 'chess-types'
import * as Chess from 'chess.js'
import { createContext, ReactChild, ReactElement, useState } from 'react'

interface ContextInterface {
  game: ChessInstance
}

const initialValues: ContextInterface = {
  game: new Chess(),
}

export const Context = createContext<ContextInterface>(initialValues)
export const Consumer = Context.Consumer

interface Props {
  children: ReactChild
}

export function Provider({ children }: Props): ReactElement {
  const [game] = useState<ChessInstance>(initialValues.game)
  
  return (
    <Context.Provider value={{ game }}>
      {children}
    </Context.Provider>
  )
}

export default Provider
