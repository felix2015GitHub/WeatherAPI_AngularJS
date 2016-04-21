"use strict";
/*
(function(){

}())
*/
var Ctrl = function($scope){
	$scope.skills = [];
 
	$scope.skill = '';
	$scope.submit = function(){
		if(!!$scope.skill) {
			$scope.skills.push($scope.skill);
		}
		$scope.skill = '';
	}
};