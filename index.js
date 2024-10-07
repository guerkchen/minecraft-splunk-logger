const axios = require("axios")
const splunkLogger = require("splunk-logging").Logger
require("dotenv").config()

const splunkConfig = {
    token: process.env.SPLUNK_TOKEN,
    url: process.env.SPLUNK_URL
};

const mcApiUrl = 'https://api.mcsrvstat.us/3/' + process.env.MC_DNS

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

async function fetchData() {
	var response;
	try{
		response = await axios.get(mcApiUrl)
	} catch (error) {
		console.error(error)
		return
	}
	logToSplunk(response.data)
}

fetchData()
