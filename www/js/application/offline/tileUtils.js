tileUtils = function() {

function pyramid(mapIDs, maxlat, maxlon, minlat, minlon, options) {
    /*    
    Given a list of mapIDs, a central lat/lng, and zoomLimit/radius options 
    generate the urls for the pyramid of tiles for zoom levels 3-17
    
    radius is how many tiles from the center at zoomLimit
    (by default 
        zooms 3-14 have radius of 1.  
        15 has radius 2
        16 has radius 4.  
        17 has radius 8
     )
    */
    
    //handle options
    var zoomLimit = options['zoomLimit'] || 18;
    var minZoom = options['minZoom'] || 3;
    var maxZoom = options['maxZoom'] || 18;
    var radius = options['radius'] || 1; 
    
    //declare vars outside of loop
    var urls = [], mapID, zoom, t_x_min, t_y_min, t_x_max, t_y_max, r, x, y;
    
    for (var i=0, l=mapIDs.length; i<l; i++) { //iterate over map ids
        mapID = mapIDs[i];
        for (zoom=minZoom; zoom<=maxZoom; zoom++) { //iterate over zoom levels
            t_x_min = long2tile(minlon, zoom);
            t_y_min = lat2tile(minlat, zoom);
            t_x_max = long2tile(maxlon, zoom);
            t_y_max = lat2tile(maxlat, zoom);
            for (x = t_x_min; x <= t_x_max; x++) { //iterate over x's
                for (y = t_y_max; y <= t_y_min; y++) { //iterate over y's
                    urls.push(tile2url(mapID, zoom, x, y));
                }
            }
        }
    }
    return urls;
}

function tile2url(mapID, zoom, x, y) {
    /*  Given a mapID, zoom, tile_x, and tile_y,
     *  return the url of that tile
     */
    return 'http://api.tiles.mapbox.com/v4/' 
        + mapID + '/' + zoom + '/'
        + x + '/' + y + '.png?access_token=pk.eyJ1IjoidHJhaWxoZWFkbGFicyIsImEiOiJRNEU4VWFNIn0.IT_1YvYqery8yDIQZFDQqw';
}

//both from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
function long2tile(lon, zoom) { 
    return (Math.floor((lon+180)/360*Math.pow(2,zoom))); 
}
function lat2tile(lat, zoom)  { 
    return (Math.floor(
        (1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)
    ));
}

return {
    'pyramid': pyramid
};

}();