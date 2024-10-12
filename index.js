const axios = require("axios")
const splunkLogger = require("splunk-logging").Logger
const { app } = require('@azure/functions');
require("dotenv").config()

const splunkConfig = {
    token: process.env.SPLUNK_TOKEN,
    url: process.env.SPLUNK_URL
};

const servers = process.env.MC_DNS.split(";")
const mcApiUrl = 'https://api.mcsrvstat.us/3/'

var logger = new splunkLogger(splunkConfig)

function logToSplunk(data){
	logger.send({"message": data}, function(err, resp, body) {
		if(!err && body.code == 0){
			console.log("mc data send to splunk")
		} else {
			console.error("error sending data to splunk: " + err)
		}
	})
}

async function fetchData(url) {
	var response;
	try{
		response = await axios.get(url)
		response.data.icon = ""
	} catch (error) {
		console.error(error)
		return null
	}
	return response.data
}

async function logServerStatus(server){
	console.log("log Status of Server " + server)
	const url = mcApiUrl + server
        const data = await fetchData(url)
        logToSplunk(data)
}

function logServerStatuses(){
	servers.forEach((server) => {
		logServerStatus(server)
	})
}

app.timer("loggingTimer", {
	schedule: '0 */2 * * * *',
	handler: (myTimer, context) => {
		context.log("Timmer function processed request.")
		logServerStatuses()
	}
})

logServerStatuses()
