# Domain Model: Dogfood 2026 Hackathon Platform

## Core Entities

### 1. Identity & Users
- **Users**: 
  - `id`, `email`, `password_hash`, `name`, `role` (enum: participant, judge, organizer, admin), `created_at`, `updated_at`.

### 2. Events & Tracks
- **Events**:
  - `id`, `name`, `description`, `start_date`, `end_date`, `status` (enum: draft, registration, active, judging, archived).
- **Tracks**:
  - `id`, `event_id`, `name`, `description`.
- **Prizes**:
  - `id`, `event_id`, `track_id` (optional), `name`, `amount_or_value`.

### 3. Registration & Teams
- **Registrations**:
  - `id`, `event_id`, `user_id`, `status` (enum: pending, approved, rejected, waitlisted).
- **Teams**:
  - `id`, `event_id`, `name`, `join_code`.
- **TeamMembers**:
  - `team_id`, `user_id`, `role` (enum: owner, member).
- **TeamInvitations**:
  - `id`, `team_id`, `email`, `status` (enum: pending, accepted, rejected), `expires_at`.

### 4. Projects & Submissions
- **Projects**:
  - `id`, `team_id`, `event_id`, `title`, `description`, `tech_stack`, `github_url`, `demo_url`.
- **Submissions**:
  - `id`, `project_id`, `track_id`, `status` (enum: draft, submitted, disqualified, judged).
- **Eligibility**:
  - `id`, `submission_id`, `rule_id`, `status` (enum: pending, passed, failed), `verified_by`.

### 5. Judging & Evaluation
- **Judges**:
  - `id`, `event_id`, `user_id`, `status` (enum: active, inactive).
- **Rubrics**:
  - `id`, `event_id`, `track_id` (optional), `name`, `description`.
- **RubricCriteria**:
  - `id`, `rubric_id`, `name`, `description`, `weight`, `max_score`.
- **JudgeAssignments**:
  - `id`, `judge_id`, `submission_id`, `status` (enum: pending, scored, conflict).
- **JudgeConflicts**:
  - `id`, `judge_id`, `submission_id`, `reason`, `status` (enum: reported, resolved).
- **Scores**:
  - `id`, `assignment_id`, `total_raw_score`, `total_normalized_score`, `submitted_at`.
- **ScoreItems**:
  - `id`, `score_id`, `criterion_id`, `value`.

### 6. Results & Normalization
- **NormalizationResults**:
  - `id`, `submission_id`, `track_id`, `normalized_score`, `z_score`, `rank`.
- **FinalResults**:
  - `id`, `event_id`, `submission_id`, `prize_id`, `awarded_at`.

### 7. Engagement & Audit
- **Votes** (for T3 features):
  - `id`, `user_id`, `submission_id`, `created_at`.
- **Comments**:
  - `id`, `author_id`, `submission_id`, `content`, `created_at`.
- **AuditLogs**:
  - `id`, `actor_id`, `action_type`, `resource_type`, `resource_id`, `previous_state` (JSON), `new_state` (JSON), `created_at`.

## State Machines

### Event State Machine
`draft` -> `registration` -> `active` -> `judging` -> `archived`
- Validations ensure transition rules (e.g., cannot move to `judging` if `active` end date is in the future, or without explicit admin override).

### Submission State Machine
`draft` -> `submitted` -> `disqualified` | `judged`
- Transition to `submitted` requires meeting all eligibility constraints.
- Transition to `judged` requires all assigned judges to complete scoring.
