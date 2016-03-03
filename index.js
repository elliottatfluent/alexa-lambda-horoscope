/**
 * App ID for the skill
 */
var APP_ID = "your app id";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var http = require("http");

var Horoscope = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
Horoscope.prototype = Object.create(AlexaSkill.prototype);
Horoscope.prototype.constructor = Horoscope;

Horoscope.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("Horoscope onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

Horoscope.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("Horoscope onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Would you like to know what your future holds for today";
    var repromptText = speechOutput;
    
    response.ask(speechOutput, repromptText);
};

Horoscope.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("Horoscope onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

Horoscope.prototype.intentHandlers = {
    // register custom intent handlers
    "HoroscopeIntent": function (intent, session, response) {
      handleRequest(intent, session, response);  
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can say tell me today's prediction for Sagittarius");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the Horoscope skill.
    var horoscopeObj = new Horoscope();
    horoscopeObj.execute(event, context);
};


var handleRequest = function(intent, session, response){

    var daySlot = intent.slots.Date;
    var dateOption = 'today';

    if(daySlot && daySlot.value)
    {
      var splitDate = daySlot.value.split("-");  
      
      switch(splitDate.length)
      {
        case 1:
          dateOption = "year";
          break;
        case 2:
          if(splitDate[1].indexOf("W") > -1)
            dateOption = "week";
          else
            dateOption ="month";
          break;
        case 3:
        default:
          dateOption = "today";
          break;
      };
    }

    var options = {
      host: 'horoscope-api.herokuapp.com',
      path: '/horoscope/' + dateOption + '/' + intent.slots.Sign.value
  };

  callback = function(res) {
    var str = '';
    
    //another chunk of data has been received, so append it to `str`
    res.on('data', function (chunk) {
      str += chunk;
    });

    //the whole response has been received, so we just print it out here
    res.on('end', function () {
      reply = JSON.parse(str.toString("utf8")).horoscope;   
      response.tellWithCard(reply, "Horoscope", reply);             
    });
  };

  http.request(options, callback).end();    
};

