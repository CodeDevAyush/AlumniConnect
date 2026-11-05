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

The public APIs provide profile and activity data; **they do not return an AlumniConnect score**. The backend fetches public data on demand, applies the point rules below, stores the data and score breakdown as an evidence snapshot, and adds the components together. We do not request external platform passwords or tokens, and no API key is required for these public-data requests. Unauthenticated GitHub API requests are subject to GitHub's rate limits.

The automated total is out of 100: GitHub (45) + Codeforces (45) + evidence availability (10). Each category is threshold-based: meeting a threshold earns the listed points for that signal, and falling below its first threshold earns 0. Points within a signal do not accumulate across thresholds.

### GitHub (45 points)

The backend requests the public GitHub user record and up to 100 repositories, ordered by most recently updated. It calculates:

| Signal derived from GitHub data | Threshold | Points |
| --- | --- | ---: |
| Public repository count from the user record | 1–2 / 3–5 / 6+ repositories | 5 / 10 / 15 |
| Repositories whose `pushed_at` date is within the last 365 days, among the fetched repositories | 1 / 2 / 3+ repositories | 5 / 10 / 15 |
| Fetched repositories with a non-empty description, divided by the number fetched | 40% / 80%+ coverage | 5 / 10 |
| User record has a non-empty bio | Yes | 5 |

Description coverage is measured only against the fetched sample (up to 100), while the repository-count signal uses GitHub's total public repository count. If no repositories are fetched, description coverage earns 0. Stars, followers, raw commit counts, private repositories, and ownership claims do not contribute.

### Codeforces (45 points)

For a Codeforces handle, the backend requests the public user record, the latest 10,000 submissions, and the user's rated-contest history. It calculates:

| Signal derived from Codeforces data | Threshold | Points |
| --- | --- | ---: |
| Distinct problems with an `OK` submission in the fetched submissions | 10 / 50 / 150+ problems | 5 / 10 / 15 |
| Current rating from the user record | 1200 / 1400 / 1700+ | 5 / 10 / 15 |
| Number of rated-contest entries returned | 1 / 5 / 15+ contests | 5 / 10 / 15 |

Repeated accepted submissions for the same problem count once. The service identifies a problem using its contest ID, index, and name. An absent rating earns 0 rating points. This is a coarse pilot rubric, not a platform-independent ranking; different coding platforms use incompatible metrics.

### Evidence availability (10 points)

The backend adds 10 points when both GitHub evidence and supported Codeforces evidence are successfully retrieved and assessed. Provider/network errors, missing profiles, or rate limits fail the assessment with an API error; they are not silently converted into 0 points.

If the selected coding platform is not yet supported for automated scoring (for example, LeetCode, HackerRank, or CodeChef), the backend still assesses GitHub, but sets the coding score and evidence-availability score to null. It returns `MANUAL_REVIEW` and no overall score rather than treating missing support as a zero.

### Example calculation

Suppose the fetched GitHub evidence earns 30/45, the Codeforces evidence earns 25/45, and both providers returned usable evidence. The overall result is `30 + 25 + 10 = 65/100`, which maps to `DEVELOPING`. The score is a result of these project-defined rules, not an official rating from either platform.

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
