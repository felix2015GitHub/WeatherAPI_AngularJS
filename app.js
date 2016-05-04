(function(){

    var URL_CITY = "http://api.openweathermap.org/data/2.5/weather",
        URL_DAYS = "http://api.openweathermap.org/data/2.5/forecast/daily",
        APP_KEY = "8b5e25806eda1463bbfb1ce83b50c4e9",
        currentCity = 'London',
        currentDays = 7;

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
                    if(pane.attr == "show"){
                        $scope.select(pane);
                    }
                    panes.push(pane);
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
                title: '@',
                attr: '@'
            },
            link: function(scope, element, attrs, tabsCtrl) {
                tabsCtrl.addPane(scope);
            },
            templateUrl: 'my-pane.html'
        };
    });

	app.controller('TabController', ['$http', function($http){

		var self = this;
        self.selectCity = currentCity;
        self.cityPool = ["Taipei", "NewYork", "London"];
        self.selectDays = currentDays;
        self.daysPool = [5, 7, 16];
        self.time = new Date();

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

		function getCurrentCityData(){
            $http.get(URL_CITY, {
                params: {
                    q:currentCity,
                    mode:"xml",
                    units:"metric",
                    appid:APP_KEY
                }
            }).then(function(response){
                var xml2json = new X2JS();
                var getData = xml2json.xml_str2json(response.data);
                self.cityInfo = getData.current;
            });
	    };

	    function getNextDaysData(url){
            $http.get(URL_DAYS, {
                params: {
                    q:currentCity,
                    mode:"xml",
                    units:"metric",
                    cnt:currentDays,
                    appid:APP_KEY 
                }
            }).then(function(response){
                var xml2json = new X2JS();
                var getData = xml2json.xml_str2json(response.data);
                self.nextDaysInfo = getData.weatherdata.forecast.time;
            });
	    };

	}]);

})();