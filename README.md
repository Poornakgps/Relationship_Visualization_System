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
#### Option A: Using Neo4j Desktop
1. Download and install [Neo4j Desktop](https://neo4j.com/download/)
2. Create a new project and database
3. Set password to `password`
4. Install APOC plugin
5. Start the database

#### Option B: Using Neo4j Community Server
```bash
# Download and extract Neo4j
wget https://neo4j.com/artifact.php?name=neo4j-community-5.15.0-unix.tar.gz
tar -xzf neo4j-community-5.15.0-unix.tar.gz
cd neo4j-community-5.15.0

# Set initial password
bin/neo4j-admin dbms set-initial-password password

# Install APOC plugin
wget https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/5.15.0/apoc-5.15.0-extended.jar
mv apoc-5.15.0-extended.jar plugins/

# Start Neo4j
bin/neo4j start
```

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

## 🧪 Test Data Generator

The `generate_test_data.py` script creates realistic test data including:

- **Users**: 50-100 users with personal information
- **Transactions**: 200-300 transactions between users
- **Relationships**: Automatic relationship detection based on:
  - Shared email addresses
  - Shared phone numbers
  - Shared IP addresses
  - Shared devices
  - Similar addresses

### Manual Test Data Generation
```bash
# With local setup
source venv/bin/activate
python generate_test_data.py

# With Docker (after services are running)
docker-compose exec data-generator python generate_test_data.py
```

## 🔧 Development

### Backend Development
```bash
cd backend

# Run tests
./mvnw test

# Package application
./mvnw package

# Run with different profiles
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend Development
```bash
cd frontend

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Queries

#### Useful Neo4j Cypher Queries
```cypher
-- View all users
MATCH (u:User) RETURN u LIMIT 25

-- View all transactions
MATCH (t:Transaction) RETURN t LIMIT 25

-- Find users with shared emails
MATCH (u1:User)-[r:SHARES_EMAIL]->(u2:User) 
RETURN u1.firstName, u1.email, u2.firstName, u2.email

-- Find transactions from same device
MATCH (t1:Transaction)-[r:SAME_DEVICE]->(t2:Transaction) 
RETURN t1.amount, t1.deviceId, t2.amount, t2.deviceId

-- Find user transaction patterns
MATCH (u:User)-[r:INITIATED]->(t:Transaction) 
RETURN u.firstName, count(t) as transactionCount 
ORDER BY transactionCount DESC

-- Complex relationship analysis
MATCH (u1:User)-[:SHARES_EMAIL|SHARES_PHONE|SHARES_ADDRESS*1..2]-(u2:User)
WHERE u1 <> u2
RETURN u1.firstName, u2.firstName, 
       [(u1)-[r]-(u2) | type(r)] as relationshipTypes
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Neo4j: 7474, 7687
   - Backend: 8080
   - Frontend: 5173 (dev), 3000 (docker)
   - Proxy: 3000

2. **Java Version Issues**
   ```bash
   # Check Java version
   java -version
   
   # On macOS with SDKMAN
   sdk install java 17.0.8-tem
   sdk use java 17.0.8-tem
   ```

3. **Neo4j Connection Issues**
   - Ensure Neo4j is running
   - Check credentials (neo4j/password)
   - Verify APOC plugin is installed

4. **Python Dependencies**
   ```bash
   # Recreate virtual environment
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

5. **Docker Issues**
   ```bash
   # Clean Docker system
   docker system prune -a
   
   # Remove volumes
   docker-compose down -v
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

### Performance Tuning

#### Neo4j Memory Settings (docker-compose.yml)
```yaml
environment:
  NEO4J_dbms_memory_heap_initial__size: 512m
  NEO4J_dbms_memory_heap_max__size: 1G
  NEO4J_dbms_memory_pagecache_size: 512m
```

#### Backend JVM Settings
```yaml
environment:
  JAVA_OPTS: -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0
```

## 📝 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8080/swagger-ui.html (local) or http://localhost:3000/api/swagger-ui.html (docker)

### Key Endpoints
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user by ID
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create transaction
- `GET /api/relationships/users` - Get user relationships
- `GET /api/relationships/transactions` - Get transaction relationships

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.