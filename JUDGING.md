# Judging Architecture & Integrity: Dogfood 2026

## Core Philosophy
**Judging integrity is the highest engineering priority.** The platform must produce mathematically defensible, explainable, and tamper-proof outcomes. No raw score should ever be overwritten or manipulated.

## 1. Judging Pipeline
The end-to-end judging pipeline is an immutable flow of data:

1. **Raw Scores**: Judges submit scores against rubric criteria via a web interface. These are saved as immutable records.
2. **Judge Statistics**: The system analyzes each judge's scoring history (mean, standard deviation) to identify biases (e.g., "harsh" vs. "lenient" judges).
3. **Normalization**: Raw scores are passed through a deterministic normalization algorithm (e.g., Z-score normalization) to level the playing field.
4. **Normalized Scores**: The output is stored separately from raw scores.
5. **Aggregation**: Normalized scores across all judges for a single submission are aggregated.
6. **Results**: Final rankings are generated and presented to organizers.

## 2. Normalization Strategy
To ensure fairness, a statistical normalization approach is taken:
- **Z-Score Normalization**: $Z = (X - \mu) / \sigma$ where $X$ is the raw score, $\mu$ is the judge's mean score across all their assignments, and $\sigma$ is their standard deviation.
- **Minimum Assignment Threshold**: Judges must score a minimum number of projects (e.g., 5) for their standard deviation to be statistically valid.
- **Reproducibility**: The normalization script must be deterministic. Given the same set of raw scores, it must always produce the exact same normalized scores.

## 3. Role Isolation & Integrity
- **Blind Assignments**: Judges do not see which other judges are assigned to the same project.
- **Strict Row-Level Security**: The API layer ensures that `GET /api/v1/assignments/:id/scores` will return a 403 Forbidden if the `assignment` does not belong to the currently authenticated judge.
- **Immutable Submission**: Once a judge submits a score for an assignment and marks it "final", it is locked. Re-opening requires an admin action, which is logged in the `audit_logs`.
- **Score Items**: Individual scores are stored for each rubric criterion, allowing granular analysis (e.g., "This project scored high on Innovation but low on Polish").

## 4. Conflict of Interest (COI) Management
- **Pre-emptive**: Judges can flag a conflict of interest on an assignment before scoring begins.
- **Re-assignment**: Flagged assignments are automatically pulled from their queue and placed in an organizer review queue for reassignment.

## 5. Auditability
- **Audit Logs**: Every score submission, normalization run, and result publication writes an event to the `audit_logs`.
- **Transparency**: Organizers can export a complete CSV of all raw scores, judge statistics, and normalized scores to verify the math manually.
