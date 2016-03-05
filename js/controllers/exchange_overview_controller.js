'use strict';

Instantdex.controller('ExchangeOverviewController', function($scope,$state, $http, ngDialog, InstantdexServices, GlobalServices, BalanceServices){
  $scope.allCoins = [];
  $scope.exchangeBalanceData = [];
  $scope.credsAvailableExchanges = angular.copy(BalanceServices.credsAvailableExchanges);
  $scope.exchangeNames = angular.copy(BalanceServices.exchangeNames);
  //$scope.exchangeNames = [];
  $scope.totalOtherCoinBalance = angular.copy(BalanceServices.tempCoinBalance);
  $scope.totalBTC = angular.copy(BalanceServices.totalBtcCoinBalance);
  $scope.totalNXT = angular.copy(BalanceServices.totalNxtCoinBalance);
  $scope.exchangeWiseList =  angular.copy(GlobalServices.exchange_coins);

  
  // $scope.initialize = function(){
  //       for(var i in $scope.exchangeWiseList){
  //          $scope.exchangeNames.push({'name': $scope.exchangeWiseList[i].exchange, 'id': parseInt(i), 'isChecked':false, 'coinDetails':[]});  
  //       }
  // }

  // if($scope.exchangeNames.length == 0){
  //   console.log("after seting api cred");
  //   var a = angular.copy(GlobalServices.exchangeWithApiCreds);
  //   $scope.initialize();
  //   BalanceServices.initBalanceCall(a);
  // }

  $scope.checkboxChanged = function(id){
    $scope.exchange = $scope.exchangeNames[id].name;
    for(var i in $scope.credsAvailableExchanges){
      if($scope.credsAvailableExchanges[i].exchange != $scope.exchangeNames[id].name){
        $scope.exchangeNames[id].isChecked = false;
      }
    }
  }


}).filter('firstUpper', function() {
     return function(input, scope) {
         return input ? input.substring(0,1).toUpperCase()+input.substring(1).toLowerCase() : "";
     }
});
