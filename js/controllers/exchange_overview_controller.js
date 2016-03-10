'use strict';

Instantdex.controller('ExchangeOverviewController', function($scope,$state, $http, ngDialog,InstantdexServices, GlobalServices, BalanceServices, $interval){
  
	// $scope.credsAvailableExchanges = angular.copy(BalanceServices.credsAvailableExchanges);
	$scope.exchangeNames = [];
	$scope.totalsTable = [];
	if(GlobalServices.exchangeWithApiCreds.length == 0){
		$scope.showExchangeData = false;	
	}
	else{
		$scope.showExchangeData = true;
	}
	
	// $scope.$on("newExchangeApiCredAdded", function(event, data){
	// 	$scope.exchangeNames = angular.copy(BalanceServices.exchangeNames);
	// });

	$scope.$on("newCoinBalanceAdded", function(event, data){
		$scope.exchangeNames = angular.copy(BalanceServices.exchangeNames);
	});

	$scope.$on("totalCoinBalanceUpdated", function(event, data){
		$scope.totalsTable = angular.copy(BalanceServices.totalsTable);
	});

	// $scope.$watch(BalanceServices.exchangeNames, function(){
	// 	$scope.exchangeNames = angular.copy(BalanceServices.exchangeNames);
	// 	$scope.totalsTable = angular.copy(BalanceServices.totalsTable);
	// }, true);

	$scope.selectAll =  function(){
		$scope.exchangeNames.forEach(function(e){
			if($scope.selectedAll){
				e.isChecked = true;
		  	}
		  	else{
				e.isChecked = false;
		  	}
		});
	}

	$scope.excCheckboxUpdated = function(){
		var status = true;
		$scope.exchangeNames.forEach(function(e){
			if(!e.isChecked){
				status = false;
		  	}
		  // 	else{
				// status = true;
		  // 	}
		});
		$scope.selectedAll = status;
	}

	$scope.initialize = function(){
		// if(BalanceServices.exchangeNames.length == 0){
		// 	console.log("after seting api cred");
		// 	BalanceServices.initBalanceCall();
		// }
		$scope.exchangeNames = angular.copy(BalanceServices.exchangeNames);
		$scope.totalsTable = angular.copy(BalanceServices.totalsTable);
	}
	$scope.initialize();


console.log("Total Table",  $scope.totalsTable)

// $scope.checkboxChanged = function(id){
//     $scope.exchange = $scope.exchangeNames[id].name;
//     console.log($scope.exchange);
//     console.log($scope.exchangeNames[id].coinDetails);
//     // for(var i in $scope.credsAvailableExchanges){
//     //   if($scope.credsAvailableExchanges[i].exchange != $scope.exchangeNames[id].name){
//     //     $scope.exchangeNames[id].isChecked = false;
//     //   }
//     // }
//   }


})