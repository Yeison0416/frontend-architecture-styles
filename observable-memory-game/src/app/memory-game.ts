import template from './memory-game.hbs';

import { CellIndex, GameState } from './types/types';

import { Board } from './components/board/board';
import { MessageDisplayer } from './components/message/message-displayer';

import { getPatternSequence } from './services/emit-pattern-counter-by-interval';

import { getGameStateStore } from './state/game-state-store';

import { getNextGameState, initialGameState, appliedUSerInputGameState, getNextLevelGameState } from './domain/rules';

export function MemoryGame(appRootNode: HTMLElement) {
    // Render the template
    appRootNode.innerHTML = template();

    // Create the game state store
    const gameStateStore = getGameStateStore(initialGameState());

    // Cell click handler. Communication between Board component and Game State Store
    const onCellClick = (cellIndex: CellIndex) => {
        gameStateStore.setState({
            playerInput: [...gameStateStore.getState().playerInput, cellIndex],
            gamePhase: 'USER_INPUT_VALIDATION',
        });

        gameStateStore.setState(appliedUSerInputGameState(gameStateStore.getState(), cellIndex));

        if (gameStateStore.getState().gamePhase === 'NEXT_LEVEL') {
            const nextLevelState = getNextLevelGameState(gameStateStore.getState());
            gameStateStore.setState(nextLevelState);
            patternSequence(gameStateStore.getState());
        }
    };

    const patternSequence = (gameState: GameState) =>
        getPatternSequence(gameState).subscribe(({ cellIndex, count }) => {
            gameStateStore.setState(getNextGameState(gameStateStore.getState(), cellIndex, count));
        });

    // Component instances
    Board(gameStateStore, onCellClick);
    MessageDisplayer(gameStateStore);

    function startGame() {
        patternSequence(gameStateStore.getState());
    }

    const state = {
        startGame: startGame,
    };

    return Object.assign({}, state);
}
