import { CellIndex } from '../../types/types';
import { BoardViewContract } from '../../types/view-contracts';

import { fromEvent, Subscription } from 'rxjs';

const FLICKER_DELAY_MS = 100;
const FLICKER_DELAY_MS_LEVEL_CHANGE = 300;

export function BoardView(): BoardViewContract {
    const boardContainer = document.querySelector('[data="board-container"]')! as HTMLElement;
    const boardCells: HTMLElement[] = Array.from(document.querySelectorAll('[data-cell="cell"]')) as HTMLElement[];

    let clickSubscription: Subscription | undefined;
    let animationGeneration = 0;

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const highlightCellByIndex = (cellIndex: CellIndex | null, isUserTurn: boolean): void => {
        boardCells.forEach((cell: HTMLElement) => {
            if (isUserTurn) {
                cell.classList.remove('board__cell--highlighted');
            } else {
                cell.classList.toggle('board__cell--highlighted', cellIndex === Number(cell.getAttribute('data-index')));
            }
        });
    };

    const highlightBoard = (): void => {
        boardCells.forEach((cell: HTMLElement) => cell.classList.toggle('board__cell--highlighted'));
    };

    const setBoardInteractivity = (enabled: boolean): void => {
        boardContainer.style.pointerEvents = enabled ? 'auto' : 'none';
    };

    setBoardInteractivity(false);

    return {
        highlightCell(cellIndex: CellIndex | null, isUserTurn: boolean, flicker = false): void {
            const generation = ++animationGeneration;

            if (!flicker) {
                highlightCellByIndex(cellIndex, isUserTurn);
                return;
            }

            highlightCellByIndex(null, false);

            void delay(FLICKER_DELAY_MS).then(() => {
                if (generation !== animationGeneration) {
                    return;
                }

                highlightCellByIndex(cellIndex, isUserTurn);
            });
        },

        setInteractive(enabled: boolean): void {
            setBoardInteractivity(enabled);
        },

        playLevelTransition(): void {
            const generation = ++animationGeneration;

            highlightBoard();

            void delay(FLICKER_DELAY_MS_LEVEL_CHANGE).then(() => {
                if (generation !== animationGeneration) {
                    return;
                }

                highlightBoard();
            });
        },

        onCellClicked(handler: (cellIndex: CellIndex) => void): void {
            clickSubscription?.unsubscribe();

            clickSubscription = fromEvent(boardContainer, 'click').subscribe((event) => {
                const clickedCell = (event.target as HTMLElement).closest('[data-cell="cell"]') as HTMLElement;

                if (!clickedCell) {
                    return;
                }

                handler(Number(clickedCell.getAttribute('data-index')));
            });
        },

        destroy(): void {
            animationGeneration++;
            clickSubscription?.unsubscribe();
            clickSubscription = undefined;
            setBoardInteractivity(false);
            boardCells.forEach((cell) => cell.classList.remove('board__cell--highlighted'));
        },
    };
}
