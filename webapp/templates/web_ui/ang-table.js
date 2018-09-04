// var app = angular.module('sunspecdata', []);

var app = angular.module('sunspecdata', ["ngSanitize", "ngCsv"], function($httpProvider) {
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
});

app.controller('sunspecdataController', function($scope, $http, $window, $interval, $timeout) {
	time_format = function (d) {
	    year = d.getFullYear();
	    month = d.getMonth()+1;
	    date = d.getDate();
	    hours = format_two_digits(d.getHours());
	    minutes = format_two_digits(d.getMinutes());
	    seconds = format_two_digits(d.getSeconds());
	    return year+"_"+month+"_"+date+"_"+hours+"_"+minutes+"_"+seconds;
	};
	format_two_digits = function (n) {
    		return n < 10 ? '0' + n : n;
	};	
	$scope.checkAll = function () {
		if ($scope.selectedAll) {
		    $scope.selectedAll = true;
		} else {
		    $scope.selectedAll = false;
		}
		for (row_idx in $scope.rows){
			$scope.boxselect[row_idx] = $scope.selectedAll;
		}
   	};
	$scope.getSunspecData = function(){	
		$http.get("sunspecdata").then(function(response){
			$scope.rows = response.data;
			for (row_idx in $scope.rows){
				//$scope.raw_db.push($scope.rows[row_idx]);
				if ($scope.rows[row_idx].sf != null){
					$scope.rows[row_idx].value = $scope.rows[row_idx].value*Math.pow(10,$scope.rows[row_idx].sf);
					$scope.rows[row_idx].value = ($scope.rows[row_idx].value).toFixed(3);
				}
			}
			
			console.log(response);
		}
		/*,function(response){
			console.log(response)
			if (response.status == -1){
				$interval.cancel($scope.sunspecdatapoll)
				alert("SunSpec web server is no longer available. Please restart server.")
			}
			if (response.status == 500){
				alert("Internal Server Error. Please fix isssue in server.")
			}
			if (response.status == 503){
				$interval.cancel($scope.sunspecdatapoll)
			}
		}*/);
	};	
	$scope.btnDatalogStart = function(){
		d = new Date();
		datetext = time_format(d);
		$scope.timestamp = datetext;
		callAtInterval = function(){
			$scope.sunspecdatapoll = $interval($scope.getSunspecData, $scope.period);
		}
		$timeout(callAtInterval, 1000);
		$http.get('getServerName/').then(function(response){
			$scope.server_name = response.data
		})
		$http.post('btnDatalogStart/', Date.now()).then(function(response){
			alert(response.data)
			$scope.btnDatalogStop()
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
		console.log($scope.raw_db)
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
			alert("######## SUBMIT ERROR ######## \n"+
			      "Please input some data first\n"  +
			      "############################## ");
			return;
		}
		submitObject = [{id : $scope.rows[row_idx].id, value:$scope.inputs[row_idx]}];
		$http.post('btnSubmit/',submitObject).then(function(response){
			console.log(response)
			if (response.data == 0){
				alert("Submit Success!!")
			}else{
				alert("######## ValueError ######## \n"+
				      "Input Value must be in allowable range of datatype\n"+
				      "############################ ");
			}
		});
		$scope.inputs[row_idx] = '';
	};
	$scope.btnGraphMultiple = function(){
		chart_vars = ''
		for (row_idx in $scope.rows){
			if ($scope.boxselect[row_idx] == true && $scope.rows[row_idx].type != 'string'){
				chart_vars = chart_vars + $scope.rows[row_idx].id + '-'
			}
				$scope.boxselect[row_idx] = false;
		$scope.selectedAll = false;
		}
		//$http.get('renderGraph').then(function(response){
		//	console.log(response)
		//});
		$window.open('chart.html/'+chart_vars);
	};

	$scope.sunspecdatapoll = 0;
	$scope.editflags = [];
	$scope.boxselect = [];
	$scope.server_name = '--'
	//FIX THIS: The editflags array is defined to be of arbitrarily large size and initialized to false.
	//Ideally size of this array needs to be only as big as the number of rows in the table.
	for (i=0; i<100;i++){
		$scope.editflags[i] = false;
		$scope.boxselect[i] = false;
	}
	$scope.raw_db = [{timstamp:'timestamp',id:'id',value:'value',sf:'sf',units:'units',type:'type',access:'access'}];
	$scope.csv_header = [];
	//$scope.raw_db = [];
	$scope.inputs = [];
	$scope.stopFlag = false;
	$scope.selectedAll = false;
//	$scope.options = [{id:1, value:10000},{id:2, value:1000}];
	$scope.options= [10000,1000,500]
	$scope.period= $scope.options[1];
});



