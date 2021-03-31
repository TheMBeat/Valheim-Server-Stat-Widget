// Valheim-Server-Status Widget
//
// Copyright (C) 2021 by TheMBeat <thembeat@gmx.com>
//
// Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER
// IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
// OF THIS SOFTWARE.
//
// Valheim icon made by Iron Gate Studios from https://www.valheimgame.com
// Gamer icon made by Muhammad Haq from https://freeicons.io/user-interface-icons-4/group-profile-users-icon-36699#
// Versions paper icon made by Ray Dev from https://freeicons.io/business-and-online-icons/git-branch-icon-icon#

// Variables used by Scriptable.
// Parameters:
// {"url":"http:://xxx.xxx.xxx.xxx","port":"xxxx"}
// Optional key in parameters: "theme": system|light|dark

let valheimURL = "" //set the URL here for debug http://
let valheimStatusPort = "" // set the API-key here for debug
let wTheme = "system" // set the theme for debug

if (config.runsInWidget) {
    const widgetParams = (args.widgetParameter != null ? JSON.parse(args.widgetParameter) : null)
    if (widgetParams == null) {
        throw new Error("Please long press the widget and add the parameters.")
    } else if (!widgetParams.hasOwnProperty("url") && !widgetParams.hasOwnProperty("port")) {
        throw new Error("Wrong parameters.")
    }

    valheimURL = widgetParams.url
    valheimStatusPort = widgetParams.port
    if (widgetParams.hasOwnProperty("theme")) {
        wTheme = widgetParams.theme
    }
}

let wBackground = new LinearGradient()
let wColor = new Color("#ffffff")
setTheme()

let valheimStats = await getStats()


let wSize = config.widgetFamily || "small" //set size of widget for debug
let widget = await createWidget() || null

if (!config.runsInWidget) {
    if (wSize == "large") {
        await widget.presentLarge()
    } else if (wSize == "medium") {
        await widget.presentMedium()
    } else {
        await widget.presentSmall()
    }
}
Script.setWidget(widget)
Script.complete()

async function createWidget() {

    const logoImg = await getImage('valheim-logo.png')
    const playerImg = await getImage('player-logo.png')
    const versionImg = await getImage('version-logo.png')

    let w = new ListWidget()
    //      w.refreshAfterDate = 5400
    w.backgroundGradient = wBackground
    w.setPadding(5, 5, 5, 5)

    let state = (valheimStats != null ? (valheimStats.online ? true : false) : null)

    // First Row
    let content = w.addImage(logoImg)
    content.centerAlignImage()
    w.addSpacer(2)

    if (valheimStats == null) {
        content = w.addText("No connection")
        content.font = Font.thinSystemFont(14)
        content.textColor = (state ? Color.green() : Color.red())
        content.centerAlignText()
        w.addSpacer()
        return w
    }

    content = w.addText(valheimStats.name)
    content.font = Font.blackSystemFont(16)
    content.textColor = (state ? Color.green() : Color.red())
    content.centerAlignText()

    w.addSpacer(4)


    w.url = valheimURL + ':' + valheimStatusPort + "/status"

    let fontSizeHeadline = 13
    let fontSizeString = 11

    switch (wSize) {
        case "large":
            fontSizeHeadline = 19
            fontSizeString = 16
            break;
        case "medium":
            fontSizeHeadline = 15
            fontSizeString = 13
            break;
    }

    // |....|....| --> Active Player
    let layoutStack = w.addStack()
    layoutStack.addSpacer(10)
    layoutStack.setPadding(3, 0, 0, 10)
    layoutStack.centerAlignContent()

    content = layoutStack.addImage(playerImg)
    content.imageSize = new Size(20, 20)
    content.tintColor = wColor
    layoutStack.addSpacer()

    content = layoutStack.addText(valheimStats.players.toString() + ' / ' + valheimStats.max_players.toString())
    content.font = Font.mediumSystemFont(fontSizeString)
    content.textColor = wColor


    // |....|....|
    // |....|....| --> Version
    layoutStack = w.addStack()
    layoutStack.addSpacer(10)
    layoutStack.setPadding(3, 0, 0, 10)
    layoutStack.centerAlignContent()

    content = layoutStack.addImage(versionImg)
    content.imageSize = new Size(20, 20)
    content.tintColor = wColor
    layoutStack.addSpacer()

    content = layoutStack.addText(valheimStats.version)
    content.font = Font.mediumSystemFont(fontSizeString)
    content.textColor = wColor

    // Updatedate
    w.addSpacer()
    let date = new Date(Date.now())
    let dateFormatter = new DateFormatter()
    dateFormatter.useShortTimeStyle()
    dateFormatter.useMediumDateStyle()
    let dateStr = dateFormatter.string(date)

    content = w.addText(dateStr)
    content.centerAlignText()
    content.font = Font.mediumSystemFont(7)
    content.textColor = wColor
    content.textOpacity = 0.5

    w.addSpacer()
    return w
}

function setTheme() {
    if (wTheme == "system") {
        if (Device.isUsingDarkAppearance()) {
            wTheme = "dark"
        } else {
            wTheme = "light"
        }
    }
    wBackground.locations = [0, 1]
    if (wTheme == "dark") {
        wBackground.colors = [
            new Color("#1F1F1F"),
            new Color("#1F1F1F")
        ]
        wColor = new Color("#ffffff")
    } else {
        wBackground.colors = [
            new Color("#ffffffe6"),
            new Color("#ffffffe6")
        ]
        wColor = new Color("#000000")
    }
}

async function getStats() {
    try {
        let req = new Request(valheimURL + ':' + valheimStatusPort + "/status")
        let json = await req.loadJSON()

        return json
    } catch {

        return null
    }
}

// get images from local filestore or download them once
async function getImage(image) {
    let fm = FileManager.local()
    let dir = fm.documentsDirectory()
    let path = fm.joinPath(dir, image)
    if (fm.fileExists(path)) {
        return fm.readImage(path)
    } else {
        // download once
        let imageUrl
        switch (image) {
            case 'valheim-logo.png':
                imageUrl = "https://oyster.ignimgs.com/mediawiki/apis.ign.com/valheim/e/e9/Valheim_logo.png"
                break
            case 'player-logo.png':
                imageUrl ="https://pics.freeicons.io/uploads/icons/png/7364060301582634778-512.png"
                break
            case 'version-logo.png':
                imageUrl ="https://pics.freeicons.io/uploads/icons/png/19797032331543238892-512.png"
                break
            default:
                console.log(`Sorry, couldn't find ${image}.`);
        }
        let iconImage = await loadImage(imageUrl)
        fm.writeImage(path, iconImage)
        return iconImage
    }
}

// helper function to download an image from a given url
async function loadImage(imgUrl) {
    const req = new Request(imgUrl)
    return await req.loadImage()
}
