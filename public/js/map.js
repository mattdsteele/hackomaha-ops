var api_url = "/";

var OPS = {
  curData: [],

  init: function(){

    $.getJSON(api_url + "districts", function(json) {
      OPS.curData = json;
      maps.init();
    });


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
    // var newDataURL = api_url + type + id;

    // console.log(newDataURL);

      switch(type){
        case 'districts':
          maps.addDistrictCollection(OPS.curData, 0);
          // console.log('districts loading...');
          break;
        case 'schools':
          maps.addSchoolsCollection(OPS.curData);
          break;
      }


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

  addSchoolsCollection: function(data, year){
    var collection = new MQA.ShapeCollection();
    collection.maxZoomLevel = 7;

    var s = data[year]['Schools'];

    for(i=0; i < s.length; i++){
      var mapCircle = new MQA.CircleOverlay();

      var school = s[i];
      var schoolSize = school['EnrollmentSize'] * 0.05;
      var schoolID = school['School']['Id'];

      mapCircle.radiusUnit = 'MI';
      mapCircle.radius = schoolSize;
      mapCircle.shapePoints = [school['School']['Latitude'], school['School']['Longitude']];
      mapCircle.colorAlpha = 0.5;
      mapCircle.borderWidth = 0;
      mapCircle.fillColor = '#05c0e2';
      mapCircle.fillColorAlpha = 0.05;
      mapCircle.school_id = schoolID;

      MQA.EventManager.addListener(mapCircle, 'click', showGraphs);

      collection.add(mapCircle);
    }

    map.addShapeCollection(collection);
    map.bestFit();

  }

};




function loadCollection(evt){
  var district_url = api_url + 'district/' + this.district_id;

  // console.log(this.district_id);

  $.getJSON(district_url, function(json) {
    OPS.curData = json;
    // console.log(OPS.curData);
    map.removeAllShapes();
    maps.addSchoolsCollection(OPS.curData, 0);
  });
}

function showGraphs(evt){
  console.log(this.school_id);
}

(function($){

  OPS.init();

})(jQuery);
