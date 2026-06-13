import { CellIndex, GameState } from '../types/types';

export type BoardDisplayState = {
    readonly highlightedCell: CellIndex | null;
    readonly isInteractive: boolean;
    readonly flicker: boolean;
    readonly levelTransition: boolean;
};

export function mapBoardDisplay(state: GameState): BoardDisplayState {
    const isUserTurn = state.gamePhase === 'USER_TURN';
    const showHighlight = state.gamePhase === 'SHOW_SEQUENCE' || state.gamePhase === 'USER_TURN';
    const currentCellIndex = state.pattern[state.pattern.length - 1];
    const prevCellIndex = state.pattern[state.pattern.length - 2];

    return {
        highlightedCell: showHighlight ? (currentCellIndex ?? null) : null,
        isInteractive: isUserTurn,
        flicker: showHighlight && currentCellIndex === prevCellIndex,
        levelTransition: state.gamePhase === 'NEXT_LEVEL',
    };
}
