import { MessageViewModelContract } from '../../types/view-model-contracts';

export type MessageViewInstance = {
    readonly destroy: () => void;
};

export function MessageView(messageViewModel: MessageViewModelContract): MessageViewInstance {
    const messageContainer = document.querySelector('[data-component="message-displayer"]')! as HTMLElement;

    const messageSubscription = messageViewModel.message$.subscribe((message) => {
        if (message !== null) {
            messageContainer.innerText = message;
        }
    });

    return {
        destroy() {
            messageSubscription.unsubscribe();
            messageContainer.innerText = '';
        },
    };
}
