//  Author: Dustin Hardin
//
//  Description:
//  Used to display a 5 day forecast for weather by City,Location where location can be a state, province, etc.
//  Utilizes the Yahoo Query Language (yql) webservice to query for the city,location woeid and then query
//  for the weather for the returend woied.
//
//  References:
//  YQL: https://developer.yahoo.com/yql/
//  jQuery: https://jquery.com/
//  jQuery UI: https://jqueryui.com/
//  GitHub: https://github.com/dhardin/WeatherFeed

(function ($, document, window) {
    var defaults = {
        retryLimit: 10,
        relativeTimeZone: true,
        width:1100 + "px"
    };

    $.fn.weatherFeed = function (options) {
        options = options || {};
        var tryCount = 0;
        this.each(function () {
            var $weatherTag = $(this);
            $weatherTag.css("width", options.width);
            var city = $.trim($(this).text().split(',')[0]);
            var state = $.trim($(this).text().split(',')[1]);
            var days = 6;
            var title = city + ", " + state;
            var location = "";
            var description = "";
            var day = "";
            var high = "";
            var low = "";
            var dayDOM = "";

            var loadBar = document.getElementsByClassName("loading");
            $weatherTag.html(loadBar);

            $.ajax({
                url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.places%20where%20text%3D%22" + city + "%20" + state + "%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=?",
                dataType: "json",
                success: function (response) {
                    var woeid = response.query.count > 1 ? response.query.results.place[0].woeid : response.query.results.place.woeid;
                    $.ajax({
                        url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid=' + woeid + '&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=?',
                        dataType: "json",
                        success: function (data) {

                            var date = new Date();

                            var time = date.getTime();
                            var today = new Date(time);

                            var weatherListItem =  title;

                            for (var i = 0; i < data.query.results.channel.item.forecast.length && i < days; i++) {

                                if (i == 0) {
                                    day = "Today: ";
                                    date =  data.query.results.channel.item.forecast[i].date;
                                    high = "High:" + data.query.results.channel.item.forecast[i].high + "&deg;F   ";
                                    low = "low:" + data.query.results.channel.item.forecast[i].low + " &deg;F  ";
                                    tempSummary = high + low;
                                    description = data.query.results.channel.item.forecast[i].text;
                                    dayDom = "<li class='fullDay forecast'>" + day + date + "<p>" + description + "<p>" + high + " &nbsp;-" + low + "</p></li>";
                                }
                                else {
                                    day =  data.query.results.channel.item.forecast[i].day;
                                    date = data.query.results.channel.item.forecast[i].date;

                                    high = "High: " + data.query.results.channel.item.forecast[i].high + " &deg;F";
                                    low = " Low: " + data.query.results.channel.item.forecast[i].low + " &deg;F";
                                    description = data.query.results.channel.item.forecast[i].text;
                                    dayDom = "<li class='fullDay forecast'>" + day + " " + date + "<p>" + description + "<p>" + high + "&nbsp;-" + low + "</p></li>";
                                }
                                weatherListItem += dayDom;

                            }
                            weatherListItem += "</ul>";
                            $weatherTag.html(weatherListItem);
                        },

                    });
                },
            });
        });
    };

    //**************************
    //   Helper Functions
    //**************************

    Date.prototype.stdTimezoneOffset = function () {
        var jan = new Date(this.getFullYear(), 0, 1);
        var jul = new Date(this.getFullYear(), 6, 1);
        return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    }

    Date.prototype.dst = function () {
        return this.getTimezoneOffset() < this.stdTimezoneOffset();
    }

})(jQuery, document, window);
