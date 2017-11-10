#!/usr/bin/env groovy

pipeline {
  agent any

  options {
    ansiColor('xterm')
    timestamps()
  }

  libraries {
    lib("pay-jenkins-library@master")
  }

  stages {
    stage('Docker Build') {
      steps {
        script {
          buildApp{
            app = "products-ui"
          }
        }
      }
    }
    stage('Test') {
      steps {
        runParameterisedEndToEnd("productsui", null, "end2end-products", false, false)
      }
    }
    stage('Docker Tag') {
      steps {
        script {
          dockerTag {
            app = "products-ui"
          }
        }
      }
    }
    stage('Deploy') {
      when {
        branch 'master'
      }
      steps {
        deployPaas("products-ui", "test", null, true)
      }
    }
  }
}