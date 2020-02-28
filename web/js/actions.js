var API_KEY = "I1rH9uz9nCRroecxKLJpcg==";
var DOCKER_IP = "https://192.168.241.129";
var SMS_API_ENDPOINT = DOCKER_IP + "/smc";

function searchBtnClick(param) {
	// Retrieve context for API endpoint
	context = smxProxy.sendRequest("get-context", null, "onContext");
	$("#searchResults").html("<p><b>Searching, please wait...</b></p>");
}

function onContext(context) {
	// Extract API endpoint
	// Query domains - we can use context SID here in global domain
	
	var command = "show-domains";
	var headers = {"x-chkp-sid": context['management-server-api']['sid'],
	"Content-Type": "application/json", "x-chkp-smc": context['management-server-api']['url'] + "/" + command};
	var params = {};
	chainStart(command, params, headers, context);
	//alert(JSON.stringify(domains));
	

}

function chainStart(command, params, headers, context) {
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
        
        $("#searchResults").empty();
	$("#searchResults").append("<table width='100%' id='resultsTable'><tr><thead><th>Hostname</th><th>IP Address</th><th>Domain</th></thead></tr><tbody></tbody></table>");
	for (i = 0;i < found_domains.length; i++){
            // Use each domain UID to get a SID and search for the given IP
            //console.log("working on " + found_domains[i]['uid']);
	    var params = {"domain": found_domains[i]['uid'], "api-key": API_KEY};
            var command = "login";
            var headers = {"Content-Type": "application/json", "x-chkp-smc": context['management-server-api']['url'] + "/" + command};
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
		var command = "show-objects";
		var headers = {"Content-Type": "application/json", "x-chkp-sid": response['sid'], "x-chkp-smc": context['management-server-api']['url'] + "/" + command};
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
				$("#resultsTable").append("<tr><td>" + objects_found[o]['name'] + "</td>" + "<td>" + objects_found[o]['ipv4-address'] + "</td>");
					for (s = 0; s < found_domains.length; s++){
						if (found_domains[s]['uid'] == objects_found[o]['domain']['uid']){
							$("#resultsTable td:last").after("<td>" + found_domains[s]['name'] + "</td></tr>");
							break;
						}
					}
			}
		});

	    });
	}
        
	
	});
    }


