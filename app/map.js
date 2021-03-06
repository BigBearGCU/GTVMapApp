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
    $( "#advance" ).click(function() {
        //move on
        console.log( "advance Clicked" );
        advanceToNextPoint();
    });

    $( "#back" ).click(function() {
        console.log( "back Clicked" );
        advancetoPrevPoint();
    });
    $('#back').toggle();
    $('#advance').toggle();
});

function createMap()
{
    map = po.map()
        .container(d3.select("#map").append("svg:svg").node())
        .zoom(zoomLevel)
        .center({"lat":centreLongtitude, "lon":centreLatititude});

    map.add(po.compass());

    map.add(po.image()
        .url(po.url("http://acetate.geoiq.com/tiles/terrain/{Z}/{X}/{Y}.png")));

    layer = d3.select("#map svg").insert("svg:g");

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
    map.add(po.geoJson()
        .url(name)
        .id("majorpoint")
        .on("load", function(e)
        {

            points= e.features;
            selectedPoint=0;

            for (var i = 0; i < e.features.length; i++) {
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
            d3.select(point.element).transition().style('fill','red').attr('r','10');
            map.center({"lat":point.element.getAttribute("lat"), "lon":point.element.getAttribute("lon")});
            showSelectedPoint();
            displayLines();
            displayText();

        }));
}

function advancetoPrevPoint()
{
    point=points[selectedPoint];
    lastPoint=points[selectedPoint];
    d3.select(lastPoint.element).transition().style('fill','brown').attr('r','5');
    selectedPoint--;
    if (selectedPoint<0)
    {
        selectedPoint=points.length-1;
    }
    point=points[selectedPoint];
    d3.select(point.element).transition().style('fill','red').attr('r','10');
    displayLines();
    showSelectedPoint();
    map.center({"lat":point.element.getAttribute("lat"), "lon":point.element.getAttribute("lon")});
}

function advanceToNextPoint()
{

    point=points[selectedPoint];
    console.log(point);

    lastPoint=points[selectedPoint];
    //get
    d3.select(lastPoint.element).transition().style('fill','brown').attr('r','5');
    selectedPoint++;
    if (selectedPoint>points.length-1)
    {
        selectedPoint=0;
    }
    point=points[selectedPoint];
    //point.element.style.fill='red';
    d3.select(point.element).transition().style('fill','red').attr('r','10');
    //point.element.setAttribute('r',"10");
    displayLines();
    showSelectedPoint();
    map.center({"lat":point.element.getAttribute("lat"), "lon":point.element.getAttribute("lon")});
}

function showSelectedPoint()
{
    var point=points[selectedPoint];

    $("#info").empty();
    $("#info").append("<h3>"+point.element.getAttribute("text")+"</h3>");
    $("#info").show();
}

function displayLines()
{
    //remove all existing lines
    $("path").remove();
    for(var i=0;i<points.length;i++)
    {
        lineElements[i]=transform(points[i].data.geometry.coordinates);
    }
    var lineFunction = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("linear");

    layer.append("path")
        .attr("d", lineFunction(lineElements))
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("fill", "none");
}

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

function transform(coords) {
    //do we have a last point and a currentpoint
    var offsetX=0;
    var offsetY=0;
    if (point!=null && lastPoint!=null){
        var startX=point.element.getAttribute("mapX");
        var startY=point.element.getAttribute("mapY");

        var endX=lastPoint.element.getAttribute("mapX");
        var endY=lastPoint.element.getAttribute("mapY");

        offsetX=startX-endX;
        offsetY=startY-endY;
        console.log("Offset "+offsetX+" "+offsetY);
    }

    d = map.locationPoint({lon: coords[0], lat: coords[1]});
    return {"x":d.x-offsetX, "y":d.y-offsetY};
}


