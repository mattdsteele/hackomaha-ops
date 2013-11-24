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

  MQA.withModule('smallzoom','shapes', function() {

    map.addControl(
      new MQA.SmallZoom(),
      new MQA.MapCornerPlacement(MQA.MapCorner.TOP_LEFT, new MQA.Size(5,5))
    );

    var schools = new MQA.ShapeCollection();
    schools.collectionName = 'nebraska_schools';
    schools.maxZoomLevel = 7;

    for(i=0; i < timeline.length; i++){
      var school = new MQA.CircleOverlay();

      var district = timeline[i]['Districts'][0];
      var districtSize = timeline[i]['Districts'][0]['EnrollmentSize'] * 0.05;
      var districtID = timeline[i]['Districts'][0]['District']['Id'];
      var latLong = timeline[i]['Districts'][0]['District']['Latitude'] + ', ' + timeline[i]['Districts'][0]['District']['Longitude'];

      school.radiusUnit = 'MI';
      school.radius = districtSize;
      school.shapePoints = [timeline[i]['Districts'][0]['District']['Latitude'], timeline[i]['Districts'][0]['District']['Longitude']];
      school.colorAlpha = 0.5;
      school.borderWidth = 0;
      school.fillColor = '#05c0e2';
      school.fillColorAlpha = 0.4;
      school.district_id = districtID;

      MQA.EventManager.addListener(school, 'dblclick', getDistrict);

      schools.add(school);
    }

    map.addShapeCollection(schools);



    map.bestFit();

    function getDistrict(evt){
      var district_url = "http://15.126.247.23:3000/district/" + this.district_id;
      $.getJSON(district_url, function(data) {
        console.log(data);
      });
    }

  });
});
