# SC3040 Advanced Software Engineering

## Project Overview
This project is part of the SC3040 Advanced Software Engineering course.

## Project Structure
```
.
├── compose.yaml
├── frontend
│   ├── Dockerfile
│   └── src
└── microservices
    ├── Dockerfile
    └── receiptservice.py
```

## Setup and Running

### Prerequisites
- Docker / Docker Desktop

### Running the Application
1. Clone the repository
2. Navigate to the project root directory
3. Run the following command:
   ```
   docker-compose up --build
   ```
4. Access Frontend UI at `http://localhost:3000`
5. Access MongoDB instance at `mongodb://root:secret@localhost:27017/expense_note?authSource=admin`
