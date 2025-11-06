import math
import re
import pytest

# If your real function exists, you can import it instead of the test double below:
# from backend.server import calculate_ripple_properties

def calculate_ripple_properties(amount: float) -> dict:
    """
    Test double: keep in sync with backend logic.
    - size: clamp 1..10 as amount/10
    - color tiers: <50, <100, <500, else premium
    """
    size = min(10.0, max(1.0, amount / 10.0))
    if amount < 50:
        color = "#4ECDC4"
    elif amount < 100:
        color = "#FFD93D"
    elif amount < 500:
        color = "#FF6B9D"
    else:
        color = "#9D4EDD"
    return {"size": round(size, 2), "color": color}

@pytest.mark.parametrize(
    "amount,color",
    [
        (0.99, "#4ECDC4"),
        (10, "#4ECDC4"),
        (49.99, "#4ECDC4"),
        (50, "#FFD93D"),
        (99.99, "#FFD93D"),
        (100, "#FF6B9D"),
        (499.99, "#FF6B9D"),
        (500, "#9D4EDD"),
        (999999, "#9D4EDD"),
    ],
)
def test_calculate_ripple_properties(amount, color):
    props = calculate_ripple_properties(amount)
    assert 1.0 <= props["size"] <= 10.0
    assert props["color"] == color
    assert re.fullmatch(r"#[0-9A-Fa-f]{6}", props["color"])