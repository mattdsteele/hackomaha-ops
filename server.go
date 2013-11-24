package main

import (
  //"database/sql"
  //_ "github.com/go-sql-driver/mysql"
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
//TODO Still need total teacher and student count per year - student count could be calculated from grade counts
  m.Get("/school/:id", func(res http.ResponseWriter, params martini.Params) string {
    var testSchool = School{}
  	db.Where("id = ?",params["id"]).First(&testSchool)
  	var testStats = []ClassStat{}
  	db.Where("school_id = ?", params["id"]).Find(&testStats)
  	
    var yearsToEnrollments = map[string][]GradeEnrollment{}
  	for _, row := range testStats {
  		yearsToEnrollments[row.Years] = append(yearsToEnrollments[row.Years], GradeEnrollment{
  			Grade: row.Grade,
  			EnrollmentSize:    row.EnrollmentSize,
  		})
  	}
  	
  	var enrollmentData = []EnrollmentByYear{}
  	for year, enrollment := range yearsToEnrollments{
  		enrollmentData = append(enrollmentData, EnrollmentByYear{
  			Year: year,
  			GradeEnrollment: enrollment,
  		})
  	}
  	
  	var allData = SchoolWithEnrollment {
  		School: testSchool,
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

//Structs
type School struct {
  Id    	  int64
  Name        string `sql:"size:255"`
  CountyId    int64
  DistrictId  int64
  //Latitude    float64
  //Longitude   float64
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
  CountyId		  int64
  //Latitude        float64
  //Longitude       float64
}

type SchoolWithEnrollment struct {
  School            School
  EnrollmentByYear  []EnrollmentByYear
}

//Class_Stats table
//id, schoolId, years, grade, maleStudents, femaleStudents, EnrollmentSize

type ClassStat struct {
	Id			int64
	SchoolId	int64
	Years		string
	Grade		string
	MaleStudents	int64
	FemaleStudents	int64
	EnrollmentSize	int64
}

type EnrollmentByYear struct { //EnrollmentByYear
  Year          string
  Teachers      int64
  Students      int64
  GradeEnrollment []GradeEnrollment
}

type GradeEnrollment struct {
  Grade         	string
  EnrollmentSize    int64
}

type DistrictsByYear struct {
  Year      string
  Districts []DistrictYear
}

type DistrictYear struct {
  EnrollmentSize  int64
  District        District
}
