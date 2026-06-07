import { CellIndex, GameState } from '../types/types';

const GRID_SIZE = 9;
const INIT_LENGTH_PATTERN = 2;

export function initialGameState(): GameState {
    return {
        lengthPattern: INIT_LENGTH_PATTERN,
        gridSize: GRID_SIZE,
        level: 1,
        pattern: [],
        playerInput: [],
        gameMessage: { type: 'LEVEL_INFO', message: 'elements' },
        gamePhase: 'INIT',
    };
}

export function getNextGameState(gameState: GameState, cellIndex: number | null, count: number | null): Partial<GameState> {
    const lengthPattern = gameState.lengthPattern;
    return {
        pattern: [...gameState.pattern, cellIndex].filter((i): i is number => i !== null),
        gameMessage: {
            type: count === lengthPattern - 1 ? 'USER_TURN' : 'LEVEL_INFO',
            message: count !== null && count === lengthPattern - 1 ? 'YOUR TURN' : `${lengthPattern - (count ?? 0)} elements`,
        },
        gamePhase: count !== null ? 'SHOW_SEQUENCE' : 'USER_TURN',
    };
}

export function appliedUSerInputGameState(gameState: GameState, cellIndex: CellIndex): Partial<GameState> {
    if (gameState.gamePhase !== 'USER_INPUT_VALIDATION') return gameState;

    const index = gameState.playerInput.length - 1;
    const expectedCellIndex = gameState.pattern[index];

    if (cellIndex !== expectedCellIndex) {
        return {
            gamePhase: 'GAME_OVER',
            gameMessage: { type: 'GAME_OVER', message: `Game Over! You reached level ${gameState.level}` },
        };
    }

    if (gameState.playerInput.length === gameState.pattern.length) {
        return {
            gamePhase: 'NEXT_LEVEL',
        };
    }

    // Default return to satisfy function contract
    return {};
}

export function getNextLevelGameState(gameState: GameState): GameState {
    return {
        ...gameState,
        lengthPattern: gameState.lengthPattern + 1,
        level: gameState.level + 1,
        pattern: [],
        playerInput: [],
        gameMessage: { type: 'LEVEL_INFO', message: 'elements' },
        gamePhase: 'INIT',
    };
}
