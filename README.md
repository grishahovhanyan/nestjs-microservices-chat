# 🚀 Nest Microservices Chat!

This project provides a powerful and scalable foundation for building a modern chat application using NestJS microservices. By leveraging the microservices architecture, it ensures seamless communication between different components, scalability, and modularity for future enhancements.

The chat system is built using NestJS's microservices capabilities, allowing each service to handle a specific aspect of the application, such as user management, messaging, and real time socket notifications. These services communicate with each other using efficient and secure protocols like TCP or gRPC, ensuring low-latency and reliable performance, even in high-demand scenarios.

### 🔍 Key features include:

- 🧩 **Microservice Architecture:** A modular structure with four independent microservices: `auth`, `conversations`, `participants`, and `messages`. These services communicate via TCP or gRPC, ensuring scalability and separation of concerns.
- 🗄️ **Database Integration:** MySQL is used as the primary database, with TypeORM configured for seamless interaction and migration management to handle schema changes across services.
- 🔐 **Authentication and Authorization:** A dedicated `auth` microservice implementing JWT-based authentication for secure user sessions, including registration, login, and user management APIs.
- 💬 **Real-time Communication:** Socket.IO integration for real-time messaging and updates, enabling seamless communication between clients and the backend.
- 📄 **API Documentation:** Auto-generated API documentation using NestJS DTOs for a consistent and clear API structure.
- 🛡️ **Validation and Error Handling:** Utilizes `class-validator` for easy validation through decorators, along with custom exceptions and tailored messages to ensure robust error handling.
- 🐳 **Docker Support:** Each microservice has its own Dockerfile, and a `docker-compose.yml` file in the main directory allows you to run all microservices together, ensuring consistent deployment across environments.

## 🗂️ Project Structure

- **`apps/` :**

  - This folder contains individual NestJS microservices that handle different aspects of the chat application. Each microservice is responsible for a specific feature or functionality within the system.

    - Each microservice has its own configuration file (`.env`) to manage environment-specific settings.
    - A dedicated `Dockerfile` for containerizing each microservice, enabling independent deployment and scalability.
    - A separate `package.json` for managing dependencies, scripts, and specific configurations for each microservice, ensuring isolation and modularity within the project.

  - The current microservices in the `apps/` folder are:

    - **`auth/` :** Manages user authentication and authorization, including registration, login, and JWT token generation for secure user sessions. In addition to the user module and authentication functionality, it also includes a **socket** folder for implementing real-time communication. This module enables WebSocket connections for real-time chat events, allowing the application to emit events to connected clients.

      - **`socket/` :** Handles WebSocket communication for real-time events in the chat application. This folder includes:

        - **`chat.gateway.ts` :** A NestJS gateway implementation that handles socket connections and provided methods to emit events to connected clients.

        - **`socket.controller.ts` :** Contains the TCP event handler that emits events using TCP calls. Microservices use these TCP calls to send socket events to users.

        - **`socket.module.ts` :** A NestJS module that imports and provides services related to socket communication.

        - **`socket.service.ts` :** Contains the logic to handle the emitting of socket events to clients.

    - **`conversations/` :** Responsible for managing conversations between users, including creating new conversations, storing metadata, and fetching conversation details.

    - **`participants/` :** Manages participants within conversations, adding/removing users and handling user roles and permissions.

    - **`messages/` :** Handles the storage and retrieval of messages within conversations, including message sending, editing, deleting, and history retrieval.

