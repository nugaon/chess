import axios from 'axios';
import { Move, ShortMove, Square } from 'chess-types';
import Chessboard from 'chessboardjsx';
import { useContext, useEffect, useState } from 'react';
import { Context as isAIcheckedContext } from '../providers/ai-checked';
import { Context as BeeContext } from '../providers/bee';
import { Context as ChessContext } from '../providers/chess-engine';


type Piece =
  'wP' | 'wN' | 'wB' | 'wR' | 'wQ' | 'wK' |
  'bP' | 'bN' | 'bB' | 'bR' | 'bQ' | 'bK'
;

export async function sendGameEnd(history: string[]): Promise<void> {
  await axios.post('http://localhost:3001/game-end', {
    history
  })
}

export default function ChessTable() {

  const [fen, setFen] = useState<string>('start')
  const [dropSquareStyle, setDropSquareStyle] = useState<any>({})
  const [squareStyles, setSquareStyles] = useState<any>({})
  const [pieceSquare, setPieceSquare] = useState<Square | null>(null)
  const [history, setHistory] = useState<Array<any>>([])
  const { game, startingFen } = useContext(ChessContext)
  const { bee } = useContext(BeeContext)
  const isAIchecked = useContext(isAIcheckedContext);
  const [checkMate, setCheckMate ] = useState(false)
  const [winner, setWinner] = useState<'w' | 'b' | 'd' | ' '>(' ')
  //const { setChecked } = useContext(isAIcheckedContext)
  const [stateHash, setStateHash] = useState('')
  const [stateUrl, setStateUrl] = useState('')
  const [check, setCheck] = useState<boolean>(false)
  const [draw, setDraw] = useState<boolean>(false)
  //const [checked, setCheckboxChecked ] = useState(false)
  const [AIMove, setAIMove ] = useState('')

  const move = (step: string | ShortMove): Move | null => {
    const move = game.move(step)
    if(!move) return move

    // after move
    if (game.in_checkmate()) {
      sendGameEnd(game.history())
      setCheckMate(true)
      setWinner(game.history().length % 2 === 1 ? 'w' : 'b' )
    } else if (game.in_stalemate() || game.in_draw()) {
      sendGameEnd(game.history())
      setDraw(true)
      setWinner('d')
    } else if(check !== game.in_check()) {
      setCheck(game.in_check())
    }

    return move
  }

  const squareStyling = ({ pieceSquare, history }: { pieceSquare: string | null, history: Array<any> }) => {
    const sourceSquare = history.length && history[history.length - 1].from;
    const targetSquare = history.length && history[history.length - 1].to;

    const css: any = {
      ...(history.length && {
        [sourceSquare]: {
          backgroundColor: 'rgba(255, 255, 0, 0.4)'
        }
      }),
      ...(history.length && {
        [targetSquare]: {
          backgroundColor: 'rgba(255, 255, 0, 0.4)'
        }
      })
    }

    if(pieceSquare) {
      css[pieceSquare] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    }

    return css
  }

  // keep clicked square style and remove hint squares
  const removeHighlightSquare = () => {
    setSquareStyles(squareStyling({ pieceSquare, history }))
  };

  // show possible moves
  const highlightSquare = (sourceSquare: Square, squaresToHighlight: Square[]) => {
    const highlightStyles = [sourceSquare, ...squaresToHighlight].reduce(
      (a, c) => {
        return {
          ...a,
          ...{
            [c]: {
              background:
                'radial-gradient(circle, #fffc00 36%, transparent 40%)',
              borderRadius: '50%'
            }
          },
          ...squareStyling({
            history,
            pieceSquare
          })
        };
      },
      {}
    );
    setSquareStyles({...squareStyles, ...highlightStyles})
  };

  if (AIMove !== '') {
    console.log("AI Move: "+AIMove)

    move(AIMove)
    setFen(game.fen())
    setAIMove('')
  }
  async function getAIMove(fen:any){

      fetch('http://localhost:6969', {
        //signal: controller.signal,
      //mode: 'no-cors',
      method: 'POST',
      // headers: {
      //   'Accept': 'application/json',
      //   'Content-Type': 'application/json'
      // },
      body: JSON.stringify({
        "FenString": fen
      })
    }).then(( response ) => response.json( ))
    .then(( data ) => {
        setAIMove(data['AI Move'])
        return  data.json})
  }

  async function getAgentMove(fen:string, history: string[]): Promise<any>{
    console.log('ask for agent moves at state', fen, history)

    const response = await axios.post('http://localhost:3001/step', {
      fen,
      history
    })

    const { step, perpetrator } = response.data
    console.log('agent move: perpetrator', perpetrator)

    return step
}


  async function applyAIMove(){
    await getAIMove(game.fen())
  }

  async function applyAgentMove() {
    const fen = game.fen()
    const history = game.history()
    const response = await getAgentMove(fen, history)
    console.log('response', response)

    setAIMove(response)
  }

  const onDrop = ({ sourceSquare, targetSquare, piece }: { sourceSquare: Square, targetSquare: Square, piece: Piece }): void => {

    // see if the move is legal
    let step = move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to a queen for example simplicity
    });

    // illegal move
    if (step === null) return;


    if(isAIchecked.checked){
      applyAgentMove()
    }

    setFen(game.fen())
    console.log(game.fen())

    setHistory(game.history({ verbose: true }))
  }

  const onMouseOverSquare = (square: Square) => {
    // get list of possible moves for this square
    let moves = game.moves({
      square,
      verbose: true
    });

    // exit if there are no moves available for this square
    if (moves.length === 0) return;

    let squaresToHighlight: Square[] = [];
    for (var i = 0; i < moves.length; i++) {
      squaresToHighlight.push(moves[i].to);
    }

    highlightSquare(square, squaresToHighlight);
  };

  const onMouseOutSquare = () => removeHighlightSquare();

  // central squares get diff dropSquareStyles
  const onDragOverSquare = (square: Square) => {
    setDropSquareStyle(
      square === 'e4' || square === 'd4' || square === 'e5' || square === 'd5'
        ? { backgroundColor: 'cornFlowerBlue' }
        : { boxShadow: 'inset 0 0 1px 4px rgb(255, 255, 0)' })
  };

  const onSquareClick = (square: Square) => {
    setPieceSquare(square)
    //setSquareStyles(squareStyling({ pieceSquare: square, history }))

    if(!pieceSquare) return

    let step = move({
      from: pieceSquare,
      to: square,
      promotion: 'q' // always promote to a queen for example simplicity
    });

    // illegal move
    if (step === null) return;

    if(isAIchecked.checked){
      applyAgentMove()
    }

    setFen(game.fen())
    console.log(game.fen())

    setHistory(game.history({ verbose: true }))
    setPieceSquare(null)
  };

  useEffect(() => {
    setFen(startingFen)
  }, [startingFen])

  return (<>
    <div hidden={!checkMate}>
    Check Mate!
  </div>
  <div hidden={!check}>
    Check!
  </div>
  <div hidden={winner !== 'w' && winner !== 'b' }>
    The winner is {winner === 'w' ? 'White' : 'Black'}
  </div>
  <div hidden={winner !== 'd' }>
    Draw!
  </div>
    <div style={{
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Chessboard
        id="ChessTable"
        calcWidth={({ screenWidth }) => (screenWidth < 500 ? 350 : 480)}
        position={fen}
        onDrop={onDrop}
        onMouseOverSquare={onMouseOverSquare}
        onMouseOutSquare={onMouseOutSquare}
        boardStyle={{
          borderRadius: '5px',
          boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`
        }}
        squareStyles={squareStyles}
        dropSquareStyle={dropSquareStyle}
        onDragOverSquare={onDragOverSquare}
        onSquareClick={onSquareClick}
      />
    </div>
    </>
  )
}
