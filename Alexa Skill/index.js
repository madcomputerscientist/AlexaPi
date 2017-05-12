//var https = require('https')

//PubHub server infromation (This is how i send the information to the Raspberry Pi)
var iotCloud = require("pubnub")({
  ssl           : true,  // <- enable TLS Tunneling over TCP 
  publish_key   : "pub-c-c986ff40-0e29-415b-a1a6-1dcf79095d51", //If you want to host this yourself, this is where your publish_key and subscribe_key will go.
  subscribe_key : "sub-c-2d8fef94-dad3-11e6-8da7-0619f8945a4f"
});

var myChannel = "Alexa Pi";

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

        switch(event.request.intent.name) {
          case "VolumeUpIntent":
          messageRequest.volume = event.request.intent.slots.Volume.value;
          level = (typeof messageRequest.volume == 'undefined' ? '' : `by ${messageRequest.volume}`);
          intentResponse = `Volume was increased ${level}`;
          break;

          case "VolumeDownIntent":
          messageRequest.volume = event.request.intent.slots.Volume.value;
          level = (typeof messageRequest.volume == 'undefined' ? '' : `by ${messageRequest.volume}`);
          intentResponse = `Volume was lowered ${level}`;
          break;

          case "ChannelUpIntent":
          intentResponse = `Changed to next channel`;
          break;

          case "ChannelDownIntent":
          intentResponse = `Changed to previous channel`;
          break;

          case "ChannelChangeIntent":
          messageRequest.channel = event.request.intent.slots.Channel.value;
          intentResponse = `Changed to channel ${messageRequest.channel}`;
          break;

          case "TogglePowerTVIntent":
          intentResponse = `TV power button pressed`;
          break;

          case "TogglePowerCableIntent":
          intentResponse = `Cable power button pressed`;
          break;

          case "TogglePowerAllIntent":
          intentResponse = `Power buttons pressed`;
          break;

          case "ToggleClosedCaptionIntent":
          intentResponse = `Closed captioning toggled`;
          break;

          case "ChangeInputIntent":
          messageRequest.source = event.request.intent.slots.Source.value;
          intentResponse = `Switched input to ${messageRequest.source}`;
          break;

          default:
            context.fail("Invalid intent");
        }

        iotCloud.publish({ //Publishes the message to my PubHub Device.
            channel   : myChannel,
            message   : messageRequest,
            callback  : function(e) { 
                console.log( "SUCCESS!", e ); 
                context.succeed(
                    generateResponse(
                        buildSpeechletResponse(intentResponse, true),
                        {}
                    )
                );
              },
            error     : function(e) { 
                console.log( "FAILED! RETRY PUBLISH!", e );
                context.fail(`PubNub fail: ${e}`);
              }
        });

        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`);
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`);

    }

  } catch(error) { context.fail(`Exception: ${error}`); }
}

// Helpers
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