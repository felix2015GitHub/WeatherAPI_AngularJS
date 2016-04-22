(function(){

	var app = angular.module('weather', ['ngSanitize']);

	app.controller('TabController', ['$http', function($http){
		var currentCity = 'London',
			currentDays = 7,
			defaultType = 'xml',
            selectPage = 'days',
			month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		var apiURLcity = "http://api.openweathermap.org/data/2.5/weather?q="+currentCity+"&mode="+defaultType+"&units=metric&appid=8b5e25806eda1463bbfb1ce83b50c4e9";
		var apiURLdays = "http://api.openweathermap.org/data/2.5/forecast/daily?q="+currentCity+"&mode="+defaultType+"&units=metric&cnt="+currentDays+"&appid=8b5e25806eda1463bbfb1ce83b50c4e9";
		var self = this;
		self.cityData = '';
		self.daysData = '';
        self.tabPool = {city: false, days:true};

		getCurrentCityData(apiURLcity);
		getNextDaysData(apiURLdays);

        self.showPage = function(id){
            self.tabPool[selectPage] = false;
            self.tabPool[id] = true;
            selectPage = id;
        }

		function getCurrentCityData(url){
            $http.get(url).then(function(response){
                if(defaultType=="xml"){
                    self.showCurrentCity($.parseXML(response.data));
                }else{
                    self.showCurrentCity(response.data);
                }
            });
	    };

	    function getNextDaysData(url){
            $http.get(url).then(function(response){
                if(defaultType=="xml"){
                    self.showNextDays($.parseXML(response.data));
                }else{
                    self.showNextDays(response.data);
                }
            });
	    };

		self.getNodeValue = function(data, xpath){
        	var nodes = data.evaluate(xpath, data, null, XPathResult.ANY_TYPE, null);
        	return nodes.iterateNext().nodeValue;
    	};

		self.showNextDays = function(data){
	        var html="";
	        html += '<table class="table">';
	        html += '<tbody>';
	        for(var i=0;i<currentDays;i++){
	            if(defaultType=="xml"){
	                var getDay = self.getNodeValue(data, "//forecast/time["+(i+1)+"]/@day");
	                var mon = month[parseInt((getDay.split("-")[1]))-1];
	                var day = getDay.split("-")[2];
	                var icon = self.getNodeValue(data, "//forecast/time["+(i+1)+"]/symbol/@var");
	                var temperatureMax = Math.round(self.getNodeValue(data, "//forecast/time["+(i+1)+"]/temperature/@max"));
	                var temperatureMin = Math.round(self.getNodeValue(data, "//forecast/time["+(i+1)+"]/temperature/@min"));
	                var weatherDes = self.getNodeValue(data, "//forecast/time["+(i+1)+"]/symbol/@name");
	                var speed = self.getNodeValue(data, "//forecast/time["+(i+1)+"]/windSpeed/@mps");
	                var cloudsAll = self.getNodeValue(data, "//forecast/time["+(i+1)+"]/clouds/@all");
	                var pressure = self.getNodeValue(data, "//forecast/time["+(i+1)+"]/pressure/@value");
	            }else{
	                var monTmp = new Date((data.list[i].dt)*1000).getMonth();
	                var mon = month[monTmp];
	                var day = new Date((data.list[i].dt)*1000).getDate();
	                var icon = data.list[i].weather[0].icon
	                var temperatureMax = Math.round(data.list[i].temp.max);
	                var temperatureMin = Math.round(data.list[i].temp.min);
	                var weatherDes = data.list[i].weather[0].description;
	                var speed = data.list[i].speed;
	                var cloudsAll = data.list[i].clouds;
	                var pressure = data.list[i].pressure;
	            }
	            html += '<tr>';
	            html += '<td>'+day+' '+mon+' <img src="images/'+icon+'.png"></td>';
	            html += '<td><span class="label label-warning">'+temperatureMax+'°C </span>&nbsp;';
	            html += '<span class="label label-default">'+temperatureMin+'°C </span> &nbsp;&nbsp;';
	            html += '<i>'+weatherDes+'</i> <p> '+speed+'m/s <br>clouds: '+cloudsAll+'%, '+pressure+' hpa</p></td>';
	            html += '</tr>';
	        }
	        html += '</tbody></table>';
	        self.daysData = html;
		};

    	self.showCurrentCity = function(data){
    		
        	var c = new Date();

            if(defaultType=="xml"){
                var cityName = self.getNodeValue(data, "//city/@name");
                var country = self.getNodeValue(data, "//city/country/text()");
                self.cityInfo = cityName+", "+country;
                self.temperature = Math.round(self.getNodeValue(data, "//temperature/@value"))+"  °C";
                self.icon = self.getNodeValue(data, "//weather/@icon");
                self.getCityDes = self.getNodeValue(data, "//weather/@number");
                var cityDes;
                switch(self.getCityDes.slice(0,1)){
                    case "2": cityDes = "Thunderstorm"; break;
                    case "3": cityDes = "Drizzle"; break;
                    case "5": cityDes = "Rain"; break;
                    case "6": cityDes = "Snow"; break;
                    case "8": 
                        self.getCityDes=="800" ? cityDes="Clear":cityDes="Clouds";
                        break;
                    default:
                        var getCityDesVal = self.getNodeValue(data, "//weather/@value");
                        var strlen = getCityDesVal.length;
                        var firstChar = getCityDesVal.slice(0,1).toUpperCase();
                        cityDes = firstChar+getCityDesVal.slice(1,strlen);
                        break;
                }
                self.cityDesInfo = cityDes;
                var speedName = self.getNodeValue(data, "//wind/speed/@name");
                var speedVal = self.getNodeValue(data, "//wind/speed/@value");
                var directionName = self.getNodeValue(data, "//wind/direction/@name");
                var directionVal = self.getNodeValue(data, "//wind/direction/@value");
                var cloudsName = self.getNodeValue(data, "//clouds/@name");
                var pressureVal = self.getNodeValue(data, "//pressure/@value");
                var humidityVal = self.getNodeValue(data, "//humidity/@value");
                var getSunrise = new Date(self.getNodeValue(data, "//city/sun/@rise"));
                var getSunset = new Date(self.getNodeValue(data, "//city/sun/@set"));
                var sunrise = getSunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
                var sunset = getSunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
                var coordlon = self.getNodeValue(data, "//city/coord/@lon");
                var coordlat = self.getNodeValue(data, "//city/coord/@lat");
            }else{
                var cityName = data.name;
                var country = data.sys.country;
                var temperature = Math.round(data.main.temp);
                var icon = data.weather[0].icon;
                var getCityDes = data.weather[0].id;
                var cityDes;
                switch(getCityDes.toString().slice(0,1)){
                    case "2": cityDes="Thunderstorm"; break;
                    case "3": cityDes="Drizzle"; break;
                    case "5": cityDes="Rain"; break;
                    case "6": cityDes="Snow"; break;
                    case "8": 
                        getCityDes=="800" ? cityDes="Clear":cityDes="Clouds";
                        break;
                    default:
                        var getCityDesVal=data.weather[0].description;
                        var strlen=getCityDesVal.length;
                        var firstChar=getCityDesVal.slice(0,1).toUpperCase();
                        cityDes=firstChar+getCityDesVal.slice(1,strlen);
                        break;
                }
                var speedName = "---";
                var speedVal = data.wind.speed;
                var directionName = "---";
                var directionVal = data.wind.deg;
                var cloudsName = "---";
                var pressureVal = data.main.pressure;
                var humidityVal = data.main.humidity;
                var getSunrise = new Date((data.sys.sunrise)*1000);
                var getSunset = new Date((data.sys.sunset)*1000);
                var sunrise = getSunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
                var sunset = getSunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
                var coordlon = data.coord.lon;
                var coordlat = data.coord.lat;
            }
        /*
        	var html;
        	html = '<h3>'+cityName+', '+country+'</h3>'+
                '<h2> <img src="images/'+icon+'.png"> '+temperature+' °C</h2>'+
                cityDes+
                '<p>'+
                '<span id="date_m">get at '+
                c.getFullYear()+'.'+
                (((c.getMonth()+1)<10)?("0"+(c.getMonth()+1)):(c.getMonth()+1))+'.'+
                ((c.getDate()<10)?("0"+c.getDate()):c.getDate())+' '+
                ((c.getHours()<10)?("0"+c.getHours()):c.getHours())+":"+
                ((c.getMinutes()<10)?("0"+c.getMinutes()):c.getMinutes())+'</span>'+
                '(<a type="button" style="color: #D26C22;" href="#">Wrong data?</a>)'+
                '</p>'+
                '<table class="table table-striped table-bordered table-condensed">'+
                '<tbody>'+
                '<tr>'+
                '<td>Wind</td>'+
                '<td>'+speedName+' '+speedVal+' m/s <br>'+
                directionName+' ('+directionVal+' )</td>'+
                '</tr>'+
                '<tr>'+
                '<td>Cloudiness</td>'+
                '<td>'+cloudsName+'</td>'+
                '</tr>'+
                '<tr>'+
                '<td>Pressure<br></td>'+
                '<td>'+pressureVal+' hpa</td>'+
                '</tr>'+
                '<tr>'+
                '<td>Humidity</td>'+
                '<td>'+humidityVal+' %</td>'+
                '</tr>'+
                '<tr>'+
                '<td>Sunrise</td>'+
                '<td id="sunrise">'+sunrise+'</td>'+
                '</tr>'+
                '<tr>'+
                '<td>Sunset</td>'+
                '<td id="sunset">'+sunset+'</td>'+
                '</tr>'+
                '<tr>'+
                '<td>Geo coords</td>'+
                '<td id="coord"><a href="http://openweathermap.org/Maps?zoom=12&amp;lat='+coordlat+'&amp;lon='+coordlon+'&amp;layers=B0FTTFF">[ '+coordlon+', '+coordlat+' ]</a></td>'+
                '</tr>'+
                '</tbody>'+
                '</table>';
        	self.cityData = html;  
            */    	
    	};

	}]);

})();