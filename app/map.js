/**
 * Created with JetBrains WebStorm.
 * User: brian
 * Date: 03/08/2013
 * Time: 00:23
 * To change this template use File | Settings | File Templates.
 */
var po = org.polymaps;
var map;
//Centre point of Europe, should we change and get an average all points
var centreLongtitude=53;
var centreLatititude=9;
var zoomLevel=4;
var selected;
var points=[];
var layer=null;
var lineElements=[];
var textElements=[];
var selectedPoint=0;
var lastPoint;
var point;


$(document).ready(function() {
    //Bind advance click event
    $( "#advance" ).click(function() {
        //move on
        console.log( "advance Clicked" );
        advanceToNextPoint();
    });

    //Bind back click event
    $( "#back" ).click(function() {
        console.log( "back Clicked" );
        advancetoPrevPoint();
    });
    //hide these button
    $('#back').toggle();
    $('#advance').toggle();
});

//create map functoion
function createMap()
{
    //Add a map layer and centre it
    map = po.map()
        .container(d3.select("#map").append("svg:svg").node())
        .zoom(zoomLevel)
        .center({"lat":centreLongtitude, "lon":centreLatititude});

    map.add(po.compass());

    //Add map times
    map.add(po.image()
        .url(po.url("http://acetate.geoiq.com/tiles/terrain/{Z}/{X}/{Y}.png")));

    //Add and SVG layer for drawing things on map
    layer = d3.select("#map svg").insert("svg:g");

    //hide map
    toggleMapDisplay();
    $('#back').toggle();
    $('#advance').toggle();
    //displayPoints();
}

function toggleMapDisplay()
{
    $('#map').toggle();
}

function displayPointsFromJSON(name)
{
    //Add Geo Data and add a layer onto the map
    map.add(po.geoJson()
        .url(name)
        .id("majorpoint")
        .on("load", function(e)
        {
            //all points
            points= e.features;
            //current selected point
            selectedPoint=0;

            //loop through each point
            for (var i = 0; i < e.features.length; i++) {
                //Add a whole bunch of attributes to the point, just makes it easier to retrieve
                var feature = e.features[i];
                feature.element.setAttribute('r',"5");
                feature.element.setAttribute("name",feature.data.name);
                feature.element.setAttribute("text",feature.data.text);
                feature.element.setAttribute("lon",feature.data.geometry.coordinates[0]);
                feature.element.setAttribute("lat",feature.data.geometry.coordinates[1]);
                feature.element.setAttribute("mapX",feature.data.geometry.coordinates.x);
                feature.element.setAttribute("mapY",feature.data.geometry.coordinates.y);
            }
            var point=points[selectedPoint];
            //set the selected point to look like it has been selected(slightly bigger and red)
            d3.select(point.element).transition().style('fill','red').attr('r','10');
            //center the map on the selected point
            map.center({"lat":point.element.getAttribute("lat"), "lon":point.element.getAttribute("lon")});
            showSelectedPoint();
            displayLines();
            displayText();

        }));
}

//Advance to Next point
function advancetoPrevPoint()
{
    //get the current point
    point=points[selectedPoint];
    //set it to the last point
    lastPoint=point;
    //'deselect last point'
    d3.select(lastPoint.element).transition().style('fill','brown').attr('r','5');
    //go back a point
    selectedPoint--;
    //if we have went out of bounds, loop back to start
    if (selectedPoint<0)
    {
        selectedPoint=points.length-1;
    }
    //select new point
    point=points[selectedPoint];
    //'select new point'
    d3.select(point.element).transition().style('fill','red').attr('r','10');
    //make sure all lines are drawn correctly
    displayLines();
    showSelectedPoint();
    //move map to the new select lon and lat
    map.center({"lat":point.element.getAttribute("lat"), "lon":point.element.getAttribute("lon")});
}

//move to next point
function advanceToNextPoint()
{

    point=points[selectedPoint];
    console.log(point);
    lastPoint=point;
    d3.select(lastPoint.element).transition().style('fill','brown').attr('r','5');
    selectedPoint++;
    if (selectedPoint>points.length-1)
    {
        selectedPoint=0;
    }
    point=points[selectedPoint];
    d3.select(point.element).transition().style('fill','red').attr('r','10');
    displayLines();
    showSelectedPoint();
    map.center({"lat":point.element.getAttribute("lat"), "lon":point.element.getAttribute("lon")});
}

function showSelectedPoint()
{
    //get selected point
    var point=points[selectedPoint];
    //empty the element with the info id
    $("#info").empty();
    //append the text on
    $("#info").append("<h3>"+point.element.getAttribute("text")+"</h3>");
    //now lets show it
    $("#info").show();
}

function displayLines()
{
    //remove all existing lines
    $("path").remove();
    //transform all coords into something that we can draw
    for(var i=0;i<points.length;i++)
    {
        lineElements[i]=transform(points[i].data.geometry.coordinates);
    }
    //this is our line func
    var lineFunction = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("linear");

    //now add our line on
    layer.append("path")
        .attr("d", lineFunction(lineElements))
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("fill", "none");
}

//Text - TODO: not really working
function displayText()
{
    $("text").remove();
    for(var i=0;i<points.length;i++)
    {
        textElements[i]=transform(points[i].data.geometry.coordinates);
    }

    var textFunction=d3.svg.text()
        .x(function(d){return d.x})
        .y(function(d){return d.y});

    layer.apppend("text")
        .attr("d",textFunction(textElements))
        .attr("font-family", "sans-serif")
        .attr("fill", "black");
}

//transform from mpa coords to drawing coords
function transform(coords) {
    var offsetX=0;
    var offsetY=0;
    //do we have a last point and a current point
    if (point!=null && lastPoint!=null){
        var startX=point.element.getAttribute("mapX");
        var startY=point.element.getAttribute("mapY");

        var endX=lastPoint.element.getAttribute("mapX");
        var endY=lastPoint.element.getAttribute("mapY");
        //calculate offset
        offsetX=startX-endX;
        offsetY=startY-endY;
        console.log("Offset "+offsetX+" "+offsetY);
    }
    //offset position based on offset
    d = map.locationPoint({lon: coords[0], lat: coords[1]});
    return {"x":d.x-offsetX, "y":d.y-offsetY};
}


