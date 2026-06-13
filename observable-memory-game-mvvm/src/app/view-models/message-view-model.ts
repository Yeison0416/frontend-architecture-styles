import { BehaviorSubject } from 'rxjs';

import { GameStateStore } from '../types/types';
import { MessageViewModelContract } from '../types/view-model-contracts';

import { mapMessageDisplay } from './map-message-display';

export function MessageViewModel(store: GameStateStore): MessageViewModelContract {
    const messageSubject = new BehaviorSubject<string | null>(mapMessageDisplay(store.getState()));

    const storeSubscription = store.subscribe((state) => {
        messageSubject.next(mapMessageDisplay(state));
    });

    return {
        message$: messageSubject.asObservable(),
        destroy() {
            storeSubscription.unsubscribe();
            messageSubject.complete();
        },
    };
}
