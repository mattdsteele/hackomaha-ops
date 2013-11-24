var opsAppModule = angular.module('opsApp',[]);

opsAppModule.factory('OpsApi', function ($http) {
    var api = {};
		//munge the data to show school name and value
    api.getSchools = function () {
        return $http.get("/schools" , {cache: true})
    };
    api.getSchool = function (schoolId) {
        return $http.get("/school/" + schoolId , {cache: true})
    };
    api.getCounties = function () {
        return $http.get("/schools" )
    };
    api.getDistricts = function () {
        return $http.get("/districts")
    };
    api.getDistrict = function (districtID) {
        return $http.get("/district/" + districtID )
    };
    return api;
});

opsAppModule.controller('OpsCtrl', function ($scope, OpsApi) {
	//labels will be school name
	$scope.historicalBarChart = [];
	$scope.addBarChart= function(){
		nv.addGraph(function() {  
			
		  var chart = nv.models.discreteBarChart()
		      .x(function(d) { return d.label })
		      .y(function(d) { return d.value })
		      .staggerLabels(true)
		      //.staggerLabels(historicalBarChart[0].values.length > 8)
		      .tooltips(false)
		      .showValues(true)
		      .transitionDuration(250);
					chart.xAxis
							.axisLabel("Schools");
					chart.yAxis
							.axisLabel("# of Students")
							
			chart.margin({left: 100,bottom: 100}) //hack https://github.com/novus/nvd3/issues/17

		  d3.select('#barchart svg')
		      .datum($scope.historicalBarChart)
		      .call(chart);
		  nv.utils.windowResize(chart.update);
		  return chart;
		});
	}
	//data should be an array of points.. this should be fixed
	$scope.addEnrollmentChart = function(data){
//		var data = [4, 8, 15, 16, 23, 42];

		var width = 420, barHeight = 20;

		var x = d3.scale.linear()
		    .domain([0, d3.max(data)])
		    .range([0, width]);

		var chart = d3.select(".gradelevelChart")
		    .attr("width", width)
		    .attr("height", barHeight * data.length);

		var bar = chart.selectAll("g")
		    .data(data)
			  .enter().append("g")
		    .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

		bar.append("rect")
		    .attr("width", x)
		    .attr("height", barHeight - 1);

		bar.append("text")
		    .attr("x", function(d) { return x(d) - 3; })
		    .attr("y", barHeight / 2)
		    .attr("dy", ".35em")
		    .text(function(d) { return d; });				
	}
	
	

	
  $scope.drawEnrollmentChart = function(){
		OpsApi.getSchool($scope.schoolId).success(function(data){
			$scope.schoolEnrollment = [];
			for(var i = 0; i < data["EnrollmentByYear"].length; i++){
				for(var j = 0; j < data["EnrollmentByYear"][i]["GradeEnrollment"].length; j++){
				 $scope.schoolEnrollment.push(data["EnrollmentByYear"][i]["GradeEnrollment"][j]['Enrollment'])
				}
			}
			$scope.addEnrollmentChart($scope.schoolEnrollment);
		});
	}
	
	
  $scope.schoolId = 2;
  OpsApi.getSchool($scope.schoolId).success(function (data) {
		$scope.historicalBarChart = [{key: "Cumulative Return", values:[]}]

		for(var i = 0; i < data["EnrollmentByYear"].length; i++){
			for(var j = 0; j < data["EnrollmentByYear"][i]['GradeEnrollment'].length; j++){
				console.log(data["EnrollmentByYear"][i]['GradeEnrollment'][j]['Enrollment'])
				$scope.historicalBarChart[0]['values'].push(
				{
				label:data.School['Name']+' yr'+(i+1),
				value:data["EnrollmentByYear"][i]['GradeEnrollment'][j]['Enrollment']
			});
			}
		}
		 	$scope.addBarChart();
     });
	
});
