package main

import (
  "database/sql"
  _ "github.com/go-sql-driver/mysql"
  "github.com/codegangsta/martini"
  "encoding/json"
  "strconv"
)

func main() {
  m := martini.Classic()

  db, err := sql.Open("mysql", "root@127.0.0.1/ops")
  if err != nil { panic(err) }
  defer db.Close()

  m.Map(db)

  schoolOne := School{Id: 1, Name: "Millard North High School", CountyId: 1, DistrictId: 1}
  schoolTwo := School{Id: 2, Name: "Millard South High School", CountyId: 1, DistrictId: 1}
  schools := []School{schoolOne, schoolTwo}

  m.Get("/schools", func() string {
    llSchoolsJ, err := json.Marshal(schools)
    if err != nil { panic(err) }
    return string(llSchoolsJ[:])
  })

  m.Get("/schools/:id", func(params martini.Params) string {
    school := schoolFind(schools, params["id"])
    llSchoolJ, err := json.Marshal(school)
    if err != nil { panic(err) }
    return string(llSchoolJ[:])
  })

  m.Run()
}

func schoolFind(schools []School, id string) School {
  schoolId, err := strconv.ParseInt(id, 0, 64)
  if err != nil { panic(err) }

  for _, value := range schools {
    if value.Id == schoolId {
      return value
    }
  }

  return School{}
}

type School struct {
  Id          int64
  Name        string `sql:"size:255"`
  CountyId    int64
  DistrictId  int64
}
