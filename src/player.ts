import { calculateMoveProps } from './calculateMove';
import { move } from "./clientActions";
import { FullPosition, PlayerId, PositionValue, SeriesId, SeriesSummary } from "./dtos";
import { applyTheFunk } from './funky-five';

export type PreviousMove = { value: PositionValue, position: FullPosition };

export type SeriesWithTurnInProgress = {
    id: SeriesId
    currentGame: {
        turnsTaken: number
        secondsUsed: {
            x: number
            o: number
        }
        currentTurn: PositionValue
        availableMoves: FullPosition[]
        previousMoves: PreviousMove[]
    }
    timeControlSeconds: number
    gamesCompletedCount: number
    totalGamesCount: number
}

export const getPlayer = (playerId: PlayerId, positionValue: PositionValue) => {

    let lastGamesCompletedCount = -1; // Mutation!?!?! Noooooooooooooo!
    let lastTurnsCompletedCount = -1;

    const onUpdate = (summary: SeriesSummary) => {

        if (summary.gamesCompletedCount > lastGamesCompletedCount) {
            if (summary.gamesCompletedCount < summary.totalGamesCount) {
                console.log(`${positionValue}: It looks like a new game has started. I'm excited for series ${summary.id}!`);
            } else {
                console.log(`${positionValue}: Well that's it! Another hard-fought series (${summary.id}) in the can.`);
            }
        }
        if (summary.currentGame.length === 0) {
            console.log(`${positionValue}: No game in progress for series ${summary.id}. I'm so scared!`);
            return;
        }
        if (summary.currentGame[0].currentTurn.length === 0) {
            console.log(`${positionValue}: It's nobody's turn for series ${summary.id}. That's weird.`);
            return;
        }
        if (summary.currentGame[0].currentTurn[0] !== positionValue) {
            console.log(`${positionValue}: It's not my turn for series ${summary.id}.`);
            return;
        }
        if (lastGamesCompletedCount >= summary.gamesCompletedCount
            && lastTurnsCompletedCount >= summary.currentGame[0].previousMoves.length) {

            console.log(`${positionValue}: I've already seen this turn before and I'm not a big fan of reruns for series ${summary.id}.`);
            return;
        }

        lastGamesCompletedCount = summary.gamesCompletedCount;
        lastTurnsCompletedCount = summary.currentGame[0].previousMoves.length;

        const inProgress: SeriesWithTurnInProgress = {
            ...summary,
            currentGame: {
                ...summary.currentGame[0],
                currentTurn: summary.currentGame[0].currentTurn[0]
            }
        }

        const moveProps: calculateMoveProps = {
            availableMoves: inProgress.currentGame.availableMoves,
            previousMoves: inProgress.currentGame.previousMoves
        };

        console.log(JSON.stringify(moveProps))
        // let bestMove = calculateMove(moveProps);

        // move(playerId, bestMove as FullPosition);


        var moveDecision = applyTheFunk(inProgress);

        setTimeout(() => {
            // if (positionValue === 'O') {
            //     console.log(`${positionValue}: It's my turn, but no one has made me smart yet. I will just do something random for series ${summary.id}.`);
            //     randomMove(playerId)
            //         .catch(error => console.error(`Error making random move: ${error.message}`));
            // } else {
            console.log(`${positionValue}: It's my turn, and I'm our cool bot making the move ${moveDecision} for series ${summary.id}.`);
            move(playerId, moveDecision as FullPosition)
                .catch(error => console.error(`Error making bot move: ${error.message}`));
            // }
        }, 100)
    }

    return {
        playerId,
        positionValue,
        onUpdate
    }
}