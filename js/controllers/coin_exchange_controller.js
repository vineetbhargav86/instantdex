'use strict';

Instantdex.controller('CoinExchangeController', function($scope, $state, GlobalServices, naclAPI, naclCommon, $stateParams){
    naclCommon.onload();
    $scope.combinedor1by1 = false;
    $scope.coinslist = GlobalServices.getCoinTypes();

    $scope.credsAvailableExchanges = GlobalServices.credsAvailableExchanges;
    $scope.coinsValidExchanges = GlobalServices.coinsValidExchanges;

console.log('exchange_coins', GlobalServices.exchange_coins);
console.log('coinsValidExchanges', GlobalServices.coinsValidExchanges);
console.log('exchangeWithApiCreds', GlobalServices.exchangeWithApiCreds);

    $scope.coinType1 = $stateParams.coinType1 || "";
    $scope.coinType2 = $stateParams.coinType2 || "";
    
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

    // check if coin type 1 not equal to coin type 2
    $scope.$watch("coinType1", function(newVal, oldVal) {
        if(newVal && newVal === $scope.coinType2) {
            $scope.coinType1 = oldVal;
        };
    });

    // check if coin type 2 not equal to  coin type 1
    $scope.$watch("coinType2", function(newVal, oldVal) {
        if(newVal && newVal === $scope.coinType1) {
            $scope.coinType2 = oldVal;
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