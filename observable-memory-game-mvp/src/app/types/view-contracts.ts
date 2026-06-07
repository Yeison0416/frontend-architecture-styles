export type MessageViewContract = {
    readonly showMessage: (message: string) => void;
    readonly destroy: () => void;
};

export type MemoryGamePresenterContract = {
    readonly startGame: () => void;
    readonly destroy: () => void;
};
