import { Bee } from '@ethersphere/bee-js'
import { createContext, ReactChild, ReactElement, useState } from 'react'

interface ContextInterface {
  bee: Bee
}

const initialValues: ContextInterface = {
  bee: new Bee('https://bee-9.gateway.ethswarm.org'),
}

export const Context = createContext<ContextInterface>(initialValues)
export const Consumer = Context.Consumer

interface Props {
  children: ReactChild | ReactChild[]
}

export function Provider({ children }: Props): ReactElement {
  const [bee] = useState<Bee>(initialValues.bee)

  return (
    <Context.Provider value={{ bee }}>
      {children}
    </Context.Provider>
  )
}

export const zeroPostageId = '0000000000000000000000000000000000000000000000000000000000000000'

export default Provider
