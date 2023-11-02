package api

import (
	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/DataObserve/datav/query/pkg/models"
	"github.com/gin-gonic/gin"
)

const (
	TestDatasourceAPI       = "testDatasource"
	GetServiceInfoListAPI   = "getServiceInfoList"
	GetEnvironmentsAPI      = "getEnvironments"
	GetServiceNamesAPI      = "getServiceNames"
	GetServiceOperationsAPI = "getServiceOperations"
	GetDependencyGraphAPI   = "getDependencyGraph"
	GetLogsAPI              = "getLogs"
	GetTracesAPI            = "getTraces"
	GetTraceAPI             = "getTrace"
	GetTraceTagKeysAPI      = "getTraceTagKeys"
)

var APIRoutes = map[string]func(c *gin.Context, ds *models.Datasource, conn ch.Conn, params map[string]interface{}) models.PluginResult{
	GetServiceInfoListAPI:   GetServiceInfoList,
	GetEnvironmentsAPI:      GetEnvironments,
	GetServiceNamesAPI:      GetServiceNames,
	GetServiceOperationsAPI: GetServiceOperations,
	GetLogsAPI:              GetLogs,
	GetDependencyGraphAPI:   GetDependencyGraph,
	GetTracesAPI:            GetTraces,
	GetTraceAPI:             GetTrace,
	GetTraceTagKeysAPI:      GetTraceTagKeys,
}
