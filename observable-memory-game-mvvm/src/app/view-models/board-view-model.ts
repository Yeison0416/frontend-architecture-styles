import { BehaviorSubject } from 'rxjs';

import { CellIndex, GamePhase, GameStateStore } from '../types/types';
import { BoardViewModelContract } from '../types/view-model-contracts';

import { applyUserCellClick } from '../domain/rules';

import { mapBoardDisplay } from './map-board-display';

export function BoardViewModel(store: GameStateStore, onAfterCellClick: (gamePhase: GamePhase) => void): BoardViewModelContract {
    const displaySubject = new BehaviorSubject(mapBoardDisplay(store.getState()));

    const storeSubscription = store.subscribe((state) => {
        displaySubject.next(mapBoardDisplay(state));
    });

    return {
        display$: displaySubject.asObservable(),
        onCellClick(cellIndex: CellIndex) {
            const nextState = applyUserCellClick(store.getState(), cellIndex);

            if (Object.keys(nextState).length === 0) {
                return;
            }

            store.setState(nextState);
            onAfterCellClick(store.getState().gamePhase);
        },
        destroy() {
            storeSubscription.unsubscribe();
            displaySubject.complete();
        },
    };
}
