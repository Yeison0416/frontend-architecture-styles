import { CellIndex } from '../../types/types';
import { BoardViewModelContract } from '../../types/view-model-contracts';

import { fromEvent, Subscription } from 'rxjs';

const FLICKER_DELAY_MS = 100;
const FLICKER_DELAY_MS_LEVEL_CHANGE = 300;

export type BoardViewInstance = {
    readonly destroy: () => void;
};

export function BoardView(boardViewModel: BoardViewModelContract): BoardViewInstance {
    const boardContainer = document.querySelector('[data="board-container"]')! as HTMLElement;
    const boardCells: HTMLElement[] = Array.from(document.querySelectorAll('[data-cell="cell"]')) as HTMLElement[];

    let clickSubscription: Subscription | undefined;
    let displaySubscription: Subscription | undefined;
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

    const highlightCell = (cellIndex: CellIndex | null, isUserTurn: boolean, flicker: boolean): void => {
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
    };

    const playLevelTransition = (): void => {
        const generation = ++animationGeneration;

        highlightBoard();

        void delay(FLICKER_DELAY_MS_LEVEL_CHANGE).then(() => {
            if (generation !== animationGeneration) {
                return;
            }

            highlightBoard();
        });
    };

    setBoardInteractivity(false);

    displaySubscription = boardViewModel.display$.subscribe(({ highlightedCell, isInteractive, flicker, levelTransition }) => {
        setBoardInteractivity(isInteractive);

        if (levelTransition) {
            playLevelTransition();
            return;
        }

        highlightCell(highlightedCell, isInteractive, flicker);
    });

    clickSubscription = fromEvent(boardContainer, 'click').subscribe((event) => {
        const clickedCell = (event.target as HTMLElement).closest('[data-cell="cell"]') as HTMLElement;

        if (!clickedCell) {
            return;
        }

        boardViewModel.onCellClick(Number(clickedCell.getAttribute('data-index')));
    });

    return {
        destroy() {
            animationGeneration++;
            displaySubscription?.unsubscribe();
            clickSubscription?.unsubscribe();
            setBoardInteractivity(false);
            boardCells.forEach((cell) => cell.classList.remove('board__cell--highlighted'));
        },
    };
}
