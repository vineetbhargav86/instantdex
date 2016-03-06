'use strict';

Instantdex.controller('ExchangeOverviewController', function($scope, $state,
    $http, ngDialog, InstantdexServices, GlobalServices,
    BalanceServices, $interval) {
    $scope.credsAvailableExchanges = angular.copy(BalanceServices.credsAvailableExchanges);
    $scope.exchangeNames = BalanceServices.exchangeNames;
    $scope.totalsTable = BalanceServices.totalsTable;
    $scope.selectAll = function() {
        $scope.exchangeNames.forEach(function(e) {
            if ($scope.selectedAll) {
                e.isChecked = true;
            } else {
                e.isChecked = false;
            }
        })
    }
    $scope.initialize = function() {
        if ($scope.exchangeNames.length == 0) {
            console.log("after seting api cred");
            BalanceServices.initBalanceCall();
        }
    }
    $scope.initialize();
    console.log("Total Table", $scope.totalsTable)
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
}).filter('firstUpper', function() {
    return function(input, $scope) {
        return input ? input.substring(0, 1).toUpperCase() + input.substring(
            1).toLowerCase() : "";
    }
});