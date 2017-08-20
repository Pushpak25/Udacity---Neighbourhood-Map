var map;
var defaultMarker;
var highlightedMarker;
var initLat = 12.97194;
var initLong = 77.59369;

function mapLoadError() {
    $('#searchSummary').text("Could not load Google Maps");
    $('#list').hide();
}

//Initialize Map
function initMap() {
    var styles = [{
            "elementType": "geometry",
            "stylers": [{
                "color": "#ebe3cd"
            }]
        },
        {
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#523735"
            }]
        },
        {
            "elementType": "labels.text.stroke",
            "stylers": [{
                "color": "#f5f1e6"
            }]
        },
        {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#c9b2a6"
            }]
        },
        {
            "featureType": "administrative.land_parcel",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "administrative.land_parcel",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#dcd2be"
            }]
        },
        {
            "featureType": "administrative.land_parcel",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#ae9e90"
            }]
        },
        {
            "featureType": "administrative.neighborhood",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "landscape.natural",
            "elementType": "geometry",
            "stylers": [{
                "color": "#dfd2ae"
            }]
        },
        {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{
                "color": "#dfd2ae"
            }]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#93817c"
            }]
        },
        {
            "featureType": "poi.business",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#a5b076"
            }]
        },
        {
            "featureType": "poi.park",
            "elementType": "labels.text",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#447530"
            }]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{
                "color": "#f5f1e6"
            }]
        },
        {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "road.arterial",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{
                "color": "#fdfcf8"
            }]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{
                "color": "#f8c967"
            }]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#e9bc62"
            }]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "road.highway.controlled_access",
            "elementType": "geometry",
            "stylers": [{
                "color": "#e98d58"
            }]
        },
        {
            "featureType": "road.highway.controlled_access",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#db8555"
            }]
        },
        {
            "featureType": "road.local",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#806b63"
            }]
        },
        {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [{
                "color": "#dfd2ae"
            }]
        },
        {
            "featureType": "transit.line",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#8f7d77"
            }]
        },
        {
            "featureType": "transit.line",
            "elementType": "labels.text.stroke",
            "stylers": [{
                "color": "#ebe3cd"
            }]
        },
        {
            "featureType": "transit.station",
            "elementType": "geometry",
            "stylers": [{
                "color": "#dfd2ae"
            }]
        },
        {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#b9d3c2"
            }]
        },
        {
            "featureType": "water",
            "elementType": "labels.text",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#92998d"
            }]
        }
    ];
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: initLat, lng: initLong },
        zoom: 13,
        styles: styles,
        mapTypeControl: false
    });
    ko.applyBindings(new AppViewModel());
}

String.prototype.contains = function(other) {
    return this.indexOf(other) !== -1;
};

//Knockout's View Model
var AppViewModel = function() {
    var self = this;

    function initialize() {
        getRestaurants();
    }


    if (typeof google !== 'object' || typeof google.maps !== 'object') {} else {
        defaultMarker = makeMarkerIcon('FF0000');
        highlightedMarker = makeMarkerIcon('FFFF24');
        var infoWindow = new google.maps.InfoWindow();
        google.maps.event.addDomListener(window, 'load', initialize);
    }
    self.restaurantList = ko.observableArray([]);
    self.filterQuery = ko.observable('');
    self.searchResult = ko.observable('');

    self.onSearchClicked = function() {
        return false; //Prevents page reload on btnSubmit click
    };


    //List of restaurant's after filter based on search query
    self.FilteredRestaurantList = ko.computed(function() {
        self.restaurantList().forEach(function(restaurant) {
            restaurant.marker.setMap(null);
        });

        var results = ko.utils.arrayFilter(self.restaurantList(), function(restaurant) {
            return restaurant.name().toLowerCase().contains(self.filterQuery().toLowerCase());
        });

        results.forEach(function(restaurant) {
            restaurant.marker.setMap(map);
        });
        if (results.length > 0) {
            if (results.length == 1) {
                self.searchResult(results.length + " restaurant from Foursquare ");
            } else {
                self.searchResult(results.length + " restaurants from Foursquare ");
            }
        } else {
            self.searchResult("No restaurants Available");
        }
        return results;
    });
    self.searchResult("Loading restaurants, Please wait...");

    //function called when a restaurant is clicked from the filtered list
    self.selectRestaurant = function(restaurant) {
        infoWindow.setContent(restaurant.formatedDataForInfoWindow());
        infoWindow.open(map, restaurant.marker);
        map.panTo(restaurant.marker.position);
        restaurant.marker.setAnimation(google.maps.Animation.BOUNCE);
        restaurant.marker.setIcon(highlightedMarker);
        self.restaurantList().forEach(function(unselected_restaurant) {
            if (restaurant != unselected_restaurant) {
                unselected_restaurant.marker.setAnimation(null);
                unselected_restaurant.marker.setIcon(defaultMarker);
            }
        });
    };

    //Get restaurants in Bengaluru
    function getRestaurants() {
        var data;

        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/explore',
            dataType: 'json',
            data: 'client_id=M1SZDSAG2GXQWNSFDAJKR1UID5AWRBWLMOMTL3H0JH4KXEZJ&client_secret=QOMLC0OL2H4ZNPP0C5X0ZJMG3WBEKG2NDOEG3EC1GKUNP4CZ&v=20170810%20&near=Bangalore, IN&query=restaurant',
            async: true,
        }).done(function(response) {
            if(response.response.groups[0] < 1) $('#searchSummary').text('restaurants could not load...');
            data = response.response.groups[0].items;
            data.forEach(function(restaurant) {
                foursquare = new Foursquare(restaurant.venue, map);
                self.restaurantList.push(foursquare);
            });
            self.restaurantList().forEach(function(restaurant) {
                if (restaurant.map_location()) {
                    google.maps.event.addListener(restaurant.marker, 'click', function() {
                        self.selectRestaurant(restaurant);
                    });
                }
            });
        }).fail(function(response, status, error) {
            $('#searchSummary').text('restaurants could not load...');
        });
    }
};

//function to make default and highlighted marker icon
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

var Foursquare = function(restaurant, map) {
    var self = this;
    self.name = ko.observable(restaurant.name);
    self.location = restaurant.location;
    self.lat = self.location.lat;
    self.lng = self.location.lng;
    //map_location returns a computed observable of latitude and longitude
    self.map_location = ko.computed(function() {
        if (self.lat === 0 || self.lon === 0) {
            return null;
        } else {
            return new google.maps.LatLng(self.lat, self.lng);
        }
    });
    self.formattedAddress = ko.observable(self.location.formattedAddress);
    self.formattedPhone = ko.observable(restaurant.contact.formattedPhone);
    self.marker = (function(restaurant) {
        var marker;

        if (restaurant.map_location()) {
            marker = new google.maps.Marker({
                position: restaurant.map_location(),
                map: map,
                icon: defaultMarker
            });
        }
        return marker;
    })(self);
    self.id = ko.observable(restaurant.id);
    self.url = ko.observable(restaurant.url);
    self.formatedDataForInfoWindow = function() {
        return '<div class="infoWindowContent">' + '<a href="' + (self.url() === undefined ? '/' : self.url()) + '">' +
            '<span class="infoWindowHeader"><h4>' + (self.name() === undefined ? 'restaurant name not available' : self.name()) + '</h4></span>' +
            '</a><h6>' + (self.formattedAddress() === undefined ? 'No address available' : self.formattedAddress()) + '<br>' + (self.formattedPhone() === undefined ? 'No Contact Info' : self.formattedPhone()) + '</h6>' +
            '</div>';
    };
};