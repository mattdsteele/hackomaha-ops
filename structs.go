package main

type School struct {
  Id          int64
  Name        string `sql:"size:255"`
  CountyId    int64
  DistrictId  int64
  Lat    	  float64
  Lon   	  float64
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
  CountyId        int64
  Schools         []School
  Lat        	  float64
  Lon       	  float64
}

type SchoolWithEnrollment struct {
  School            School
  EnrollmentByYear  []EnrollmentByYear
}

//Class_Stats table
//id, schoolId, years, grade, maleStudents, femaleStudents, EnrollmentSize
type ClassStat struct {
        Id                        int64
        SchoolId        int64
        Years                string
        Grade                string
        MaleStudents        int64
        FemaleStudents        int64
        EnrollmentSize        int64
}

type DistrictClassStats struct {
        Id                        int64
        DistrictId        int64
        Years                string
        Grade                string
        MaleStudents          int64
        FemaleStudents        int64
        EnrollmentSize        int64
        TeacherSize           int64
}

//School_Stats table - already exists with this plus more
type SchoolStat struct {
        SchoolId                int64
        Years                        string
        EnrollmentSize        int64
        TeacherSize                string
}

type DistrictWithYears struct {
  District          District
  EnrollmentsByYear []EnrollmentByYear
}

type EnrollmentByYear struct {
  Year          string
  Teachers      int64
  Students      int64
  GradeEnrollment []GradeEnrollment
}

type GradeEnrollment struct {
  Grade             string
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