- **`libs/` :**

  - This folder contains shared libraries generated using the NestJS CLI command `nest g library LIB_NAME`. These libraries can be reused across different modules in the application, promoting modularity and code reuse.

  - **`common/` :**

    - Contains shared utilities and components that are used across various modules in the application.

    - **`config/` :**

      - **`config.module.ts`:** Contains configuration setup for each microservice. It uses the `ConfigModule` from NestJS, along with validation schemas using Joi. This module is globally applied across the application to ensure consistent configuration management with validation for each microservice.

    - **`constants/`:** Contains constant values used throughout the application, such as configurations and settings

    - **`decorators/`:** Houses custom decorators that simplify and enhance the functionality of your code.

    - **`dtos/`:** Contains shared Data Transfer Objects (DTOs) used across multiple modules.

    - **`enums/`:** Stores enumerations that define a set of named constants, which can be used to represent a collection of related values in a type-safe manner.

    - **`exceptions/`:** Contains custom exceptions that extend the standard NestJS exceptions, providing more specific error handling across the application.

    - **`guards/`:** Includes custom guards that control access to routes based on certain conditions.

    - **`interceptors/`:** Houses custom interceptors that modify incoming requests or outgoing responses, such as logging, transformation, or error handling.

    - **`pipes/`:** Contains custom pipes that transform or validate data before it is processed by the controller. Pipes can be used for tasks like data validation, parsing, or formatting.

    - **`transformers/`:** Includes transformers that modify data between different layers of the application.

    - **`utils/`:** Stores utility functions and helpers that provide reusable functionality across the application, such as formatting dates, generating tokens, or handling common logic.

    - **`validators/`:** Contains custom validation decorators built on top of `class-validator`. Examples include:

      - `NumberField`: A decorator to validate number fields with custom logic.
      - `StringFieldOptional`: A decorator for optional string fields with additional validation rules.
      - Other custom validation decorators tailored to specific requirements in the application.

  - **`database/` :**

    - **`mysql/` :**

      - Contains configurations and setup for MySql integration, including TypeORM support and migration management.

      - **`entities/`:** Houses TypeORM entity definitions that map to database tables. These entities define the structure of your database and are used by TypeORM to perform CRUD operations. Each entity represents a model in your application and is directly tied to a specific database table.

      - **`migrations/`:** Contains migration files that handle changes to the database schema. Migrations can be generated using the command `npm run migrations:generate --name=MIGRATION_NAME`.

  - **`microservices/` :**

    - **`constants/` :**

      - **`packages.ts`:** Includes gRPC package names.
      - **`services.ts`:** Defines TCP service names.

    - **`options/` :**

      - Contains helper functions to manage connections between different microservices, simplifying communication setup and management.

    - **`types/` :**

      - Defines types for microservices, including type definitions that facilitate type safety when interacting with other services.
      - Each type folder includes a `MicroserviceNameGrpcServiceControllerMethods` decorator, which automatically applies the `GrpcMethod` decorator to all methods within the corresponding `MicroserviceNameGrpcController`. This simplifies the process of defining and managing gRPC methods in controllers.

  - **`swagger/`:**
    - **`responses/`**: Defines custom Swagger responses for different HTTP statuses.
      - `config.ts`: Contains Swagger configuration settings.
      - `index.ts`: Entry point for the Swagger configuration.
      - `swagger.decorator.ts`: A decorator to simplify Swagger documentation creation for routes.
      - `swagger.type.ts`: Contains all type definitions used in the Swagger configuration.
      - `tsconfig.lib.json`: TypeScript configuration specific to the Swagger library.

- **`docker-compose.yml` :**

  - Defines a multi-container Docker application setup, managing the deployment and orchestration of multiple services for the chat application.

  - **MySQL Services:**

    - **`mysql`**: A MySQL container for database management, with environment configurations to set up the database.

    - **`mysql_migrations`**: A service that runs database migrations on startup, ensuring the schema is up-to-date. It depends on the `mysql` service and is configured to run the migrations from the `auth` microservice.

  - **Microservices:**

    - Includes individual microservices for the chat application, each with its own configuration:

      - **`auth`**: Handles authentication and authorization.
      - **`conversations`**: Manages conversation data.
      - **`participants`**: Handles participant data within conversations.
      - **`messages`**: Manages messages in the chat.

    - Each microservice has its own `.env` file for environment-specific settings, a dedicated `Dockerfile` for containerization, and a `package.json` for managing dependencies.

  - **Network and Volumes:**

    - All services are connected via a shared Docker network (`nest_chat`), allowing them to communicate with each other.
    - A persistent volume (`mysql_data`) is used to store MySQL data, ensuring data durability across container restarts.

  - **Ports and Dependencies:**

    - Each microservice exposes its own port and depends on the `mysql` service being healthy before starting.
    - Services like `auth`, `conversations`, `participants`, and `messages` restart automatically and use volumes for live code updates during development.

- **`proto/` :**

  - This folder contains `.proto` files that define the gRPC service contracts used across the microservices in the application.
    The `.proto` files are copied to all other microservices during the build process, ensuring that each microservice has access to the same service definitions and can communicate seamlessly using gRPC.
    These files define the structure of gRPC requests and responses, as well as service methods for inter-microservice communication. This setup ensures that the microservices can consistently share data and invoke each other's services via gRPC.

- **`public/` :**

  - This folder contains static files such as HTML, CSS, and JavaScript that are used to render the basic chat UI for users.
  - These files allow users to access the chat interface in their browser at `localhost:PORT/chat-ui`.
  - The chat UI provides a simple front-end for interacting with the chat application, enabling features like sending and receiving messages in real-time using WebSockets.

- **`.env.example`:**

  - Provides a template for environment variables required by the application. This file serves as a reference for creating the actual `.env` file with appropriate values for different environments (development, testing, production).

- **`eslintrc.json.mjs` :**

  - Configures ESLint for linting JavaScript/TypeScript code. It defines rules and settings for code quality and style enforcement, ensuring consistent and error-free code across the project.

- **`.prettierrc.js` :**
  - Configures Prettier for code formatting. It specifies formatting options such as indentation, line width, and quote style, ensuring that code adheres to a consistent format throughout the project.

## 📝 Note on `NOTE`

Throughout the project, you will encounter `NOTE` comments that provide important context or instructions. These comments are intended to guide developers in understanding key parts of the code, configuration, and best practices.

## 💻 Prerequisites:

Ensure you have the following tools installed in your PC:

- NodeJS (along with npm)
- NestJS
- MySql

## 🚀 Run project:

1. Clone the repository:

```sh
git clone https://github.com/grishahovhanyan/nestjs-microservices-chat.git
```

2. Navigate to the project directory:

```sh
cd nestjs-microservices-chat
```

