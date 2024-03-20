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

    
}