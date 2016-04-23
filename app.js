(function(){

	var app = angular.module('weather', ['ngSanitize']);

	app.controller('TabController', ['$http', function($http){
		var currentCity = 'London',
			currentDays = 7,
			defaultType = 'json',
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
            self.date_m = "get on "+
                c.getFullYear()+'.'+
                (((c.getMonth()+1)<10)?("0"+(c.getMonth()+1)):(c.getMonth()+1))+'.'+
                ((c.getDate()<10)?("0"+c.getDate()):c.getDate())+' '+
                ((c.getHours()<10)?("0"+c.getHours()):c.getHours())+":"+
                ((c.getMinutes()<10)?("0"+c.getMinutes()):c.getMinutes());

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
                self.windVal = speedName+" "+speedVal;
                var directionName = self.getNodeValue(data, "//wind/direction/@name");
                var directionVal = self.getNodeValue(data, "//wind/direction/@value");
                self.windDirection = directionName+" ("+directionVal+" )";
                self.cloudsName = self.getNodeValue(data, "//clouds/@name");
                var pressureVal = self.getNodeValue(data, "//pressure/@value");
                self.Pressure = pressureVal+" hpa";
                var humidityVal = self.getNodeValue(data, "//humidity/@value");
                self.Humidity = humidityVal+" %";
                var getSunrise = new Date(self.getNodeValue(data, "//city/sun/@rise"));
                var getSunset = new Date(self.getNodeValue(data, "//city/sun/@set"));
                self.sunrise = getSunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
                self.sunset = getSunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
                self.coordlon = self.getNodeValue(data, "//city/coord/@lon");
                self.coordlat = self.getNodeValue(data, "//city/coord/@lat");
                self.geoCoords = "["+self.coordlon+", "+self.coordlat+"]";
            }else{
                var cityName = data.name;
                var country = data.sys.country;
                self.cityInfo = cityName+", "+country;
                self.temperature = Math.round(data.main.temp);
                self.icon = data.weather[0].icon;
                self.getCityDes = data.weather[0].id;
                var cityDes;
                switch(self.getCityDes.toString().slice(0,1)){
                    case "2": cityDes="Thunderstorm"; break;
                    case "3": cityDes="Drizzle"; break;
                    case "5": cityDes="Rain"; break;
                    case "6": cityDes="Snow"; break;
                    case "8": 
                        self.getCityDes=="800" ? cityDes="Clear":cityDes="Clouds";
                        break;
                    default:
                        var getCityDesVal=data.weather[0].description;
                        var strlen=getCityDesVal.length;
                        var firstChar=getCityDesVal.slice(0,1).toUpperCase();
                        cityDes=firstChar+getCityDesVal.slice(1,strlen);
                        break;
                }
                self.cityDesInfo = cityDes;
                var speedName = "---";
                var speedVal = data.wind.speed;
                self.windVal = speedName+" "+speedVal;
                var directionName = "---";
                var directionVal = data.wind.deg;
                self.windDirection = directionName+" ("+directionVal+" )";
                self.cloudsName = "---";
                var pressureVal = data.main.pressure;
                self.Pressure = pressureVal+" hpa";
                var humidityVal = data.main.humidity;
                self.Humidity = humidityVal+" %";
                var getSunrise = new Date((data.sys.sunrise)*1000);
                var getSunset = new Date((data.sys.sunset)*1000);
                self.sunrise = getSunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
                self.sunset = getSunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
                self.coordlon = data.coord.lon;
                self.coordlat = data.coord.lat;
                self.geoCoords = "["+self.coordlon+", "+self.coordlat+"]";
            }            	
    	};

	}]);

})();