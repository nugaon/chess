import { Bee } from '@ethersphere/bee-js'
import { createContext, ReactChild, ReactElement, useEffect, useState } from 'react'

interface ContextInterface {
  bee: Bee | null
}

const initialValues: ContextInterface = {
  bee: null,
}

export const Context = createContext<ContextInterface>(initialValues)
export const Consumer = Context.Consumer

interface Props {
  children: ReactChild | ReactChild[]
}

export function Provider({ children }: Props): ReactElement {
  const [bee, setBee] = useState<Bee | null>(initialValues.bee)

  useEffect(() => {
    //swarm extension init
    let apiAddress: string
    if (window.swarm) {
      apiAddress = window.swarm.web2Helper.fakeBeeApiAddress()
    } else {
      apiAddress = 'https://bee-9.gateway.ethswarm.org'
    }
    setBee(new Bee(apiAddress))
    console.log(`using Bee endpoint: ${apiAddress}`)
  }, [])

  return (
    <Context.Provider value={{ bee }}>
      {children}
    </Context.Provider>
  )
}

export const zeroPostageId = '0000000000000000000000000000000000000000000000000000000000000000'

export default Provider
