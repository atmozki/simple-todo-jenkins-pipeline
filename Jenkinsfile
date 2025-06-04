pipeline {
  agent any

  environment {
    // Since we're building locally, no need for a registry string
    IMAGE_NAME = "simple-todo-app"
    IMAGE_TAG  = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        // Grab the code from wherever this Jenkins job is configured to look
        checkout scm
      }
    }

    stage('Install & Build') {
      steps {
        // Use bat on Windows if Jenkins is running on Windows.
        // If Jenkins agent is Linux (WSL or similar), replace with 'sh'.
        bat 'npm install'
        bat 'npm run build'   // For our minimal app, build is usually a no-op or ESLint precompile
      }
    }

    stage('Test') {
      steps {
        bat 'npm test'       // Expect your package.json has "test": "jest" or similar
      }
      post {
        always {
          // Let’s archive any test output if you configure Jest to produce an XML report
          junit '**/test-results/*.xml'  // Adjust if you generate JUnit XML; otherwise skip
        }
      }
    }

    stage('Code Quality (Lint)') {
      steps {
        bat 'npm run lint'   // Expect "lint" in package.json runs ESLint
      }
      post {
        always {
          // If you installed Warnings NG or ESLint Publisher, record any lint issues
          recordIssues tools: [eslint(pattern: '**/*.js')]
        }
      }
    }

    stage('Security Scan') {
      steps {
        // Run npm audit with at least moderate severity (or your preferred level)
        bat 'npm audit --audit-level=moderate'
      }
      post {
        failure {
          echo "Security issues detected. Check console for details."
        }
      }
    }

    stage('Build Docker Image Locally') {
      steps {
        // Build a Docker image named simple-todo-app:<buildNumber>
        bat "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
      }
    }

    stage('Deploy to Local “Staging”') {
      steps {
        script {
          // If a previous staging container is running, stop & remove it
          bat """
            docker stop simple-todo-staging || echo Staging container not running
            docker rm simple-todo-staging  || echo Staging container not found
          """
          // Run a new container from the image on port 3001
          bat """
            docker run -d ^
              --name simple-todo-staging ^
              -p 3001:3000 ^
              ${IMAGE_NAME}:${IMAGE_TAG}
          """
        }
      }
    }

    stage('Deploy to Local “Production”') {
      when {
        branch 'main'
      }
      steps {
        script {
          // Stop & remove any existing “prod” container
          bat """
            docker stop simple-todo-prod || echo Prod container not running
            docker rm simple-todo-prod  || echo Prod container not found
          """
          // Run a new prod container on port 3000
          bat """
            docker run -d ^
              --name simple-todo-prod ^
              -p 3000:3000 ^
              ${IMAGE_NAME}:${IMAGE_TAG}
          """
        }
      }
    }

    stage('Health Check') {
      steps {
        script {
          // Pause briefly to give the prod container a moment to start
          sleep(time: 5, unit: 'SECONDS')

          // Check that http://localhost:3000/health returns 200
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
          // If you have Email Extension configured, it could send an alert here.
          // For now, just echo a message.
          echo "⚠️ Health check failed; inspect your application."
        }
      }
    }
  }

  post {
    always {
      // Clean up workspace (and optionally remove images/containers):
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