import template from './memory-game.hbs';

import { Subscription } from 'rxjs';

import { CellIndex, GameState } from './types/types';
import { MemoryGameViewModelContract } from './types/view-model-contracts';

import { Board } from './components/board/board';
import { MessageView } from './components/message/message-view';

import { getPatternSequence } from './services/emit-pattern-counter-by-interval';

import { getGameStateStore } from './state/game-state-store';

import { MessageViewModel } from './view-models/message-view-model';

import { applyUserCellClick, getNextGameState, getNextLevelGameState, initialGameState } from './domain/rules';

export function MemoryGameViewModel(appRootNode: HTMLElement): MemoryGameViewModelContract {
    appRootNode.innerHTML = template();

    const gameStateStore = getGameStateStore(initialGameState());
    const messageViewModel = MessageViewModel(gameStateStore);
    const messageView = MessageView(messageViewModel);

    let patternSubscription: Subscription | undefined;
    let destroyed = false;

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

    return {
        startGame() {
            patternSequence(gameStateStore.getState());
        },
        destroy() {
            if (destroyed) {
                return;
            }

            destroyed = true;
            stopPatternSequence();
            messageView.destroy();
            messageViewModel.destroy();
            gameStateStore.destroy();
        },
    };
}
