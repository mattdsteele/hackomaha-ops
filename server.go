package main

import (
  "database/sql"
  _ "github.com/go-sql-driver/mysql"
  "github.com/codegangsta/martini"
  "encoding/json"
  "strconv"
  "net/http"
)

func main() {
  m := martini.Classic()

  db, err := sql.Open("mysql", "root@127.0.0.1/ops")
  if err != nil { panic(err) }
  defer db.Close()

  m.Map(db)

  schoolOne := School{
    Id: 1,
    Name: "Millard North High School",
    CountyId: 1,
    DistrictId: 1,
    ClassStats: []ClassStat{
      ClassStat{
        SchoolId: 1,
        Years: "2012-2013",
        Grade: "6",
        MaleStudents: "10",
        FemaleStudents: "15",
        TotalStudents: "25",
      },
    },
  }
  schoolTwo := School{Id: 2, Name: "Millard South High School", CountyId: 1, DistrictId: 1}
  schools := []School{schoolOne, schoolTwo}

  entry2012 := DistrictYear{
    EnrollmentSize: 15,
    District: District{
      Id: 15,
      Name: "OPS",
      Latitude: 72.12345,
      Longitude: 45.215,
    },
  }

  allDistricts := []DistrictsByYear{
    DistrictsByYear{
      Year: "2012-2013",
      Districts: []DistrictYear{entry2012},
    },
    DistrictsByYear{
      Year: "2011-2012",
      Districts: []DistrictYear{entry2012},
    },
  }

  m.Get("/schools", func(res http.ResponseWriter) string {
    return render(res, schools)
  })

  m.Get("/districts", func(res http.ResponseWriter) string {
    return render(res, allDistricts)
  })

  m.Get("/schools/:id", func(res http.ResponseWriter, params martini.Params) string {
    school := schoolFind(schools, params["id"])
    return render(res, school)
  })

  m.Get("/schools/:id/:year", func(res http.ResponseWriter, params martini.Params) string {
    return "WOOOOO"
  })

  m.Run()
}

func render(res http.ResponseWriter, data interface{}) string {
    thing, err := json.Marshal(data)
    if err != nil { panic(err) }
  return asJson(res, thing)
}
func asJson(res http.ResponseWriter, data []byte) string {
  res.Header().Set("Content-Type", "application/json")
  return string(data[:])
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
  ClassStats  []ClassStat
}

type District struct {
  Id              int64
  Name            string
  Latitude        float64
  Longitude       float64
}

type DistrictsByYear struct {
  Year      string
  Districts []DistrictYear
}

type DistrictYear struct {
  EnrollmentSize  int64
  District        District
}

type ClassStat struct {
  SchoolId        int64
  Years           string
  Grade           string
  MaleStudents    string
  FemaleStudents  string
  TotalStudents   string
}
