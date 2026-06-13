import { Observable } from 'rxjs';

import { CellIndex } from './types';
import { BoardDisplayState } from '../view-models/map-board-display';

export type MessageViewModelContract = {
    readonly message$: Observable<string | null>;
    readonly destroy: () => void;
};

export type BoardViewModelContract = {
    readonly display$: Observable<BoardDisplayState>;
    readonly onCellClick: (cellIndex: CellIndex) => void;
    readonly destroy: () => void;
};

export type MemoryGameViewModelContract = {
    readonly startGame: () => void;
    readonly destroy: () => void;
};
