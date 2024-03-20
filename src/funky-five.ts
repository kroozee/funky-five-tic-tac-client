import { FullPosition, BoardPosition as NumberBoardPosition, PositionValue } from './dtos';
import { PreviousMove, SeriesWithTurnInProgress } from './player';
import { Grouping, groupBy } from './utilities';

/* things that seem useful

- compare count of moves each player needs to make to win each local game
- figure out how to detect who has advantage, if any

*/

// const meh = Array
//     .from(Array(9).keys())
//     .flatMap(globalIndex => Array
//         .from(Array(9).keys())
//         .map(localIndex => `${globalIndex}:${localIndex}`))

type BoardPosition = `${NumberBoardPosition}`;

const winningLocalPositions: BoardPosition[][] = [
    ['0', '1', '2'],
    ['3', '4', '5'],
    ['6', '7', '8'],

    ['0', '3', '6'],
    ['1', '4', '7'],
    ['2', '5', '8'],

    ['0', '4', '8'],
    ['2', '4', '6'],
];

const winningPatterns: FullPosition[][] = [
    // Horizontal
    ["0:0", "0:1", "0:2"],
    ["1:0", "1:1", "1:2"],
    ["2:0", "2:1", "2:2"],
    // Vertical
    ["0:0", "1:0", "2:0"],
    ["0:1", "1:1", "2:1"],
    ["0:2", "1:2", "2:2"],
    // Diagonal
    ["0:0", "1:1", "2:2"],
    ["0:2", "1:1", "2:0"]
];

type LocalGameState = {
    localGame: BoardPosition
    wonBy: PositionValue | undefined
    potentialWins: {
        x: BoardPosition[][]
        o: BoardPosition[][]
    }
};

type GlobalGameState = {
    localGames: LocalGameState[]
} & Pick<LocalGameState, 'potentialWins'>;

const hasWon = (player: PositionValue, localGameMoves: PreviousMove[]): boolean => {
    const playerPositions = localGameMoves
        .filter(move => move.value === player)
        .map(move => move.position.charAt(2));

    return winningLocalPositions
        .some(win => win.every(win => playerPositions.includes(win)));
};

const whoHasWon = (localGameMoves: PreviousMove[]): PositionValue | undefined => {
    const hasXWon = hasWon('X', localGameMoves);
    const hasOWon = hasWon('O', localGameMoves);
    return hasXWon ? 'X' : hasOWon ? 'O' : undefined;
};

const getPotentialWins = (
    player: PositionValue,
    localGameMoves: PreviousMove[],
    availableMoves: FullPosition[]): BoardPosition[][] => {
    const playerPositions = localGameMoves
        .filter(move => move.value === player)
        .map(move => move.position.charAt(2));
    const openPositions = availableMoves
        .map(move => move.charAt(2));

    return winningLocalPositions
        .filter(win => win.every(winPosition => playerPositions.includes(winPosition)
            || openPositions.includes(winPosition)))
        .map(potentialWin => potentialWin.filter(winPosition => !openPositions.includes(winPosition)));
};

const toLocalGameState = (localGameMoves: Grouping<PreviousMove>, availableMoves: FullPosition[]): LocalGameState => {
    return {
        localGame: localGameMoves.key as BoardPosition,
        wonBy: whoHasWon(localGameMoves.values),
        potentialWins: {
            x: getPotentialWins('X', localGameMoves.values, availableMoves),
            o: getPotentialWins('O', localGameMoves.values, availableMoves),
        }
    }
};

const getPotentialGlobalWins = (player: PositionValue, localGames: LocalGameState[]) => {
    const wonOrOngoingGames = localGames
        .filter(game => game.wonBy === player || game.wonBy === undefined)
        .map(game => game.localGame);

    return winningLocalPositions
        .filter(win => win.every(winPosition => wonOrOngoingGames.includes(winPosition)))
        .map(potentialWin => potentialWin.filter(winPosition => !wonOrOngoingGames.includes(winPosition)));
};

const toGlobalGameState = (previousMoves: PreviousMove[], availableMoves: FullPosition[]): GlobalGameState => {
    const localGames = groupBy(previousMoves, move => move.position[0])
        .map(localGameMoves => toLocalGameState(localGameMoves, availableMoves));
    return {
        localGames,
        potentialWins: {
            x: getPotentialGlobalWins('X', localGames),
            o: getPotentialGlobalWins('O', localGames),
        },
    };
};

export const applyTheFunk = ({
    currentGame: {
        currentTurn: me,
        availableMoves,
        previousMoves,
    }
}: SeriesWithTurnInProgress) => {
    const state = toGlobalGameState(previousMoves, availableMoves);
    state.localGames.forEach(game => { });
    console.log({
        player: me,
        state
    });
};