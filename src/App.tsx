import { useReducer } from 'react'
import Board from '@/components/Board.tsx'
import { initialState, reducer } from '@/game/reducer.ts'
import { useKeyboard } from '@/hooks/useKeyboard.ts'

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  useKeyboard(dispatch)

  return (
    <main className="app">
      <h1>Vite Tetris</h1>
      <Board field={state.field} current={state.current} />
    </main>
  )
}

export default App
