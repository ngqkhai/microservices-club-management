@echo off

REM Build and run the frontend Docker container

echo Building the frontend Docker image...
docker build -t club-management-frontend ./newfrontend

echo Running the frontend container...
docker run -d ^
  --name club-management-frontend ^
  -p 3000:3000 ^
  --env-file .env ^
  club-management-frontend

echo Frontend is now running on http://localhost:3000
echo Health check available at http://localhost:3000/api/health

pause
