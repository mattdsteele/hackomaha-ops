package main

import (
  "github.com/codegangsta/martini"
  "encoding/json"
  "net/http"
  "os"
  "strconv"
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

  //Cached data
  var allSchools = []School{}
  db.Order("Name").Find(&allSchools)

  allDistricts := []District{}
  db.Order("Name").Find(&allDistricts)

  //These are all the years of active school data. We could also derive it from the DB, possibly
  years := []string{"20022003", "20032004", "20042005", "20052006", "20062007", "20072008", "20082009", "20092010", "20102011", "20112012", "20122013"}

  m.Get("/schools", func(res http.ResponseWriter) string {
    return render(res, allSchools)
  })
  m.Get("/districts", func(res http.ResponseWriter) string {
    compiledDistricts := []District{}
    for _, district := range allDistricts {

      schools := []School{}
      for _, school := range allSchools {
        if school.DistrictId == district.Id {
          schools = append(schools, school)
        }
      }

      copiedDistrict := District{
        Id:  district.Id,
        Name: district.Name,
        CountyId: district.CountyId,
        Schools: schools,
      }
      compiledDistricts = append(compiledDistricts, copiedDistrict)
    }

    return render(res, compiledDistricts)
  })

  //TODO need to also return stats by year -- needs to return []DistrictsByYear - district level stats for each year and each district
  m.Get("/old/districts", func(res http.ResponseWriter) string {
    allDistricts := []District{}
    db.Find(&allDistricts)

    districtsByYear := []DistrictsByYear{}
    for _, year := range years {
      districtByYear := DistrictsByYear{
        Year: year,
      }

      allDistrictsWithYears := []DistrictYear{}
      for _, district := range allDistricts {

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
  
  type YearAndSchool struct {
  	SchoolId	int64
  	Years 		string
  }

  //TODO need to also return stats by year for each school in the district
  m.Get("/district/:id", func(res http.ResponseWriter, params martini.Params) string {
    districtId := params["id"]

    district := District{}
    db.Where("id = ?", districtId).First(&district);

    var districtStats = []DistrictClassStats{}
    db.Where("district_id = ?", districtId).Find(&districtStats)

    yearsToEnrollments := map[string][]GradeEnrollment{}
    for _, row := range districtStats {
      if row.EnrollmentSize > 0 {
        yearsToEnrollments[row.Years] = append(yearsToEnrollments[row.Years], GradeEnrollment{
          Grade: row.Grade,
          EnrollmentSize: row.EnrollmentSize,
        })
      }
    }

    //FIXME hardcoded teacher value
    teacherSize := 55
    enrollmentsByYear := []EnrollmentByYear{}
    for _, year := range years {
      enrollment := yearsToEnrollments[year]
      var classSize int64 = 0
      for _, i := range enrollment { classSize += i.EnrollmentSize }

      enrollmentsByYear = append(enrollmentsByYear, EnrollmentByYear{
        Year: year,
        GradeEnrollment: enrollment,
        Students : classSize,
        Teachers: int64(teacherSize),
      })
    }


    return render(res, DistrictWithYears{
      District: district,
      EnrollmentsByYear: enrollmentsByYear,
    })
  })

  //This is the original district/:id. We probably can delete it.
  m.Get("/old/district/:id", func(res http.ResponseWriter, params martini.Params) string {

    schoolsByYear := []SchoolsByYear{}

    schoolsInDistrict := []School{}
    db.Where("district_id = ?", params["id"]).Find(&schoolsInDistrict)

    var schoolStats = []SchoolStat{}  
    db.Where("school_id LIKE ?", params["id"] + "%").Find(&schoolStats)

    schoolAndYearToStats := map[YearAndSchool]SchoolStat{}
    for _, schoolStat := range schoolStats {
      schoolAndYearToStats[YearAndSchool{
        SchoolId: schoolStat.SchoolId,
        Years: schoolStat.Years,
      }] = schoolStat
    }

    //TODO Use years from db? - if so make sure they're in the right order
    for _, year := range years {

      schoolsInYear := []SchoolYear{}
      for _, school := range schoolsInDistrict {
        var enrollment = schoolAndYearToStats[YearAndSchool{
          SchoolId: school.Id,
          Years: year,
        }].EnrollmentSize
        if enrollment > 0 {
          schoolsInYear = append(schoolsInYear, SchoolYear {
            EnrollmentSize: enrollment,
            School: school,
          })
        }
      }

      schoolsByYear = append(schoolsByYear, SchoolsByYear{
        Year: year,
        Schools: schoolsInYear,
      })
    }

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
    //Using hard coded years to make sure they're returned in order:
    for _, year := range years {

      enrollment := yearsToEnrollments[year]	

      //calculate Students field
      //Could pull from SchoolStat, but will want to change
      //query above and deal properly with teacher_size being null
      var classSize int64 = 0
      for _, i := range enrollment { classSize += i.EnrollmentSize }

	  teachersAsFloat, _ := strconv.ParseFloat(yearsToTotalStats[year].TeacherSize, 64)
      enrollmentData = append(enrollmentData, EnrollmentByYear{
        Year: year,
        GradeEnrollment: enrollment,
        Students: classSize,
        Teachers: int64(teachersAsFloat),
      })
    }

    //put it all together
    var allData = SchoolWithEnrollment {
      School: school,
      EnrollmentByYear: enrollmentData,
    }

    return render(res, allData)
  })

  m.Run();
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
