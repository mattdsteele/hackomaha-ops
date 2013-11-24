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

  //These are all the years of active school data. We could also derive it from the DB, possibly
  years := []string{"20022003", "20032004", "20042005", "20052006", "20062007", "20072008", "20082009", "20092010", "20102011", "20112012", "20122013"}

  m.Get("/schools", func(res http.ResponseWriter) string {
    var allSchools = []School{}
    db.Find(&allSchools)
    return render(res, allSchools)
  })

  //TODO need to also return stats by year -- needs to return []DistrictsByYear - district level stats for each year and each district
  m.Get("/districts", func(res http.ResponseWriter) string {
    allDistricts := []District{}
    db.Find(&allDistricts)

    districtsByYear := []DistrictsByYear{}
    for _, year := range years {
      districtByYear := DistrictsByYear{
        Year: year,
      }

      allDistrictsWithYears := []DistrictYear{}
      for _, district := range allDistricts {

        //FIXME hardcoded
        district.Latitude = 41.31027811
        district.Longitude = -96.146874

        districtWithYear := DistrictYear {
          EnrollmentSize: 2555,
          District: district,
        }
        allDistrictsWithYears = append(allDistrictsWithYears, districtWithYear)
      }

      districtByYear.Districts = allDistrictsWithYears
      districtsByYear = append(districtsByYear, districtByYear)
    }

    return render(res, districtsByYear)
  })

  //TODO need to also return stats by year for each school in the district
  m.Get("/district/:id", func(res http.ResponseWriter, params martini.Params) string {
    schoolsByYear := []SchoolsByYear{}

    schoolsInDistrict := []School{}
    db.Where("district_id = ?", params["id"]).Find(&schoolsInDistrict)
    
    //db.Where("school_id = ? and years = ?", schoolId, year).Select("teacher_size").First(&teacherAmount)

    for _, year := range years {

      //calculate school enrollment & append it
      schoolsInYear := []SchoolYear{}
      for _, school := range schoolsInDistrict {
        schoolsInYear = append(schoolsInYear, SchoolYear {
          //FIXME hardcoded
          EnrollmentSize: 552,
          School: school,
        })
      }

      schoolsByYear = append(schoolsByYear, SchoolsByYear{
        Year: year,
        Schools: schoolsInYear,
      })
    }

    var testDistrict = District{}
    db.Where("id = ?", params["id"]).First(&testDistrict)
    return render(res, schoolsByYear)

  })

  //TODO Possible clean-up opportunities here, but it's looking pretty decent
  m.Get("/school/:id", func(res http.ResponseWriter, params martini.Params) string {
    var school = School{
      //FIXME hardcoded data
      Latitude : 41.31027811,
      Longitude : -96.146874,
    }
    schoolId := params["id"]
    db.Where("id = ?", schoolId).First(&school)
    
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
    
    var schoolStats = []SchoolStat{}
    db.Where("school_id = ? and teacher_size is not null", params["id"]).Find(&schoolStats)
    
    var yearsToTotalStats = map[string]SchoolStat{}
    for _, row := range schoolStats {
    	yearsToTotalStats[row.Years] = row
    }

    var enrollmentData = []EnrollmentByYear{}
    for year, enrollment := range yearsToEnrollments{

      //calculate Students field
      //Could pull from SchoolStat, but will want to change
      //query above and deal properly with teacher_size being null
      var classSize int64 = 0
      for _, i := range enrollment { classSize += i.EnrollmentSize }

      enrollmentData = append(enrollmentData, EnrollmentByYear{
        Year: year,
        GradeEnrollment: enrollment,
        Students: classSize,
        Teachers: int64(yearsToTotalStats[year].TeacherSize),
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
