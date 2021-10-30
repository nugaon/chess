import './App.css';
import ChessTable from './components/chess-table';
import Menu from './components/menu';
import Bee from './providers/bee';
import ChessEngine from './providers/chess-engine';
import AiChecked from './providers/ai-checked'

function App() {

  return (
    <div className="App">
      <Bee>
        <AiChecked>
          <ChessEngine>
            <Menu></Menu>
            <ChessTable></ChessTable>
          </ChessEngine>
        </AiChecked>
      </Bee>
    </div>
  );
}

export default App
