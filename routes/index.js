var express = require('express');
var router = express.Router();
var _ = require('underscore');
var config = require('../config');

var clientKey = config.foursquareClientKey;
var clientSecret = config.foursquareClientSecret;

var foursquare = (require('foursquarevenues'))(clientKey, clientSecret);

var offRoadDistanceKm = 5;

/* GET home page. */
router.get('/', function(req, res, next) {
  	res.render('index', { title: 'Roadtrip' });
});

router.post('/poi', function(req, res) {
	var pointsToSearch = req.body.splice(0,4);
	var searchesCompleted = 0;
	console.log(pointsToSearch.length + "  places to search");
	var places = [];
  	for(i = 0; i < pointsToSearch.length; i++) {
  		var point = pointsToSearch[i];
		var params = { ll: point.A + "," + point.F, limit: 10, intent: "checkin" };
		console.log("Searching " + params.ll);
  		foursquare.getVenues(params, function(error, result) {
		    if (!error) {
		    	_.each(result.response.venues, function(v) {
		    		if(v.location.lat != undefined && v.location.lng != undefined) {
		    			console.log(v);
				    	places.push({
				    		title: v.name,
				    		location: {
				    			lat: v.location.lat,
				    			lng: v.location.lng
				    		},
				    		id: v.id,
				    		categories: _.map(v.categories, "name")
				    	});
				    }
			    });
			    console.log(JSON.stringify(places));
			    searchesCompleted++;
			    console.log(searchesCompleted + " searches completed");
		    } else {
		    	console.log(" ========== ERROR ");
		    	console.log(error);
		    }
		    if(searchesCompleted == pointsToSearch.length) {
		    	console.log("DONE!");
		    	res.json(places);
		    }
		});
	};
});

module.exports = router;
