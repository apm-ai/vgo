package clickhouse

import (
	"context"
	"fmt"
	"net"
	"strings"
	"sync"
	"time"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/DataObserve/datav/query/pkg/colorlog"
	"github.com/DataObserve/datav/query/pkg/models"
	"github.com/gin-gonic/gin"
)

/* Query plugin for clickhouse database */

var datasourceName = "clickhouse"

type ClickHousePlugin struct{}

var conns = make(map[int64]ch.Conn)
var connsLock = &sync.Mutex{}

func (p *ClickHousePlugin) Query(c *gin.Context, ds *models.Datasource) interface{} {
	query := c.Query("query")
	fmt.Println("query clickhouse database:", query)

	conn, ok := conns[ds.Id]
	if !ok {
		var err error
		conn, err = connectToClickhouse(ds)
		if err != nil {
			colorlog.RootLogger.Warn("connect to clickhouse error:", err, "ds_id", ds.Id, "url", ds.URL)
			return err
		}
		connsLock.Lock()
		conns[ds.Id] = conn
		connsLock.Unlock()
	}

	rows, err := conn.Query(c.Request.Context(), query)
	if err != nil {
		colorlog.RootLogger.Info("Error query clickhouse :", "error", err, "ds_id", ds.Id, "query:", query)
		return err
	}

	for rows.Next() {
		// var v interface{}
		// err := rows.Scan(&v)
		// if err != nil {
		// 	colorlog.RootLogger.Info("scan clickhouse error:", err, "ds_id", ds.Id)
		// 	return err
		// }
		// fmt.Println("v:", v)
	}
	return nil
}

func init() {
	// register datasource
	models.RegisterPlugin(datasourceName, &ClickHousePlugin{})
}

func connectToClickhouse(ds *models.Datasource) (ch.Conn, error) {
	conn, err := ch.Open(&ch.Options{
		Addr: strings.Split(ds.URL, ","),
		Auth: ch.Auth{
			Database: "default",
			Username: "default",
			Password: "",
		},
		DialContext: func(ctx context.Context, addr string) (net.Conn, error) {
			var d net.Dialer
			return d.DialContext(ctx, "tcp", addr)
		},
		Debug: true,
		Debugf: func(format string, v ...any) {
			fmt.Printf(format, v)
		},
		Settings: ch.Settings{
			"max_execution_time": 60,
		},
		Compression: &ch.Compression{
			Method: ch.CompressionLZ4,
		},
		DialTimeout:          time.Second * 30,
		MaxOpenConns:         5,
		MaxIdleConns:         5,
		ConnMaxLifetime:      time.Duration(10) * time.Minute,
		ConnOpenStrategy:     ch.ConnOpenInOrder,
		BlockBufferSize:      10,
		MaxCompressionBuffer: 10240,
		ClientInfo: ch.ClientInfo{ // optional, please see Client info section in the README.md
			Products: []struct {
				Name    string
				Version string
			}{
				{Name: "my-app", Version: "0.1"},
			},
		},
	})
	if err != nil {
		return nil, err
	}

	err = conn.Ping(context.Background())
	if err != nil {
		return nil, err
	}

	return conn, nil
}