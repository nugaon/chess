import './App.css';
import ChessTable from './chess-table';
import ChessEngine from './providers/chess-engine';

function App() {

  return (
    <div className="App">
      <ChessEngine>
        <ChessTable></ChessTable>
      </ChessEngine>
    </div>
  );
}

export default App
