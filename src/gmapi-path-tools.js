/* ***** BEGIN LICENSE BLOCK *****
# Copyright 2010 Alexandre Poirot
#
# Contributor(s):
#   Alexandre poirot <poirot.alex@gmail.com>
# 
# 
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either 
# version 2.1 of the License, or (at your option) any later version.
# 
# This library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Lesser General Public License for more details.
# 
# You should have received a copy of the GNU Lesser General Public 
# License along with this library.  If not, see <http://www.gnu.org/licenses/>.
#
# ***** END LICENSE BLOCK *****/


function getDestLatLng(latLng, bearing, distance) {
  var EARTH_RADIUS = 6378.137; //in kilometres
  var lat1 = latLng.lat().toRad();
  var lng1 = latLng.lng().toRad();
  var brng = bearing*Math.PI/180; 
  var dDivR = distance/EARTH_RADIUS;
  var lat2 = Math.asin( Math.sin(lat1)*Math.cos(dDivR) + Math.cos(lat1)*Math.sin(dDivR)*Math.cos(brng) );
  var lng2 = lng1 + Math.atan2(Math.sin(brng)*Math.sin(dDivR)*Math.cos(lat1), Math.cos(dDivR)-Math.sin(lat1)*Math.sin(lat2));
  return new google.maps.LatLng(lat2/ Math.PI * 180, lng2/ Math.PI * 180);
}

// Square with $radius radius in kilometers, with $this as center
google.maps.LatLng.prototype.getRadialBoundaries = function getRadialBoundaries(radius) {
  var hypotenuse = Math.sqrt(2 * radius * radius);
  var sw = getDestLatLng(this, 225, hypotenuse);
  var ne = getDestLatLng(this, 45, hypotenuse);
  return new google.maps.LatLngBounds(sw, ne);
}

function bearingBetween(point1, point2) {
  var lat1 = point1.lat().toRad(), lat2 = point2.lat().toRad();
  var dLon = (point2.lng()-point1.lng()).toRad();
  
  var y = Math.sin(dLon) * Math.cos(lat2);
  var x = Math.cos(lat1)*Math.sin(lat2) -
          Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
  var brng = Math.atan2(y, x);
  
  return (brng.toDeg()+360) % 360;
}

// Point between $this and $point2 at $dist kilometers from $this
google.maps.LatLng.prototype.pointBetween = function(point2, dist) {
  dist = dist/6371;  // convert dist to angular distance in radians
  var brng = bearingBetween(this, point2).toRad();  
  var lat1 = this.lat().toRad(), lon1 = this.lng().toRad();

  var lat2 = Math.asin( Math.sin(lat1)*Math.cos(dist) + 
                        Math.cos(lat1)*Math.sin(dist)*Math.cos(brng) );
  var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(dist)*Math.cos(lat1), 
                               Math.cos(dist)-Math.sin(lat1)*Math.sin(lat2));
  lon2 = (lon2+3*Math.PI)%(2*Math.PI) - Math.PI;  // normalise to -180...+180

  if (isNaN(lat2) || isNaN(lon2)) return null;
  return new google.maps.LatLng(lat2.toDeg(), lon2.toDeg());
}

// Return the distance between the former point and the point passed in argument
// Result in kilometers
google.maps.LatLng.prototype.distanceFrom = function(newLatLng) {
  var R = 6371000; // meters
  var lat1 = this.lat();
  var lon1 = this.lng();
  var lat2 = newLatLng.lat();
  var lon2 = newLatLng.lng();
  var dLat = (lat2-lat1) * Math.PI / 180;
  var dLon = (lon2-lon1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 )
      *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d/1000;
} 

Number.prototype.toRad = function() {
  return this * Math.PI / 180;
}

Number.prototype.toDeg = function() {
  return this * 180 / Math.PI;
}

