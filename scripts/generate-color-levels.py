"""Build 30 fixed, distinct water-sort puzzles and verify their shortest solutions."""
from collections import Counter, deque
from itertools import permutations
from pathlib import Path
from random import Random
import json

CAPACITY = 4
SOLVED = ((0, 0, 0, 0), (1, 1, 1, 1), (2, 2, 2, 2), (), ())
TARGETS = [3] * 2 + [4] * 3 + [5] * 5 + [6] * 6 + [7] * 6 + [8] * 5 + [9] * 3


def canonical(board):
    return tuple(sorted(board))


def shape(board):
    return min(tuple(sorted(tuple(mapping[color] for color in tube) for tube in board))
               for mapping in permutations(range(3)))


def is_solved(board):
    return all(not tube or len(tube) == CAPACITY and len(set(tube)) == 1 for tube in board)


def forward(board):
    for source, tube in enumerate(board):
        if not tube:
            continue
        color = tube[-1]
        run = 0
        for segment in reversed(tube):
            if segment != color:
                break
            run += 1
        for target, destination in enumerate(board):
            if source == target or len(destination) == CAPACITY or destination and destination[-1] != color:
                continue
            count = min(run, CAPACITY - len(destination))
            next_board = list(board)
            next_board[source] = tube[:-count]
            next_board[target] = destination + (color,) * count
            yield tuple(next_board)


def shortest(board):
    if is_solved(board):
        return 0
    seen = {canonical(board)}
    queue = deque([(board, 0)])
    while queue:
        current, depth = queue.popleft()
        for next_board in forward(current):
            key = canonical(next_board)
            if key in seen:
                continue
            if is_solved(next_board):
                return depth + 1
            seen.add(key)
            queue.append((next_board, depth + 1))
    raise ValueError('Generated unsolvable board')


def reverse(board):
    for source, tube in enumerate(board):
        if not tube:
            continue
        color = tube[-1]
        run = 0
        for segment in reversed(tube):
            if segment != color:
                break
            run += 1
        for count in range(1, run + 1):
            if count == run and run < len(tube):
                continue
            for target, destination in enumerate(board):
                if source == target or len(destination) + count > CAPACITY or destination and destination[-1] == color:
                    continue
                next_board = list(board)
                next_board[source] = tube[:-count]
                next_board[target] = destination + (color,) * count
                yield tuple(next_board)


pool = {}
for steps in range(3, 21):
    for seed in range(1, 121):
        random = Random(seed * 1397 + steps * 71)
        board = SOLVED
        for _ in range(steps):
            options = list(reverse(board))
            if not options:
                break
            board = random.choice(options)
        moves = shortest(board)
        if 3 <= moves <= 9:
            pool.setdefault(shape(board), {'steps': steps, 'seed': seed, 'optimal': moves, 'tubes': board})

selected = []
used = set()
for target in TARGETS:
    candidates = [(key, item) for key, item in pool.items() if item['optimal'] == target and key not in used]
    if not candidates:
        raise ValueError(f'Not enough puzzles with {target} moves')
    candidates.sort(key=lambda pair: (pair[1]['steps'], pair[1]['seed']))
    key, choice = candidates[0]
    used.add(key)
    selected.append({'optimal': choice['optimal'], 'tubes': choice['tubes']})

assert len(selected) == 30
assert all(Counter(color for tube in item['tubes'] for color in tube) == Counter({0: 4, 1: 4, 2: 4}) for item in selected)
output = Path(__file__).resolve().parents[1] / 'games/color-lab/src/levels.generated.json'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(selected, ensure_ascii=False, separators=(',', ':')) + '\n')
print(f'Generated {len(selected)} solvable levels: {TARGETS}')
