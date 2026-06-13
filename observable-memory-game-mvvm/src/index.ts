import 'reset-css';
import './index.scss';
import { MemoryGameViewModel } from './app/memory-game-view-model';

function game() {
    return {
        run() {
            const appRootNode: HTMLElement = document.getElementById('app-root')! as HTMLElement;
            const viewModelOrchestrator = MemoryGameViewModel(appRootNode);

            viewModelOrchestrator.startGame();

            const teardown = (): void => {
                viewModelOrchestrator.destroy();
            };

            window.addEventListener('pagehide', teardown);
            window.addEventListener('beforeunload', teardown);
        },
    };
}

const gameApp = game();
gameApp.run();
