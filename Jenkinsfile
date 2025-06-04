pipeline {
  agent any

  environment {
    IMAGE_NAME = "simple-todo-app"
    IMAGE_TAG  = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install & Build') {
      steps {
        bat 'npm install'
        bat 'npm run build'
      }
    }

    stage('Test') {
      steps {
        bat 'npm run test'
      }
    }

    stage('Code Quality (Lint)') {
      steps {
        bat 'npm run lint'
      }
    }

    stage('Security Scan') {
      steps {
        bat 'npm run security'
      }
      post {
        failure {
          echo "Security issues detected; check console output."
        }
      }
    }

    stage('Build Docker Image Locally') {
      steps {
        bat "docker build -t %IMAGE_NAME%:%IMAGE_TAG% ."
      }
    }

    stage('Deploy to Local “Staging”') {
      steps {
        bat """
          echo ====== Stopping existing staging container (if any) ======
          docker stop simple-todo-staging || echo Staging container not running
          echo ====== Removing existing staging container (if any) ======
          docker rm simple-todo-staging  || echo Staging container not found
          echo ====== Running new staging container port 3001 → 3000 ======
          docker run -d --name simple-todo-staging -p 3001:3000 %IMAGE_NAME%:%IMAGE_TAG%
          echo ====== Staging container started ======
          docker ps --filter "name=simple-todo-staging"
        """
      }
    }

    stage('Deploy to Local “Production”') {
      when {
        branch 'main'
      }
      steps {
        bat """
          echo ====== Stopping existing production container (if any) ======
          docker stop simple-todo-prod || echo Prod container not running
          echo ====== Removing existing production container (if any) ======
          docker rm simple-todo-prod  || echo Prod container not found
          echo ====== Running new production container port 3000 → 3000 ======
          docker run -d --name simple-todo-prod -p 3000:3000 %IMAGE_NAME%:%IMAGE_TAG%
          echo ====== Production container started ======
          docker ps --filter "name=simple-todo-prod"
        """
      }
    }

    stage('Health Check') {
      steps {
        script {
          sleep(time: 5, unit: 'SECONDS')
          def status = bat(
            script: 'curl -s -o NUL -w "%{http_code}" http://localhost:3000/health',
            returnStdout: true
          ).trim()
          if (status != '200') {
            error("Health check failed: HTTP ${status}")
          } else {
            echo "Production container is healthy (HTTP 200)."
          }
        }
      }
      post {
        failure {
          echo "⚠️ Health check failed; inspect your application."
        }
      }
    }
  }

  post {
    always {
      cleanWs()
    }
    success {
      echo "Pipeline completed successfully ✅"
    }
    failure {
      echo "Pipeline encountered failures ❌"
    }
  }
}
