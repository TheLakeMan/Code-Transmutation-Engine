"""Seven Gates cellular automaton.

This module implements a lightweight, dependency-free cellular automaton with
seven discrete energy bands (0-6). Cells interact with their four orthogonal
neighbors using a wrapping grid so edges behave like portals.

Usage examples:
- Library: import ``AutomatonState`` and call ``simulate``.
- CLI: ``python python/seven_gates.py --width 32 --height 16 --steps 12 --seed 7``
- npm wrapper: ``npm run seven-gates`` (uses defaults defined below)
"""

from __future__ import annotations

import argparse
import random
from dataclasses import dataclass
from typing import Iterable, Iterator, List

STATE_RANGE = 7
ACTIVE_THRESHOLD = 4
PALETTE = " .:=*#@"  # seven characters representing the energy bands


def _wrap(value: int, max_value: int) -> int:
    return value % max_value


@dataclass
class AutomatonState:
    width: int
    height: int
    cells: List[List[int]]

    @classmethod
    def random(cls, width: int, height: int, seed: int | None = None) -> "AutomatonState":
        rng = random.Random(seed)
        cells = [[rng.randrange(STATE_RANGE) for _ in range(width)] for _ in range(height)]
        return cls(width, height, cells)

    def neighbor_coords(self, row: int, col: int) -> Iterator[tuple[int, int]]:
        for delta_row, delta_col in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            yield _wrap(row + delta_row, self.height), _wrap(col + delta_col, self.width)

    def step(self) -> "AutomatonState":
        next_cells: List[List[int]] = []
        for row in range(self.height):
            next_row: List[int] = []
            for col in range(self.width):
                current = self.cells[row][col]
                active_neighbors = sum(
                    1 for r, c in self.neighbor_coords(row, col) if self.cells[r][c] >= ACTIVE_THRESHOLD
                )
                if active_neighbors >= 2:
                    next_row.append((current + 1) % STATE_RANGE)
                elif active_neighbors == 0:
                    next_row.append((current - 1) % STATE_RANGE)
                else:
                    next_row.append(current)
            next_cells.append(next_row)
        return AutomatonState(self.width, self.height, next_cells)

    def render(self) -> str:
        lines = []
        for row in self.cells:
            line = "".join(PALETTE[state] for state in row)
            lines.append(line)
        return "\n".join(lines)


def simulate(initial: AutomatonState, steps: int) -> AutomatonState:
    state = initial
    for _ in range(steps):
        state = state.step()
    return state


def _parse_args(argv: Iterable[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the Seven Gates cellular automaton")
    parser.add_argument("--width", type=int, default=32, help="Grid width")
    parser.add_argument("--height", type=int, default=16, help="Grid height")
    parser.add_argument("--steps", type=int, default=24, help="Number of steps to simulate")
    parser.add_argument("--seed", type=int, default=7, help="Random seed for initial state")
    parser.add_argument("--frames", action="store_true", help="Print every frame instead of only the final state")
    return parser.parse_args(argv)


def _run_cli(args: argparse.Namespace) -> None:
    state = AutomatonState.random(args.width, args.height, seed=args.seed)
    if args.frames:
        print("Initial state:\n" + state.render())
        for step_index in range(1, args.steps + 1):
            state = state.step()
            print(f"\nStep {step_index}:\n{state.render()}")
    else:
        final_state = simulate(state, args.steps)
        print(final_state.render())


def main(argv: Iterable[str] | None = None) -> None:
    args = _parse_args(argv)
    _run_cli(args)


if __name__ == "__main__":
    main()
