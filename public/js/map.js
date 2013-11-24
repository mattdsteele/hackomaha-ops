var api_url = "/";

var OPS = {
  curData: [],

  init: function(){

    // $.getJSON("http://15.126.247.23:3000/districts", function(json) {
    //   OPS.data = json;
    // });
    maps.init();
  }

};

var maps = {

  init: function(){
    console.log('init');
    MQA.EventUtil.observe(window, 'load', function() {
      var options={
        elt:document.getElementById('map'),
        zoom:10,
        latLng:{lat:41.25, lng:-96},
        mtype:'map',
        bestFitMargin:0,
        zoomOnDoubleClick:true
      };

      window.map = new MQA.TileMap(options);

      MQA.withModule('smallzoom','shapes', function() {

        map.addControl(
          new MQA.SmallZoom(),
          new MQA.MapCornerPlacement(MQA.MapCorner.TOP_LEFT, new MQA.Size(5,5))
        );

        maps.loadCollectionData('districts','');



      });
    });
  },

  loadCollectionData: function(type, id){
    var newDataURL = api_url + type + id;

    // console.log(newDataURL);

    $.getJSON(newDataURL, function(json) {
      OPS.curData = json;
      switch(type){
        case 'districts':
          maps.addDistrictCollection(OPS.curData, 0);
          // console.log('districts loading...');
          break;
        case 'schools':
          maps.addSchoolsCollection(OPS.curData);
          break;
      }
    });


  },

  addDistrictCollection: function(data, year){
    var collection = new MQA.ShapeCollection();
    collection.maxZoomLevel = 7;
    var d = data[year]['Districts'];

    // console.log(d);
    for(i=0; i < d.length; i++){
      var mapCircle = new MQA.CircleOverlay();

      var district = d[i];
      var districtSize = district['EnrollmentSize'] * 0.05;
      var districtID = district['District']['Id'];

      console.log(district['District']['Longitude']);

      mapCircle.radiusUnit = 'MI';
      mapCircle.radius = districtSize;
      mapCircle.shapePoints = [district['District']['Latitude'], district['District']['Longitude']];
      mapCircle.colorAlpha = 0.5;
      mapCircle.borderWidth = 0;
      mapCircle.fillColor = '#05c0e2';
      mapCircle.fillColorAlpha = 0.05;
      mapCircle.district_id = districtID;

      MQA.EventManager.addListener(mapCircle, 'click', loadCollection);

      collection.add(mapCircle);
    }

    map.addShapeCollection(collection);
    map.bestFit();

  },

  addSchoolsCollection: function(data){
    var collection = new MQA.ShapeCollection();
    collection.maxZoomLevel = 7;

    for(i=0; i < data.length; i++){
      var mapCircle = new MQA.CircleOverlay();

      var district = data[i]['Districts'][i];
      var districtSize = data[i]['Districts'][i]['EnrollmentSize'] * 0.05;
      var districtID = data[i]['Districts'][i]['District']['Id'];
      var latLong = data[i]['Districts'][i]['District']['Latitude'] + ', ' + data[i]['Districts'][i]['District']['Longitude'];

      mapCircle.radiusUnit = 'MI';
      mapCircle.radius = districtSize;
      mapCircle.shapePoints = [data[i]['Districts'][i]['District']['Latitude'], data[i]['Districts'][i]['District']['Longitude']];
      mapCircle.colorAlpha = 0.5;
      mapCircle.borderWidth = 0;
      mapCircle.fillColor = '#05c0e2';
      mapCircle.fillColorAlpha = 0.4;
      mapCircle.district_id = districtID;

      MQA.EventManager.addListener(mapCircle, 'click', getDistrict);

      collection.add(mapCircle);
    }

    map.addShapeCollection(collection);
    map.bestFit();

  }

};




function loadCollection(evt){
  var district_url = "http://15.126.247.23:3000/district/" + this.district_id;
  $.getJSON(district_url, function(data) {
    console.log(data);
  });
}
(function($){

  OPS.init();

})(jQuery);
