'use strict';

Instantdex.controller('CoinExchangeController', function($scope, $state, naclAPI, naclCommon, $stateParams, GlobalServices, BalanceServices, $interval, $timeout){
    naclCommon.onload();
    $scope.combinedor1by1 = false;
    $scope.timerOn = false;
    $scope.credsAvailableExchanges = GlobalServices.credsAvailableExchanges;
    $scope.coinsValidExchanges = GlobalServices.coinsValidExchanges;

    $scope.exchangeWithApiCreds = GlobalServices.exchangeWithApiCreds;
    
    console.log("coinsValidExchanges: "+GlobalServices.coinsValidExchanges);

    $scope.coinType1 = $stateParams.coinType1 || "";
    $scope.coinType2 = $stateParams.coinType2 || "";

    $scope.loadingAvePrice = false;

    $scope.selectedCoinsBalance = {};

    $scope.orderHistory = [];

    GlobalServices.getOrderHistory($scope.exchangeWithApiCreds)
        .then(function(orderHistory) {
            $scope.orderHistory = orderHistory;
        });

    $scope.avePriceResponse = {};
    $scope.exchCoinsTable = [];
    $scope.showAmountInput= [];
    // $scope.exchangesList = [];

    $scope.$watch($scope.avePriceResponse, function(){
        for(var i in $scope.exchCoinsTable){
            $scope.exchCoinsTable[i].price = $scope.avePriceResponse.aveprice;
        }
    });

    $scope.$on("newExchangeApiCredAdded", function(event, data){
        $scope.buildExchCoinsTable();
    });

    $scope.areExchCredsAvailable = function(exchange){
        if(GlobalServices.exchangeWithApiCreds.indexOf(exchange) != -1){
            return true;
        }
        return false;
    }
    // $scope.initializeExchangeList = function(){
    //     var tempList = [];
    //     for(var i in GlobalServices.exchangeDetails){
    //         if($scope.areExchCredsAvailable(GlobalServices.exchangeDetails[i])){
    //             $scope.exchangesList.push({"exchange": GlobalServices.exchangeDetails[i], "coinType1":"", "apicredsset": true});
    //         }
    //         else{
    //             tempList.push({"exchange": GlobalServices.exchangeDetails[i], "coinType1":"", "apicredsset": false});
    //         }
    //     }
    //     angular.extend($scope.exchangesList, tempList);
    // };
    // $scope.initializeExchangeList();

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

    $scope.getBalanceOfCoinForExchange = function(){
        for(var i in $scope.exchCoinsTable){
            var balFetched = BalanceServices.isBalanceFetchedRecently($scope.exchCoinsTable[i].exchange, $scope.coinType2);
            if(typeof(balFetched) != "undefined"){
                if(!balFetched["recent"]){
                    $scope.callBalanceAPi($scope.exchCoinsTable[i].exchange, $scope.coinType2);
                    BalanceServices.exchangeNames[balFetched["ind1"]].coinDetails[balFetched["ind2"]].loadtime = (new Date()).getTime();
                }
                else{
                    $scope.exchCoinsTable[i].balanceB = BalanceServices.exchangeNames[balFetched["ind1"]].coinDetails[balFetched["ind2"]].balance;
                }
            }
        }
    }

    $scope.getIndexOfExchangeInCoinExchangeList = function(exchange){
        for(var i in $scope.exchCoinsTable){
            if($scope.exchCoinsTable[i].exchange == exchange){
                return i;
            }
        }
        return -1;
    }

    $scope.buildExchCoinsTable = function(){
        if($scope.coinType2 != "" && $scope.coinType2 != $scope.coinType1){
            var j = 0;
            for(var i in GlobalServices.exchangeDetails){
                j = $scope.getIndexOfExchangeInCoinExchangeList(GlobalServices.exchangeDetails[i]);
                if(j != -1){
                    $scope.exchCoinsTable[j].price = $scope.avePriceResponse.aveprice;
                    $scope.exchCoinsTable[j].apicredsset = $scope.areExchCredsAvailable(GlobalServices.exchangeDetails[i]);
                }
                else{
                    $scope.exchCoinsTable.push({"exchange": GlobalServices.exchangeDetails[i], "price": $scope.avePriceResponse.aveprice, "amount":0, "balanceB":"", "totalA":"", "apicredsset": $scope.areExchCredsAvailable(GlobalServices.exchangeDetails[i])});
                }
                // $scope.getBalanceOfCoinForExchange(GlobalServices.exchangeDetails[i], $scope.coinType2);
                // $scope.callAvePriceApi(1);
                // $timeout(function(){
                //     $scope.callAvePriceApi(1);
                //     $scope.loadingAvePrice = false;
                // }, 5000);
            }
        }
    }

    $scope.callAvePriceApi = function(basevolume){
        if($scope.coinType1 == "" || $scope.coinType2 == ""){
            return;
        }
        var request = '{\"agent\":\"tradebot\",\"method\":\"aveprice\",\"comment\":\" \",\"base\":\"'+$scope.coinType1+'\",\"rel\":\"'+$scope.coinType2+'\",\"basevolume\":\"'+basevolume+'\"}';
        var callback = function(req, res){
            $scope.avePriceResponse = res.data;
            for(var j in $scope.exchCoinsTable){                
                $scope.exchCoinsTable[j].price = res.data.aveprice;
            }
            $scope.loadingAvePrice = false;
        }
        GlobalServices.makeRequest(request, callback);
    }

    $scope.callReCallAvePriceApi = function(){
        $scope.callAvePriceApi(1);
        $scope.loadingAvePrice = true;
        $timeout(function(){
            $scope.callAvePriceApi(1);
        }, 6000);
    }

    $scope.buildExchCoinsTable();

    if($stateParams.coinType1 && $stateParams.coinType2){
        $scope.callReCallAvePriceApi();
    }

    $scope.getBalanceOfCoinForExchange();

    console.log("All exchages coins :"+ JSON.stringify(GlobalServices.exchange_coins));

    $scope.$on("newExchangeApiCredAdded", function(event, data){
        $scope.buildExchCoinsTable();
    });

    $interval(function(){//Call average api every 1 minute as it keeps changing
        $scope.loadingAvePrice = true;
        $scope.callAvePriceApi(1);
    }, 60000);

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
        $scope.coinsChanged();
    }

    $scope.preventDefault = function(event){
        event.preventDefault();
    }

    $scope.toggleAmoutInput = function(index){
        $scope.showAmountInput[index] = !$scope.showAmountInput[index];
    }

    $scope.coinsChanged = function(){
        $scope.buildExchCoinsTable();
        if($scope.coinType2 == "" || $scope.coinType1 == "" || ($scope.coinType2 == $scope.coinType1)){
            return false;
        }
        $scope.callReCallAvePriceApi();
    }

    $scope.goToOptionsAddCreds = function(event, exchange){
        event.preventDefault();
        $state.go('options', {
            "exchange": exchange
        });
    }
    
    $scope.timerStart = function(){
      
      var endtimeSeconds = 5; 
      var endtime = Date.now() + endtimeSeconds*1000 + 1999; 
     
      var myTimer = $interval(function(){startTimer();}, 1000);
      
     function startTimer(){
        var differ = endtime - Date.now();
        if(differ<999)
          stopTimer();
       else{
        var sec = Math.floor( (differ/1000) % 60 );
        var min = Math.floor( (differ/1000/60) % 60 ); 
        if(min<10) min = '0'+min;
        if(sec<10) sec = '0'+sec;
        $scope.timer = min+':'+sec;
       $scope.timerOn = true;
       }
      };
      
      function stopTimer(){
        if(angular.isDefined(myTimer)){
          $interval.cancel(myTimer);
          myTimer = undefined;
          $scope.timerOn = false;
        }
      };
      
    };

});