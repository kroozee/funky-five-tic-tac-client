import { FullPosition, BoardPosition as NumberBoardPosition, PositionValue } from './dtos';
import { PreviousMove, SeriesWithTurnInProgress } from './player';
import { Grouping, groupBy, orderBy } from './utilities';

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
        X: BoardPosition[][]
        O: BoardPosition[][]
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
        .map(potentialWin => potentialWin.filter(winPosition => openPositions.includes(winPosition)));
};

const toLocalGameState = (localGameMoves: Grouping<PreviousMove>, availableMoves: FullPosition[]): LocalGameState => {
    return {
        localGame: localGameMoves.key as BoardPosition,
        wonBy: whoHasWon(localGameMoves.values),
        potentialWins: {
            X: getPotentialWins('X', localGameMoves.values, availableMoves),
            O: getPotentialWins('O', localGameMoves.values, availableMoves),
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
            X: getPotentialGlobalWins('X', localGames),
            O: getPotentialGlobalWins('O', localGames),
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
    const opponent = me === 'X' ? 'O' : 'X';
    const state = toGlobalGameState(previousMoves, availableMoves);

    console.log({
        player: me,
        state
    });

    const getFallbackMove = (localGameCoordinate: BoardPosition): FullPosition => {
        // this is just a placeholder
        return state.potentialWins[me][0]
            ? `${localGameCoordinate}:${state.potentialWins[me][0]}` as FullPosition
            : availableMoves[Math.floor(Math.random() * availableMoves.length)] as FullPosition;
    }

    const getLocalGameMove = (localGameCoordinate: BoardPosition): FullPosition => {
        console.log('IN getLocalGameMove')

        // + Check to see which values are already taken in the current local game.
        // would be nice if state.localGame (the one we're forced to play in here) had all the available moves listed ....going to keep using previous/available
        const alreadyTakenTheseSpots = previousMoves
            .map(v => v.position)
            .filter(x => x.charAt(0) == localGameCoordinate);

        console.log({ alreadyTakenTheseSpots });
        if (alreadyTakenTheseSpots.length < 1) {
            console.log('were trying to take a corner');
            // If we don't have an existing piece on the current local game, (if possible...) put one in any of the corners with priority to ones without an adjacent opponent piece.
            // corners = 0,2,6,8
            return `${localGameCoordinate}:${availableMoves.find(m => [0, 2, 6, 8].some(i => i.toString() == m.charAt(2)))?.charAt(2)}` as FullPosition;
        } else {
            const winning_moves = state.localGames
                .find(game => game.localGame === localGameCoordinate)!.potentialWins[me]
                .filter(w => w.length === 1);

            if (winning_moves.length === 1) {
                // one winning move --- for now, take it TO DO check to see if it's the best thing to do
                console.log('were trying to take a winning move');
                return `${localGameCoordinate}:${winning_moves[0][0]}` as FullPosition;
            } else if (winning_moves.length > 1) {
                // de-prioritize values that lead to other local games where the opponent has a combination that is 1 away
                const moveToMake = winning_moves
                    .map((moves) => {
                        const games = moves
                            .map(move => state.localGames.find(game => game.localGame === move) as LocalGameState);
                        const worstGameForOpponent = orderBy(games, game => Math.max(...game.potentialWins[opponent].map(win => win.length)))[0];
                        return worstGameForOpponent
                            ? `${localGameCoordinate}:${worstGameForOpponent.localGame}` as FullPosition
                            : undefined
                        // moves_away[state.localGames[+move].potentialWins[opponent].length].push(move);
                    })
                    .find(move => !!move);
                return moveToMake ?? getFallbackMove(localGameCoordinate);
                // if (moves_away[3]?.length > 0) {
                //     console.log(`sending opponent to game ${moves_away[3][0]}`);
                //     return `${localGameCoordinate}:${moves_away[3][0]}` as FullPosition;
                //     // TODO - don't default to first
                // } else if (moves_away[2]?.length > 0) {
                //     console.log(`sending opponent to game ${moves_away[2][0]}`);
                //     return `${localGameCoordinate}:${moves_away[2][0]}` as FullPosition;
                //     // TODO - don't default to first
                // } else {
                //     // no choice but to send them to a square they win
                //     console.log(`sending opponent to game ${moves_away[1][0]}`);
                //     // TODO - if there is more than one option here can we check to see if it's not sending them to a square that would win the global game?
                //     return `${localGameCoordinate}:${moves_away[1][0]}` as FullPosition;
                // }
            }
            return getFallbackMove(localGameCoordinate);
        }
    };

    const getMove = () => {
        console.log('IN getMove')

        // If it is the first move, choose [4 ,4]
        if (!previousMoves?.length) {
            console.log('no moves yet... returning 4:4')
            return '4:4' as FullPosition;
        }

        // + Check for which local game we are required to make a move in.
        // if all 1st quads are the same, we have to move in that~ otherwise its a "free" move
        var coordinate1 = availableMoves.every(val => val.charAt(0) == availableMoves[0].charAt(0))
            ? availableMoves[0].charAt(0) as BoardPosition
            : undefined;

        console.log(`Cor1 = ${coordinate1}`);

        if (coordinate1) { // Forced to play in this quad
            console.log({ coordinate1 });
            return getLocalGameMove(coordinate1);
        } else { // free move!<-- when we get to choose any local
            const { localGame: localGameThatHelpsUsWin } = orderBy(state.localGames, game => Math.min(...game.potentialWins[me].map(win => win.length)))[0];

            console.log({ localGameThatHelpsUsWin });
            state.localGames.forEach((game: LocalGameState) => {
                if (game) {
                    // + Check to see which values are already taken in the current local game.
                }

                //MG note: started to work through this list above, in the "forced" area but didn't get too far... sorry...
                // + Count the number of combinations that have one remaining move to be complete for both the player and the opponent for each local game.
                // + Count the number of possible winning combinations for both the player and the opponent for each local game.
                // If the current local game has a combination for us that is 1 move away, choose that remaining combination's value.
                // If #3 is NOT true, de-prioritize values that lead to other local games where the opponent has a combination that is 1 away.
                // If the opponent doesn't have other local games that have a combination that is 1 away, choose a value from the player combination for the local game with the fewest steps remaining.
                // If the there are multiple player combinations for the current local game that have the same moves remaining, choose the value that directs the opponent to the other local game with the lowest quantity of possible winning combinations.
            });

            return getLocalGameMove(localGameThatHelpsUsWin);
        }
    }

    return getMove();
};