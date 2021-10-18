import './App.css';
import ChassTable from './chess-table';
import ChessEngine from './providers/chess-engine';

function App() {

  return (
    <div className="App">
      <ChessEngine>
        <ChassTable></ChassTable>
      </ChessEngine>
    </div>
  );
}

export default App
