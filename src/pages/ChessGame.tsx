import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Chess, Move } from 'chess.js';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { ChessPiece } from '../components/ChessPiece';

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
  const [lastCapture, setLastCapture] = useState<{square: string, id: number} | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);

  const isWhiteTurn = game.turn() === 'w';

  // Sound effects
  const playSound = (type: 'move' | 'capture') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (type === 'move') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      } else {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      }
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}
  };

  const makeMove = useCallback((moveStr: string | {from: string, to: string, promotion?: string}) => {
    try {
      const result = game.move(moveStr);
      if (result) {
        setGame(new Chess(game.fen())); // Force re-render
        if (result.captured) {
           playSound('capture');
           setLastCapture({ square: result.to, id: Date.now() });
        } else {
           playSound('move');
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

  const pieceIds = useMemo(() => {
    const ids: Record<string, string> = {};
    ['a','b','c','d','e','f','g','h'].forEach(file => {
      [1,2,7,8].forEach(rank => {
        ids[file + rank] = file + rank;
      });
    });
    game.history({ verbose: true }).forEach(move => {
      ids[move.to] = ids[move.from];
      delete ids[move.from];
      if (move.flags.includes('k')) {
         if (move.color === 'w') { ids['f1'] = ids['h1']; delete ids['h1']; }
         else { ids['f8'] = ids['h8']; delete ids['h8']; }
      } else if (move.flags.includes('q')) {
         if (move.color === 'w') { ids['d1'] = ids['a1']; delete ids['a1']; }
         else { ids['d8'] = ids['a8']; delete ids['a8']; }
      }
    });
    return ids;
  }, [game.fen()]);

  const capturedPieces = useMemo(() => {
    const INITIAL_PIECES = {
      w: { p: 8, n: 2, b: 2, r: 2, q: 1 },
      b: { p: 8, n: 2, b: 2, r: 2, q: 1 }
    };
    const counts = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
    };
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type !== 'k') {
          counts[piece.color as 'w'|'b'][piece.type as 'p'|'n'|'b'|'r'|'q']++;
        }
      }
    }
    
    const whiteCaptured: string[] = []; 
    const blackCaptured: string[] = []; 

    const processCaptured = (color: 'w'|'b', capturedList: string[]) => {
      const types = ['q', 'r', 'b', 'n', 'p'] as const;
      let extra = 0;
      for (const type of types) {
        if (type !== 'p') {
          const diff = INITIAL_PIECES[color][type] - counts[color][type];
          if (diff < 0) {
            extra += -diff;
          } else if (diff > 0) {
            for (let i = 0; i < diff; i++) capturedList.push(type);
          }
        } else {
           const diff = INITIAL_PIECES[color][type] - counts[color][type];
           const actuallyCaptured = diff - extra;
           for (let i = 0; i < actuallyCaptured; i++) capturedList.push(type);
        }
      }
    };
    
    processCaptured('b', whiteCaptured);
    processCaptured('w', blackCaptured);
    
    return { whiteCaptured, blackCaptured };
  }, [game.fen()]);

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

  const BOT_LEVELS = ['Noob', 'Pro', 'God', 'Legend', 'Mythic', 'Titan', 'Immortal', 'Grandmaster', 'Engine'];

  useEffect(() => {
    if (mode === 'bot' && game.turn() === 'b' && !game.isGameOver() && botLevel !== null) {
      setIsBotThinking(true);
      setTimeout(() => {
        const moves = game.moves();
        if (botLevel === 0) { // Noob (random)
          makeMove(moves[Math.floor(Math.random() * moves.length)]);
        } else {
          // Levels mapping logic
          let depth = 1;
          let randomNoise = 0.5;
          if (botLevel === 1) { depth = 1; randomNoise = 0.2; } // Pro
          if (botLevel === 2) { depth = 2; randomNoise = 0.2; } // God
          if (botLevel === 3) { depth = 2; randomNoise = 0.05; } // Legend
          if (botLevel === 4) { depth = 3; randomNoise = 0.1; } // Mythic
          if (botLevel === 5) { depth = 3; randomNoise = 0.02; } // Titan
          if (botLevel === 6) { depth = 3; randomNoise = 0; } // Immortal
          if (botLevel === 7) { depth = 4; randomNoise = 0.05; } // Grandmaster
          if (botLevel === 8) { depth = 4; randomNoise = 0; } // Engine
          
          let bestMove = null;
          let bestValue = -Infinity;
          
          // Shuffle moves to add variety
          const shuffledMoves = [...moves].sort(() => Math.random() - 0.5);

          // simplified root minimax
          for(let i=0; i<shuffledMoves.length; i++) {
            game.move(shuffledMoves[i]);
            const baseValue = minimax(game, depth - 1, -Infinity, Infinity, false);
            // Add tiny random noise to break ties among moves with equal evaluation
            const boardValue = baseValue + (Math.random() * randomNoise);
            game.undo();
            if (boardValue > bestValue) {
               bestValue = boardValue;
               bestMove = shuffledMoves[i];
            }
          }
          if (!bestMove) bestMove = shuffledMoves[0];
          makeMove(bestMove);
        }
        setIsBotThinking(false);
      }, 50); // Small timeout to allow UI to render thinking state before main thread blocks
    }
  }, [game, mode, botLevel, makeMove]);

  // Render board
  const board = game.board();
  const ranks = [8,7,6,5,4,3,2,1]; // Never flip
  const files = ['a','b','c','d','e','f','g','h'];

  const isBottomWhite = true;
  const topColor = 'b' as 'w' | 'b';
  const bottomColor = 'w' as 'w' | 'b';

  const handleReset = () => {
    setGame(new Chess());
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const renderCapturedPieces = (color: 'w'|'b') => {
    const pieces = color === 'w' ? capturedPieces.whiteCaptured : capturedPieces.blackCaptured;
    if (pieces.length === 0) return null;
    
    // Sort pieces: pawn, knight, bishop, rook, queen
    const order: Record<string, number> = { 'p': 1, 'n': 2, 'b': 3, 'r': 4, 'q': 5 };
    const sorted = [...pieces].sort((a, b) => order[a] - order[b]);

    const isCapturingBlack = color === 'w';
    
    return (
      <div className="flex flex-wrap items-center text-xl sm:text-2xl opacity-80 gap-[1px]">
        {sorted.map((p, i) => (
           <span key={i} 
              className="w-5 h-5 -ml-1.5 drop-shadow-md"
           >
             <ChessPiece type={isCapturingBlack ? p : p.toUpperCase()} />
           </span>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-[#302E2B] z-50 flex flex-col items-center pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <header className="w-full flex items-center justify-between p-4 text-white">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white/10 rounded-full active:scale-95 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-heading font-bold text-lg">{mode === 'bot' ? 'vs Bot' : 'Local 1v1'}</span>
        <button onClick={handleReset} className="p-2.5 bg-white/10 rounded-full active:scale-95 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center">
          <RotateCcw className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 w-full flex flex-col items-center justify-center p-4">
        {/* Top Player Info */}
        <div className="w-full max-w-md flex flex-col items-start mb-3">
           <div className="flex items-center gap-2 text-white w-full">
             <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center p-1.5 border-2 transition-all duration-300 shrink-0", 
                (!isWhiteTurn && topColor === 'b') || (isWhiteTurn && topColor === 'w') 
                ? (mode === 'bot' && topColor === 'b' ? "border-green-500 bg-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "border-red-500 bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.5)]") 
                : "border-transparent bg-white/10"
             )}>
               <ChessPiece type={topColor === 'w' ? 'K' : 'k'} />
             </div>
             <span className="font-bold text-lg whitespace-nowrap">{topColor === 'w' ? 'White' : (mode === 'bot' ? 'Bot Level ' + (botLevel !== null ? BOT_LEVELS[botLevel] : '') : 'Black')}</span>
             
             {isBotThinking && mode === 'bot' && topColor === 'b' && (
               <div className="flex gap-1 ml-1 mr-2">
                 <motion.div className="w-1.5 h-1.5 bg-white rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                 <motion.div className="w-1.5 h-1.5 bg-white rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                 <motion.div className="w-1.5 h-1.5 bg-white rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
               </div>
             )}

             <div className="flex-1 flex justify-end pr-1">
               {renderCapturedPieces(topColor as 'w'|'b')}
             </div>
           </div>
        </div>

        <div className="w-full aspect-square flex flex-col relative z-0" style={{ maxWidth: 'min(100%, 28rem, 100vh - 16rem)', boxShadow: '0 0 20px rgba(0,0,0,0.5)'}}>
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
                      {lastCapture?.square === square && (
                        <motion.div 
                          key={`capture-${lastCapture.id}`}
                          initial={{ opacity: 0.8, scale: 0.5 }}
                          animate={{ opacity: 0, scale: 1.5 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="absolute inset-0 bg-red-500 rounded-full z-0 pointer-events-none"
                        />
                      )}
                      {isLegalMove && (
                        <div className={cn("absolute rounded-full pointer-events-none z-10", piece ? "w-full h-full border-4 border-black/20 shadow-[inset_0_0_0_2px_rgba(0,0,0,0.1)]" : "w-1/3 h-1/3 bg-black/20")} />
                      )}
                      {piece && (
                        <motion.div 
                          layoutId={`piece-${pieceIds[square] || square}`}
                          animate={lastCapture?.square === square ? {
                            rotate: [0, -10, 10, -10, 10, 0],
                            scale: [1, 1.2, 1],
                          } : {
                            rotate: 0, scale: 1
                          }}
                          className="relative z-10 w-full h-full p-1"
                          transition={lastCapture?.square === square ? { duration: 0.4 } : { type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <ChessPiece type={piece.color === 'w' ? piece.type.toUpperCase() : piece.type} />
                        </motion.div>
                      )}
                   </div>
                 )
               })}
             </div>
           ))}
        </div>
        
        {/* Bottom Player Info */}
        <div className="w-full max-w-md flex flex-col items-start mt-3">
           <div className="flex items-center gap-2 text-white w-full">
             <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center p-1.5 border-2 transition-all duration-300 shrink-0", 
                (!isWhiteTurn && bottomColor === 'b') || (isWhiteTurn && bottomColor === 'w') 
                ? (mode === 'bot' && bottomColor === 'b' ? "border-green-500 bg-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "border-red-500 bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.5)]") 
                : "border-transparent bg-white/10"
             )}>
               <ChessPiece type={bottomColor === 'w' ? 'K' : 'k'} />
             </div>
             <span className="font-bold text-lg whitespace-nowrap">{bottomColor === 'w' ? (mode === 'bot' ? 'You' : 'White') : 'Black'}</span>
             
             <div className="flex-1 flex justify-end pr-1">
               {renderCapturedPieces(bottomColor as 'w'|'b')}
             </div>
           </div>
        </div>
      </div>

      {game.isGameOver() && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card w-full max-w-sm rounded-3xl p-8 flex flex-col items-center shadow-2xl border-4 border-[#302E2B]"
          >
             <h2 className="text-4xl font-heading font-black mb-2 text-foreground">
                {game.isCheckmate() ? "Checkmate!" : "Draw"}
             </h2>
             <p className="text-xl mb-8 font-bold text-foreground/70 text-center">
               {game.isCheckmate() 
                 ? `${game.turn() === 'w' ? 'Black' : 'White'} is victorious` 
                 : "The game ends in a draw"
               }
             </p>
             <button onClick={handleReset} className="w-full py-4 bg-[#7FA650] hover:bg-[#8CB759] rounded-2xl font-bold text-xl active:scale-95 shadow-[0_6px_0_#537133] active:shadow-[0_0px_0_#537133] active:translate-y-[6px] transition-all text-white">
               Play Again
             </button>
          </motion.div>
        </div>
      )}

      {mode === 'bot' && botLevel === null && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-6 text-white text-center">
           <h2 className="text-3xl font-heading font-bold mb-4">Select Difficulty</h2>
           <div className="flex flex-col gap-2 w-full max-w-sm max-h-[70vh] overflow-y-auto pr-2 pb-4">
             {BOT_LEVELS.map((lvl, i) => (
                <button 
                  key={lvl} 
                  onClick={() => setBotLevel(i)}
                  className="w-full py-3 bg-[#7FA650] hover:bg-[#8CB759] rounded-xl font-bold text-lg transition-transform active:scale-95 text-white shadow-[0_4px_0_#537133] shrink-0"
                >
                  {lvl}
                </button>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}
