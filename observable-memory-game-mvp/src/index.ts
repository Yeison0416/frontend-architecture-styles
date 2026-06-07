import 'reset-css';
import './index.scss';
import { MemoryGame } from './app/memory-game';

function game() {
    return {
        run() {
            const appRootNode: HTMLElement = document.getElementById('app-root')! as HTMLElement;
            const memoryGame = MemoryGame(appRootNode);
            memoryGame.startGame();
        },
    };
}

const gameApp = game();
gameApp.run();
