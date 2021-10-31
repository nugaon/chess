import { Square } from 'chess-types';
import Chessboard from 'chessboardjsx';
import { useContext, useEffect, useState } from 'react';
import { Context as ChessContext } from '../providers/chess-engine';
import { Context as isAIcheckedContext } from '../providers/ai-checked';
import { Context as BeeContext, zeroPostageId } from '../providers/bee';
import { setSwarmHashToUrl, uploadString } from '../utils/swarm-game-data';



type Piece =
  'wP' | 'wN' | 'wB' | 'wR' | 'wQ' | 'wK' |
  'bP' | 'bN' | 'bB' | 'bR' | 'bQ' | 'bK'
;

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
  const [winnder, setWinner] = useState('')

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

  //const { setChecked } = useContext(isAIcheckedContext)
  const [stateHash, setStateHash] = useState('')
  const [stateUrl, setStateUrl] = useState('')
  //const [checked, setCheckboxChecked ] = useState(false)
  const [AIMove, setAIMove ] = useState('')

  if (AIMove!=='') {
    console.log("AI Move: "+AIMove)

    game.move(AIMove)
    setFen(game.fen())
    setAIMove('')

    if (AIMove.includes("#") || AIMove.includes("++")) {
      setCheckMate(true)
      setWinner('AI')
      //game.in_checkmate() ? setWinner('AI') : setWinner('Human')
      console.log(game.in_checkmate())
      console.log(game.history())
      alert("  --== ALL HAIL H.A.L. ==--  ")
    }
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


  async function applyAIMove(){

    await getAIMove(game.fen())

  }

  const onDrop = ({ sourceSquare, targetSquare, piece }: { sourceSquare: Square, targetSquare: Square, piece: Piece }): void => {

    // see if the move is legal
    let move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return;


    if(isAIchecked.checked){
      applyAIMove()
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

    let move = game.move({
      from: pieceSquare,
      to: square,
      promotion: 'q' // always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return;

    if(isAIchecked.checked){
      applyAIMove()
    }

    setFen(game.fen())
    console.log(game.fen())

    setHistory(game.history({ verbose: true }))
    setPieceSquare(null)
  };

  //const onSquareRightClick = (square: Square) =>
    //setSquareStyles({ [square]: { backgroundColor: 'deepPink' } })

  useEffect(() => {
    setFen(startingFen)
  }, [startingFen])

  return (
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
        //onSquareRightClick={onSquareRightClick}
      />
    </div>
  )
}
