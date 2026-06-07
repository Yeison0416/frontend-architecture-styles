import template from './memory-game.hbs';

import { Subscription } from 'rxjs';

import { CellIndex, GameState } from './types/types';
import { MemoryGamePresenterContract, MessageViewContract } from './types/view-contracts';

import { Board } from './components/board/board';
import { MessageView } from './components/message/message-view';

import { getPatternSequence } from './services/emit-pattern-counter-by-interval';

import { getGameStateStore } from './state/game-state-store';

import { applyUserCellClick, getNextGameState, getNextLevelGameState, initialGameState } from './domain/rules';

export function MemoryGamePresenter(appRootNode: HTMLElement): MemoryGamePresenterContract {
    appRootNode.innerHTML = template();

    const gameStateStore = getGameStateStore(initialGameState());
    const messageView: MessageViewContract = MessageView();

    let patternSubscription: Subscription | undefined;

    const updateMessageFromState = (state: GameState): void => {
        if (state.gamePhase === 'SHOW_SEQUENCE' || state.gamePhase === 'GAME_OVER') {
            messageView.showMessage(state.gameMessage.message);
        }
    };

    const stopPatternSequence = (): void => {
        patternSubscription?.unsubscribe();
        patternSubscription = undefined;
    };

    const patternSequence = (gameState: GameState): void => {
        stopPatternSequence();

        patternSubscription = getPatternSequence(gameState).subscribe(({ cellIndex, count }) => {
            gameStateStore.setState(getNextGameState(gameStateStore.getState(), cellIndex, count));
            updateMessageFromState(gameStateStore.getState());
        });
    };

    const onCellClick = (cellIndex: CellIndex): void => {
        const nextState = applyUserCellClick(gameStateStore.getState(), cellIndex);

        if (Object.keys(nextState).length === 0) {
            return;
        }

        gameStateStore.setState(nextState);
        updateMessageFromState(gameStateStore.getState());

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
            stopPatternSequence();
            messageView.destroy();
        },
    };
}
