
export interface ThemeContextState {
    isDarkTheme: boolean
}

export type ThemeContextAction = {type: 'TOGGLE_THEME'}

export const reducer = (state: ThemeContextState, action: ThemeContextAction): ThemeContextState => {
    switch (action.type) {
      case 'TOGGLE_THEME':
        const newState = {
          ...state,
          isDarkTheme: !state.isDarkTheme
        }
        localStorage.setItem('ThemeContext', JSON.stringify(newState))
        return newState
  
      default:
        return state
    }
  }
  
  export const initialState = (): ThemeContextState => {
    let isDarkTheme;
    try {
      const state: ThemeContextState = JSON.parse(localStorage.getItem('ThemeContext') ?? '{}')
      isDarkTheme = state.isDarkTheme
    }
    catch {
      isDarkTheme = false
    }
    return {
      isDarkTheme
    }
  }