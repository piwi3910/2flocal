# CI/CD Pipeline Documentation for 2FLocal

## Overview

This document provides comprehensive documentation for the Continuous Integration and Continuous Deployment (CI/CD) pipeline implemented for the 2FLocal application. The pipeline automates testing, building, and deployment processes, ensuring consistent quality and streamlined releases.

## Pipeline Architecture

The CI/CD pipeline is implemented using GitHub Actions and consists of the following components:

1. **Backend Pipeline**: Handles testing, building, and deployment of the Node.js backend service.
2. **Mobile App Pipeline**: Handles testing, building, and deployment of the React Native mobile app for iOS and Android.
3. **Fastlane Integration**: Automates the deployment of mobile apps to TestFlight and Play Store.
4. **Docker Integration**: Containerizes the backend service for consistent deployment.

## Workflow Triggers

### Backend Workflow

The backend workflow is triggered on:
- Push to the `main` branch that includes changes to files in the `backend/` directory
- Pull requests to the `main` branch that include changes to files in the `backend/` directory

### Mobile App Workflow

The mobile app workflow is triggered on:
- Push to the `main` branch that includes changes to files in the `app/` directory
- Pull requests to the `main` branch that include changes to files in the `app/` directory

## Pipeline Stages

### Backend Pipeline

1. **Test Stage**:
   - Checkout code
   - Set up Node.js environment
   - Install dependencies
   - Run linting
   - Run unit tests
   - Upload test coverage reports

2. **Build Stage**:
   - Checkout code
   - Set up Node.js environment
   - Install dependencies
   - Build the application
   - Upload build artifacts

3. **Security Scan Stage**:
   - Checkout code
   - Set up Node.js environment
   - Install dependencies
   - Run security audit
   - Run SAST scan using CodeQL

4. **Deploy to Staging Stage**:
   - Checkout code
   - Download build artifacts
   - Set up Docker Buildx
   - Login to Docker Hub
   - Build and push Docker image with staging tag
   - Deploy to staging environment
   - Notify deployment status

5. **Deploy to Production Stage**:
   - Checkout code
   - Download build artifacts
   - Set up Docker Buildx
   - Login to Docker Hub
   - Build and push Docker image with production tag
   - Deploy to production environment
   - Notify deployment status

### Mobile App Pipeline

1. **Test Stage**:
   - Checkout code
   - Set up Node.js environment
   - Install dependencies
   - Run linting
   - Run unit tests
   - Upload test coverage reports

2. **Build Android Stage**:
   - Checkout code
   - Set up Node.js environment
   - Install dependencies
   - Set up JDK
   - Build Android app
   - Upload APK
   - Run security scan

3. **Build iOS Stage**:
   - Checkout code
   - Set up Node.js environment
   - Install dependencies
   - Install Cocoapods
   - Build iOS app
   - Upload IPA

4. **E2E Tests Stage**:
   - Checkout code
   - Set up Node.js environment
   - Install dependencies
   - Install Detox CLI
   - Install Cocoapods
   - Build for Detox
   - Run E2E tests
   - Upload E2E test results

5. **Deploy to TestFlight Stage**:
   - Checkout code
   - Set up Ruby
   - Install Fastlane
   - Deploy to TestFlight
   - Notify deployment status

6. **Deploy to Play Store Stage**:
   - Checkout code
   - Download APK
   - Deploy to Play Store
   - Notify deployment status

## Environment Configuration

### GitHub Secrets

The following secrets need to be configured in GitHub:

- `DOCKER_HUB_USERNAME`: Docker Hub username
- `DOCKER_HUB_TOKEN`: Docker Hub access token
- `SLACK_WEBHOOK_URL`: Slack webhook URL for notifications
- `APPLE_ID`: Apple ID for TestFlight deployment
- `APP_STORE_CONNECT_API_KEY`: App Store Connect API key
- `PLAY_STORE_SERVICE_ACCOUNT_JSON`: Google Play Store service account JSON

### Environment Variables

Environment-specific configurations are managed through environment variables:

- Staging environment variables
- Production environment variables

## Deployment Strategy

### Backend Deployment

The backend service is deployed using Docker containers:

1. The application is built and packaged into a Docker image
2. The Docker image is pushed to Docker Hub with appropriate tags
3. The image is deployed to the target environment (staging or production)

### Mobile App Deployment

#### iOS Deployment

iOS deployment is handled using Fastlane:

1. The app is built using Xcode
2. The build is uploaded to TestFlight for beta testing
3. After approval, the app is promoted to the App Store

#### Android Deployment

Android deployment is handled using Fastlane:

1. The app is built using Gradle
2. The APK is uploaded to the Play Store internal testing track
3. After testing, the app is promoted to beta and then production

## Quality Gates

The following quality gates are implemented in the pipeline:

1. **Code Quality Checks**:
   - Linting
   - Formatting
   - Static code analysis

2. **Security Scanning**:
   - Dependency vulnerability scanning
   - SAST scanning
   - Container scanning

3. **Test Coverage Thresholds**:
   - Minimum code coverage requirements

4. **Performance Testing**:
   - Load testing
   - Performance benchmarks

## Notification System

The pipeline includes a notification system that sends alerts to Slack for:

1. Build failures
2. Deployment status
3. Security vulnerabilities
4. Test coverage issues

## Versioning Strategy

The application follows semantic versioning (MAJOR.MINOR.PATCH):

1. MAJOR version for incompatible API changes
2. MINOR version for backward-compatible functionality additions
3. PATCH version for backward-compatible bug fixes

Build numbers are automatically incremented for each build.

## Rollback Procedures

### Backend Rollback

To rollback the backend service:

1. Identify the previous stable version
2. Deploy the Docker image with the previous version tag
3. Verify the rollback was successful

### Mobile App Rollback

#### iOS Rollback

To rollback the iOS app:

1. In App Store Connect, select the previous version
2. Click "Add to Review"
3. Submit for review

#### Android Rollback

To rollback the Android app:

1. In Google Play Console, select the previous version
2. Click "Rollout" to revert to the previous version

## Troubleshooting Guide

### Common Issues and Solutions

1. **Build Failures**:
   - Check the build logs for errors
   - Verify dependencies are correctly installed
   - Ensure environment variables are properly set

2. **Test Failures**:
   - Review test logs for specific failures
   - Check if tests are flaky or environment-dependent
   - Verify test data and mocks

3. **Deployment Failures**:
   - Check deployment logs
   - Verify credentials and permissions
   - Ensure target environment is available

4. **Security Scan Issues**:
   - Review security scan reports
   - Address vulnerabilities in dependencies
   - Fix code security issues

## Maintenance and Updates

Regular maintenance tasks for the CI/CD pipeline:

1. Update GitHub Actions versions
2. Update Docker base images
3. Review and update security scanning tools
4. Optimize pipeline performance
5. Update documentation as needed

## Conclusion

This CI/CD pipeline provides a robust, automated process for testing, building, and deploying the 2FLocal application. By following the procedures outlined in this document, the development team can ensure consistent quality and streamlined releases.