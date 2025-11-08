package handlers

import (
	"encoding/json"
	"net/http"
	"runtime"
	"time"

	"github.com/BachirKhiati/lexia/internal/database"
)

type HealthHandler struct {
	db        *database.DB
	startTime time.Time
}

func NewHealthHandler(db *database.DB) *HealthHandler {
	return &HealthHandler{
		db:        db,
		startTime: time.Now(),
	}
}

// HealthResponse contains health check information
type HealthResponse struct {
	Status    string            `json:"status"`
	Timestamp string            `json:"timestamp"`
	Uptime    string            `json:"uptime"`
	Version   string            `json:"version"`
	Checks    map[string]string `json:"checks"`
}

// SystemStats contains detailed system statistics
type SystemStats struct {
	Uptime          string         `json:"uptime"`
	GoVersion       string         `json:"go_version"`
	NumGoroutines   int            `json:"num_goroutines"`
	MemoryStats     MemoryStats    `json:"memory_stats"`
	DatabaseStats   DatabaseStats  `json:"database_stats"`
	Timestamp       string         `json:"timestamp"`
}

type MemoryStats struct {
	Alloc      uint64 `json:"alloc_mb"`
	TotalAlloc uint64 `json:"total_alloc_mb"`
	Sys        uint64 `json:"sys_mb"`
	NumGC      uint32 `json:"num_gc"`
}

type DatabaseStats struct {
	OpenConnections int    `json:"open_connections"`
	InUse           int    `json:"in_use"`
	Idle            int    `json:"idle"`
	Status          string `json:"status"`
}

// Health returns basic health check
// @Summary Health check endpoint
// @Description Returns the health status of the application
// @Tags Health
// @Produce json
// @Success 200 {object} HealthResponse "Service is healthy"
// @Failure 503 {object} HealthResponse "Service is unhealthy"
// @Router /health [get]
func (h *HealthHandler) Health(w http.ResponseWriter, r *http.Request) {
	checks := make(map[string]string)

	// Check database connection
	ctx := r.Context()
	err := h.db.PingContext(ctx)
	if err != nil {
		checks["database"] = "unhealthy: " + err.Error()
	} else {
		checks["database"] = "healthy"
	}

	// Overall status
	status := "healthy"
	statusCode := http.StatusOK
	for _, check := range checks {
		if check != "healthy" {
			status = "unhealthy"
			statusCode = http.StatusServiceUnavailable
			break
		}
	}

	response := HealthResponse{
		Status:    status,
		Timestamp: time.Now().Format(time.RFC3339),
		Uptime:    time.Since(h.startTime).String(),
		Version:   "1.0.0",
		Checks:    checks,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}

// Ready returns readiness status (ready to accept traffic)
// @Summary Readiness check endpoint
// @Description Returns whether the service is ready to accept requests
// @Tags Health
// @Produce json
// @Success 200 {object} map[string]string "Service is ready"
// @Failure 503 {object} map[string]string "Service is not ready"
// @Router /ready [get]
func (h *HealthHandler) Ready(w http.ResponseWriter, r *http.Request) {
	// Check if database is accessible
	ctx := r.Context()
	err := h.db.PingContext(ctx)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]string{
			"status": "not ready",
			"reason": "database unavailable",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "ready",
	})
}

// Live returns liveness status (container is alive)
// @Summary Liveness check endpoint
// @Description Returns whether the service is alive
// @Tags Health
// @Produce json
// @Success 200 {object} map[string]string "Service is alive"
// @Router /live [get]
func (h *HealthHandler) Live(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "alive",
	})
}

// Stats returns detailed system statistics
// @Summary Get system statistics
// @Description Returns detailed system and runtime statistics
// @Tags Health
// @Produce json
// @Security BearerAuth
// @Success 200 {object} SystemStats "System statistics"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Router /stats [get]
func (h *HealthHandler) Stats(w http.ResponseWriter, r *http.Request) {
	// Get memory stats
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	memStats := MemoryStats{
		Alloc:      m.Alloc / 1024 / 1024,
		TotalAlloc: m.TotalAlloc / 1024 / 1024,
		Sys:        m.Sys / 1024 / 1024,
		NumGC:      m.NumGC,
	}

	// Get database stats
	dbStats := DatabaseStats{
		Status: "unknown",
	}

	// Access stats directly since database.DB embeds *sql.DB
	stats := h.db.Stats()
	dbStats.OpenConnections = stats.OpenConnections
	dbStats.InUse = stats.InUse
	dbStats.Idle = stats.Idle
	dbStats.Status = "connected"

	response := SystemStats{
		Uptime:        time.Since(h.startTime).String(),
		GoVersion:     runtime.Version(),
		NumGoroutines: runtime.NumGoroutine(),
		MemoryStats:   memStats,
		DatabaseStats: dbStats,
		Timestamp:     time.Now().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
