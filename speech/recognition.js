const path = require('path')
const Sonus = require('./sonus')
const Speech = require('@google-cloud/speech')
const screen = require('../screen')

const hotwordGerman = [{ file: path.join(__dirname, 'hey_spiegel.pmdl'), hotword: 'Hey Spiegel' }]
const hotwordEnglish = [{ file: path.join(__dirname, 'hey_mirror.pmdl'), hotword: 'Hey Mirror' }]
let sonusGerman = null
let sonusEnglish = null

module.exports = {
  init: function (id, key, voiceOverlay) {
    if (sonusGerman != null || id == null || key == null)
      return
    const speech = Speech({
      projectId: id,
      credentials: key
    })
    const textDisplay = voiceOverlay.children('#voiceinput')
    const showVoiceOverlay = show => {
      if (show)
        voiceOverlay.addClass('shown')
      else
        voiceOverlay.removeClass('shown')
    }
    sonusGerman = Sonus.init({ hotwords: hotwordGerman, language: 'de-DE' }, speech)
    sonusEnglish = Sonus.init({ hotwords: hotwordEnglish, language: 'en-US' }, speech)
    Sonus.start(sonusGerman)
    Sonus.start(sonusEnglish)
    sonusGerman.on('hotword', () => {
      screen.turnOn()
      showVoiceOverlay(true)
      textDisplay.text('')
    })
    sonusGerman.on('partial-result', res => {
      textDisplay.html('<span style="color: #666">'+res+'...</span>')
    })
    sonusGerman.on('final-result', res => {
      textDisplay.text(res)
    })
    sonusEnglish.on('hotword', () => {
      screen.turnOn()
      showVoiceOverlay(true)
      textDisplay.text('')
    })
    sonusEnglish.on('partial-result', res => {
      textDisplay.html('<span style="color: #666">'+res+'...</span>')
    })
    sonusEnglish.on('final-result', res => {
      textDisplay.text(res)
    })
    Sonus.annyang.addCommands({
      'Abbruch (Storno)': () => {showVoiceOverlay(false)},
      'stop': () => {showVoiceOverlay(false)},
      'Storno (Abbruch)': () => {showVoiceOverlay(false)},
      'cancel': () => {showVoiceOverlay(false)},
      'abort': () => {showVoiceOverlay(false)},
      'sorry': () => {showVoiceOverlay(false)},
      '(go to) sleep': () => {showVoiceOverlay(false); screen.turnOff()},
      'geh aus': () => {showVoiceOverlay(false); screen.turnOff()}
    })
    Sonus.annyang.addCallback('resultNoMatch', () => {
      textDisplay.text('???!...')
      setTimeout(() => {showVoiceOverlay(false)}, 700)
    })
  },
  addCommands: function (handlers) {
    //handlers should call showVoiceOverlay(false) when done
    Sonus.annyang.addCommands(handlers)
  }
}
