/**
 * Created with JetBrains WebStorm.
 * User: brian
 * Date: 03/08/2013
 * Time: 10:21
 * To change this template use File | Settings | File Templates.
 */

var testimonyURL="http://localhost:3000/testimony/";

function Testimony(name,picURL,basicInfo,data)
{
    var self=this;
    self.name=ko.observable(name);
    self.pic=ko.observable(picURL);
    self.basicInfo=ko.observable(basicInfo);
    self.data=ko.observable(data);
    self.logMouseClick = function(testimony) {

        console.log("Testimony "+testimony.name());
        toggleMainScreen();
        toggleMainDisplay();
        toggleMapDisplay();
        displayPointsFromJSON(self.data());
    }

}

function TestimoniesViewModel()
{
    var self=this;
    self.columnLength=ko.observable(4);
    self.testimonies = ko.observableArray([
        new Testimony("Dorrith Simm","resources/Anonymous.png","DORRITH SIM found solace in Scotland and penned book My Pocket about starting a new life in a foreign country, which is being distributed in schools across Renfrewshire to tie in with a website about the Holocaust.","DorrithSimm.json")
    ]);
    self.selected=ko.observable(self.testimonies()[0]);
    self.rows = ko.computed(function()
    {
        var result = [],
            row,
            colLength = parseInt(self.columnLength(), 10);

        //loop through items and push each item to a row array that gets pushed to the final result
        for (var i = 0, j = self.testimonies().length; i < j; i++) {
            if (i % colLength === 0) {
                if (row) {
                    result.push(row);
                }
                row = [];
            }
            row.push(self.testimonies()[i]);
        }

        //push the final row
        if (row) {
            result.push(row);
        }

        return result;
    });
}

$(document).ready(function() {
    jQuery.get(testimonyURL, function (data, textStatus, jqXHR) {
        console.log("Get resposne:");
        console.dir(data);
        console.log(textStatus);
        console.dir(jqXHR);
    });
    ko.applyBindings(new TestimoniesViewModel());
    toggleMainDisplay();
});

function toggleMainScreen()
{
    $("#mainMenu").toggle();
}

function toggleMainDisplay()
{
    $("#display").toggle();
}