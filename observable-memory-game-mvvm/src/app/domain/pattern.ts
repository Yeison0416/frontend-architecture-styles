import { Pattern, CellIndex } from '../types/types';

type RandomFn = () => number;

export function pattern(length: number, random: RandomFn, gridSize: number): Pattern {
    const pattern: CellIndex[] = [];

    for (let i = 0; i < length; i++) {
        pattern.push(Math.floor(random() * gridSize));
    }

    return pattern;
}
