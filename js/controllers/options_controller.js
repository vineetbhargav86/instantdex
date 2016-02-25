'use strict';

Instantdex.controller('OptionsController', function($scope, $state, $http, ngDialog, InstantdexServices, GlobalServices){
	$scope.exchanges = GlobalServices.exchangeDetails;
    $scope.preventDefault = function(event){
        event.preventDefault();
    }

    $scope.getAllExchanges = function(){
    	var request = '{\"agent\":\"InstantDEX\",\"method\":\"allexchanges\"}';
    	var callback = function(req, res){
    		var exchanges = res.data.result;
    		var exchngObj = null;
    		for(var e in exchanges){
    			exchngObj = {};
    			exchngObj["name"] = exchanges[e];
    			exchngObj["areCredsSet"] = false;
    			exchngObj["active"] = "";
    			exchngObj["apikey"] = "";
    			exchngObj["apisecret"] = "";
    			GlobalServices.exchangeDetails.push(exchngObj);
    		}
    		$scope.exchanges = GlobalServices.exchangeDetails;
    		console.log("Exchanges"+ JSON.stringify($scope.exchanges));
    	};
    	GlobalServices.makeRequest(request, callback);
    }
    $scope.getAllExchanges();

    $scope.open = function (exchange) {
	    var modalInstance = ngDialog.open({
	      template: 'apiExchangeCredsModal.html',
	      controller: 'ApiExchangeCredsCtrl',
	      scope: $scope,
	      resolve: {
	      	exchangeDets: function () {
	      		for(var e in GlobalServices.exchangeDetails){
	    			if(GlobalServices.exchangeDetails[e]["name"] == exchange){
	    				return GlobalServices.exchangeDetails[e];
	    			}
    			}
	        }
	      }
	    });
	    modalInstance.closePromise.then(function (apiCreds) {
	    	if(typeof(apiCreds.value.apikey) != 'undefined' && typeof(apiCreds.value.apisecret) != 'undefined' && apiCreds.value.apikey != "" && apiCreds.value.apisecret != ""){
	    		$scope.apiKeyPair(apiCreds.value);
	    	}
	    });
	};

	$scope.apiKeyPair = function(apiCreds){
		var request = '{\"agent\":\"InstantDEX\",\"method\":\"apikeypair\",\"exchange\":\"'+apiCreds.exchange+
						'\",\"apikey\":\"'+apiCreds.apikey+'\",\"apisecret\":\"'+apiCreds.apisecret+'\"}';
    	var callback = function(req, res){
    		for(var e in GlobalServices.exchangeDetails){
    			console.log(res);
    			if(GlobalServices.exchangeDetails[e]["name"] == apiCreds.exchange){
    				GlobalServices.exchangeDetails[e]["areCredsSet"] = true;
    				GlobalServices.exchangeDetails[e]["apikey"] = apiCreds.apikey;
    				GlobalServices.exchangeDetails[e]["apisecret"] = apiCreds.apisecret;
    				break;
    			}
    		}
    		$scope.exchanges = GlobalServices.exchangeDetails;
    		console.log("Exchanges"+ JSON.stringify($scope.exchanges));
    	};
		GlobalServices.makeRequest(request, callback);
	}
});

Instantdex.controller('ApiExchangeCredsCtrl', function ($scope, exchangeDets) {
	$scope.apikey = exchangeDets.apikey;
	$scope.apisecret = exchangeDets.apisecret;
	$scope.exchange = exchangeDets.name;
	$scope.ok = function () {
		$scope.closeThisDialog({ apikey: $scope.apikey, apisecret: $scope.apisecret, exchange: $scope.exchange
		});
	};
});