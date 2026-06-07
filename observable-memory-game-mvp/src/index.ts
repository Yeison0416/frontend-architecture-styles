import 'reset-css';
import './index.scss';
import { MemoryGamePresenter } from './app/memory-game-presenter';

function game() {
    return {
        run() {
            const appRootNode: HTMLElement = document.getElementById('app-root')! as HTMLElement;
            const memoryGamePresenter = MemoryGamePresenter(appRootNode);

            memoryGamePresenter.startGame();

            const teardown = (): void => {
                memoryGamePresenter.destroy();
            };

            window.addEventListener('pagehide', teardown);
            window.addEventListener('beforeunload', teardown);
        },
    };
}

const gameApp = game();
gameApp.run();
