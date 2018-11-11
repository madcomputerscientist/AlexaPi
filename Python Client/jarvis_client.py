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
        channelNo = message['channel']
    except KeyError:
        channelNo = 0

    try:
        source = message['source']
    except KeyError:
        source = 'TV'

    print(command)
    print(volume)
    print(channelNo)
    print(source)

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
            if (channelNo != 0):
                for index in range (0, len(channelNo)):
                    if channelNo[index] == '0':
                        channelKey = "KEY_0"
                    elif channelNo[index] == '1':
                        channelKey = "KEY_1"
                    elif channelNo[index] == '2':
                        channelKey = "KEY_2"
                    elif channelNo[index] == '3':
                        channelKey = "KEY_3"
                    elif channelNo[index] == '4':
                        channelKey = "KEY_4"
                    elif channelNo[index] == '5':
                        channelKey = "KEY_5"
                    elif channelNo[index] == '6':
                        channelKey = "KEY_6"
                    elif channelNo[index] == '7':
                        channelKey = "KEY_7"
                    elif channelNo[index] == '8':
                        channelKey = "KEY_8"
                    elif channelNo[index] == '9':
                        channelKey = "KEY_9"

                    requests.get(remoteURL.replace("{remote}", "twc").replace("{key}", channelKey))
                    time.sleep(1)
        elif command == "ToggleClosedCaptionIntent":
            requests.get(remoteURL.replace("{remote}", "twc").replace("{key}", "KEY_SETUP"))
            time.sleep(1)
            requests.get(remoteURL.replace("{remote}", "twc").replace("{key}", "KEY_SELECT"))
            time.sleep(1)
            requests.get(remoteURL.replace("{remote}", "twc").replace("{key}", "KEY_DOWN"))
            time.sleep(1)
            requests.get(remoteURL.replace("{remote}", "twc").replace("{key}", "KEY_SELECT"))
            time.sleep(1)
            requests.get(remoteURL.replace("{remote}", "twc").replace("{key}", "KEY_EXIT"))
        elif command == "ChangeInputIntent":
            requests.get(remoteURL.replace("{remote}", "hometv").replace("{key}", "KEY_CYCLEWINDOWS"))
            time.sleep(1)

            if source == "computer":
                channelKey = "KEY_2"
            elif source == "Xbox":
                channelKey = "KEY_3"
            elif source == "TV":
                channelKey = "KEY_4"
            else:
                channelKey = "KEY_4"
            
            requests.get(remoteURL.replace("{remote}", "hometv").replace("{key}", channelKey))
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