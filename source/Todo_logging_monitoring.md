# Phase 1 — Production Deployment

## Goal

App chạy thật trên internet.

---

## 1. Chuẩn bị backend production

### TODO

- [ ]  Tách `.env.production`
- [ ]  Config CORS production
- [ ]  Config JWT secrets
- [ ]  Disable debug logs
- [ ]  Setup PM2 hoặc Docker restart
- [ ]  Add health check endpoint

Ví dụ:

```
/health
```

---

## 2. Deploy VPS

Ví dụ:

- GCP VM
- Ubuntu 22.04

### TODO

- [ ]  SSH vào VPS
- [ ]  Install Docker
- [ ]  Install Docker Compose
- [ ]  Clone project
- [ ]  Run backend containers

---

## 3. Reverse proxy

### TODO

- [ ]  Install Nginx
- [ ]  Setup domain
- [ ]  Setup HTTPS bằng.... (cloudflare ssl)
- [ ]  Reverse proxy websocket

---

# Phase 2 — Observability

## Goal

Biết app đang sống hay chết 😄

---

# 4. Setup Prometheus

### TODO

- [ ]  Install Prometheus container
- [ ]  Add `/metrics`
- [ ]  Expose Node.js metrics
- [ ]  Verify scrape working

Metrics:

- CPU
- RAM
- request count
- latency
- websocket count
- active websocket rooms
- messages/sec
- reconnect rate
- reservation conflicts/sec
- Redis pubsub latency

---

# 5. Setup Grafana

### TODO

- [ ]  Install Grafana
- [ ]  Connect Prometheus datasource
- [ ]  Create dashboard

Dashboard nên có:

- CPU
- RAM
- RPS
- p95 latency
- websocket users
- DB latency

---

# Phase 3 — Logging

## Goal

Biết lỗi gì đang xảy ra.

---

# 6. Structured logging

### TODO

- [ ]  Add Pino
- [ ]  Log request IDs
- [ ]  Log errors
- [ ]  Log websocket connect/disconnect

---

# Phase 4 — Load Testing

## Goal

Benchmark thật.

---

# 7. Setup k6

### TODO

- [ ]  Install k6
- [ ]  Create login stress test
- [ ]  Create websocket test
- [ ]  Create reservation test
- [ ]  Create payment flow test

---

# 8. Benchmark theo level

### TODO

- [ ]  100 users
- [ ]  300 users
- [ ]  500 users
- [ ]  1000 users

Ở mỗi level:

- latency?
- CPU?
- RAM?
- websocket disconnect?
- DB bottleneck?

---

# Phase 5 — Optimization

## Goal

Scale tốt hơn.

---

# 9. Database optimization

### TODO

- [ ]  Add indexes
- [ ]  Analyze slow queries
- [ ]  Prevent N+1 queries
- [ ]  Add pagination
- [ ]  Add connection pooling

---

# 10. Realtime optimization

### TODO

- [ ]  Reduce websocket broadcasts
- [ ]  Batch notifications
- [ ]  Optimize room subscriptions
- [ ]  Prevent duplicate subscriptions

---

# 11. Cache optimization

### TODO

- [ ]  Cache workshop details
- [ ]  Cache seat counts
- [ ]  Add TTL policies
- [ ]  Prevent cache stampede

---

# Phase 6 — Reliability

## Goal

App không chết dễ dàng.

---

# 12. Crash recovery

### TODO

- [ ]  PM2 auto restart
- [ ]  Docker restart policy
- [ ]  Health checks
- [ ]  Graceful shutdown

---

# 13. Circuit breaker + retry

### TODO

- [ ]  Payment retry strategy
- [ ]  Timeout handling
- [ ]  RabbitMQ dead letter queue

---

# Phase 7 — CI/CD

## Goal

Deploy tự động.

---

# 14. GitHub Actions

### TODO

- [ ]  Run tests
- [ ]  Build Docker images
- [ ]  Deploy to VPS
- [ ]  Restart containers

---

# Phase 8 — Documentation

## Goal

Biến project thành CV killer 😄

---

# 15. Architecture docs

### TODO

- [ ]  System architecture diagram
- [ ]  Realtime flow diagram
- [ ]  Reservation conflict handling
- [ ]  Payment flow
- [ ]  Deployment architecture

---

# 16. Performance report

### TODO

- [ ]  Benchmark screenshots
- [ ]  Grafana dashboards
- [ ]  k6 results
- [ ]  Bottleneck analysis
- [ ]  Optimization results

# Phase 9 — Security

## TODO

- [ ]  rate limiting
- [ ]  helmet headers
- [ ]  JWT rotation
- [ ]  refresh token revoke
- [ ]  CSRF review
- [ ]  secret management
- [ ]  SQL injection review
- [ ]  dependency vulnerability scan


---


# Phase 10 — Distributed Systems

## TODO

- [ ]  Redis pub/sub multi-instance websocket
- [ ]  horizontal scaling
- [ ]  sticky sessions
- [ ]  distributed locks
- [ ]  queue-based notification system

