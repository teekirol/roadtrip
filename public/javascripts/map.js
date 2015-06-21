var rendererOptions = {
  draggable: true
};
var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);;
var directionsService = new google.maps.DirectionsService();
var map;
var markers = [];
var highlightIcon = { url:"http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=|ff0000"};

var sf = new google.maps.LatLng(37.7833, -122.4167);

var pointIntervalKm = 10;

function initialize() {

  var mapOptions = {
    zoom: 1,
    center: sf
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directionsPanel'));

}

function clearResults() {
  for(i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  };
  markers = [];
   // Clear results table
  $("#venues").html("");
}

function drawPlaces(response) {
  
  clearResults();

  // Extract the set of points from which we will search Yelp
  console.log(response);
  var path = response.routes[0].overview_path;
  var searchedPath = [];
  var currentPoint = path[0];
  for(i = 1; i < path.length; i++) {
    if(getDistanceFromLatLonInKm(currentPoint.A, currentPoint.F, path[i].A, path[i].F) > pointIntervalKm) {
      currentPoint = path[i];
      searchedPath.push(currentPoint);
    }
  }

  console.log(searchedPath);

  $.ajax({
    url: "/poi", 
    type: "POST",
    data: JSON.stringify(searchedPath), 
    contentType: 'application/json',
    dataType: "json",
    success: function(data) {
      for(i = 0; i < data.length; i++) {
        
        var venue = data[i];

        $("#venues").append("<tr id='" + venue.id + "'>" + 
          "<td><a href='http://foursquare.com/v/" + venue.id + "'> " + venue.title + "</a></td>" +
          "<td>" + venue.categories.join(",") + "</td>" +
          "</tr>");

        var m = new google.maps.Marker({
          title: venue.title,
          map: map,
          position:  new google.maps.LatLng(venue.location.lat, venue.location.lng)
        });

        markers.push(m);
      }
    },
    error: function(data, status, e) {
      alert(status);
    }
  });
}

function calcRoute(origin, dest, waypoint) {

  clearResults();

  if(waypoint != "") {
    waypoint = [{location: waypoint, stopover: true }];
  } else {
    waypoint = [];
  }

  var request = {
    origin: origin,
    destination: dest,
    travelMode: google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: true,
    waypoints: waypoint
  };

  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    } else {
      alert(status);
    }
  });
}

google.maps.event.addDomListener(window, 'load', initialize);

// http://stackoverflow.com/a/27943
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

$(function() {

    $('#submit').click(function() {
      calcRoute($('#origin').val(), $('#dest').val(), $("#waypoint").val());
    });

    $("#search").click(function() {
      drawPlaces(directionsDisplay.getDirections());
    });
});