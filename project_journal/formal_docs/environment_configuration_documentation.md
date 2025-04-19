# Environment Configuration Documentation for 2FLocal

## Overview

This document provides comprehensive documentation for the staging and production environments of the 2FLocal application. It includes setup procedures, environment-specific configurations, secrets management, database migration strategies, and troubleshooting guides.

## Environment Architecture

The 2FLocal application is deployed on Kubernetes and consists of the following components:

1. **Backend Service**: Node.js application running in containers
2. **Database**: PostgreSQL database for data storage
3. **Monitoring**: Prometheus and Grafana for metrics and dashboards
4. **Logging**: ELK stack (Elasticsearch, Kibana, Filebeat) for log collection and analysis

### Staging Environment

The staging environment is used for testing and validation before deploying to production. It has the following characteristics:

- Lower resource allocation
- Debug-level logging
- Beta features enabled
- Daily database backups
- Separate domain (api-staging.2flocal.com)

### Production Environment

The production environment is used for serving end users. It has the following characteristics:

- Higher resource allocation
- Info-level logging
- Only stable features enabled
- Frequent database backups (every 6 hours)
- Production domain (api.2flocal.com)

## Setup Procedures

### Prerequisites

- Kubernetes cluster
- kubectl configured to access the cluster
- Helm (optional, for package management)
- Docker for building container images

### Deployment Steps

1. **Create Namespaces**:
   ```bash
   kubectl apply -f kubernetes/base/namespaces.yaml
   ```

2. **Deploy Database**:
   ```bash
   # For staging
   kubectl apply -f kubernetes/staging/database/pvc.yaml
   kubectl apply -f kubernetes/staging/database/secrets.yaml
   kubectl apply -f kubernetes/staging/database/deployment.yaml
   kubectl apply -f kubernetes/staging/database/service.yaml
   kubectl apply -f kubernetes/staging/database/backup-pvc.yaml
   kubectl apply -f kubernetes/staging/database/backup-cronjob.yaml
   
   # For production
   kubectl apply -f kubernetes/production/database/pvc.yaml
   kubectl apply -f kubernetes/production/database/secrets.yaml
   kubectl apply -f kubernetes/production/database/deployment.yaml
   kubectl apply -f kubernetes/production/database/service.yaml
   kubectl apply -f kubernetes/production/database/backup-pvc.yaml
   kubectl apply -f kubernetes/production/database/backup-cronjob.yaml
   ```

3. **Deploy Backend Service**:
   ```bash
   # For staging
   kubectl apply -f kubernetes/staging/backend/configmap.yaml
   kubectl apply -f kubernetes/staging/backend/secrets.yaml
   kubectl apply -f kubernetes/staging/backend/deployment.yaml
   kubectl apply -f kubernetes/staging/backend/service.yaml
   kubectl apply -f kubernetes/staging/backend/ingress.yaml
   
   # For production
   kubectl apply -f kubernetes/production/backend/configmap.yaml
   kubectl apply -f kubernetes/production/backend/secrets.yaml
   kubectl apply -f kubernetes/production/backend/deployment.yaml
   kubectl apply -f kubernetes/production/backend/service.yaml
   kubectl apply -f kubernetes/production/backend/ingress.yaml
   ```

4. **Deploy Monitoring**:
   ```bash
   kubectl apply -f kubernetes/base/monitoring/prometheus-configmap.yaml
   kubectl apply -f kubernetes/base/monitoring/prometheus-deployment.yaml
   kubectl apply -f kubernetes/base/monitoring/grafana-deployment.yaml
   ```

5. **Deploy Logging**:
   ```bash
   kubectl apply -f kubernetes/base/logging/elasticsearch-deployment.yaml
   kubectl apply -f kubernetes/base/logging/kibana-deployment.yaml
   kubectl apply -f kubernetes/base/logging/filebeat-daemonset.yaml
   ```

## Secrets Management

### Secret Storage

Secrets are stored as Kubernetes Secrets. In a real-world scenario, consider using one of the following approaches for enhanced security:

1. **Sealed Secrets**: Encrypt secrets in Git repositories
2. **External Secrets**: Integrate with external secret managers like HashiCorp Vault or AWS Secrets Manager
3. **SOPS**: Mozilla's Secret OPerationS for encrypting secrets

### Secret Rotation

1. **Regular Rotation**: Rotate secrets on a regular schedule (e.g., every 90 days)
2. **Emergency Rotation**: Rotate secrets immediately if compromised
3. **Automated Rotation**: Use tools like Vault's dynamic secrets for automated rotation

### Secret Access

1. **Principle of Least Privilege**: Only grant access to secrets that are needed
2. **RBAC**: Use Kubernetes Role-Based Access Control to restrict access to secrets
3. **Audit Logging**: Enable audit logging for secret access

## Environment-Specific Settings

### Configuration Management

Environment-specific settings are managed through:

1. **ConfigMaps**: For non-sensitive configuration
2. **Secrets**: For sensitive configuration
3. **Environment Variables**: Injected into containers

### Feature Flags

Feature flags are implemented to enable/disable features in different environments:

1. **Staging**: Beta features enabled for testing
2. **Production**: Only stable features enabled

### API Endpoints

Each environment has its own domain:

1. **Staging**: api-staging.2flocal.com
2. **Production**: api.2flocal.com

### Logging Levels

Different logging levels are configured for each environment:

