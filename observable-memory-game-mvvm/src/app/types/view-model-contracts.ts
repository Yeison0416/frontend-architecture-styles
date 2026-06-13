import { Observable } from 'rxjs';

export type MessageViewModelContract = {
    readonly message$: Observable<string | null>;
    readonly destroy: () => void;
};

export type MemoryGameViewModelContract = {
    readonly startGame: () => void;
    readonly destroy: () => void;
};
