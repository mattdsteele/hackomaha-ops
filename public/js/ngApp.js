var opsAppModule = angular.module('opsApp',[]);

opsAppModule.factory('OpsApi', function ($http) {
    var api = {};
		//munge the data to show school name and value
    api.getSchools = function () {
        return $http.get("/schools" , {cache: true})
    };
    api.getSchool = function (schoolId) {
			console.log('school id is '+ schoolId)
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
  var btnYear = $('.navbar-nav button');

  $(btnYear).on('click', function(evt){
    // console.log(evt.target);
    // console.log(evt.target.dataset.year);
    // console.log(maps, OPS);

    OPS.curYear = evt.target.dataset.year;
    if(OPS.curYear > 0){
      OPS.curYear = OPS.curYear -1;
    }
    maps.loadCollectionData(OPS.curType, OPS.curYear);
  });
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

	 	$scope.yearAry=['2002/2003','2003/2004','2004/2005','2005/2006','2006/2007','2007/2008','2008/2009','2009/2010',
	 	'2010/2011','2011/2012','2012/2013']
  
	 	$scope.schoolId = 280001005; //fixme get rid of this
	 	//this is the one to use for UI
	 		 $scope.drawStackedBar = function(schoolId){
	 			 OpsApi.getSchool($scope.schoolId).success(function (data){
	 				 $scope.createStackedBar($scope.mungeDataForStackedBar(data));
	 			 });
	 		 }
		 
	 	 	$scope.mungeDataForStackedBar =function(data){
	 	 		var yearsData = data['EnrollmentByYear'];
	 	 		var mungedData = [];
	 	 		for(var i=0; i < yearsData.length; i++){
	 	 			var aryItem = {"Year":yearsData[i]['Year']}
	 	 			var gradeEnrollmentAry = yearsData[i]["GradeEnrollment"]
	 	 			for(var j=0 ; j< gradeEnrollmentAry.length; j++){
	 	 				aryItem["Grade " +	gradeEnrollmentAry[j]['Grade']] = gradeEnrollmentAry[j]['EnrollmentSize'];
	 	 			}
	 	 			mungedData.push(aryItem);
	 	 		}
	 	 			return mungedData;
	 	 	}	 
			 
	 		 $scope.createStackedBar = function(data){
	 			 var margin = {top: 20, right: 40, bottom: 30, left: 40},
	 			     width = 760 - margin.left - margin.right,
	 			     height = 500 - margin.top - margin.bottom;

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

	 			 var svg = d3.select("#stackedGradesByYear").append("svg")
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

	 		   x.domain(data.map(function(d) { return d.Year; }));
	 		   y.domain([0, d3.max(data, function(d) { return d.total; })]);

	 		   svg.append("g")
	 		       .attr("class", "x axis")
	 		       .attr("transform", "translate(0," + height + ")")
	 		       .call(xAxis);

	 		   svg.append("g")
	 		       .attr("class", "y axis")
	 		       .call(yAxis)
	 		     .append("text")
	 		       .attr("transform", "rotate(-90)")
	 		       .attr("y", 6)
	 		       .attr("dy", ".71em")
	 		       .style("text-anchor", "end")
	 		       .text("children by grade");

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
	 		       .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

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
		 
	 	$scope.drawStackedBar();
});
