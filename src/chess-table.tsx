import { Square } from 'chess-types';
import Chessboard from 'chessboardjsx';
import { useContext, useState } from 'react';
import { Context as ChessContext } from './providers/chess-engine';

type Piece =
  'wP' | 'wN' | 'wB' | 'wR' | 'wQ' | 'wK' |
  'bP' | 'bN' | 'bB' | 'bR' | 'bQ' | 'bK'
;

export default function HumanVsHuman () {
  const [fen, setFen] = useState<string>('start')
  const [dropSquareStyle, setDropSquareStyle] = useState<any>({})
  const [squareStyles, setSquareStyles] = useState<any>({})
  const [pieceSquare, setPieceSquare] = useState<Square | null>(null)
  const [history, setHistory] = useState<Array<any>>([])
  const { game } = useContext(ChessContext)

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

  const onDrop = ({ sourceSquare, targetSquare, piece }: { sourceSquare: Square, targetSquare: Square, piece: Piece }): void => {
    // const { sourceSquare, targetSquare, piece } = obj
    // see if the move is legal
    let move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return;

    setFen(game.fen())
    setHistory(game.history({ verbose: true }))
    setSquareStyles(squareStyling({ pieceSquare, history }))

    // const notKnights = piece !== 'wN' && piece !== 'bN';
    // notKnights && game.undo();

    // setTimeout(() => {
    //   const notKnights = piece !== 'wN' && piece !== 'bN';
    //   this.setState(({ history, pieceSquare }) => {
    //     notKnights && this.game.undo();

    //     return {
    //       fen: this.game.fen(),
    //       undo: notKnights ? true : false,
    //       history: this.game.history({ verbose: true }),
    //       squareStyles: squareStyling({ pieceSquare, history })
    //     };
    //   });
    // }, 1000)
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
    setSquareStyles(squareStyling({ pieceSquare: square, history }))

    if(!pieceSquare) return

    let move = game.move({
      from: pieceSquare,
      to: square,
      promotion: 'q' // always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return;


    setFen(game.fen())
    setHistory(game.history({ verbose: true }))
    setPieceSquare(null)
  };

  const onSquareRightClick = (square: Square) =>
    setSquareStyles({ [square]: { backgroundColor: 'deepPink' } })

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Chessboard
        id="humanVsHuman"
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
        onSquareRightClick={onSquareRightClick}
      />
    </div>
  )
}
