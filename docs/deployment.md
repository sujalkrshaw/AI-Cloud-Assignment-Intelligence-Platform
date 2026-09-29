# Deployment

## Local
Use Docker Compose for the most reproducible demo.

## Supabase path
Create a Supabase project, create PostgreSQL tables equivalent to `models.py`, create a private Storage bucket, and set the production `DATABASE_URL`. Keep service-role credentials server-side only. Supabase provides managed Postgres, Auth and Storage; the free plan currently includes limited quotas, so monitor usage.

## Production
Build the backend container and deploy it to a container-capable service. Deploy the Vite frontend as static assets. Put HTTPS and an API gateway/load balancer in front of the backend. Configure secrets through the platform secret manager.
