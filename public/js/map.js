var timeline = [];

$.getJSON("http://localhost:3000/districts", function(data) {
  timeline = data;
});

MQA.EventUtil.observe(window, 'load', function() {

  /*Create an object for options*/
  var options={
    elt:document.getElementById('map'),
    zoom:10,
    latLng:{lat:41.25, lng:-96},
    mtype:'map',
    bestFitMargin:0,
    zoomOnDoubleClick:false
  };

  /*Construct an instance of MQA.TileMap with the options object*/
  window.map = new MQA.TileMap(options);

// MQA.EventManager.addListener(map, 'shapecollectionadded', loadData);
//  MQA.EventManager.addListener(map, 'movestart', loadData);
//  MQA.EventManager.addListener(map, 'move', loadData);
//  MQA.EventManager.addListener(map, 'moveend', loadData);
//  MQA.EventManager.addListener(map, 'dragstart', loadData);
//  MQA.EventManager.addListener(map, 'drag', loadData);
//  MQA.EventManager.addListener(map, 'dragend', loadData);
//  MQA.EventManager.addListener(map, 'zoomstart', loadData);
//  loadDataMQA.EventManager.addListener(map, 'zoomend', loadData);
  var schoolsShapeCollection = new MQA.ShapeCollection();
	var createShapeCollection = function(){
    map.addControl(
      new MQA.SmallZoom(),
      new MQA.MapCornerPlacement(MQA.MapCorner.TOP_LEFT, new MQA.Size(5,5))
    );

    var disctricts = new MQA.ShapeCollection();
    disctricts.collectionName = 'nebraska_disctricts';
    disctricts.maxZoomLevel = 7;

    for(i=0; i < timeline.length; i++){
      var disctrictCircle = new MQA.CircleOverlay();

      var district = timeline[i]['Districts'][0];
      var districtSize = timeline[i]['Districts'][0]['EnrollmentSize'] * 0.05;
      var districtID = timeline[i]['Districts'][0]['District']['Id'];
      var latLong = timeline[i]['Districts'][0]['District']['Latitude'] + ', ' + timeline[i]['Districts'][0]['District']['Longitude'];

      disctrictCircle.radiusUnit = 'MI';
      disctrictCircle.radius = districtSize;
      disctrictCircle.shapePoints = [timeline[i]['Districts'][0]['District']['Latitude'], timeline[i]['Districts'][0]['District']['Longitude']];
      disctrictCircle.colorAlpha = 0.5;
      disctrictCircle.borderWidth = 0;
      disctrictCircle.fillColor = '#05c0e2';
      disctrictCircle.fillColorAlpha = 0.4;
      disctrictCircle.district_id = districtID;

      MQA.EventManager.addListener(disctrictCircle, 'dblclick', getDistrict);

      disctricts.add(disctrictCircle);
    }

    map.addShapeCollection(disctricts);



    map.bestFit();
	}	
  MQA.withModule('smallzoom','shapes', function() {
		createShapeCollection();
  });
	/**
	when double clicked, this should get all the schools for district to be inserted in the shape Collection and 
	**/
	
  function getDistrict(evt){
    var district_url = "http://15.126.247.23:3000/district/" + this.district_id;
    $.getJSON(district_url, function(data) {
      console.log(data);
			//schoolsShapeCollection
			//$scope.addEnrollmentChart
    });
  }
});
