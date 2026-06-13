import template from './memory-game.hbs';

import { Subscription } from 'rxjs';

import { GamePhase, GameState } from './types/types';
import { MemoryGameViewModelContract } from './types/view-model-contracts';

import { BoardView } from './components/board/board-view';
import { MessageView } from './components/message/message-view';

import { getPatternSequence } from './services/emit-pattern-counter-by-interval';

import { getGameStateStore } from './state/game-state-store';

import { BoardViewModel } from './view-models/board-view-model';
import { MessageViewModel } from './view-models/message-view-model';

import { getNextGameState, getNextLevelGameState, initialGameState } from './domain/rules';

export function MemoryGameViewModel(appRootNode: HTMLElement): MemoryGameViewModelContract {
    appRootNode.innerHTML = template();

    const gameStateStore = getGameStateStore(initialGameState());

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

    const handleAfterCellClick = (gamePhase: GamePhase): void => {
        if (gamePhase === 'NEXT_LEVEL') {
            gameStateStore.setState(getNextLevelGameState(gameStateStore.getState()));
            patternSequence(gameStateStore.getState());
        }

        if (gamePhase === 'GAME_OVER') {
            stopPatternSequence();
        }
    };

    const messageViewModel = MessageViewModel(gameStateStore);
    const boardViewModel = BoardViewModel(gameStateStore, handleAfterCellClick);
    const messageView = MessageView(messageViewModel);
    const boardView = BoardView(boardViewModel);

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
            boardView.destroy();
            boardViewModel.destroy();
            messageView.destroy();
            messageViewModel.destroy();
            gameStateStore.destroy();
        },
    };
}
