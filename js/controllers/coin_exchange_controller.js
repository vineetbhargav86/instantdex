'use strict';

Instantdex.controller('CoinExchangeController', function($scope, $state, GlobalServices, naclAPI, naclCommon, $interval){
    naclCommon.onload();
    $scope.combinedor1by1 = false;
    $scope.coinslist = GlobalServices.getCoinTypes();

    $scope.coinType1 = "";
    $scope.coinType2 = "";
    $scope.avePriceResponse = {};
    $scope.exchCoinsTable = [];

    $scope.buildExchCoinsTable = function(){
        for(var i in GlobalServices.exchangeWithApiCreds){
            // $scope.callAvePriceApi(GlobalServices.exchangeWithApiCreds[i], $scope.relcoin, basevolume);
            $scope.getBalanceOfCoinForExchange(GlobalServices.exchangeWithApiCreds[i], $scope.coinType2);
            $scope.exchCoinsTable.push({"exchange": GlobalServices.exchangeWithApiCreds[i], "price": $scope.avePriceResponse.aveprice, "amount":0, "balanceB":"", "totalA":"", "apicredsset": ""})
            //call some api and get price for coinA
        }
    }
    $scope.buildExchCoinsTable();

    $scope.getBalanceOfCoinForExchange = function(exchange, coin){
        for(var i in $scope.exchCoinsTable){
            var balFetched = BalanceServices.isBalanceFetchedRecently($scope.exchCoinsTable[i].exchange, coin);
            if(!balFetched["recent"]){
                $scope.callBalanceAPi(exchange, coin);
                BalanceServices.exchangeNames[balFetched["ind1"]].coinDetails[balFetched["ind2"]] = (new Date()).getTime();
            }
            else{
                $scope.exchCoinsTable[i].balanceB = BalanceServices.exchangeNames[balFetched["ind1"]].coinDetails[balFetched["ind2"]].balance;
            }
        }
    }

    //get balance for each exchange for selected coin with balance api
    $scope.callBalanceAPi = function(exchange, coin){
        var request = '{\"agent\":\"InstantDEX\",\"method\":\"balance\",\"exchange\":\"'+exchange+'\",\"base\":\"'+coin+'\"}';
        var callback = function(req, res){
            var data = res.data;
            // $scope.exchangeBalanceData = [];
            for(var j in $scope.exchCoinsTable){
                if($scope.exchCoinsTable[j].exchange == req.exchange){
                    $scope.exchCoinsTable[j].balanceB = data.balance;
                    break;
                }
            }
        }
        GlobalServices.makeRequest(request, callback);
    }

    $scope.callAvePriceApi = function(basevolume){
        var request = '{\\\"agent\\\":\\\"tradebot\\\",\\\"method\\\":\\\"aveprice\\\",\\\"comment\\\":\\\"\\\",\\\"base\\\":\\\"'+$scope.coinType1+'\\\",\\\"rel\\\":\\\"'+$scope.coinType2+'\\\",\\\"basevolume\\\":\\\"'+basevolume+'\\\""}';
        var callback = function(req, res){
            $scope.avePriceResponse = res;
        }
        GlobalServices.makeRequest(request, callback);
    }

    $interval(function(){//Call average api every 1 minute as it keeps changing
        $scope.callAvePriceApi(1);
    }, 60000);

    $scope.switchToCombinedOr1By1 = function(){
        if($scope.combinedor1by1){
            $state.go('coin_exchange1by1');
        }
        else{
            $state.go('coin_exchange');
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

    $scope.toggleAmoutInput = function(){
        $scope.showAmountInput = !$scope.showAmountInput;
    }

});