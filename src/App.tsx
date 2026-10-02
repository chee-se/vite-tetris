import Board from './components/Board.tsx'
import { createSampleField } from './game/field.ts'

const field = createSampleField()

function App() {
  return (
    <main className="app">
      <h1>Vite Tetris</h1>
      <Board field={field} />
    </main>
  )
}

export default App
