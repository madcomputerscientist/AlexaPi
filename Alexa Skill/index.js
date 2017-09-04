var pubnubClientAlexa = require("pubnub")({
  ssl           : true,
  publish_key   : "pub-c-c986ff40-0e29-415b-a1a6-1dcf79095d51",
  subscribe_key : "sub-c-2d8fef94-dad3-11e6-8da7-0619f8945a4f"
});
var alexaChannel = "Alexa Pi";

var pubnubClientSmartLamp = require("pubnub")({
  ssl           : true,
  publish_key   : "pub-c-0bed295e-a3e2-451a-882c-76cda83f73c9",
  subscribe_key : "sub-c-3477209c-225a-11e7-894d-0619f8945a4f"
});
var smartLampChannel = "SmartLamp";

PubnubClient = {
  AlexaPi: 0,
  SmartLamp: 1
};

exports.handler = (event, context) => {
  try {
    if (event.session.new) {
      // New Session
      console.log("NEW SESSION")
    }

    switch (event.request.type) {
      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`)
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Welcome to an Alexa Skill, this is running on a deployed lambda function", true),
            {}
          )
        )
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`)

        var messageRequest = {
          "command": event.request.intent.name
        }

        var intentResponse;
        var targetClient;

        switch(event.request.intent.name) {
          case "VolumeUpIntent":
            messageRequest.volume = event.request.intent.slots.Volume.value;
            level = (typeof messageRequest.volume == 'undefined' ? '' : `by ${messageRequest.volume}`);
            intentResponse = `Volume was increased ${level}`;
            targetClient = PubnubClient.AlexaPi;
            break;

          case "VolumeDownIntent":
            messageRequest.volume = event.request.intent.slots.Volume.value;
            level = (typeof messageRequest.volume == 'undefined' ? '' : `by ${messageRequest.volume}`);
            intentResponse = `Volume was lowered ${level}`;
            targetClient = PubnubClient.AlexaPi;
            break;

          case "ChannelUpIntent":
            intentResponse = `Changed to next channel`;
            targetClient = PubnubClient.AlexaPi;
            break;

          case "ChannelDownIntent":
            intentResponse = `Changed to previous channel`;
            targetClient = PubnubClient.AlexaPi;
            break;

          case "ChannelChangeIntent":
            messageRequest.channel = event.request.intent.slots.Channel.value;
            intentResponse = `Changed to channel ${messageRequest.channel}`;
            targetClient = PubnubClient.AlexaPi;
            break;

          case "TogglePowerTVIntent":
            intentResponse = `TV power button pressed`;
            targetClient = PubnubClient.AlexaPi;
            break;

          case "TogglePowerCableIntent":
            intentResponse = `Cable power button pressed`;
            targetClient = PubnubClient.AlexaPi;
            break;

          case "TogglePowerAllIntent":
            intentResponse = `Power buttons pressed`;
            targetClient = PubnubClient.AlexaPi;
            break;

          case "ToggleClosedCaptionIntent":
            intentResponse = `Closed captioning toggled`;
            targetClient = PubnubClient.AlexaPi;
            break;

          case "ChangeInputIntent":
            messageRequest.source = event.request.intent.slots.Source.value;
            intentResponse = `Switched input to ${messageRequest.source}`;
            targetClient = PubnubClient.AlexaPi;
            break;
            
          case "TurnOnLightsIntent":
            messageRequest.command = "On";
            intentResponse = `Lights turned on`;
            targetClient = PubnubClient.SmartLamp;
            break;

          case "TurnOffLightsIntent":
            messageRequest.command = "Off";
            intentResponse = `Lights turned off`;
            targetClient = PubnubClient.SmartLamp;
            break;

          case "TurnOnWhiteLightIntent":
            messageRequest.command = "White";
            intentResponse = `White lights turned on`;
            targetClient = PubnubClient.SmartLamp;
            break;

          case "TurnOnYellowLightIntent":
            messageRequest.command = "Yellow";
            intentResponse = `Yellow lights turned on`;
            targetClient = PubnubClient.SmartLamp;
            break;

          case "BlinkLightIntent":
            messageRequest.command = "Blink";
            intentResponse = `Party time!`;
            targetClient = PubnubClient.SmartLamp;
            break;

          default:
            context.fail("Invalid intent");
            break;
        }

        if (targetClient == PubnubClient.AlexaPi) {
          pubnubPublish(context, pubnubClientAlexa, alexaChannel, messageRequest, intentResponse);
        }
        else if (targetClient == PubnubClient.SmartLamp) {
          pubnubPublish(context, pubnubClientSmartLamp, smartLampChannel, messageRequest, intentResponse);
        }        
        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`);
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`);
        break;
    }

  } catch(error) { context.fail(`Exception: ${error}`); }
}

// Helpers
pubnubPublish = (context, client, channel, message, intent) => {
  client.publish({ //Publishes the message to my PubHub Device.
      channel   : channel,
      message   : message,
      callback  : function(e) { 
          console.log( "SUCCESS!", e ); 
          context.succeed(
              generateResponse(
                  buildSpeechletResponse(intent, true),
                  {}
              )
          );
        },
      error     : function(e) { 
          console.log( "FAILED! RETRY PUBLISH!", e );
          context.fail(`PubNub fail: ${e}`);
        }
  });
}

buildSpeechletResponse = (outputText, shouldEndSession) => {
  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  }
}

generateResponse = (speechletResponse, sessionAttributes) => {
  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }
}