from pubnub import Pubnub
import requests
import time

pubnub = Pubnub(publish_key="pub-c-c986ff40-0e29-415b-a1a6-1dcf79095d51", subscribe_key="sub-c-2d8fef94-dad3-11e6-8da7-0619f8945a4f", ssl_on=False)
channel = "Alexa Pi"

def callback(message, channel):
    command = message['command']
    try:
        volume = int(message['volume'])
    except KeyError:
        volume = 3
    try:
        channel = message['channel']
    except KeyError:
        channel = 0

    #print(command)
    #print(volume)
    #print(channel)

    remoteURL = "http://raspberrypi.local/irremote.php?remote={remote}&key={key}"

    try:
        if command == "TogglePowerTVIntent":
            requests.get(remoteURL.replace("{remote}", "hometv").replace("{key}", "KEY_POWER"))
        elif command == "TogglePowerCableIntent":
            requests.get(remoteURL.replace("{remote}", "twc").replace("{key}", "KEY_POWER"))
        elif command == "TogglePowerAllIntent":
            requests.get(remoteURL.replace("{remote}", "hometv").replace("{key}", "KEY_POWER"))
            requests.get(remoteURL.replace("{remote}", "twc").replace("{key}", "KEY_POWER"))
        elif command == "VolumeUpIntent":
            for index in range(0, volume + 1):
                requests.get(remoteURL.replace("{remote}", "hometv").replace("{key}", "KEY_VOLUMEUP"))
                time.sleep(1)
        elif command == "VolumeDownIntent":
            for index in range(0, volume + 1):
                requests.get(remoteURL.replace("{remote}", "hometv").replace("{key}", "KEY_VOLUMEDOWN"))
                time.sleep(1)
        elif command == "ChannelUpIntent":
            requests.get(remoteURL.replace("{remote}", "twc").replace("{key}", "KEY_CHANNELUP"))
        elif command == "ChannelDownIntent":
            requests.get(remoteURL.replace("{remote}", "twc").replace("{key}", "KEY_CHANNELDOWN"))
        elif command == "ChannelChangeIntent":
            if (channel != 0):
                for index in range (0, len(channel)):
                    if channel[index] == '0':
                        channelKey = "KEY_0"
                    elif channel[index] == '1':
                        channelKey = "KEY_1"
                    elif channel[index] == '2':
                        channelKey = "KEY_2"
                    elif channel[index] == '3':
                        channelKey = "KEY_3"
                    elif channel[index] == '4':
                        channelKey = "KEY_4"
                    elif channel[index] == '5':
                        channelKey = "KEY_5"
                    elif channel[index] == '6':
                        channelKey = "KEY_6"
                    elif channel[index] == '7':
                        channelKey = "KEY_7"
                    elif channel[index] == '8':
                        channelKey = "KEY_8"
                    elif channel[index] == '9':
                        channelKey = "KEY_9"

                    requests.get(remoteURL.replace("{remote}", "twc").replace("{key}", channelKey))
                    time.sleep(1)
    except ConnectionError:
        error("Connection error")
            
def error(message):
    print("ERROR : " + str(message))


def connect(message):
    print("CONNECTED")


def reconnect(message):
    print("RECONNECTED")


def disconnect(message):
    print("DISCONNECTED")


pubnub.subscribe(channels=channel, callback=callback, error=error,
                 connect=connect, reconnect=reconnect, disconnect=disconnect)