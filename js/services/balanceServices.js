'use strict';

Instantdex.service('BalanceServices', function($http, $q, GlobalServices){
  var balService = this;  
  this.allCoins = [];
  
  this.exchangeBalanceData = [];
  this.credsAvailableExchanges = [];
  this.exchangeNames = [];
  this.exchangeWiseList = [];
  this.tempCoinBalance = 0;
  this.totalBtcCoinBalance = 0;
  this.totalNxtCoinBalance = 0;


    function initialize(){
        balService.exchangeWiseList = GlobalServices.exchange_coins;
        var exchangeNames = [];
        for(var i in balService.exchangeWiseList){
            balService.exchangeNames.push({'name': balService.exchangeWiseList[i].exchange, 'id': parseInt(i), 'isChecked':false, 'coinDetails':[]});  
        }
    }


    this.getCoinsOfExchangesWithApiCreds = function(e){
    var tempCoins = [];
    for(var i in e){
        for(var j in balService.exchangeWiseList){
          if(balService.exchangeWiseList[j].exchange == e[i]){
            tempCoins = [];
            GlobalServices.buildUniqueCoinsList(balService.exchangeWiseList[j].coins, tempCoins);
            balService.allCoins = angular.extend(balService.allCoins, tempCoins);
            balService.credsAvailableExchanges.push({'exchange': balService.exchangeWiseList[j].exchange, 'coins':balService.allCoins});
          }
        }
    }
    console.log('BalanceService credsAvailableExchanges', balService.credsAvailableExchanges);
  }
 
 

  this.getBalanceOfCoinForExchange = function(exchange, coin){
    console.log("calling Balance API");
    var request = '{\"agent\":\"InstantDEX\",\"method\":\"balance\",\"exchange\":\"'+exchange+'\",\"base\":\"'+coin+'\"}';
    var callback = function(req, res){
      var data = res.data;
      for(var i in balService.exchangeNames){
        if(!data.hasOwnProperty('error') && balService.exchangeNames[i].name === req.exchange){
            balService.exchangeNames[i].coinDetails.push({"balance": data.balance, "coin": req.base});
            if(req.base === "BTC"){
                balService.totalBtcCoinBalance += data.balance;
            }else if(req.base === "NXT"){
                balService.totalNxtCoinBalance += data.balance;
            }else{
                balService.tempCoinBalance += data.balance;
            }
        }
      }
    }
    GlobalServices.makeRequest(request, callback);
  }

  this.initBalanceCall = function(e){
       console.log('initializing......')
       initialize();
       this.getCoinsOfExchangesWithApiCreds(e);   
       for(var i in this.credsAvailableExchanges){
          for(var j in this.credsAvailableExchanges[i].coins){
            this.getBalanceOfCoinForExchange(this.credsAvailableExchanges[i].exchange, this.credsAvailableExchanges[i].coins[j]);
           }
       }
 } 
});