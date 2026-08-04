# Folder Structure

```
campus/                      # CampusFlow repo root
├── .kiro/                   # AEOS (constitution, specs, skills, workflows, memory)
├── .cursor/                 # Cursor rules + thin skill loaders
├── .github/workflows/       # CI (Maven + frontend gates)
├── src/                     # Spring Boot backend
│   ├── main/java/com/campusflow/
│   │   ├── config/          # Security, JPA, Web
│   │   ├── domain/          # JPA entities + enums
│   │   ├── dto/             # request/response + MapStruct mappers
│   │   ├── exception/       # Global handler + domain exceptions
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── security/        # JWT filter + token provider
│   │   ├── service/         # Business logic
│   │   └── web/api/         # REST controllers
│   ├── main/resources/
│   │   ├── application*.yml
│   │   └── db/migration/    # Flyway SQL
│   └── test/java/           # JUnit / Spring tests
├── frontend/                # React + Vite UI
│   ├── src/
│   ├── e2e/                 # Playwright
│   └── docker/              # nginx for containerized UI
├── docker/                  # API Dockerfile, compose, healthcheck, .env.example
├── pom.xml
├── AGENTS.md
└── README.md
```

Legacy Khonofy Express/Prisma/`backend/`/`base44/` layouts do **not** apply to this repository.