3. Run the following command to install all dependencies:

```sh
npm install
```

4. Create a .env file from the provided .env.example file in root and in each apps folder.

```sh
cp .env.example .env
```

5. To run migrations, use the following command:

```sh
npm run migrations:run
```

6. To run single microservice the development environment, use the following command:

```sh
npm run start:dev APP_NAME
```

After starting the server, you can access the application at: http://localhost:PORT_FROM_ENV/swagger-ui/

## 🐳 Run project with docker compose:

1. After clone go to the project directory and create a .env file from the provided .env.example file in root and in each apps folder.

```sh
cp .env.example .env
```

2. Build Docker images for a multi-container application defined in a Docker Compose file.

```sh
docker compose up --build
```

3. Run Docker containers based on the images created in the previous step.

```sh
docker compose up
```

## ✏️ Auth Microservice Endpoints

- **Sign up:** `GET /auth/signup/`
- **Sign in:** `GET /auth/signin/`

- **Get current user:** `GET /users/me/`
- **Get users:** `GET /users/`

## ✏️ Conversations Microservice Endpoints

- **Get current user conversations:** `GET /conversations/`
- **Create conversation:** `POST /conversations/`
- **Get conversation by id:** `GET /conversations/:id/`
- **Update conversation:** `PUT /conversations/:id/`
- **Delete conversation:** `DELETE /conversations/:id/`

## ✏️ Participants Microservice Endpoints

- **Get conversation participants:** `GET /conversations/:conversationId/participants/`
- **Create participant:** `POST /conversations/:conversationId/participants/`
- **Get participant by id:** `GET /conversations/:conversationId/participants/:id/`
- **Update participant:** `PUT /conversations/:conversationId/participants/:id/`
- **Delete participant:** `DELETE /conversations/:conversationId/participants/:id/`

## ✏️ Messages Microservice Endpoints

- **Get conversation messages:** `GET /conversations/:conversationId/messages/`
- **Create message:** `POST /conversations/:conversationId/messages/`
- **Get message by id:** `GET /conversations/:conversationId/messages/:id/`
- **Update message:** `PUT /conversations/:conversationId/messages/:id/`
- **Delete message:** `DELETE /conversations/:conversationId/messages/:id/`

## 🗂️ NPM Commands

- **`npm run format`**: Formats TypeScript files in the `src`, `test`, and `libs` directories according to the rules defined in the `.prettierrc.js` configuration file.

- **`npm run lint`**: Executes ESLint to check for code quality issues and ensure that the code adheres to the defined coding standards.

- **`npm run lint:fix`**: Executes ESLint to check for code quality issues and automatically applies fixes wherever possible to ensure the code adheres to the defined coding standards.

- **`npm run build`**: Compiles TypeScript files into JavaScript and outputs the results into the `dist` folder, preparing the application for deployment.

- **`npm run start`**: Starts the NestJS application in production mode using the compiled files from the `dist` folder.

- **`npm run start:dev`**: Launches the application in development mode with live reloading enabled, automatically restarting the server when changes are detected.

- **`npm run start:debug`**: Runs the application in debug mode with live reloading, allowing for debugging and step-by-step code execution.

- **`npm run start:prod`**: Starts the compiled production-ready application using Node.js, running the code from the `dist/main` file.

- **`npm run typeorm`**: Runs TypeORM CLI commands using `ts-node` to handle database-related tasks, such as running migrations, without needing to compile TypeScript code first.

- **`npm run migrations:create`**: Creates a new migration file in the specified `migrations` directory, which can be used to define database schema changes.

- **`npm run migrations:generate`**: Automatically generates a migration file based on the current state of the entities, capturing any schema changes that need to be applied to the database.

- **`npm run migrations:run`**: Applies all pending migrations to the database, updating the schema according to the latest migration files.

- **`npm run migrations:rollback`**: Reverts the last migration that was applied, rolling back the database schema to the previous state.

- **`npm run generate:proto:types`**: Generates TypeScript types for Protocol Buffers definitions using `protoc` and the `ts-proto` plugin. You can run this command with a specific `.proto` file by using the `--path` option, like so: `npm run generate:proto:types --path=./proto/users.proto`.

## 🗂️ NestJS CLI Commands

- **`nest g app APP_NAME`**: Generates a new microservice application in the `apps/` folder, creating the structure and files needed to build and manage a standalone microservice.

- **`nest g module MODULE_NAME`**: Generates a new module in the application, creating a directory and file structure for the module.

- **`nest g service SERVICE_NAME`**: Generates a new service in the specified module, providing a class with dependency injection.

- **`nest g controller CONTROLLER_NAME`**: Generates a new controller in the specified module, enabling the creation of routes and request handlers.

- **`nest g class CLASS_NAME`**: Generates a new class in the specified directory, which can be used for utility functions, constants, or other shared logic.

- **`nest g library LIB_NAME`**: Generates a new library in the `libs/` folder, creating a reusable set of functionalities that can be shared across the application.

## 📝 Author

- **Grisha Hovhanyan** - [github:grishahovhanyan](https://github.com/grishahovhanyan)
