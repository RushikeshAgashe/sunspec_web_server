var app = angular.module('chartApp', function($httpProvider) {
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
});

app.controller('chartController', function($scope, $http, $window, $interval, $timeout) {

	var dps = [];
	dps[0] = [];
	dps[1] = [];
	$scope.chart = new CanvasJS.Chart("chartContainer", {
		exportEnabled: true,
		backgroundColor: "#F5F5DC",
		zoomEnabled: true,
		zoomType: "xy",
		//axisY:{
		//   viewportMinimum: 0,
		//   viewportMaximum: 50
		//},
		title :{
			fontFamily: "tahoma",
			padding: 20,
			text: "Data Graph"
		},
		axisY: {
			includeZero: false
		},
		data: [
		{
			type: "spline",
			markerSize: 0,
			showInLegend: true,
			dataPoints: dps[0]
		},
		{
			type: "spline",
			showInLegend: true,
			markerSize: 0,
			dataPoints: dps[1]
		}]
	});
	
	dpsInit = function(){
		$http.get("chartdata").then(function(response){
			$scope.dpsLength = response.data.length;
			for (row_idx in response.data){
				console.log(row_idx)	
			//	dps[row_idx] = [];
				console.log(dps);
				new_series = {
					type: "spline",
					markerSize: 0,
					showInLegend: true,
					datapoints: dps[row_idx]
				};
				$scope.chart.options.data.push(new_series);
			}
			console.log($scope.chart.options)
		});
	};

	$scope.getChartData = function(){
                $http.get("chartdata").then(function(response){
                        $scope.rows = response.data;
                        for (row_idx in $scope.rows){
                                $scope.raw_db.push($scope.rows[row_idx]);
                                if ($scope.rows[row_idx].sf != null){
                                        $scope.rows[row_idx].value = $scope.rows[row_idx].value*Math.pow(10,$scope.rows[row_idx].sf);
                                        $scope.rows[row_idx].value = ($scope.rows[row_idx].value).toFixed(3);
                                }
				dps[row_idx].push({
					x: 	new Date().getTime()/1000 - OFFSET,
					y: parseFloat($scope.rows[row_idx].value)
				});
				console.log($scope.rows[row_idx].timestamp);
                        }
			xVal++;	
                        //console.log(response);
                });
        };
	OFFSET = new Date().getTime()/1000
	dpsInit();
	$scope.chartdatapoll = $interval($scope.getChartData, 200);
	$scope.raw_db = [{timstamp:'timestamp',id:'id',value:'value',sf:'sf',units:'units',type:'type',access:'access'}];
	var xVal = 0;
	var yVal = 100;
	var updateInterval = 100;
	var dataLength = 500; // number of dataPoints visible at any point

	var updateChart = function (count) {
		for (dps_idx in dps){
			if (dps[dps_idx].length > dataLength) {
				dps[dps_idx].shift();
			}
		}
		$scope.chart.render();
	};

	updateChart(dataLength); 
	setInterval(function(){ updateChart() }, updateInterval); 
});

