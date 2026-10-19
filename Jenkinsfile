pipeline {
  agent any
  stages {
    stage('构建镜像') { steps { sh 'docker build -t home-page:latest .' } }
    stage('部署') { steps { sh 'docker compose -f deploy/docker-compose.yml up -d' } }
  }
}