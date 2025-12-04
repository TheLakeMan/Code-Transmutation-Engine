import unittest

import python.seven_gates as sg


class SevenGatesTests(unittest.TestCase):
    def test_simulation_is_reproducible(self):
        initial = sg.AutomatonState.random(4, 3, seed=1)
        final = sg.simulate(initial, 3)
        self.assertEqual(
            final.cells,
            [
                [4, 4, 2, 5],
                [5, 3, 2, 3],
                [6, 1, 4, 5],
            ],
        )

    def test_wrapped_neighbors_influence_single_cell(self):
        state = sg.AutomatonState(1, 1, [[4]])
        next_state = state.step()
        self.assertEqual(next_state.cells, [[5]])

    def test_render_respects_palette_ordering(self):
        state = sg.AutomatonState(3, 1, [[0, 3, 6]])
        self.assertEqual(state.render(), " =@")


if __name__ == "__main__":
    unittest.main()
