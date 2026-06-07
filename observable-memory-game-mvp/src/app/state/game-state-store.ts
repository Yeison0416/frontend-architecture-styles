import { BehaviorSubject } from 'rxjs';
import { GameState, GameStateStore } from '../types/types';

function createGameStateStore(initState: GameState): GameStateStore {
    const subject = new BehaviorSubject<GameState>(initState);

    return {
        getState: (): GameState => subject.getValue(),
        setState: (newState: Partial<GameState>): void => subject.next({ ...subject.getValue(), ...newState }),
        subscribe: (callback: (state: GameState) => void) => subject.subscribe(callback),
    };
}

export const getGameStateStore = (gameState: GameState): GameStateStore => createGameStateStore({ ...gameState });
