package main

import (
  "database/sql"
  _ "github.com/go-sql-driver/mysql"
  "github.com/codegangsta/martini"
  "encoding/json"
  "net/http"
)

func main() {
  m := martini.Classic()

  db, err := sql.Open("mysql", "root@127.0.0.1/ops")
  if err != nil { panic(err) }
  defer db.Close()

  m.Map(db)

  //All fake data
  schoolOne := School{
    Id: 1,
    Name: "Millard North High School",
    CountyId: 1,
    DistrictId: 1,
    Latitude: 41.31027811,
    Longitude: -96.146874,
  }
  schoolTwo := School{
    Id: 2,
    Name: "Millard South High School",
    CountyId: 1,
    DistrictId: 1,
    Latitude: 41.31027811,
    Longitude: -96.146874,
  }
  schools := []School{schoolOne, schoolTwo}

  entry2012 := DistrictYear{
    EnrollmentSize: 15,
    District: District{
      Id: 15,
      Name: "OPS",
      Latitude: 41.31027811,
      Longitude: -96.146874,
    },
  }

  schoolYearOne := SchoolYear{
    EnrollmentSize: 55,
    School: schoolOne,
  }
  district66 := SchoolsByYear{
    Year: "2012-2013",
    Schools: []SchoolYear{
      schoolYearOne,
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


  edisonElementary := SchoolWithEnrollment{
    School: schoolOne,
    EnrollmentByYear: []EnrollmentByYear{
      EnrollmentByYear{
        Year: "2012-2013",
        Teachers: 55,
        Students: 3000,
        GradeEnrollment: []GradeEnrollment{
          GradeEnrollment{
            Grade: "6th",
            Enrollment: 544,
          },
          GradeEnrollment{
            Grade: "5th",
            Enrollment: 544,
          },
          GradeEnrollment{
            Grade: "4th",
            Enrollment: 544,
          },
          GradeEnrollment{
            Grade: "3th",
            Enrollment: 544,
          },
        },
      },
      EnrollmentByYear{
        Year: "2011-2012",
        Teachers: 55,
        Students: 3000,
        GradeEnrollment: []GradeEnrollment{
          GradeEnrollment{
            Grade: "6th",
            Enrollment: 544,
          },
          GradeEnrollment{
            Grade: "5th",
            Enrollment: 544,
          },
          GradeEnrollment{
            Grade: "4th",
            Enrollment: 544,
          },
          GradeEnrollment{
            Grade: "3th",
            Enrollment: 544,
          },
        },
      },
    },
  }

  //Routes
  m.Get("/schools", func(res http.ResponseWriter) string {
    return render(res, schools)
  })

  m.Get("/districts", func(res http.ResponseWriter) string {
    return render(res, allDistricts)
  })

  m.Get("/district/:id", func(res http.ResponseWriter) string {
    return render(res, district66)
  })

  m.Get("/school/:id", func(res http.ResponseWriter, params martini.Params) string {
    return render(res, edisonElementary)
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
  res.Header().Set("Access-Control-Allow-Origin", "*")
  return string(data[:])
}

//Structs
type School struct {
  Id          int64
  Name        string `sql:"size:255"`
  CountyId    int64
  DistrictId  int64
  Latitude    float64
  Longitude   float64
}

type SchoolsByYear struct {
  Year        string
  Schools     []SchoolYear
}

type SchoolYear struct {
  EnrollmentSize  int64
  School          School
}

type District struct {
  Id              int64
  Name            string
  Latitude        float64
  Longitude       float64
}

type SchoolWithEnrollment struct {
  School            School
  EnrollmentByYear  []EnrollmentByYear
}

type EnrollmentByYear struct {
  Year          string
  Teachers      int64
  Students      int64
  GradeEnrollment []GradeEnrollment
}

type GradeEnrollment struct {
  Grade         string
  Enrollment    int64
}

type DistrictsByYear struct {
  Year      string
  Districts []DistrictYear
}

type DistrictYear struct {
  EnrollmentSize  int64
  District        District
}
