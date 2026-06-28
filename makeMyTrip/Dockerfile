# Stage 1: Build stage
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application jar file (skipping tests for speed)
RUN mvc package -DskipTests || mvn package -DskipTests

# Stage 2: Production run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar file from the build stage
COPY --from=build /app/target/makeMyTrip-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080 (default Spring Boot port)
EXPOSE 8080

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
