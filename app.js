(function(){

    var currentCity = 'London',
        currentDays = 7,
        selectPage = 'days',
        month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	var app = angular.module('weather', []);

    app.directive('myTabs', function(){
        return {
            restrict: 'E',
            transclude: true,
            scope: {},
            controller: ['$scope', function($scope) {
                var panes = $scope.panes = [];

                $scope.select = function(pane) {
                    angular.forEach(panes, function(pane) {
                        pane.selected = false;
                    });
                    pane.selected = true;
                };

                this.addPane = function(pane) {
                    if (panes.length === 0) {
                        $scope.select(pane);
                    }
                    panes.push(pane);
                    angular.forEach(panes, function(pane) {
                        if(pane.title=="Next Days"){
                            pane.selected = true;
                        }else{
                            pane.selected = false;
                        }
                    });
                };
            }],
            templateUrl: 'my-tabs.html'
        };
    });

    app.directive('myPane', function() {
        return {
            require: '^^myTabs',
            restrict: 'E',
            transclude: true,
            scope: {
                title: '@'
            },
            link: function(scope, element, attrs, tabsCtrl) {
                tabsCtrl.addPane(scope);
            },
            templateUrl: 'my-pane.html'
        };
    });

	app.controller('TabController', ['$http', function($http){

		var self = this;
		self.cityData = '';
		self.daysData = '';
        self.tabPool = {city: false, days:true};
        self.showDaysPool = [];
        self.selectCity = currentCity;
        self.cityPool = ["Taipei", "NewYork", "London"];
        self.selectDays = currentDays;
        self.daysPool = [5, 7, 16];
        self.time = new Date();

        self.tabList = [
            {name: "Current City", select: false, tag:"city"},
            {name: "Next Days", select: true, tag:"days"}
        ];

        self.typeList = [
            {val: "xml", text: "XML"},
            {val: "json", text: "JSON"}
        ];

		getCurrentCityData();
		getNextDaysData();

        self.daysChange = function(){
            currentDays = self.selectDays;
            getNextDaysData();
        };

        self.cityChange = function(){
            currentCity = self.selectCity;
            getCurrentCityData();
            getNextDaysData();
        };
/*
        self.showPage = function(id){
            self.tabPool[selectPage] = false;
            self.tabPool[id] = true;
            selectPage = id;
        };
*/
		function getCurrentCityData(){
            var apiURLcity = "http://api.openweathermap.org/data/2.5/weather?q="+currentCity+"&mode=xml&units=metric&appid=8b5e25806eda1463bbfb1ce83b50c4e9";
            $http.get(apiURLcity).then(function(response){              
                var xml2json = new X2JS();
                var getData = xml2json.xml_str2json(response.data);
                self.cityInfo = getData.current;
            });
	    };

	    function getNextDaysData(url){
            var apiURLdays = "http://api.openweathermap.org/data/2.5/forecast/daily?q="+currentCity+"&mode=xml&units=metric&cnt="+currentDays+"&appid=8b5e25806eda1463bbfb1ce83b50c4e9";
            $http.get(apiURLdays).then(function(response){
                var xml2json = new X2JS();
                var getData = xml2json.xml_str2json(response.data);
                self.nextDaysInfo = getData.weatherdata.forecast.time;
            });
	    };
/*
		self.getNodeValue = function(data, xpath){
        	var nodes = data.evaluate(xpath, data, null, XPathResult.ANY_TYPE, null);
        	return nodes.iterateNext().nodeValue;
    	};
*/
	}]);

})();