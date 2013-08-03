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

$(document).ready(function() {
    createMap();
});

function createMap()
{
    map = po.map()
        .container(d3.select("#map").append("svg:svg").node())
        .zoom(zoomLevel)
        .center({"lat":centreLongtitude, "lon":centreLatititude});

    map.add(po.compass()
        .pan("none"));

    map.add(po.image()
        .url(po.url("http://acetate.geoiq.com/tiles/terrain/{Z}/{X}/{Y}.png")));
    toggleMapDisplay();
    //displayPoints();
}

function toggleMapDisplay()
{
    $('#map').toggle();
}

function displayPointsFromJSON(name)
{
    map.add(po.geoJson()
        .url("resources/"+name)
        .id("majorpoint")
        .on("load", function(e)
        {
            var lineElements=[];
            for (var i = 0; i < e.features.length; i++) {
                var feature = e.features[i];
                lineElements[i]=transform(feature.data.geometry.coordinates);
                feature.element.setAttribute("name",feature.data.name);
                feature.element.setAttribute("text",feature.data.text);
                feature.element.addEventListener("mousedown", function(click){
                    //console.log("Clicked "+this.getAttribute("name")+" "+this.getAttribute("text"));
                    x= click.X;
                    y= click.Y;
                    $("#dialog").empty();
                    $("#dialog").append(this.getAttribute("text"));
                    //TODO: Bug 1. Dialog Position
                    $("#dialog").dialog();

                }, false);
            }
            var lineFunction = d3.svg.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                .interpolate("linear");
            var layer = d3.select("#map svg").insert("svg:g");


            layer.append("path")
                .attr("d", lineFunction(lineElements))
                .attr("stroke", "blue")
                .attr("stroke-width", 2)
                .attr("fill", "none");
        }));
}

function transform(coords) {
    d = map.locationPoint({lon: coords[0], lat: coords[1]});
    return {"x":d.x, "y":d.y};
}
