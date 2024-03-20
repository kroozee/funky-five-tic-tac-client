import { FullPosition, GameSummary, PositionValue } from './dtos';

type calculateMoveProps = {
    previousMoveLocation: FullPosition,
    previousMoveType: PositionValue,
    availableMoves: FullPosition[],
    previousMoves: GameSummary
};

export const calculateMove = ({
    previousMoveLocation,
    previousMoveType,
    availableMoves,
    previousMoves
}: calculateMoveProps) => {
    let boardInPlay = previousMoveLocation.charAt(2);
    let availableMovesOnBoardInPlay = availableMoves.filter(m => m.charAt(0).includes(boardInPlay));
    let movesOnThatBoard = previousMoves.previousMoves.filter(m => m.position.charAt(0).includes(boardInPlay));
   
    const O = 0;
    const x = 1;

    let moveArray: string[][] = [['', '', ''],
                                 ['', '', ''],
                                 ['', '', '']]

    movesOnThatBoard.map(m => {
        let position = +m.value.charAt(2);
        let playerSymbol = m.value;
        switch(position) { 
        case 0:
        case 1:
        case 2: { 
            moveArray[0][position] = playerSymbol
            break; 
        }
        case 3:
        case 4:
        case 5: {
            moveArray[1][position] = playerSymbol
        }
        case 6:
        case 7:
        case 8: {
            moveArray[2][position] = playerSymbol
        }
        default:
            break;
        }
    });

    let bestMove = findBestMove(moveArray);
    let stringBestMove = boardInPlay + ':';
    switch(bestMove.row) {
        case 0:
            if(bestMove.col == 0)
                stringBestMove = stringBestMove + '0';
            else if(bestMove.col == 1)
                stringBestMove = stringBestMove + '1';
            else 
                stringBestMove = stringBestMove + '2';            
            break;
        case 1:
            if(bestMove.col == 0) 
                stringBestMove = stringBestMove + '3';
            else if(bestMove.col == 1)
                stringBestMove = stringBestMove + '4';
            else
                stringBestMove = stringBestMove + '5';
        case 2:
            if(bestMove.col == 0)
                stringBestMove = stringBestMove + '6';
            else if(bestMove.col == 1)
                stringBestMove = stringBestMove + '7';
            else
                stringBestMove = stringBestMove + '8';  
    }
    return stringBestMove;
}

function findBestMove(board: string[][]): { row: number, col: number } {
    const PLAYER_X = 'X';
    
    let bestEval = -Infinity;
    let bestMove = { row: -1, col: -1 };

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (board[row][col] === '') {
                board[row][col] = PLAYER_X;
                let evaluate = minimax(board, 0, false, -Infinity, Infinity);
                board[row][col] = '';
                if (evaluate > bestEval) {
                    bestEval = evaluate;
                    bestMove = { row, col };
                }
            }
        }
    }

    return bestMove;
}

function minimax(board: string[][], depth: number, maximizingPlayer: boolean, alpha: number, beta: number): number {
    const PLAYER_X = 'X';
    const PLAYER_O = 'O';

    if (isTerminal(board)) {
        return evalutateBoard(board);
    }

    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (board[row][col] === '') {
                    board[row][col] = PLAYER_X;
                    let evaluate = minimax(board, depth + 1, false, alpha, beta);
                    board[row][col] = '';
                    maxEval = Math.max(maxEval, evaluate);
                    alpha = Math.max(alpha, evaluate);
                    if (beta <= alpha) break; // Beta cutoff
                }
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (board[row][col] === '') {
                    board[row][col] = PLAYER_O;
                    let evaluate = minimax(board, depth + 1, true, alpha, beta);
                    board[row][col] = '';
                    minEval = Math.min(minEval, evaluate);
                    beta = Math.min(beta, evaluate);
                    if (beta <= alpha) break; // Alpha cutoff
                }
            }
        }
        return minEval;
    }
}

function isTerminal(board: string[][]): boolean {
    // Check rows for a winning combination
    for (let row = 0; row < 3; row++) {
        if (board[row][0] !== '' && board[row][0] === board[row][1] && board[row][1] === board[row][2]) {
            return true;
        }
    }

    // Check columns for a winning combination
    for (let col = 0; col < 3; col++) {
        if (board[0][col] !== '' && board[0][col] === board[1][col] && board[1][col] === board[2][col]) {
            return true;
        }
    }

    // Check diagonals for a winning combination
    if (board[0][0] !== '' && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
        return true;
    }
    if (board[0][2] !== '' && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
        return true;
    }

    // Check if the board is full (draw)
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (board[row][col] === '') {
                return false; // Board is not full
            }
        }
    }
    return true; // Board is full (draw)
}

export const evalutateBoard = (board: string[][]) => {
        const PLAYER_X = 'X'

        for (let row = 0; row < 3; row++) {
        if (board[row][0] !== '' && board[row][0] === board[row][1] && board[row][1] === board[row][2]) {
            if (board[row][0] === PLAYER_X) {
                return 1; // Player X wins
            } else {
                return -1; // Player O wins
            }
        }
    }

    // Check columns for winning combinations
    for (let col = 0; col < 3; col++) {
        if (board[0][col] !== '' && board[0][col] === board[1][col] && board[1][col] === board[2][col]) {
            if (board[0][col] === PLAYER_X) {
                return 1; // Player X wins
            } else {
                return -1; // Player O wins
            }
        }
    }

    // Check diagonals for winning combinations
    if (board[0][0] !== '' && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
        if (board[0][0] === PLAYER_X) {
            return 1; // Player X wins
        } else {
            return -1; // Player O wins
        }
    }
    if (board[0][2] !== '' && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
        if (board[0][2] === PLAYER_X) {
            return 1; // Player X wins
        } else {
            return -1; // Player O wins
        }
    }

    return 0; // Draw if no winning combination
}