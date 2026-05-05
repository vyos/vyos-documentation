"""pytest configuration — add scripts/ to sys.path so test imports work
without requiring PYTHONPATH to be set manually."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))
