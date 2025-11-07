# Synapse Monitoring & Logging Guide

Complete guide for monitoring, logging, and alerting for Synapse in production.

## Table of Contents

1. [Monitoring Stack](#monitoring-stack)
2. [Application Logs](#application-logs)
3. [Health Checks](#health-checks)
4. [Performance Metrics](#performance-metrics)
5. [Alerting Setup](#alerting-setup)
6. [Log Aggregation](#log-aggregation)
7. [Error Tracking](#error-tracking)
8. [Dashboards](#dashboards)

---

## Monitoring Stack

### Recommended Stack

- **Logs**: Docker logs + Loki (optional)
- **Metrics**: Prometheus + Grafana (optional)
- **Uptime**: UptimeRobot or custom health checks
- **Errors**: Sentry (optional)
- **APM**: New Relic or DataDog (optional)

### Minimal Setup (No Extra Tools)

For small deployments, use built-in Docker logging and shell scripts.

---

## Application Logs

### Viewing Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f postgres

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100 backend

# Since specific time
docker compose -f docker-compose.prod.yml logs --since 2025-01-07T12:00:00

# Save logs to file
docker compose -f docker-compose.prod.yml logs > logs_$(date +%Y%m%d).txt
```

### Log Rotation

Docker automatically rotates logs, but you can configure it in `docker-compose.prod.yml`:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"    # Max size per log file
    max-file: "3"      # Keep 3 rotated files
```

### System Log Rotation

Create `/etc/logrotate.d/synapse`:

```
/var/log/synapse/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0640 root root
    sharedscripts
    postrotate
        docker compose -f /path/to/synapse/docker-compose.prod.yml restart backend
    endscript
}
```

---

## Health Checks

### Built-in Health Checks

All services have health checks configured in Docker Compose:

```bash
# Check service health status
docker compose -f docker-compose.prod.yml ps

# Expected output:
# NAME                 STATUS
# synapse-backend      Up (healthy)
# synapse-frontend     Up (healthy)
# synapse-postgres     Up (healthy)
# synapse-redis        Up (healthy)
```

### Manual Health Checks

```bash
# Backend API
curl http://localhost:8080/health
# Expected: OK

# Frontend
curl http://localhost:3000
# Expected: HTML

# PostgreSQL
docker exec synapse-postgres pg_isready -U synapse_user
# Expected: accepting connections

# Redis
docker exec synapse-redis redis-cli --raw incr ping
# Expected: integer
```

### Automated Health Check Script

Create `/usr/local/bin/synapse-health-check.sh`:

```bash
#!/bin/bash

# Configuration
API_URL="https://api.synapse.yourdomain.com/health"
WEB_URL="https://synapse.yourdomain.com"
LOG_FILE="/var/log/synapse/health-check.log"
ALERT_EMAIL="admin@yourdomain.com"

# Ensure log directory exists
mkdir -p /var/log/synapse

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Function to send alert
send_alert() {
    local service=$1
    local message=$2

    # Log the alert
    log "ALERT: $service - $message"

    # Send email (requires mailutils)
    if command -v mail &> /dev/null; then
        echo "$message" | mail -s "Synapse Alert: $service Down" $ALERT_EMAIL
    fi
}

# Check Backend API
api_status=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)
if [ $api_status -ne 200 ]; then
    send_alert "Backend API" "API returned HTTP $api_status"
    log "❌ Backend API unhealthy (HTTP $api_status)"
else
    log "✅ Backend API healthy"
fi

# Check Frontend
web_status=$(curl -s -o /dev/null -w "%{http_code}" $WEB_URL)
if [ $web_status -ne 200 ]; then
    send_alert "Frontend" "Frontend returned HTTP $web_status"
    log "❌ Frontend unhealthy (HTTP $web_status)"
else
    log "✅ Frontend healthy"
fi

# Check Database
if ! docker exec synapse-postgres pg_isready -U synapse_user -q; then
    send_alert "PostgreSQL" "Database is not accepting connections"
    log "❌ PostgreSQL unhealthy"
else
    log "✅ PostgreSQL healthy"
fi

# Check Redis
if ! docker exec synapse-redis redis-cli ping > /dev/null 2>&1; then
    send_alert "Redis" "Redis is not responding"
    log "❌ Redis unhealthy"
else
    log "✅ Redis healthy"
fi

# Check disk space
disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $disk_usage -gt 80 ]; then
    send_alert "Disk Space" "Disk usage is at ${disk_usage}%"
    log "⚠️  Disk usage high: ${disk_usage}%"
else
    log "✅ Disk usage OK: ${disk_usage}%"
fi

log "Health check completed"
```

Make it executable and schedule:

```bash
chmod +x /usr/local/bin/synapse-health-check.sh

# Add to cron (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/synapse-health-check.sh") | crontab -
```

---

## Performance Metrics

### Docker Stats

Monitor resource usage:

```bash
# Real-time stats
docker stats

# Sample output:
# CONTAINER          CPU %     MEM USAGE / LIMIT     MEM %     NET I/O
# synapse-backend    2.50%     150MiB / 2GiB        7.5%      10MB / 5MB
# synapse-frontend   0.10%     50MiB / 2GiB         2.5%      5MB / 10MB
# synapse-postgres   1.20%     200MiB / 2GiB        10%       2MB / 3MB
# synapse-redis      0.50%     30MiB / 256MiB       11.7%     1MB / 1MB
```

### Performance Monitoring Script

Create `/usr/local/bin/synapse-metrics.sh`:

```bash
#!/bin/bash

METRICS_FILE="/var/log/synapse/metrics.log"
mkdir -p /var/log/synapse

# Get timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Collect metrics
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk '{print 100 - $1}')
MEM_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

# Docker stats
BACKEND_MEM=$(docker stats synapse-backend --no-stream --format "{{.MemUsage}}" | awk '{print $1}')
POSTGRES_MEM=$(docker stats synapse-postgres --no-stream --format "{{.MemUsage}}" | awk '{print $1}')

# Log metrics
echo "$TIMESTAMP,CPU:$CPU_USAGE,MEM:$MEM_USAGE,DISK:$DISK_USAGE,BACKEND_MEM:$BACKEND_MEM,POSTGRES_MEM:$POSTGRES_MEM" >> $METRICS_FILE

# Keep only last 7 days
find /var/log/synapse/metrics.log -mtime +7 -delete
```

Schedule every 10 minutes:

```bash
chmod +x /usr/local/bin/synapse-metrics.sh
(crontab -l 2>/dev/null; echo "*/10 * * * * /usr/local/bin/synapse-metrics.sh") | crontab -
```

---

## Alerting Setup

### Email Alerts

Install mail utilities:

```bash
sudo apt install mailutils -y
```

Configure postfix or use external SMTP.

### Slack Alerts

Create `/usr/local/bin/send-slack-alert.sh`:

```bash
#!/bin/bash

SLACK_WEBHOOK_URL="YOUR_SLACK_WEBHOOK_URL_HERE"
MESSAGE=$1

if [ -z "$MESSAGE" ]; then
    echo "Usage: send-slack-alert.sh \"message\""
    exit 1
fi

curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🚨 Synapse Alert: $MESSAGE\"}" \
    $SLACK_WEBHOOK_URL
```

Use in health checks:

```bash
# Replace send_alert function with:
send_alert() {
    local service=$1
    local message=$2
    /usr/local/bin/send-slack-alert.sh "$service: $message"
}
```

### PagerDuty Integration

```bash
#!/bin/bash

PAGERDUTY_KEY="YOUR_INTEGRATION_KEY"
MESSAGE=$1

curl -X POST https://events.pagerduty.com/v2/enqueue \
  -H 'Content-Type: application/json' \
  -d "{
    \"routing_key\": \"$PAGERDUTY_KEY\",
    \"event_action\": \"trigger\",
    \"payload\": {
      \"summary\": \"$MESSAGE\",
      \"source\": \"synapse-monitoring\",
      \"severity\": \"error\"
    }
  }"
```

---

## Log Aggregation

### Option 1: Simple Centralized Logging

```bash
# Stream all logs to a file
docker compose -f docker-compose.prod.yml logs -f >> /var/log/synapse/all-logs.log &

# Search logs
grep "ERROR" /var/log/synapse/all-logs.log
grep "user_id=123" /var/log/synapse/all-logs.log
```

### Option 2: Loki + Promtail (Advanced)

Create `docker-compose.logging.yml`:

```yaml
version: '3.8'

services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - loki_data:/loki
    networks:
      - synapse-network

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
    networks:
      - synapse-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - synapse-network

volumes:
  loki_data:
  grafana_data:

networks:
  synapse-network:
    external: true
```

Deploy:

```bash
docker compose -f docker-compose.logging.yml up -d
```

Access Grafana at `http://your-server:3001` (admin/admin)

---

## Error Tracking

### Option 1: Sentry Integration

1. Create account at https://sentry.io
2. Get DSN
3. Add to backend `.env.production`:

```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

4. Add to backend code:

```go
import "github.com/getsentry/sentry-go"

// In main.go
err := sentry.Init(sentry.ClientOptions{
    Dsn: os.Getenv("SENTRY_DSN"),
    Environment: "production",
})

// Capture errors
if err != nil {
    sentry.CaptureException(err)
}
```

### Option 2: Custom Error Logging

Log errors to dedicated file:

```go
// In backend
errorLog, _ := os.OpenFile("/var/log/synapse/errors.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
log.SetOutput(errorLog)

log.Printf("ERROR: %v", err)
```

Monitor errors:

```bash
tail -f /var/log/synapse/errors.log | grep "ERROR"
```

---

## Dashboards

### Simple HTML Dashboard

Create `/var/www/html/synapse-status.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Synapse Status</title>
    <meta http-equiv="refresh" content="30">
    <style>
        body { font-family: Arial; margin: 40px; }
        .status { padding: 20px; margin: 10px 0; border-radius: 5px; }
        .healthy { background: #d4edda; color: #155724; }
        .unhealthy { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <h1>Synapse System Status</h1>
    <div id="status"></div>
    <script>
        async function checkStatus() {
            const checks = [
                { name: 'Backend API', url: 'https://api.synapse.yourdomain.com/health' },
                { name: 'Frontend', url: 'https://synapse.yourdomain.com' }
            ];

            const results = await Promise.all(checks.map(async check => {
                try {
                    const res = await fetch(check.url);
                    return { ...check, healthy: res.ok };
                } catch (e) {
                    return { ...check, healthy: false };
                }
            }));

            document.getElementById('status').innerHTML = results.map(r =>
                `<div class="status ${r.healthy ? 'healthy' : 'unhealthy'}">
                    ${r.name}: ${r.healthy ? '✅ Healthy' : '❌ Down'}
                </div>`
            ).join('');
        }

        checkStatus();
        setInterval(checkStatus, 30000);
    </script>
</body>
</html>
```

### Grafana Dashboard (Advanced)

If using Prometheus + Grafana:

1. Add Prometheus exporter to backend
2. Configure Prometheus to scrape metrics
3. Import dashboard in Grafana
4. Monitor:
   - Request rate
   - Response time
   - Error rate
   - Database connections
   - Memory usage

---

## Best Practices

1. **Log Everything Important**: Errors, authentication attempts, critical operations
2. **Use Structured Logging**: JSON format for easy parsing
3. **Set Alert Thresholds**: Not too sensitive (alert fatigue) or too loose
4. **Regular Review**: Check logs weekly for patterns
5. **Rotate Logs**: Prevent disk space issues
6. **Secure Logs**: Contain sensitive data, protect access
7. **Test Alerts**: Ensure notifications work
8. **Document Incidents**: Keep a log of issues and resolutions

---

## Quick Reference

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f backend

# Check health
curl http://localhost:8080/health

# View metrics
docker stats

# Check disk space
df -h

# Find errors in logs
docker compose -f docker-compose.prod.yml logs backend | grep ERROR

# View recent logs
docker compose -f docker-compose.prod.yml logs --tail=100 --since 1h backend

# Export logs
docker compose -f docker-compose.prod.yml logs > backup.log
```

---

For deployment guide, see [DEPLOYMENT.md](DEPLOYMENT.md)
