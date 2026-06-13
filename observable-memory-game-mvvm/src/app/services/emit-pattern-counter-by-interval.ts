import { GameState, Pattern, PatternCounter } from '../types/types';

import { pattern } from '../domain/pattern';

import { Observable, concat, from, interval, of } from 'rxjs';
import { delay, take, map, scan, switchMap } from 'rxjs/operators';

export function getPatternSequence(gameState: GameState): Observable<PatternCounter> {
    const mathRandomFn = Math.random;
    const gridSize = gameState.gridSize;
    const lengthPattern = gameState.lengthPattern;

    const emitPatternCounterByInterval = (pattern: Pattern, emitInterval: number = 1000): Observable<PatternCounter> => {
        const pattern$ = interval(emitInterval).pipe(
            take(pattern.length),
            map((index: number) => ({ cellIndex: pattern[index], count: index })),
        );

        const endSignal$ = of({ cellIndex: null, count: null }).pipe(delay(emitInterval));

        return concat(pattern$, endSignal$);
    };

    const patternCounter$ = from(pattern(lengthPattern, mathRandomFn, gridSize)).pipe(
        scan((acc: Pattern, curr: number) => [...acc, curr], []),
        switchMap((randomSequence: Pattern) => emitPatternCounterByInterval(randomSequence)),
    );

    return patternCounter$;
}
