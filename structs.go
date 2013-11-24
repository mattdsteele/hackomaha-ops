package main

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
  Grade           	string
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
