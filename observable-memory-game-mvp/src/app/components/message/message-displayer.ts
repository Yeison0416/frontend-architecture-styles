import { GameState, GameStateStore } from '../../types/types';

export function MessageDisplayer(gameStateStore: GameStateStore): void {
    const messageContainer = document.querySelector('[data-component="message-displayer"]')! as HTMLElement;

    gameStateStore.subscribe((gameState: GameState) => {
        if (gameState.gamePhase === 'SHOW_SEQUENCE') {
            messageContainer.innerText = gameState.gameMessage.message;
        }

        if (gameState.gamePhase === 'GAME_OVER') {
            messageContainer.innerText = gameState.gameMessage.message;
        }
    });
}
