import template from './memory-game.hbs';

import { Subscription } from 'rxjs';

import { CellIndex, GameState } from './types/types';

import { Board } from './components/board/board';
import { MessageDisplayer } from './components/message/message-displayer';

import { getPatternSequence } from './services/emit-pattern-counter-by-interval';

import { getGameStateStore } from './state/game-state-store';

import { applyUserCellClick, getNextGameState, getNextLevelGameState, initialGameState } from './domain/rules';

export function MemoryGame(appRootNode: HTMLElement) {
    appRootNode.innerHTML = template();

    const gameStateStore = getGameStateStore(initialGameState());

    let patternSubscription: Subscription | undefined;

    const stopPatternSequence = (): void => {
        patternSubscription?.unsubscribe();
        patternSubscription = undefined;
    };

    const patternSequence = (gameState: GameState): void => {
        stopPatternSequence();

        patternSubscription = getPatternSequence(gameState).subscribe(({ cellIndex, count }) => {
            gameStateStore.setState(getNextGameState(gameStateStore.getState(), cellIndex, count));
        });
    };

    const onCellClick = (cellIndex: CellIndex): void => {
        const nextState = applyUserCellClick(gameStateStore.getState(), cellIndex);

        if (Object.keys(nextState).length === 0) {
            return;
        }

        gameStateStore.setState(nextState);

        const { gamePhase } = gameStateStore.getState();

        if (gamePhase === 'NEXT_LEVEL') {
            gameStateStore.setState(getNextLevelGameState(gameStateStore.getState()));
            patternSequence(gameStateStore.getState());
        }

        if (gamePhase === 'GAME_OVER') {
            stopPatternSequence();
        }
    };

    Board(gameStateStore, onCellClick);
    MessageDisplayer(gameStateStore);

    function startGame() {
        patternSequence(gameStateStore.getState());
    }

    return {
        startGame,
    };
}
