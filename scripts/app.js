'use strict';

//Declaration of global variables
var map;
const initLat = 12.927442;
const initLong = 77.63276;
var allRestaurants = [];
var filteredRestaurants = [];
var markers = [];
var infoWindows = [];

//Restaurant model
var Restaurant = function (data) {
    var self = this;
    this.name = data.name;
    this.infoWindow = data.infoWindow;
    this.marker = data.marker;
    this.click = function () {
        if (document.readyState === "complete") { //To prevent calling this on initial page load
            resetMarkers();
            toggleBounce(self.marker);
            self.infoWindow.open(map, self.marker);
        }
    }
}

//Function to reset all markers and infoWindows
function resetMarkers() {
    markers.forEach(function (marker) {
        marker.setAnimation(null);
    })
    infoWindows.forEach(function (infoWindow) {
        infoWindow.close(infoWindow);
    })
}

$(document).ready(function () {
    // Function to use string.format similar to that of C# (to format the infoWindow contentString)
    if (!String.prototype.format) {
        String.prototype.format = function () {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined'
                  ? args[number]
                  : match
                ;
            });
        };
    }
})

//function to toggle the marker with animation bounce
function toggleBounce(marker) {
    if (marker.getAnimation() !== null && marker.getAnimation() !== undefined) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

//Function to initialize the map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: initLat, lng: initLong },
        zoom: 13
    });

    //ViewModel
    var ViewModel = function () {
        var self = this;
        this.restaurantList = ko.observableArray([]);
        this.query = ko.observable('');
        this.getContentString = function (restaurant) {
            return "<img src='{0}' alt='{1}'><br/><h4>{1}</h4><br/><p>{2}</p><p><strong>Cuisines:</strong> {3}</p><p><strong>Rating:</strong> <span style='background: #{7};color:white;border-radius: 4px;font-size: 16px; height: 25px;line-height: 23px;font-weight:bold;text-align: center;width: 36px;margin: 0 auto;'>{8}</span></p><a href='{4}'>Menu</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href='{6}'>Photos</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href='{5}'>More...</a>"
                .format(restaurant.thumb, restaurant.name, restaurant.location.address, restaurant.cuisines, restaurant.menu_url, restaurant.url, restaurant.photos_url, restaurant.user_rating.rating_color, restaurant.user_rating.aggregate_rating);
        }
        this.getRestaurants = ko.computed(function () {

            var params = {
                lat: initLat,
                lon: initLong,
                radius: 5000,
                collection_id: 51, //Brilliant biryani's collection from Zomato (found using their collections API)
                sort: 'rating',
                order: 'desc'
            }
            var filterString = $("#search").val();
            $.ajax({
                url: 'https://developers.zomato.com/api/v2.1/search',
                headers: {
                    'Accept': 'application/json',
                    'user-key': '7e6baf0a4c94c6ab35ee9c936d72f35b'
                },
                method: 'GET',
                dataType: 'json',
                data: params,
                async: true,
            }).done(function (response) {
                allRestaurants = response.restaurants;
                allRestaurants.forEach(function (restaurant) {
                    var marker = new google.maps.Marker({
                        position: { lat: parseFloat(restaurant.restaurant.location.latitude), lng: parseFloat(restaurant.restaurant.location.longitude) },
                        map: map,
                        title: restaurant.restaurant.name
                    });
                    var contentString = self.getContentString(restaurant.restaurant);
                    var infowindow = new google.maps.InfoWindow({
                        content: contentString
                    });
                    marker.addListener('click', function () {
                        infowindow.open(map, marker); //open the selected marker's infoWindow
                        toggleBounce(marker);
                    });
                    google.maps.event.addListener(infowindow, 'closeclick', function () {
                        marker.setAnimation(null);
                    });
                    //Close infoWindow by clicking anywhere on the map
                    map.addListener("click", function () {
                        infowindow.close(infowindow);
                        marker.setAnimation(null);
                    });
                    markers.push(marker);
                    infoWindows.push(infowindow);
                    restaurant.restaurant.marker = marker;
                    restaurant.restaurant.infoWindow = infowindow;
                    self.restaurantList.push(new Restaurant(restaurant.restaurant));
                })
            }).fail(function (response) {
                alert('Could not load restaurant details from the Zomato server');
            });
        }, this);

        this.filteredRestaurants = function () {
            var filteredRestaurants = [];
            self.restaurantList([]); //resetting restaurantList
            resetMarkers();

            var filterString = self.query().toLowerCase();

            //moving filtered restaurants to filteredRestaurants and hiding all the markers
            allRestaurants.forEach(function (restaurant) {
                if (restaurant.restaurant.name.toLowerCase().indexOf(filterString) != -1)
                    filteredRestaurants.push(restaurant);
                restaurant.restaurant.marker.setVisible(false);
            });

            //Showing filtered restaurants
            filteredRestaurants.forEach(function (restaurant) {
                restaurant.restaurant.marker.setVisible(true);
                self.restaurantList.push(new Restaurant(restaurant.restaurant));
            });
        }
    };

    //Apply knockout bindings
    ko.applyBindings(new ViewModel());
}

//Error handling for map
function mapLoadError() {
    var img = document.createElement("IMG");
    img.src = "images/GoogleMapLoadError.jpg";
    $('#imageDiv').appendChild(img);
}
