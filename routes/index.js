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
	var pointsToSearch = req.body;
	var searchesCompleted = 0;
	console.log(pointsToSearch.length + "  places to search");
	var places = [];
  	for(i = 0; i < pointsToSearch.length; i++) {
  		var point = pointsToSearch[i];
		var params = { ll: point.A + "," + point.F, limit: 10, radius: 1000*offRoadDistanceKm, sortByDistance: 0 };
		console.log("Searching " + params.ll);
  		foursquare.exploreVenues(params, function(error, result) {
		    if (!error) {

		    	var recommended = _.find(result.response.groups, function(g) {
		    		return g.name == 'recommended';
		    	});

		    	_.each(recommended.items, function(v) {
		    		v = v.venue
		    		if(v.location.lat != undefined && v.location.lng != undefined) {
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
			    searchesCompleted++;
			    console.log(searchesCompleted);
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
