import { CellIndex } from '../types/types';

export type MessageViewContract = {
    readonly showMessage: (message: string) => void;
    readonly destroy: () => void;
};

export type BoardViewContract = {
    readonly highlightCell: (cellIndex: CellIndex | null, isUserTurn: boolean, flicker?: boolean) => void;
    readonly setInteractive: (enabled: boolean) => void;
    readonly playLevelTransition: () => void;
    readonly onCellClicked: (handler: (cellIndex: CellIndex) => void) => void;
    readonly destroy: () => void;
};

export type MemoryGamePresenterContract = {
    readonly startGame: () => void;
    readonly destroy: () => void;
};
