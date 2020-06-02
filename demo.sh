#!/bin/sh

# Configure terminal session to use Minikube's docker
# Allows us to run `docker build ...` commands to Minikube's container registry instead of a container repository
eval "$(minikube docker-env)"

# Enable support for Ingress in Minikube
minikube addons enable ingress
minikube addons enable ingress-dns

# Scoped environment for demo
kubectl create namespace ers

# Generate RSA keys, used by server application
openssl req -x509 -nodes -days 365 -sha256 -newkey rsa:4096 -keyout ers.pem -out ers.pem -subj "/CN=Demo/C=US/ST=VA/L=Reston/O=Demo/CN=www.example.com"
openssl rsa -in ers.pem -pubout > ers-verifier.pem

# Create Kubernetes Secret from RSA keys, will be mounted onto pod
kubectl create secret generic ers-keys --from-file=ers-signer=ers.pem --from-file=ers-verifier=ers-verifier.pem --namespace ers

# Build application specific images
docker build -t ers-client ./client/
docker build -t ers-server ./server/

## Clean up
rm ers.pem ers-verifier.pem
