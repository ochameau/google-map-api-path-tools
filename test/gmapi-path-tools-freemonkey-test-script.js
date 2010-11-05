
var top = windows.getRegistered("firefox-window", "topmost");
var tab = top.tabs.new(file.testDir().append("gmapi-path-tools-page.html"));

wait.during(1000);

// Freemonkey hack :/
// Create objects in webpage, because we can't do that in freemonkey script
// (because of remote code execution)
var win = tab.window.wrappedJSObject;

var lacantine = win.lacantine;
var lyon = win.lyon;
var directionsService = win.directionsService;

// Check distanceFrom 
var parisLyonDistance = lacantine.distanceFrom(lyon);
assert.isEquals(Math.round(parisLyonDistance),393);

// Check getRadialBoundaries
var rectangularNearby = lacantine.getRadialBoundaries(5);
var diagonalDistance = rectangularNearby.getNorthEast().distanceFrom(rectangularNearby.getSouthWest());
// Round distances to kilometers, because distance in RadialBoundaries return slighty bigger area than expected.
assert.isEquals(Math.round(diagonalDistance),Math.round(Math.sqrt(10*10+10*10)));

// Check pointBetween
var middle1 = lacantine.pointBetween(lyon, parisLyonDistance/2);
var middle2 = lyon.pointBetween(lacantine, parisLyonDistance/2);

assert.isEquals(middle1.lng(),middle2.lng());
// Doesn't check value too precisely because all algorithms are not that precise!
// So let's check only 4 decimals
assert.isEquals(Math.round(middle1.lat()*10000),Math.round(middle2.lat()*10000));

// Now check valid behavior of getDirectionPointAtDuration
var request = {
  origin: lacantine, 
  destination: lyon,
  travelMode: win.google.maps.DirectionsTravelMode.DRIVING
};
directionsService.route(request, function(response, status) {
  if (status != win.google.maps.DirectionsStatus.OK) return assert.fail("Request failed!");
  var leg = response.routes[0].legs[0];
  
  var startPoint = win.getDirectionPointAtDuration(leg,0);
  assert.isEquals(startPoint.lat(),leg.start_location.lat());
  assert.isEquals(startPoint.lng(),leg.start_location.lng());
  
  var endPoint = win.getDirectionPointAtDuration(leg,leg.duration.value);
  assert.isEquals(endPoint.lat(),leg.end_location.lat());
  assert.isEquals(endPoint.lng(),leg.end_location.lng());
  
  // The middle of this route is on A6 highway, near the straight middle of Paris<->Lyon (next to Avallon city)
  var middlePoint = win.getDirectionPointAtDuration(leg,leg.duration.value/2);
  assert.isEquals(middlePoint.lat(),47.50450929493563);
  assert.isEquals(middlePoint.lng(),4.048676247714788);
});


