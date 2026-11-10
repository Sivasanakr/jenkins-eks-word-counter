
pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        EKS_CLUSTER = 'devops-eks-cluster'
        ECR_REPOSITORY = 'word-counter'
        AWS_ACCOUNT_ID = '384875139880'


        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        IMAGE_TAG = "${BUILD_NUMBER}"
        IMAGE_URI = "${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"

        K8S_NAMESPACE = 'devops'
        APP_NAME = 'word-counter'
    }

    stages {

        stage('Git Checkout') {
            steps {
                checkout scm

                sh '''
                    echo "Source code downloaded"
                    ls -la
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build \
                    -t ${ECR_REPOSITORY}:${IMAGE_TAG} .

                    docker images
                '''
            }
        }

        stage('ECR Login') {
            steps {
                sh '''
                    aws ecr get-login-password \
                    --region ${AWS_REGION} |
                    docker login \
                    --username AWS \
                    --password-stdin ${ECR_REGISTRY}
                '''
            }
        }

        stage('Push Image to ECR') {
            steps {
                sh '''
                    docker tag \
                    ${ECR_REPOSITORY}:${IMAGE_TAG} \
                    ${IMAGE_URI}

                    docker push ${IMAGE_URI}
                '''
            }
        }

        stage('Configure EKS') {
            steps {
                sh '''
                    aws eks update-kubeconfig \
                    --name ${EKS_CLUSTER} \
                    --region ${AWS_REGION}

                    kubectl get nodes
                '''
            }
        }

        stage('Deploy to EKS') {
            steps {
                sh '''
                    kubectl apply \
                    -f k8/namespace.yaml

                    kubectl apply \
                    -f k8/deployment.yaml

                    kubectl set image \
                    deployment/${APP_NAME} \
                    ${APP_NAME}=${IMAGE_URI} \
                    -n ${K8S_NAMESPACE}

                    kubectl apply \
                    -f k8/service.yaml
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    kubectl rollout status \
                    deployment/${APP_NAME} \
                    -n ${K8S_NAMESPACE} \
                    --timeout=300s

                    kubectl get pods \
                    -n ${K8S_NAMESPACE}

                    kubectl get svc \
                    -n ${K8S_NAMESPACE}
                '''
            }
        }

        stage('Get Application URL') {
            steps {
                script {
                    timeout(time: 10, unit: 'MINUTES') {
                        waitUntil {
                            def url = sh(
                                script: """
                                    kubectl get svc word-counter-service \
                                    -n ${K8S_NAMESPACE} \
                                    -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
                                """,
                                returnStdout: true
                            ).trim()

                            if (url) {
                                env.APP_URL = "http://${url}"
                                return true
                            }

                            echo 'Waiting for LoadBalancer...'
                            sleep 15
                            return false
                        }
                    }

                    echo "Application URL: ${env.APP_URL}"
                }
            }
        }
    }

    post {
        success {
            echo 'CI/CD Pipeline Completed Successfully'
        }
        failure {
            echo 'CI/CD Pipeline Failed'
        }
        always {
            echo 'Pipeline execution completed'
        }
    }
}
