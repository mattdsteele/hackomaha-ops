package main

import (
  "database/sql"
  _ "github.com/go-sql-driver/mysql"
)

func main() {
  db, err := sql.Open("mysql", "root@127.0.0.1/ops")
  if err != nil { panic(err) }
  defer db.Close()
}