1. **Staging**: Debug level for detailed troubleshooting
2. **Production**: Info level for important events without excessive detail

## Database Migration Strategy

### Migration Process

Database migrations are managed using Prisma Migrate:

1. **Development**: Create migrations locally
2. **Staging**: Apply migrations automatically during deployment
3. **Production**: Apply migrations manually after verification in staging

### Backup and Restore

1. **Regular Backups**: Automated backups using CronJobs
2. **Retention Policy**: Keep backups for 30 days
3. **Restore Procedure**: Use pg_restore to restore from backup

### Data Seeding

1. **Staging**: Seed with anonymized data for testing
2. **Production**: No seeding, only real data

## Monitoring and Alerting

### Metrics Collection

1. **Prometheus**: Collects metrics from services
2. **Node Exporter**: Collects system metrics
3. **Custom Metrics**: Application-specific metrics

### Dashboards

1. **Grafana**: Visualize metrics and create dashboards
2. **Default Dashboards**: System, Node.js, PostgreSQL

### Alerts

1. **Alert Rules**: Define thresholds for alerts
2. **Notification Channels**: Slack, Email, PagerDuty
3. **Escalation Policies**: Define who gets notified and when

## Logging

### Log Collection

1. **Filebeat**: Collects logs from containers
2. **Elasticsearch**: Stores and indexes logs
3. **Kibana**: Visualize and search logs

### Log Retention

1. **Staging**: 7 days
2. **Production**: 30 days

### Log Analysis

1. **Kibana Dashboards**: Visualize log patterns
2. **Saved Searches**: Common queries for troubleshooting
3. **Alerts**: Alert on specific log patterns

## SSL/TLS Certificates

SSL/TLS certificates are managed using cert-manager:

1. **Automatic Issuance**: Certificates are automatically issued by Let's Encrypt
2. **Automatic Renewal**: Certificates are automatically renewed before expiration
3. **Staging vs Production**: Staging uses Let's Encrypt staging environment, production uses production environment

## Troubleshooting Guide

### Common Issues

#### Database Connection Issues

**Symptoms**:
- Backend service cannot connect to database
- Logs show connection errors

**Solutions**:
1. Check if database pod is running: `kubectl get pods -n 2flocal-staging`
2. Check database service: `kubectl get svc postgres -n 2flocal-staging`
3. Check database credentials in secrets
4. Check network policies

#### Pod Startup Issues

**Symptoms**:
- Pods are in CrashLoopBackOff state
- Pods are not ready

**Solutions**:
1. Check pod logs: `kubectl logs <pod-name> -n 2flocal-staging`
2. Check events: `kubectl get events -n 2flocal-staging`
3. Check resource constraints
4. Check liveness and readiness probes

#### Ingress Issues

**Symptoms**:
- Cannot access services via domain names
- SSL certificate errors

**Solutions**:
1. Check ingress configuration: `kubectl get ingress -n 2flocal-staging`
2. Check SSL certificates: `kubectl get certificates -n 2flocal-staging`
3. Check DNS configuration
4. Check ingress controller logs

### Debugging Tools

1. **kubectl**: Kubernetes command-line tool
2. **k9s**: Terminal UI for Kubernetes
3. **Stern**: Multi-pod log tailing
4. **Kubectx/Kubens**: Context and namespace switching

## Maintenance Procedures

### Routine Maintenance

1. **Update Kubernetes Resources**: Apply changes to configurations
2. **Database Maintenance**: Run VACUUM ANALYZE periodically
3. **Log Rotation**: Ensure logs are rotated and archived

### Scaling

1. **Horizontal Scaling**: Adjust replica count in deployments
2. **Vertical Scaling**: Adjust resource requests and limits
3. **Database Scaling**: Consider read replicas for high read loads

### Upgrades

1. **Backend Service**: Rolling updates with zero downtime
2. **Database**: Minimize downtime with proper planning
3. **Kubernetes Components**: Follow best practices for upgrading

## Security Considerations

### Network Security

1. **Network Policies**: Restrict pod-to-pod communication
2. **Ingress Security**: Use TLS and proper annotations
3. **API Security**: Implement rate limiting and authentication

### Pod Security

1. **Non-root Users**: Run containers as non-root users
2. **Read-only Filesystem**: Use read-only filesystems where possible
3. **Security Context**: Set appropriate security contexts

### Secrets Security

1. **Encryption at Rest**: Ensure secrets are encrypted
2. **Minimal Access**: Only expose necessary secrets to pods
3. **Regular Rotation**: Rotate secrets regularly

## Conclusion

This documentation provides a comprehensive guide to the 2FLocal application's environment configuration. By following these procedures and best practices, you can ensure a reliable, secure, and maintainable deployment.

## Appendix

### Useful Commands

```bash
# Get pods in a namespace
kubectl get pods -n 2flocal-staging

# Get logs from a pod
kubectl logs <pod-name> -n 2flocal-staging

# Describe a resource
kubectl describe <resource-type> <resource-name> -n 2flocal-staging

# Port forward to a service
kubectl port-forward svc/<service-name> <local-port>:<service-port> -n 2flocal-staging

# Execute a command in a pod
kubectl exec -it <pod-name> -n 2flocal-staging -- <command>
```

### Reference Links

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Kibana Documentation](https://www.elastic.co/guide/en/kibana/current/index.html)
- [Prisma Documentation](https://www.prisma.io/docs/)