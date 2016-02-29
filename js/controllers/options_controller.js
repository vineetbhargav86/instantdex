'use strict';

Instantdex.controller('OptionsController', function($scope, $state, $http, ngDialog, InstantdexServices, GlobalServices, ApikeyService){
	// $scope.exchanges = GlobalServices.exchangeDetails;
	$scope.exchanges = [];
    $scope.preventDefault = function(event){
        event.preventDefault();
    }

    // $scope.getAllExchanges = function(){
    	// var request = '{\"agent\":\"InstantDEX\",\"method\":\"allexchanges\"}';
    	// var callback = function(req, res){
    	// 	var exchanges = res.data.result;
    	// 	var exchngObj = null;
    	// 	for(var e in exchanges){
    	// 		exchngObj = {};
    	// 		exchngObj["name"] = exchanges[e];
    	// 		exchngObj["areCredsSet"] = false;
    	// 		exchngObj["active"] = "";
    	// 		exchngObj["apikey"] = "";
    	// 		exchngObj["apisecret"] = "";
    	// 		GlobalServices.exchangeDetails.push(exchngObj);
    	// 	}
    	// 	$scope.exchanges = GlobalServices.exchangeDetails;
    	// 	console.log("Exchanges"+ JSON.stringify($scope.exchanges));
    	// };
    	// GlobalServices.makeRequest(request, callback);
    // }
    // $scope.getAllExchanges();
    console.log('before init', $scope.exchanges);
    console.log('glob serv', GlobalServices.exchangeDetails);
    $scope.setExtraParamsToExchanges = function(){
    	var exchngObj = null;
    	for(var e in GlobalServices.exchangeDetails){
			exchngObj = {};
			exchngObj["name"] = GlobalServices.exchangeDetails[e];
			exchngObj["areCredsSet"] = false;
			exchngObj["active"] = "";
			// exchngObj["apikey"] = "";
			// exchngObj["apisecret"] = "";
			$scope.exchanges.push(exchngObj);
		}
    }
	$scope.setExtraParamsToExchanges();


	var getPassphrase = function() {
		var modalInstanse = ngDialog.open({
			template: '' // go from here 
		})
	};

    $scope.open = function (exchange) {
	    var modalInstance = ngDialog.open({
	      template: 'apiExchangeCredsModal.html',
	      controller: 'ApiExchangeCredsCtrl',
	      scope: $scope,
	      resolve: {
	      	exchangeDets: function () {
	      		for(var e in $scope.exchanges){
	    			if($scope.exchanges[e]["name"] == exchange){
	    				return $scope.exchanges[e];
	    			}
    			}
	        }
	      }
	    });

	    modalInstance.closePromise.then(function (apiCreds) {
	    	if(typeof(apiCreds.value.apikey) != 'undefined' && typeof(apiCreds.value.apisecret) != 'undefined' && apiCreds.value.apikey != "" && apiCreds.value.apisecret != ""){
	    		//$scope.apiKeyPair(apiCreds.value);

	    		// user enter passphrase and then update saved apikey pairs
	    		ApikeyService.getApiKeyPairs(function(json) {
					// update model
					for(var e in $scope.exchanges){
		    			if($scope.exchanges[e]["name"] == apiCreds.value.exchange){
		    				$scope.exchanges[e]["areCredsSet"] = true;
		    				break;
		    			};
		    		};
		    		// update saved apikeys
					ApikeyService.updateApiKeyPairs(json, apiCreds.value, function() {
						console.log('updated apikey', apiCreds.value);
					});
		        });

	    	}
	    });
	};

	// deprecated function. can be deleted. 
	// apikey pairs api access in init.js with 
	// function call begins wiht:  
	// ApikeyService.getApiKeyPairs(true, function(json) {
	$scope.apiKeyPair = function(apiCreds){
		var request = '{\"agent\":\"InstantDEX\",\"method\":\"apikeypair\",\"exchange\":\"'+apiCreds.exchange+
						'\",\"apikey\":\"'+apiCreds.apikey+'\",\"apisecret\":\"'+apiCreds.apisecret+'\"}';
    	var callback = function(req, res){
    		for(var e in $scope.exchanges){
    			console.log(res);
    			if($scope.exchanges[e]["name"] == apiCreds.exchange){
    				$scope.exchanges[e]["areCredsSet"] = true;
    				// $scope.exchange[e]["apikey"] = apiCreds.apikey;
    				// $scope.exchange[e]["apisecret"] = apiCreds.apisecret;
    				break;
    			}
    		}
    		// $scope.exchanges = GlobalServices.exchangeDetails;
    		console.log("Exchanges"+ JSON.stringify($scope.exchanges));
    	};
		GlobalServices.makeRequest(request, callback);
	}
});

Instantdex.controller('ApiExchangeCredsCtrl', function ($scope, exchangeDets) {
	// $scope.apikey = exchangeDets.apikey;
	// $scope.apisecret = exchangeDets.apisecret;
	$scope.exchange = exchangeDets.name;
	$scope.ok = function () {
		$scope.closeThisDialog({ apikey: $scope.apikey, apisecret: $scope.apisecret, exchange: $scope.exchange
		});
	};
});

// controller for use in checking passphrase modal
Instantdex.controller('ApiExchangePassphraseCtrl', function($scope) {

});