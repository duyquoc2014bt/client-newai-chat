pipeline {
    agent any

    environment {
        VERCEL_ORG_ID = credentials('VERCEL_ORG_ID')  // Lưu trong Jenkins Credentials
        VERCEL_PROJECT_ID = credentials('VERCEL_PROJECT_ID')  // Lưu trong Jenkins Credentials
        VERCEL_TOKEN = credentials('VERCEL_TOKEN')  // Lưu trong Jenkins Credentials
    }

    stages {
        stage('deploy vercel') {
            steps {
                sh 'npm install'
                sh 'npm run build'
                sh 'vercel --token $VERCEL_TOKEN --prod'
            }
        }
    }
}
