import React from "react"
import { reducer, initialState, ThemeContextAction } from "./reducer"

export const ThemeContext = React.createContext({
    state: initialState,
    dispatch: ((a: ThemeContextAction) => null) as React.Dispatch<ThemeContextAction>
})

export const ThemeProvider = ({ children }: {children: any}) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  return (
    <ThemeContext.Provider value={{state, dispatch}}>
    	{ children }
    </ThemeContext.Provider>
  )
}