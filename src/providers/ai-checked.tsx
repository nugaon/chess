import { createContext, ReactChild, ReactElement, useMemo, useReducer, useState } from "react"

export const Context = createContext({checked:false, setChecked : (value:boolean)=>{
},});

interface Props {
    children: ReactChild | ReactChild[]
  }



export default function Provider({ children }: Props) {

    const [checked, setChecked] = useState<boolean>(true)
    const value = useMemo(
        () => ({ checked, setChecked }),
        [checked]
      );


return (
    <Context.Provider value={{checked, setChecked}}>
      {children}
    </Context.Provider>

  )
}
