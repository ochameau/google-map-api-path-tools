
var top = windows.getRegistered("firefox-window", "topmost");
var tab = top.tabs.new(file.testDir().append("gmapi-path-tools-page.html"));

wait.during(1000);

var win = tab.window;

var lacantine = win.wrappedJSObject.lacantine;
var lyon = win.wrappedJSObject.lyon;

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


