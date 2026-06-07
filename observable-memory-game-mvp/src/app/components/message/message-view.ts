import { MessageViewContract } from '../../types/view-contracts';

export function MessageView(): MessageViewContract {
    const messageContainer = document.querySelector('[data-component="message-view"]')! as HTMLElement;

    return {
        showMessage(message: string) {
            messageContainer.innerText = message;
        },
        destroy() {
            messageContainer.innerText = '';
        },
    };
}
