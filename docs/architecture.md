# Architecture & Engineering Decisions

## Request flow
1. React obtains a JWT through FastAPI authentication.
2. Protected requests send `Authorization: Bearer <token>`.
3. FastAPI validates the token and role.
4. Assignment metadata is stored in SQL.
5. Uploaded documents are stored outside SQL and referenced by a storage path.
6. The AI service extracts text and calculates deterministic NLP metrics.
7. Teacher reviews AI suggestions and commits the final grade.

## Scalability path
Local -> managed PostgreSQL -> object storage -> stateless API replicas -> load balancer/API gateway -> background queue for AI analysis -> cache -> CDN for frontend assets.

## AI limitations
TF-IDF/cosine similarity is a textual similarity signal. It is not proof of plagiarism and should not be represented as such. Rubric scoring is a deterministic AI-assisted heuristic; production systems should validate models against labeled evaluation data.
