// var app = angular.module('sunspecdata', []);

var app = angular.module('sunspecdata', [], function($httpProvider) {
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
});

app.controller('sunspecdataController', function($scope, $http, $window, $interval) {
	
	$scope.checkAll = function () {
		if ($scope.selectedAll) {
		    $scope.selectedAll = true;
		} else {
		    $scope.selectedAll = false;
		}
		for (row_idx in $scope.rows){
			$scope.rows[row_idx].boxselect = $scope.selectedAll;
		}
   	};
	$scope.getSunspecData = function(){	
		$http.get("sunspecdata").then(function(response){
			$scope.rows = response.data;
			for (row_idx in $scope.rows){
				if ($scope.rows[row_idx].sf != null){
					$scope.rows[row_idx].value = $scope.rows[row_idx].value*Math.pow(10,$scope.rows[row_idx].sf);
					$scope.rows[row_idx].value = ($scope.rows[row_idx].value).toFixed(3);
				}
			}
			console.log(response);
		});
	};	
	$scope.btnDatalogStart = function(){
		$scope.sunspecdatapoll = $interval($scope.getSunspecData, 1000);
		$http.post('btnDatalogStart/', Date.now()).then(function(response){
			console.log(response.status)
		});
		$scope.stopFlag = true;
	};
	$scope.btnDatalogStop = function(){
		$interval.cancel($scope.sunspecdatapoll);
		$http.post('btnDatalogStop/', "STOP").then(function(response){
			console.log(response)
		});
		$scope.stopFlag = false;
	};
	$scope.btnDatalogDownload = function(){
		$http.post('btnDatalogDownload/', $scope.rows).then(function(response){
			console.log(response)
		});
	};
	$scope.btnEdit = function(row_idx){
		$scope.editflags[row_idx]=true;
	};
	$scope.btnClear = function(row_idx){
		$scope.inputs[row_idx] = '';
		$scope.editflags[row_idx]=false;
	};
	$scope.btnSubmit = function(row_idx){
		$scope.editflags[row_idx]=false;
		if ($scope.inputs[row_idx] == null || $scope.inputs[row_idx] == ''){
			alert(" ######## SUBMIT ERROR ######## \n       Please input some data first\n ############################\# ");
			return;
		}else{
			alert("Submit Success");
		}
		$http.post('btnSubmit/', $scope.inputs[row_idx]).then(function(response){
			console.log(response)
		});
		$scope.inputs[row_idx] = '';
	};
	$scope.btnGraphMultiple = function(){
		for (row_idx in $scope.rows){
				$scope.rows[row_idx].boxselect = false;
		$scope.selectedAll = false;
		}
		$http.post('btnGraphMultiple/', $scope.rows).then(function(response){
			console.log(response)
		});
		$window.open('__blank');
	};

	$scope.sunspecdatapoll = 0;
	$scope.editflags = [];
	//FIX THIS: The editflags array is defined to be of arbitrarily large size and initialized to false.
	//Ideally size of this array needs to be only as big as the number of rows in the table.
	for (i=0; i<100;i++){
		$scope.editflags[i] = false;
	}
	$scope.inputs = []
	$scope.stopFlag = false;
	$scope.selectedAll = false;
	$scope.options=['10s', '1s', '100ms', '10ms']

});
