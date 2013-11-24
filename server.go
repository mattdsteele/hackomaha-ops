package main

import (
  "github.com/codegangsta/martini"
  "encoding/json"
  "net/http"
  "os"
  "github.com/jinzhu/gorm"
  _ "github.com/go-sql-driver/mysql"
)

func main() {
  m := martini.Classic()

  dbPassword := os.Getenv("OOPS_DB_PASS")
  db, err := gorm.Open("mysql", "oops:" + dbPassword + "@tcp(15.126.247.23:3306)/oops")
  if err != nil { panic(err) }
  //defer db.Close() //TODO what should this be?

  //db.SetPool(10)

  db.LogMode(true)

  m.Map(db)

  m.Get("/schools", func(res http.ResponseWriter) string {
    var allSchools = []School{}
    db.Find(&allSchools)
    return render(res, allSchools)
  })

  //TODO need to also return stats by year -- needs to return []DistrictsByYear - district level stats for each year and each district
  m.Get("/districts", func(res http.ResponseWriter) string {
    var allDistricts = []District{}
    db.Find(&allDistricts)
    return render(res, allDistricts)
  })

  //TODO need to also return stats by year for each school in the district - needs to return SchoolsByYear[] - data for all schools in this district
  m.Get("/district/:id", func(res http.ResponseWriter, params martini.Params) string {
    var testDistrict = District{}
    db.Where("id = ?", params["id"]).First(&testDistrict)
    return render(res, testDistrict)

  })

  //TODO Possible clean-up opportunities here
  //TODO Still need total teacher count per year
  m.Get("/school/:id", func(res http.ResponseWriter, params martini.Params) string {
    var school = School{
      //FIXME hardcoded data
      Latitude : 41.31027811,
      Longitude : -96.146874,
    }
    db.Where("id = ?",params["id"]).First(&school)
    var classStats = []ClassStat{}
    db.Where("school_id = ?", params["id"]).Find(&classStats)

    var yearsToEnrollments = map[string][]GradeEnrollment{}
    for _, row := range classStats {
      if row.EnrollmentSize > 0 {
        yearsToEnrollments[row.Years] = append(yearsToEnrollments[row.Years], GradeEnrollment{
          Grade: row.Grade,
          EnrollmentSize:    row.EnrollmentSize,
        })
      }
    }

    var enrollmentData = []EnrollmentByYear{}
    for year, enrollment := range yearsToEnrollments{

      //calculate Students field
      var classSize int64 = 0
      for _, i := range enrollment { classSize += i.EnrollmentSize }

      enrollmentData = append(enrollmentData, EnrollmentByYear{
        Year: year,
        GradeEnrollment: enrollment,
        Students: classSize,

        //FIXME hardcoded data
        Teachers: 50,
      })
    }

    //put it all together
    var allData = SchoolWithEnrollment {
      School: school,
      EnrollmentByYear: enrollmentData,
    }

    return render(res, allData)
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

