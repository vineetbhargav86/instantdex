'use strict';

Instantdex.controller('CoinExchangeController', function($scope, $state, GlobalServices, naclAPI, naclCommon, $stateParams, BalanceServices){
    naclCommon.onload();
    $scope.combinedor1by1 = false;
    $scope.coinslist = GlobalServices.getCoinTypes();

    $scope.credsAvailableExchanges = GlobalServices.credsAvailableExchanges;
    $scope.coinsValidExchanges = GlobalServices.coinsValidExchanges;

    $scope.coinType1 = $stateParams.coinType1 || "";
    $scope.coinType2 = $stateParams.coinType2 || "";
    
    $scope.selectedCoinsBalance = {};

    $scope.switchToCombinedOr1By1 = function(){
        if($scope.combinedor1by1){
            $state.go('coin_exchange1by1', {
                coinType1: $scope.coinType1,
                coinType2: $scope.coinType2
            });
        }
        else{
            $state.go('coin_exchange', {
                coinType1: $scope.coinType1,
                coinType2: $scope.coinType2
            });
        }
    }

    var checkBalanceForCoin = function(coinName) {
        if( !coinName) return true;

        var exchangeNames = angular.copy(BalanceServices.exchangeNames);
        var hasBalance = false;

        for(var i=0;i<exchangeNames.length;i++) {
            var coinDetails = exchangeNames[i].coinDetails || [];
            if(coinDetails.length) {
                for(var j=0; j<coinDetails.length; j++) {
                    if(coinDetails[j].coin === coinName) {
                        hasBalance = true;
                        $scope.selectedCoinsBalance[coinName] = { 
                            balance: coinDetails[j].balance,
                            exchange: exchangeNames[i].name
                        };
                    };
                };
            }
        };

        return hasBalance;
    };
    checkBalanceForCoin($scope.coinType1);
    checkBalanceForCoin($scope.coinType2);

    var deleteNonSelectedCoins = function() {
        for(var prop in $scope.selectedCoinsBalance) {
            if(prop !== $scope.coinType1 && prop !== $scope.coinType2)
                delete $scope.selectedCoinsBalance[prop];
        };
    };

    // check if coin type 1 not equal to coin type 2
    $scope.$watch("coinType1", function(newVal, oldVal) {
        if(newVal === oldVal) return;

        if(newVal && newVal === $scope.coinType2) {
            $scope.coinType1 = oldVal;
        };
        deleteNonSelectedCoins();

        if(!checkBalanceForCoin(newVal) && !Object.keys($scope.selectedCoinsBalance).length) {
            $scope.coinType1 = '';  
        };
        
    });

    // check if coin type 2 not equal to  coin type 1
    $scope.$watch("coinType2", function(newVal, oldVal) {
        if(newVal === oldVal) return;

        if(newVal && newVal === $scope.coinType1) {
            $scope.coinType2 = oldVal;
        };
        deleteNonSelectedCoins();

        if( !checkBalanceForCoin(newVal) && !Object.keys($scope.selectedCoinsBalance).length) {
            $scope.coinType2 = '';  
        };
        
    });

    $scope.exchangeCoinsTypes = function(event){
        event.preventDefault();
        var temp = $scope.coinType1;
        $scope.coinType1 = $scope.coinType2;
        $scope.coinType2 = temp;
    }

    $scope.preventDefault = function(event){
        event.preventDefault();
    }
});