
export interface ThemeContextState {
    isDarkTheme: boolean
}

export type ThemeContextAction = {type: 'TOGGLE_THEME'}

export const reducer = (state: ThemeContextState, action: ThemeContextAction): ThemeContextState => {
    switch (action.type) {
      case 'TOGGLE_THEME':
        return {
          ...state,
          isDarkTheme: !state.isDarkTheme
        }
  
      default:
        return state
    }
  }
  
  export const initialState: ThemeContextState = {
    isDarkTheme: false
  }