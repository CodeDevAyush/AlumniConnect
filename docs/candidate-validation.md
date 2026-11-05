# Candidate Profile Evidence Assessment

## Purpose and limitations

This is an explainable, preliminary readiness signal based on public profile evidence. It is not a measure of a person's worth, a complete skills assessment, proof of identity, or an automatic accept/reject decision. A human must review consequential decisions and consider additional evidence.

The initial implementation lives in the NestJS backend. It does not depend on the AI service, which is currently a scaffold and is not part of this feature's request path.

For a local demo without PostgreSQL, set `PROTOTYPE_IN_MEMORY=true` in `backend/.env`. This mode supports registration, login, and candidate-validation routes in process memory; all users and assessments are erased when the backend stops or restarts. Other database-backed product routes are not available in this mode. It is rejected in production and must never be deployed.

## User flow

1. A student or alumnus registers or signs in and receives a short-lived access token.
2. They submit a GitHub username and one coding-platform handle and explicitly consent to fetching public profile data.
3. The backend stores those handles under the authenticated user's ID.
4. On request, the backend fetches supported public evidence, computes component scores, and stores an immutable evidence snapshot.
5. The user can retrieve the latest result or withdraw consent, which deletes the saved handles and associated assessment history.

All candidate-validation routes require `Authorization: Bearer <accessToken>`. The backend derives the user ID from the token; the client cannot select another user's record.

## Scoring rubric (pilot values)

Automated total: 100 points. Data is fetched on demand from GitHub REST API and Codeforces public API. We do not request external platform passwords or tokens.

### GitHub (45 points)

| Signal | Points |
| --- | ---: |
| Public repositories: 1 / 3 / 6+ repositories | 5 / 10 / 15 |
| Repositories pushed to during the last 12 months: 1 / 2 / 3+ | 5 / 10 / 15 |
| Descriptions on 40% / 80%+ of the fetched repository sample | 5 / 10 |
| GitHub profile has a non-empty bio | 5 |

At most 100 repositories are fetched, ordered by most recently updated. The public repository count comes from the GitHub user record; description coverage is measured only over the fetched sample. Stars, followers, and raw commit counts do not contribute.

### Codeforces (45 points)

| Signal | Points |
| --- | ---: |
| Distinct accepted problems in the latest 10,000 submissions: 10 / 50 / 150+ | 5 / 10 / 15 |
| Current rating: 1200 / 1400 / 1700+ | 5 / 10 / 15 |
| Rated contests: 1 / 5 / 15+ | 5 / 10 / 15 |

This is a coarse pilot rubric, not a platform-independent ranking. Different coding platforms use incompatible metrics.

### Evidence availability (10 points)

10 points are included only when both the GitHub and Codeforces records are successfully retrieved. Provider failures return an API error and do not produce an assessment. For unsupported coding platforms, the score and evidence-availability score are null and status is `MANUAL_REVIEW`.

## Status bands

- `READY_FOR_REVIEW`: score of 75 or above; eligible for the next human review step, not an acceptance decision.
- `DEVELOPING`: score from 55 through 74; candidate may benefit from additional evidence.
- `NEEDS_MORE_EVIDENCE`: score below 55; this indicates limited signals from the selected rubric, not low potential.
- `MANUAL_REVIEW`: automated coding-profile scoring is unsupported; no overall score is calculated.

## Verification and privacy

- `ownershipVerified` is always false in this MVP. Profile handles are user-provided; the service does not prove that the account belongs to the user.
- Only public profile data is fetched. API rate limiting and profile removal can prevent assessment; retry or human review rather than assigning a zero.
- Consent is required before handles can be saved. `DELETE /api/v1/candidate-validation/profiles` withdraws consent and deletes profile/assessment data.
- Assessment snapshots record the evidence and timestamp used at the time. Re-running creates a new assessment.
- Passwords are hashed with bcrypt. Access tokens are currently stored by the frontend in `localStorage`.

## API contract

The route details and payload examples are in [api-contracts.md](./api-contracts.md). The current endpoints are:

- `GET /api/v1/candidate-validation/me`
- `PUT /api/v1/candidate-validation/profiles`
- `DELETE /api/v1/candidate-validation/profiles`
- `POST /api/v1/candidate-validation/assessments`

The corresponding Next.js screen is `/candidate-validation`; registration and login screens are `/register` and `/login`. Frontend pages live under `frontend/app/`, with `(auth)` and `(dashboard)` serving as route groups rather than URL segments.

## Known gaps before production

- Email verification and refresh-token rotation are not implemented; registration activates accounts with `isEmailVerified: false`.
- Ownership challenges for GitHub and coding-platform accounts are not implemented.
- Only Codeforces and GitHub have automated public-data retrieval. LeetCode, HackerRank, and CodeChef are stored for manual review; no scraping is performed.
- The rubric needs calibration against consented, representative cases and human review before it is used for any consequential decision.
- Add abuse controls, provider-aware caching/rate limits, security review, data-retention policy, and a safer browser token-storage strategy before deployment.
