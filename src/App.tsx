import './App.css';
import ChessTable from './chess-table';
import Menu from './menu';
import Bee from './providers/bee';
import ChessEngine from './providers/chess-engine';

function App() {

  return (
    <div className="App">
      <Bee>
        <ChessEngine>
          <Menu></Menu>
          <ChessTable></ChessTable>
        </ChessEngine>
        </Bee>
    </div>
  );
}

export default App
