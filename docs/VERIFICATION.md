# Verification Report

Checked on 26 October 2026 (Asia/Bangkok). This report describes the prepared local monorepo. GitHub publication remains incomplete because the tool environment cannot retrieve the GitHub CLI token.

## Results

| Check | Status | Evidence or limit |
| --- | --- | --- |
| Source branch inventory | Passed | 25 frontend branches and 18 backend branches; complete branch names and hashes in MIGRATION.md |
| Branch selection | Passed | Both upstream default branches are main |
| Source history preservation | Passed | Frontend 116 reachable commits and backend 86 reachable commits preserved with original IDs; both source tips are ancestors of the new main |
| File integrity | Passed | All 97 frontend source files, 1 public file, and 89 backend source/test/resource files match the source checkout byte for byte |
| Manifest and build configuration integrity | Passed | Frontend package/lockfile, TypeScript, Vite and ESLint configuration unchanged; backend POM, wrappers, wrapper properties and Dockerfile unchanged |
| Frontend dependency installation | Passed | npm ci, 240 packages installed from the existing lockfile |
| Frontend production build | Passed | npm run build; TypeScript checks and Vite build completed |
| Frontend lint | Failed | npm run lint reports 20 errors and 3 warnings in unchanged source; see frontend-lint-findings.csv |
| Frontend automated test suite | Not Tested | No test script exists in package.json |
| Backend compilation and packaging | Passed | Maven 3.9.12 verify with Java 23.0.2 targeting Java 21; executable Spring Boot JAR created |
| Backend tests | Passed | 16 tests, 0 failures, 0 errors, 0 skipped; see evidence/backend-tests.txt |
| Backend JAR startup and health | Passed | Local executable JAR returns success from /api/hello |
| REST configuration endpoint | Passed | GET /api/game/config returns a JSON object |
| CORS | Passed | Preflight permits configured localhost:5174 origin and rejects an unconfigured origin with HTTP 403 |
| WebSocket/STOMP | Passed | /ws handshake and STOMP CONNECT return CONNECTED |
| Frontend production preview | Passed | Built HTML serves the application root and generated assets |
| Secret scanning of source main histories | Passed | Gitleaks 8.30.1, redacted output, no findings; 74 frontend and 49 backend diff-bearing commits scanned; complete commit graphs contain additional merges |
| Secret scanning of tracked publish tree | Passed | Gitleaks directory scan of an exported tracked-file snapshot, no findings |
| Additional history credential review | Passed | Reviewed 297 frontend and 258 backend unique text candidate blobs; only empty Redis environment defaults and Maven wrapper credential-variable handling matched credential assignments |
| Git hygiene | Passed | Only .env.example files tracked in current tree; real local env files and generated output ignored; no nested Git repositories or submodules |
| Deployment path review | Passed | Vercel frontend root and Render backend root/context documented and configured |
| Docker image build | Not Tested | Docker executable unavailable in the tool environment |
| Java 21 runtime execution | Not Tested | Installed runtime is Java 23.0.2; source target and Docker runtime remain Java 21 |
| Live Redis persistence | Not Tested | No Redis service provisioned; no durability claim |
| Full browser and multiplayer gameplay | Not Tested | Smoke checks do not establish complete end-to-end gameplay correctness |
| Existing deployment availability | Not Tested | Legacy Vercel and Render endpoints identified from source only |
| GitHub CLI authentication | Failed | gh auth status fails; gh api user returns HTTP 401; gh auth token reports no token available to the tool environment |
| GitHub repository creation, push, and remote file verification | Not Tested | No create or push command attempted with unavailable authentication; a public unauthenticated lookup returned 404, which does not exclude a private existing repository |

## Backend Test Execution Detail

The first plain `mvn verify` attempt reached Spring context startup but stalled during Mockito/Byte Buddy dynamic agent attachment in the restricted Windows tool environment. Its diagnostic stream reported an inaccessible Java attach pipe; the run was interrupted. The successful rerun supplied the already-resolved Mockito JAR as an explicit test JVM agent using `-DargLine=-javaagent:<local-mockito-jar>`.

The successful command used the unchanged POM and tests:

```text
mvn -B -f backend/pom.xml -Dmaven.repo.local=<local-cache> -DargLine=-javaagent:<local-mockito-jar> verify
```

The agent flag was a local execution workaround. No build or application dependency changes were made. Unit test totals come from the completed successful run.

## Security Scope

The checked history consists of all commits reachable from the two selected source main branches and the new monorepo main. Unmerged feature branch tips are not intended for publication. Original source histories were neither rewritten nor removed.

The historical tracked frontend .env contains only public API/WebSocket addresses and a local network address; no credential was identified. Its current-tree copy was removed and localhost examples supplied. Existing historical copies remain, as required for unchanged history preservation.

Gitleaks and an additional credential-assignment review found no secrets within the checked scope. These checks are evidence of the performed scan, not a guarantee against every possible form of sensitive content. Final monorepo history scanning is also performed after the preparation commit, before handing off the checkout.

## Existing Lint Issues

The 20 errors consist of synchronous state updates in effects, explicit any types, and unused variables. The three warnings concern effect dependencies. Application source and ESLint configuration match the original files, establishing that these findings were not introduced by moving the directories. No lint rules were disabled and no business logic was changed to make the results appear green.

## Deployment Configuration

- Vercel: new frontend/vercel.json selects Vite, npm run build, and dist. Set the dashboard Root Directory to frontend and supply both VITE API/WebSocket variables.
- Render: root render.yaml sets rootDir to backend and Dockerfile/context to ./Dockerfile and . relative to that root. Supply Redis variables and the new frontend origin for CORS.
- Backend .dockerignore now excludes local env files from the Docker build context.
- Dashboard changes and production deployments were not performed. Instructions follow [Vercel monorepos](https://vercel.com/docs/monorepos) and [Render monorepo support](https://render.com/docs/monorepo-support).

## Publishing Handoff

Intended repository: https://github.com/namnueatechtitan/kombat-x-demonslayer (public, default branch main). The local origin points only at this target; the original repositories are not configured as push remotes.

The user reported successful login, but the isolated tool process still cannot retrieve a token. No password or token was requested through chat. A separate Publish-Kombat.ps1 deliverable is prepared for execution from an authenticated local PowerShell terminal. It checks the exact verified commit, a clean checkout, the expected identity, and target repository absence before creating a public repository. It pushes main without force, sets the default branch, and verifies remote files and the published commit. If the target already exists, it stops without changing it.

The remaining issues are GitHub publication, inherited frontend lint errors, and the runtime/deployment checks marked Not Tested above.
