import template from './memory-game.hbs';

import { Subscription } from 'rxjs';

import { CellIndex, GameState } from './types/types';
import { BoardViewContract, MemoryGamePresenterContract, MessageViewContract } from './types/view-contracts';

import { BoardView } from './components/board/board-view';
import { MessageView } from './components/message/message-view';

import { getPatternSequence } from './services/emit-pattern-counter-by-interval';

import { getGameStateStore } from './state/game-state-store';

import { applyUserCellClick, getNextGameState, getNextLevelGameState, initialGameState } from './domain/rules';

export function MemoryGamePresenter(appRootNode: HTMLElement): MemoryGamePresenterContract {
    appRootNode.innerHTML = template();

    const gameStateStore = getGameStateStore(initialGameState());
    const messageView: MessageViewContract = MessageView();
    const boardView: BoardViewContract = BoardView();

    let patternSubscription: Subscription | undefined;
    let destroyed = false;

    const updateViews = (state: GameState): void => {
        if (state.gamePhase === 'SHOW_SEQUENCE' || state.gamePhase === 'GAME_OVER') {
            messageView.showMessage(state.gameMessage.message);
        }

        if (state.gamePhase === 'SHOW_SEQUENCE' || state.gamePhase === 'USER_TURN') {
            const currentCellIndex = state.pattern[state.pattern.length - 1];
            const prevCellIndex = state.pattern[state.pattern.length - 2];
            const isUserTurn = state.gamePhase === 'USER_TURN';

            boardView.setInteractive(isUserTurn);

            if (currentCellIndex === prevCellIndex) {
                boardView.highlightCell(currentCellIndex, isUserTurn, true);
            } else {
                boardView.highlightCell(currentCellIndex, isUserTurn);
            }
        }

        if (state.gamePhase === 'GAME_OVER') {
            boardView.setInteractive(false);
        }

        if (state.gamePhase === 'NEXT_LEVEL') {
            boardView.playLevelTransition();
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
            updateViews(gameStateStore.getState());
        });
    };

    const onCellClick = (cellIndex: CellIndex): void => {
        const nextState = applyUserCellClick(gameStateStore.getState(), cellIndex);

        if (Object.keys(nextState).length === 0) {
            return;
        }

        gameStateStore.setState(nextState);
        updateViews(gameStateStore.getState());

        const { gamePhase } = gameStateStore.getState();

        if (gamePhase === 'NEXT_LEVEL') {
            gameStateStore.setState(getNextLevelGameState(gameStateStore.getState()));
            patternSequence(gameStateStore.getState());
        }

        if (gamePhase === 'GAME_OVER') {
            stopPatternSequence();
        }
    };

    boardView.onCellClicked(onCellClick);

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
            gameStateStore.destroy();
            messageView.destroy();
        },
    };
}
