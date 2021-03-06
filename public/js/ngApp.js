var opsAppModule = angular.module('opsApp',[]);

opsAppModule.factory('OpsApi', function ($http) {
    var api = {};
		//munge the data to show school name and value
    api.getSchools = function () {
        return $http.get("/api/schools.json" , {cache: true})
    };
    api.getSchool = function (schoolId) {
        return $http.get("/api/school/" + schoolId + '.json' , {cache: true})
    };
    api.getCounties = function () {
        return $http.get("/api/schools.json" )
    };
    api.getDistricts = function () {
        return $http.get("/api/districts.json")
    };
    api.getDistrict = function (districtID) {
        return $http.get("/api/district/" + districtID + '.json')
    };
    return api;
});

opsAppModule.controller('OpsCtrl', function ($scope, OpsApi) {


  $scope.updateCards = function(){
    OpsApi.getSchool($scope.schoolInView).success(function (data){
      $scope.cardName = data.School.Name;
      var schoolId = data.School.Id;
      var enrollmentLevel = data.EnrollmentByYear[data.EnrollmentByYear.length - 1];
      $scope.totalEnrollment = enrollmentLevel.Students;
      $scope.totalTeachers = enrollmentLevel.Teachers;
      $scope.drawStackedBar(schoolId, "school");
    });
    $scope.totalSchools = "1,367";
    $scope.cardYear = "2012-2013";
  }
  $scope.districtChanged = function() {
    var districtsInSchool = $scope.allDistricts.filter(function(i) {
      return i.Id == $scope.currentDistrict;
    })[0];
    $scope.schoolsForDistrict = districtsInSchool.Schools;
    $scope.drawStackedBar($scope.currentDistrict, "district");
    OpsApi.getDistrict($scope.currentDistrict).success(function(data) {
      $scope.cardName = data.District.Name;
      var enrollmentLevel = data.EnrollmentsByYear[data.EnrollmentsByYear.length - 1];
      $scope.totalEnrollment = enrollmentLevel.Students;
      $scope.totalTeachers = enrollmentLevel.Teachers;
    });
  };

  $scope.updateSchoolCharts = function(){
    if ($scope.schoolInView) {
      $scope.updateCards();
    } else {
      $scope.districtChanged();
    }
  }

	 	$scope.yearAry=['2002/2003','2003/2004','2004/2005','2005/2006','2006/2007','2007/2008','2008/2009','2009/2010',
	 	'2010/2011','2011/2012','2012/2013'];

    $scope.schoolInView = 280001005;
	 	$scope.schoolId = 280001005; //fixme get rid of this
	 	//this is the one to use for UI
    $scope.drawStackedBar = function(id, type){
      if (type == "school") {
        OpsApi.getSchool(id).success(function (data){
          $scope.createStackedBar($scope.mungeDataForStackedBar(data));
        });
      } else {
        OpsApi.getDistrict(id).success(function(data) {
          $scope.createStackedBar($scope.mungeDistrictData(data));
        });
      }
    }
			 /* reference 
			  [{"Year":"1","Grade 09":"591","Grade 10":"485","Grade 11":"453","Grade 12":"430"},
				  {"Year":"1","Grade 09":"591","Grade 10":"485","Grade 11":"453","Grade 12":"430"}
					]
			 */
	 	 	$scope.mungeDataForStackedBar =function(data){
	 	 		var yearsData = data['EnrollmentByYear'];
	 	 		var mungedData = [];
	 	 		for(var i=0; i < yearsData.length; i++){
	 	 			var aryItem = {"Year":yearsData[i]['Year']}
	 	 			var gradeEnrollmentAry = yearsData[i]["GradeEnrollment"]
	 	 			for(var j=0 ; j< gradeEnrollmentAry.length; j++){
	 	 				aryItem["" +	gradeEnrollmentAry[j]['Grade']] = gradeEnrollmentAry[j]['EnrollmentSize'];
	 	 			}
	 	 			mungedData.push(aryItem);
	 	 		}
	 	 			return mungedData;
	 	 	}
      $scope.mungeDistrictData = function(data) {
	 	 		var yearsData = data['EnrollmentsByYear'];
	 	 		var mungedData = [];
	 	 		for(var i=0; i < yearsData.length; i++){
	 	 			var aryItem = {"Year":yearsData[i]['Year']}
	 	 			var gradeEnrollmentAry = yearsData[i]["GradeEnrollment"]
          if (gradeEnrollmentAry) {
            for(var j=0 ; j< gradeEnrollmentAry.length; j++){
              aryItem["" +	gradeEnrollmentAry[j]['Grade']] = gradeEnrollmentAry[j]['EnrollmentSize'];
            }
            mungedData.push(aryItem);
          }
	 	 		}
	 	 			return mungedData;
      };

	 		 $scope.createStackedBar = function(data){
	 			 var margin = {top: 20, right: 40, bottom: 30, left: 40},
	 			     width = 1024 - margin.left - margin.right,
	 			     height = 550 - margin.top - margin.bottom;

	 			 var x = d3.scale.ordinal()
	 			     .rangeRoundBands([0, width], .1);

	 			 var y = d3.scale.linear()
	 			     .rangeRound([height, 0]);

	 			 var color = d3.scale.ordinal()
	 			     .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

	 			 var xAxis = d3.svg.axis()
	 			     .scale(x)
	 			     .orient("bottom");

	 			 var yAxis = d3.svg.axis()
	 			     .scale(y)
	 			     .orient("left")
	 			     .tickFormat(d3.format(".2s"));

	 			 d3.select("#stackedGradesByYear svg").remove();
	 			 var svg = d3.select("#stackedGradesByYear").insert("svg")
	 			     .attr("width", width + margin.left + margin.right)
	 			     .attr("height", height + margin.top + margin.bottom)
	 			   .append("g")
	 			     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	 		   color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Year"; }));

	 		   data.forEach(function(d) {
	 		     var y0 = 0;
	 		     d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
	 		     d.total = d.ages[d.ages.length - 1].y1;
	 		   });

	 		   data.sort(function(a, b) { return a.Year - b.Year ; });

	 		   x.domain(data.map(function(d) { return d.Year.substr(0,4) + "-" + d.Year.substr(4,7); }));
	 		   y.domain([0, d3.max(data, function(d) { return d.total; })]);

	 		   svg.append("g")
	 		       .attr("class", "x axis")
	 		       .attr("transform", "translate(0," + height + ")")
	 		       .call(xAxis);

	 		   svg.append("g")
	 		       .attr("class", "y axis")
	 		       .call(yAxis);

	 		   var state = svg.selectAll(".year")
	 		       .data(data)
	 		     .enter().append("g")
	 		       .attr("class", "g")
	 		       .attr("transform", function(d) { return "translate(" + x(d.Year) + ",0)"; });

	 		   state.selectAll("rect")
	 		       .data(function(d) { return d.ages; })
	 		     .enter().append("rect")
	 		       .attr("width", x.rangeBand())
	 		       .attr("y", function(d) { return y(d.y1); })
	 		       .attr("height", function(d) { return y(d.y0) - y(d.y1); })
	 		       .style("fill", function(d) { return color(d.name); });

	 		   var legend = svg.selectAll(".legend")
	 		       .data(color.domain().slice().reverse())
	 		     .enter().append("g")
	 		       .attr("class", "legend")
	 		       .attr("transform", function(d, i) { return "translate(40," + i * 20 + ")"; });

	 		   legend.append("rect")
	 		       .attr("x", width - 18)
	 		       .attr("width", 18)
	 		       .attr("height", 18)
	 		       .style("fill", color);

	 		   legend.append("text")
	 		       .attr("x", width - 24)
	 		       .attr("y", 9)
	 		       .attr("dy", ".35em")
	 		       .style("text-anchor", "end")
	 		       .text(function(d) { return d; });
	 		 }


	 	$scope.drawStackedBar($scope.schoolId, "school");
		//populate district and school dropdown
		 OpsApi.getDistricts().success(function(data){
       $scope.allDistricts = data;
			 $scope.districtList=[];	
			 $scope.schoolsForDistrict=[];
       var ops;
			 for(var i=0; i < data.length; i++){
         var id = { Name: data[i]['Name'], Id:data[i]['Id']};
         if (data[i].Id == 280001) {
           ops = id;
         }
				 $scope.districtList.push(id);
			 }
		 });
});
