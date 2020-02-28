# MDSSearch
## R80.40 Smart Console Extension for multi domain IP search

This Smart Console extension is designed to give you the ability to search for any host IP address across all of your configured customer domains.
It has two components: 
* The extension itself - Fairly simple (if ugly) Javascript to make API calls using an API key.
* A Docker container - to host the extension for loading into Smart Console and also to proxy the connections to your Smart Center (see note below on CORS).

## Instructions

1. You will need something to run a Docker container on. You can do it with natively in Windows but the setup can be difficult. I personally find it easier to run a Linux VM in something like VMware or Virtualbox and install the Docker.io packages there.
2. Use git to clone this repository (or download the zip file and extract to a folder). 
3. When downloaded, edit the file 'web/js/actions.js'. At the top of the file, there are two variables defined, API_KEY and DOCKER_IP. You will need to replace these with an API key that you generate in Smart Console. ** Make sure it has read-only permissions to all domains **. The DOCKER_IP value will be https:// plus the IP address of your Linux VM (or if you're running it natively in Windows - your local IP address).
4. Change (cd) into the the directory where you cloned this repo (or unzipped the files if you downloaded it).
5. run "chmod +x cycle.sh"
6. run "./cycle.sh" to build the docker image and then mount the local web files directory inside the container.
   **If you're running on windows - this obviously won't work but isn't the end of the world **
   You only have two commands to run, 'docker build . -t smex_extension' and
   'docker run -d -p 443:443 -v .\web:/var/www/localhost/htdocs -t smex_extension:latest'
7. Now everything is running, you can add the extension to Smart Console from the Preferences menu. The URL will be https://[your IP / VM IP]/extension.json.
   NOTE: This will be using a generic self-signed certificate. I would highly recommend generating your own and replacing the webcert.crt and webpriv.key files.
8. All being well, you'll get a new tab on the right hand side of your Smart Console (near the validations tab) where you can search for IPs.

## Limitations
 * IPv4 only (could easily be changed, possibly :) )
 * Returns host objects only (again, is just a filter in the actions.js file)
 * This is setup to use API key authentication in R80.40. It could be modified for R80.30 using regular credential auth fairly simply. 
 
Let me know if you have any thoughts or issues!

## CORS (and why we need a Docker image acting as a proxy)

CORS - Cross Origin Resource Sharing, is a mechanism which helps control how data from a specific origin can be shared with a third party. (quick and dirty example - Facebook would use CORS to prevent some third party Javascript sending your data Facebook data elsewhere). 
This causes issues with SmartConsole extensions because you cannot currently configure your SMS to send CORS headers to the SMEX browser window to allow the requests to be sent elsewhere (ie, your docker image). 
The workaround is to use a proxy on the origin of the javascript so there are no restrictions in the script talking to its own origin. Then that proxy can issue a unique connection request to the API server without CORS being a factor. 
