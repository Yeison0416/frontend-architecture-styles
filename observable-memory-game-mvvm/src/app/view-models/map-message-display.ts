import { GameState } from '../types/types';

export function mapMessageDisplay(state: GameState): string | null {
    if (state.gamePhase === 'SHOW_SEQUENCE' || state.gamePhase === 'GAME_OVER') {
        return state.gameMessage.message;
    }

    return null;
}
