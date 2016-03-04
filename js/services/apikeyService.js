'use strict';

Instantdex.service('ApikeyService', function($http, $q, ngDialog, GlobalServices){
    
    var encryptJson = function(passphrase, json, cb) {
        var request = json;

        request.passphrase = passphrase;
        request.agent = "SuperNET";
        request.method = "encryptjson";

        request = JSON.stringify(request);

        GlobalServices.makeRequest(request, function(req, res) {
            cb(res.data);
        });
    };
    
    var decryptJson = function(passphrase, cb) {
        var request = '{\"agent\":\"SuperNET\",\"method\":\"decryptjson\",\"passphrase\":\"'+ passphrase + '\"}';
        
        GlobalServices.makeRequest(request, function(req, res) {
            //console.log('resp after decrypt', res);
            angular.forEach(res.data, function(val, key) {
                if(!val)
                    delete res.data[key];
            });
            cb(res.data);
        });
    };

    // if json returns parsed object, else false
    var checkJson = function(json) {
        try {
            var jsonObj = JSON.parse(json); 
        } catch(e) {
            return false;
        };

        return jsonObj;
    }

    var root = this;

    /**
     * Wrapper for passphrase enter dialog
     * @return promise with passphrase
     */
    this.userPassphraseDialog = function() {
        var defered = $q.defer();

        var dialogInstance = ngDialog.open({
            template: "userPassphraseModal.html",
            controller: function($scope) {
                $scope.ok = function() {
                    $scope.closeThisDialog();
                    defered.resolve($scope.passphrase);
                }                
            }
        });
        return defered.promise;
    };

    /**
     * Decrypt json with apikeys, 
     * if not exist, creates new with empty values for each exchange
     * encrypt initialized json
     * 
     * @return all saved exchanges(in array) if saved == true
     * and all encrypded json if not
     *
     * with true can be invoked when came to options page for updating 
     * exchanges list model
     */
     // TODO check - when loads app, and enter fast passphrase - have error
    this.getApiKeyPairs = function(saved, cb) {
        var exchanges = GlobalServices.exchangeDetails;

        if(typeof saved === 'function') {
            cb = saved;
            saved = false;
        };        

        root.userPassphraseDialog().then(function(passphrase) {
            decryptJson(passphrase, function(decryptedJson) {
                // check if apikeys where encrypted
                // json stores all exchanges names, so we can check for first
                if(! decryptedJson[GlobalServices.exchangeDetails[0]]) {
                    root.createApiKeyPairs(passphrase, function(createdApiKeyPairs) {
                        //console.log('created new apikeypairs', createdApiKeyPairs);
                        return createdApiKeyPairs;
                    });
                };

                if(saved) {
                    var i = exchanges.length,
                        savedExchanges = [];

                    for( ; i--; i) {
                        var current = decryptedJson[exchanges[i]];
                        
                        if(current === "true" || current === true) {
                            savedExchanges.push(exchanges[i]);
                        };      
                    }    
                    return cb(savedExchanges);
                };

                return cb(decryptedJson);
            });
        });
    };

    /**
     * Update saved json with new apikey pair 
     * TODO extend to delete prev data - use one param - obj
     */
    this.updateApiKeyPairs = function(decryptedJson, newData, cb) {
        var exchange = newData.exchange;
        //console.log('before updete', decryptedJson, newData);

        decryptedJson[exchange] = true;
        decryptedJson[exchange + "_apikey"] = newData.apikey;
        decryptedJson[exchange + "_secret"] = newData.apisecret;

        //console.log('updeted', decryptedJson);
        encryptJson(decryptedJson.passphrase, decryptedJson, cb);
    };
    
    /**
     * Init empty apikeypairs json and encrypt it
     */
    this.createApiKeyPairs = function(passphrase) {
        var jsonObj = {};

        angular.forEach(GlobalServices.exchangeDetails, function(val) {
            jsonObj[val] = false;
        });
        
        encryptJson(passphrase, jsonObj, function(data) {
            return jsonObj;
        });
    };

    /**
     * For each saved apikeypair call Apikeypairs API
     */
    this.callApiKeyPairsApi = function(apiKeyObj) {   
    //console.log('call apikeypairs api', apiKeyObj);     
        angular.forEach(GlobalServices.exchangeDetails, function(val) {
            var exchange = apiKeyObj[val];

            if(exchange === "true" || exchange === true || exchange === 1) {
                var request = '{\"agent\":\"InstantDEX\",\"method\":\"apikeypair\",\"exchange\":\"'+ val +
                        '\",\"apikey\":\"'+ apiKeyObj[val+"_apikey"] +
                        '\",\"apisecret\":\"'+ apiKeyObj[val+"_secret"] +'\"}';
                GlobalServices.makeRequest(request, function(req, res) {
                    //console.log('Apikeypairs API call', JSON.stringify(res));
                });            
            }
        });
    };

    
});