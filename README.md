# Relationship Visualization System

A comprehensive system for visualizing user and transaction relationships using Neo4j graph database, Spring Boot backend, and React frontend with interactive graph visualizations.

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Cytoscape.js
- **Backend**: Spring Boot 3.2 + Java 17 + Neo4j Driver
- **Database**: Neo4j 5.15 Community Edition
- **Proxy**: Nginx reverse proxy
- **Test Data Generator**: Python script with Faker library

## 📋 Prerequisites

### For Local Development
- **Java 17+** (OpenJDK or Oracle JDK)
- **Node.js 18+** and npm
- **Neo4j Desktop** or **Neo4j Community Server 5.15+**
- **Python 3.8+** with pip
- **Maven 3.6+** (or use included Maven wrapper)

### For Docker Development
- **Docker** 20.10+
- **Docker Compose** 2.0+

## 🚀 Running Locally

### 1. Clone and Setup
```bash
git clone <repository-url>
cd Relationship_Visualization_System
```

### 2. Setup Neo4j Database
1. Download and install [Neo4j Desktop](https://neo4j.com/download/)
2. Create a new project and database
3. Set password to `password`
4. Install APOC plugin
5. Start the database


### 3. Setup Python Environment for Test Data
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Setup and Run Backend
```bash
cd backend

# Check Java version (should be 17+)
java -version

# Run using Maven wrapper (recommended)
./mvnw spring-boot:run

# OR install dependencies and run
./mvnw clean install
./mvnw spring-boot:run

# Backend will be available at http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
# Health check: http://localhost:8080/actuator/health
```

### 5. Setup and Run Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will be available at http://localhost:5173
```

### 6. Generate Test Data
After both backend and frontend are running:
```bash
# Activate Python environment (if not already active)
source venv/bin/activate

# Run test data generator
python generate_test_data.py
```

### 7. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Swagger Documentation**: http://localhost:8080/swagger-ui.html
- **Neo4j Browser**: http://localhost:7474 (username: neo4j, password: password)

## 🐳 Running with Docker

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd Relationship_Visualization_System

# Start all services with test data generation
docker-compose up --build

# The system will:
# 1. Start Neo4j database
# 2. Build and start backend service
# 3. Build and start frontend service
# 4. Start nginx proxy
# 5. Create Python virtual environment
# 6. Install Python dependencies
# 7. Run test data generator script
```

### Access Points
- **Application**: http://localhost:3000
- **Neo4j Browser**: http://localhost:7474 (username: neo4j, password: password)
- **Backend API**: http://localhost:3000/api
- **Swagger UI**: http://localhost:3000/api/swagger-ui.html

### Docker Services
- `neo4j`: Neo4j database server
- `backend`: Spring Boot application
- `frontend`: React application
- `proxy`: Nginx reverse proxy
- `data-generator`: Python test data generator (runs once after all services are healthy)

### Managing Docker Services
```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose down
docker-compose up --build

# Remove volumes (clears database)
docker-compose down -v
```

### Manual Test Data Generation
```bash
# With local setup
source venv/bin/activate
python generate_test_data.py

# With Docker (after services are running)
docker-compose exec data-generator python generate_test_data.py
```