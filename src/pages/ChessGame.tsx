import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Chess, Move } from 'chess.js';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

// Piece SVGs mapping (basic unicode for brevity or simple SVGs)
const pieceMap: Record<string, string> = {
  'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
  'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔'
};

const pieceValues: Record<string, number> = {
  p: 10, n: 30, b: 30, r: 50, q: 90, k: 900,
  P: -10, N: -30, B: -30, R: -50, Q: -90, K: -900
};

export default function ChessGame() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'bot'; // 'bot' or 'local'
  const navigate = useNavigate();

  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [botLevel, setBotLevel] = useState<number | null>(mode === 'bot' ? null : -1);
  const [turnIndicator, setTurnIndicator] = useState<'w'|'b'|null>(null);

  const isWhiteTurn = game.turn() === 'w';

  // Sound effects (Mock functions as audio files are not provided)
  const playSound = (type: 'move' | 'capture') => {
    // In a real app, instantiate Audio and play.
  };

  const makeMove = useCallback((moveStr: string | {from: string, to: string, promotion?: string}) => {
    try {
      const result = game.move(moveStr);
      if (result) {
        setGame(new Chess(game.fen())); // Force re-render
        playSound(result.captured ? 'capture' : 'move');
        
        if (mode === 'local') {
           setTurnIndicator(game.turn() === 'w' ? 'w' : 'b');
        }
      }
    } catch (e) {
      console.log("Invalid move", e);
    }
  }, [game, mode]);

  const handleSquareClick = (square: string) => {
    if (botLevel === null && mode === 'bot') return; // Wait to select level
    if (game.isGameOver()) return;
    if (mode === 'bot' && game.turn() === 'b') return; // Bot's turn

    if (selectedSquare) {
      // Trying to move
      const move = legalMoves.find(m => m.to === square);
      if (move) {
        makeMove({ from: selectedSquare, to: square, promotion: 'q' });
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
    }

    // Selecting a piece
    const piece = game.get(square as any);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      setLegalMoves(game.moves({ square: square as any, verbose: true }) as Move[]);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Bot Logic - Basic Minimax
  const evaluateBoard = (chess: Chess) => {
    let totalEvaluation = 0;
    const board = chess.board();
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j]) {
              totalEvaluation += pieceValues[board[i][j]!.type] * (board[i][j]!.color === 'w' ? -1 : 1); 
            }
        }
    }
    return totalEvaluation;
  };

  const minimax = (chess: Chess, depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean): number => {
    if (depth === 0 || chess.isGameOver()) {
        return evaluateBoard(chess);
    }

    const availableMoves = chess.moves();

    if (isMaximizingPlayer) {
        let bestVal = -Infinity;
        for (let i = 0; i < availableMoves.length; i++) {
            chess.move(availableMoves[i]);
            bestVal = Math.max(bestVal, minimax(chess, depth - 1, alpha, beta, !isMaximizingPlayer));
            chess.undo();
            alpha = Math.max(alpha, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    } else {
        let bestVal = Infinity;
        for (let i = 0; i < availableMoves.length; i++) {
            chess.move(availableMoves[i]);
            bestVal = Math.min(bestVal, minimax(chess, depth - 1, alpha, beta, !isMaximizingPlayer));
            chess.undo();
            beta = Math.min(beta, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    }
  };

  useEffect(() => {
    if (mode === 'bot' && game.turn() === 'b' && !game.isGameOver() && botLevel !== null) {
      setTimeout(() => {
        const moves = game.moves();
        if (botLevel === 0) { // Noob (random)
          makeMove(moves[Math.floor(Math.random() * moves.length)]);
        } else {
          // Determine depth based on level (Pro=1, God=2, Legend=3)
          const depth = Math.min(botLevel, 3); // Capped at 3 to prevent main thread blocking in this basic impl
          let bestMove = null;
          let bestValue = -Infinity;
          
          // Shuffle moves to add variety
          const shuffledMoves = [...moves].sort(() => Math.random() - 0.5);

          // simplified root minimax
          for(let i=0; i<shuffledMoves.length; i++) {
            game.move(shuffledMoves[i]);
            const baseValue = minimax(game, depth - 1, -Infinity, Infinity, false);
            // Add tiny random noise (0 to 0.1) to break ties among moves with equal evaluation
            const boardValue = baseValue + (Math.random() * 0.1);
            game.undo();
            if (boardValue > bestValue) {
               bestValue = boardValue;
               bestMove = shuffledMoves[i];
            }
          }
          if (!bestMove) bestMove = shuffledMoves[0];
          makeMove(bestMove);
        }
      }, 500);
    }
  }, [game, mode, botLevel, makeMove]);

  // Render board
  const board = game.board();
  const ranks = mode === 'local' && game.turn() === 'b' ? [1,2,3,4,5,6,7,8] : [8,7,6,5,4,3,2,1]; // Flip for local
  const files = mode === 'local' && game.turn() === 'b' ? ['h','g','f','e','d','c','b','a'] : ['a','b','c','d','e','f','g','h'];

  return (
    <div className="fixed inset-0 bg-[#302E2B] z-50 flex flex-col items-center">
      <header className="w-full flex items-center justify-between p-4 text-white">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full active:scale-95">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-heading font-bold text-lg">{mode === 'bot' ? 'vs Bot' : 'Local 1v1'}</span>
        <button onClick={() => setGame(new Chess())} className="p-2 bg-white/10 rounded-full active:scale-95">
          <RotateCcw className="w-6 h-6" />
        </button>
      </header>

      {mode === 'bot' && botLevel === null && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 p-6 text-white text-center">
           <h2 className="text-3xl font-heading font-bold mb-8">Select Difficulty</h2>
           <div className="flex flex-col gap-3 w-full max-w-sm">
             {['Noob', 'Pro', 'God', 'Legend'].map((lvl, i) => (
                <button 
                  key={lvl} 
                  onClick={() => setBotLevel(i)}
                  className="w-full py-4 bg-[#7FA650] hover:bg-[#8CB759] rounded-xl font-bold text-xl transition-transform active:scale-95 text-white shadow-[0_4px_0_#537133]"
                >
                  {lvl}
                </button>
             ))}
           </div>
        </div>
      )}

      {turnIndicator && mode === 'local' && (
        <div 
          className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 text-white cursor-pointer"
          onClick={() => setTurnIndicator(null)}
        >
          <h2 className="text-4xl font-heading font-bold mb-4">{turnIndicator === 'w' ? "White's Turn" : "Black's Turn"}</h2>
          <p className="opacity-70">Tap to show board</p>
        </div>
      )}

      <div className="flex-1 w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md aspect-square flex flex-col relative" style={{boxShadow: '0 0 20px rgba(0,0,0,0.5)'}}>
           {ranks.map((rank, ri) => (
             <div key={rank} className="flex-1 flex">
               {files.map((file, fi) => {
                 const square = (file + rank) as string;
                 const idx = mode === 'local' && !isWhiteTurn 
                      ? (7-ri) * 8 + (7-fi)
                      : ri * 8 + fi;
                 const piece = game.get(square as any);
                 const isLight = (ri + fi) % 2 === 0;
                 const isSelected = selectedSquare === square;
                 const isLegalMove = legalMoves.some(m => m.to === square);

                 return (
                   <div 
                     key={square}
                     className={cn(
                       "flex-1 relative flex items-center justify-center text-4xl sm:text-5xl cursor-pointer",
                       isLight ? "bg-[#F0D9B5]" : "bg-[#B58863]",
                       isSelected && "bg-[#F5F682]"
                     )}
                     onClick={() => handleSquareClick(square)}
                   >
                      {isLegalMove && (
                        <div className={cn("absolute rounded-full pointer-events-none z-10", piece ? "w-full h-full border-4 border-black/20" : "w-1/3 h-1/3 bg-black/20")} />
                      )}
                      {piece && (
                        <motion.span 
                          layoutId={`piece-${piece.type}-${piece.color}-${square}`}
                          className={cn(
                            "relative z-0 select-none", 
                            piece.color === 'w' ? "text-white" : "text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
                          )}
                          style={{
                             WebkitTextStroke: piece.color === 'w' ? '1px black' : 'none',
                             textShadow: piece.color === 'w' ? '0 2px 2px rgba(0,0,0,0.5)' : 'none'
                          }}
                        >
                          {piece.color === 'w' ? pieceMap[piece.type.toUpperCase()] : pieceMap[piece.type]}
                        </motion.span>
                      )}
                   </div>
                 )
               })}
             </div>
           ))}
        </div>
      </div>

      {game.isGameOver() && (
        <div className="absolute inset-x-0 bottom-0 top-auto bg-black/90 p-8 flex flex-col items-center justify-center rounded-t-3xl text-white">
           <h2 className="text-3xl font-heading font-bold mb-2">Game Over</h2>
           <p className="text-xl mb-8 opacity-80">{game.isCheckmate() ? "Checkmate!" : "Draw"}</p>
           <button onClick={() => setGame(new Chess())} className="w-full max-w-sm py-4 bg-[#7FA650] rounded-xl font-bold text-xl active:scale-95 shadow-[0_4px_0_#537133]">
             Play Again
           </button>
        </div>
      )}
    </div>
  );
}
