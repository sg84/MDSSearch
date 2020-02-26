var API_KEY = "I1rH9uz9nCRroecxKLJpcg==";
var DOCKER_IP = "https://192.168.241.129";
var SMS_API_ENDPOINT = DOCKER_IP + "/smc";

function searchBtnClick(param) {
	// Retrieve context for API endpoint
	var context = smxProxy.sendRequest("get-context", null, "onContext");
	$("#searchResults").html("<p><b>Searching, please wait...</b></p>");
}

function onContext(context) {
	// Extract API endpoint
	// Query domains - we can use context SID here in global domain
	var headers = {"x-chkp-sid": context['management-server-api']['sid'],
	"Content-Type": "application/json"};
	var params = {};
	var command = "show-domains";
	chainStart(command, params, headers);
	//alert(JSON.stringify(domains));
	

}

function chainStart(command, params, headers) {
	// Stage 1 - get domain UIDs
    var settings = {
		"url": SMS_API_ENDPOINT + "/" + command,
		"method": "POST",
		"timeout": 0,
		"headers": headers,
		"data": JSON.stringify(params),
	};

	$.ajax(settings).done(function (response){
		// Stage 2 - use domain UIDs to generate login UIDs per domain
        var found_domains = [];
        var d;
        for (d in response['objects']){
	        found_domains.push({"uid": response['objects'][d]['uid'],
        	                    "name": response['objects'][d]['name']});
        }
        
        var session_ids = [];
        for (i = 0;i < found_domains.length; i++){
            // Use each domain UID to get a SID and search for the given IP
            //console.log("working on " + found_domains[i]['uid']);
            $("#searchResults").empty();
	    var params = {"domain": found_domains[i]['uid'], "api-key": API_KEY};
            var headers = {"Content-Type": "application/json"};
            var command = "login";
            var settings = {
                "url": SMS_API_ENDPOINT + "/" + command,
                "method": "POST",
                "timeout": 0,
                "headers": headers,
                "data": JSON.stringify(params),
            };
            
            $.ajax(settings).done(function (response) {
                // Stage 3 - use SID to query objects in the domain
            	
		var params = {"type": "host", "ip-only": "true", "filter": $("#ipAddress").val()};
		var headers = {"Content-Type": "application/json", "x-chkp-sid": response['sid']};
		var command = "show-objects";
		var settings = {
                "url": SMS_API_ENDPOINT + "/" + command,
                "method": "POST",
                "timeout": 0,
                "headers": headers,
                "data": JSON.stringify(params),
            	};
		$.ajax(settings).done(function (response) {
		
			objects_found = response['objects'];
			for (o = 0; o < objects_found.length; o++){
				$("#searchResults").append("<b>Hostname</b> - " + objects_found[o]['name'] + "<br/><b>IP Address</b> - " + 
					objects_found[o]['ipv4-address'] + "<br/>");
					for (s = 0; s < found_domains.length; s++){
						if (found_domains[s]['uid'] == objects_found[o]['domain']['uid']){
							$("#searchResults").append("<b>Domain</b> - " + found_domains[s]['name'] + "<br/><br/>");
						}
					}
			}
		
		});

	    });
	}
        
	
	});
    }


