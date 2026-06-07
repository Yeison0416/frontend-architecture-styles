import { CellIndex, GameStateStore, GameState } from '../../types/types';

import { fromEvent } from 'rxjs';

export function Board(gameStateStore: GameStateStore, onCellClick: (cellIndex: CellIndex) => void): void {
    const FLICKER_DELAY_MS = 100;
    const FLICKER_DELAY_MS_LEVEL_CHANGE = 300;

    const boardContainer = document.querySelector('[data="board-container"]')! as HTMLElement;
    const boardCells: HTMLElement[] = Array.from(document.querySelectorAll('[data-cell="cell"]')) as HTMLElement[];

    fromEvent(boardContainer, 'click').subscribe((event) => {
        const clickedCell = (event.target as HTMLElement).closest('[data-cell="cell"]') as HTMLElement;

        if (!clickedCell) return;

        const cellIndex: CellIndex = Number(clickedCell.getAttribute('data-index'));

        onCellClick(cellIndex);
    });

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const highlightCellByIndex = (cellIndex: CellIndex | null, isUserTurn: boolean) => {
        boardCells.forEach((cell: HTMLElement) => {
            if (isUserTurn) {
                cell.classList.remove('board__cell--highlighted');
            } else {
                cell.classList.toggle('board__cell--highlighted', cellIndex === Number(cell.getAttribute('data-index')));
            }
        });
    };

    const highlightBoard = () => {
        boardCells.forEach((cell: HTMLElement) => cell.classList.toggle('board__cell--highlighted'));
    };

    const setBoardInteractivity = (enabled: boolean) => {
        boardContainer.style.pointerEvents = enabled ? 'auto' : 'none';
    };

    setBoardInteractivity(false);

    gameStateStore.subscribe(async (gameState: GameState) => {
        if (gameState.gamePhase === 'SHOW_SEQUENCE' || gameState.gamePhase === 'USER_TURN') {
            const currentCellIndex = gameState.pattern[gameState.pattern.length - 1];
            const prevCellIndex = gameState.pattern[gameState.pattern.length - 2];
            const isUserTurn = gameState.gamePhase === 'USER_TURN';

            // Enable board only during USER_TURN
            setBoardInteractivity(isUserTurn);

            if (currentCellIndex === prevCellIndex) {
                // Flicker: unhighlight, then highlight again using async/await
                highlightCellByIndex(null, false);
                await delay(FLICKER_DELAY_MS);
                highlightCellByIndex(currentCellIndex, isUserTurn);
            } else {
                highlightCellByIndex(currentCellIndex, isUserTurn);
            }
        }

        if (gameState.gamePhase === 'GAME_OVER') {
            setBoardInteractivity(false);
        }

        if (gameState.gamePhase === 'NEXT_LEVEL') {
            highlightBoard();
            await delay(FLICKER_DELAY_MS_LEVEL_CHANGE);
            highlightBoard();
        }
    });
}
