'use strict';

Instantdex.controller('CoinExchangeController', function($scope, $state, GlobalServices, naclAPI, naclCommon, $stateParams){
    naclCommon.onload();
    $scope.combinedor1by1 = false;
    $scope.coinslist = GlobalServices.getCoinTypes();
console.log('');
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