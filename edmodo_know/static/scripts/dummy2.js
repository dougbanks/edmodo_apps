(function() {

window.common = window.common || {};
window.common.io = window.common.io || {};

/**
 * @fileoverview A library for sound management.
 * @author Adam Stepinski
 */

/**
 * @class Base-class manager that plays no sounds.
 * Also provides the interface for other audio managers and
 * provides fallback implementations.
 *
 * @constructor
 */
common.io.NullAudioManager = function() {
};

common.io.NullAudioManager.prototype.onReady = function(handler) {
  handler();
};
common.io.NullAudioManager.prototype.preload = function(
    soundName, opt_loadHandler) {
  opt_loadHandler && window.setTimeout(function() {
    opt_loadHandler();
  }, 0);
};

/**
 * A degenerate case of playWithOptions, left in to support old code.
 * @param {String} soundName
 * @param {Boolean} opt_stopAll
 * @param {Boolean} opt_ignoreIfPlaying
 */
common.io.NullAudioManager.prototype.play = function(soundName, opt_stopAll, opt_ignoreIfPlaying) {
  this.playWithOptions(soundName, {
    stopAll: opt_stopAll,
    ignoreIfPlaying: opt_ignoreIfPlaying,
  });
};

/**
 * Play given sound.
 *
 * @param {String} soundName
 * @param {Object} options
 *    Optional flags include:
 *    stopAll: stop any playing sounds before starting the new one.
 *    ignoreIfPlaying: if this sound is already playing do nothing.
 *    fadeOut: if stopAll is true, fade old sound out before fading new in.
 *    fadeIn: fade new sound in.
 *    loop: loop this sound.
 */
common.io.NullAudioManager.prototype.playWithOptions = function(soundName, options) { };
/**
 *
 * @param {Object} volume - 0 = mute, 1 = full volume.
 */
common.io.NullAudioManager.prototype.setVolume = function(volume) { };
common.io.NullAudioManager.prototype.pause = function(soundName) { };
common.io.NullAudioManager.prototype.unpause = function(soundName) { };
common.io.NullAudioManager.prototype.stop = function(soundName) { };
common.io.NullAudioManager.prototype.stopAll = function() { };
common.io.NullAudioManager.prototype.unload = function(soundName) { };
common.io.NullAudioManager.prototype.setMute = function(newMute) { };


/**
 * @class Manager that handles all sounds playing in the game, through
 *    a hidden flash player. Preferred method for desktop version.
 * @param {String} opt_soundPath A non-default location for the sound files.
 * @constructor
 */
common.io.SMAudioManager = function(opt_soundPath) {
  var that = this;
  this.sounds = {};
  this.soundPath = opt_soundPath || '/static/sounds/';
  this.volume = 100;
  this.extension = 'mp3';
};
common.util.inherits(common.io.SMAudioManager, common.io.NullAudioManager);

/**
 * Override the type of file we look for.
 *
 * @param {Object} typeMap
 */
common.io.SMAudioManager.prototype.setExtension = function(extension) {
  this.extension = extension;
}

/**
 * Calls the handler when the audio manager is ready. If the audio manager
 * has already initialized, the handler is executed immediately.
 * @param {Function} handler The function to call when the audio manager
 *   is ready.
 */
common.io.SMAudioManager.prototype.onReady = function(handler) {
  soundManager.onready(handler);
};

/**
 * Preloads the given sound, without playing it.
 * @param {String} soundName The name of the sound to preload.
 * @param {Function} opt_loadHandler Optional load handler that gets called
 *   when the sound is loaded.
 */
common.io.SMAudioManager.prototype.preload = function(
    soundName, opt_loadHandler) {
  var options = {
    'autoLoad': true
  };
  if (opt_loadHandler) {
    options['onload'] = opt_loadHandler;
    // An HTML5-only event that fires when the browser
    // decides to stop downloading an audio file. In this case,
    // we want to continue as though the audio file was loaded, to avoid
    // stalling the preloading process.
    // http://www.schillmania.com/projects/soundmanager2/doc/#smsound-onsuspend
    options['onsuspend'] = opt_loadHandler;
  }
  var sound = this.getSound(soundName, options);
};

/**
 * Play given sound.
 *
 * @param {String} soundName
 * @param {Object} opt_options
 *    Optional flags include:
 *    stopAll: stop any playing sounds before starting the new one.
 *    ignoreIfPlaying: if this sound is already playing do nothing.
 *    fadeOut: if stopAll is true, fade old sound out before fading new in.
 *    fadeIn: fade new sound in.
 *    loop: loop this sound.
 *    volume: play sound with this volume.  0 = mute, 1 = full.
 */

common.io.SMAudioManager.prototype.playWithOptions = function(
    soundName, opt_options) {
  var options = opt_options || {};

  if (this.muted) {
    return;
  }

  var sound = this.getSound(soundName);
  if (!(options.ignoreIfPlaying && sound.playState == 1)) {
    if (options.stopAll) {
      this.stopAll();
    }
    var libOptions = {};

    if (options.volume !== undefined) {
      sound.setVolume(100 * options.volume);
    }

    libOptions.onfinish = function() {
      if (options.volume !== undefined) {
        sound.setVolume(100);
      }
      if (options.loop) {
        sound.play(libOptions);
      }
    };

    sound.play(libOptions);
  }
};

common.io.SMAudioManager.prototype.setVolume = function(volume) {
  this.volume = volume * 100;
  for (var soundName in this.sounds) {
    var sound = this.sounds[soundName];
    sound.setVolume(volume);
  }
};

/**
 * Pauses the given sound.
 * @param {String} soundName the name of the sound to pause.
 */
common.io.SMAudioManager.prototype.pause = function(soundName) {
  var sound = soundManager.getSoundById(soundName);
  if (sound) {
    sound.pause();
  }
};

/**
 * Resumes playback of the give sound. No action if sound is already
 * playing.
 * @param {String} soundName the name of the sound to unpause.
 */
common.io.SMAudioManager.prototype.unpause = function(soundName) {
  var sound = soundManager.getSoundById(soundName);
  if (sound) {
    sound.resume();
  }
};

/**
 * Stops the given sound.
 * @param {String} soundName The name of the sound to stop.
 */
common.io.SMAudioManager.prototype.stop = function(soundName) {
  var sound = this.getSound(soundName);
  sound.stop();
};

/**
 * Stops all sounds managed by this audio manager.
 */
common.io.SMAudioManager.prototype.stopAll = function() {
  for (var soundName in this.sounds) {
    var sound = this.sounds[soundName];
    sound.stop();
  }
};

/**
 * Remove all references to the given sound and release OS resources.
 * @param {String} soundName The name of the sound to unload.
 */
common.io.SMAudioManager.prototype.unload = function(soundName) {
  var sound = soundManager.getSoundById(soundName);
  if (sound) {
    sound.destruct();
    delete this.sounds[soundName];
  }
};

/**
 * Returns the sound with the given name.
 * @param {String} soundName The name of the sound to play.
 * @param {Object} opt_creationOptions Optional object containins extra options
 *   to use when creating the sound object. These will be ignored if the
 *   object already exists.
 * @private
 */
common.io.SMAudioManager.prototype.getSound = function(
    soundName, opt_creationOptions) {
  // Cached sound.
  var sound = soundManager.getSoundById(soundName);
  if (!sound) {
    // Sound not cached. Fetch it now.
    var options = opt_creationOptions || {};
    options.id = soundName;
    options.url = this.soundPath + soundName + '.' + this.extension;
    options.volume = this.volume;
    sound = soundManager.createSound(options);
  }
  this.sounds[soundName] = sound;
  return sound;
};

/**
 * Sets the muted state for the audio. Triggers
 * @param {Boolean} newMute The new mute state for the audio manager.
 */
common.io.SMAudioManager.prototype.setMute = function(newMute) {
  for (var soundName in this.sounds) {
    var sound = this.sounds[soundName];
    if (newMute) {
      sound.mute();
      sound.stop();
    } else {
      sound.unmute();
    }
  }
  this.muted = newMute;
};


/**
 * @class Manager that plays sound natively using Phonegap.
 * @param {String} opt_soundPath A non-default location for the sound files.
 * @contructor
 */
common.io.PhonegapAudioManager = function(opt_soundPath) {
  var that = this;
  this.sounds = {};
  this.pausedSounds = {};
  this.playingSounds = {};
  if (opt_soundPath == undefined) {
    this.root = 'static/sounds/';
  } else {
    this.root = opt_soundPath;
  }
  // NOTE(adam): mp3s seem to work well through phonegap these days.
  this.extension = '.aiff';
  //this.extension = '.wav';
};
common.util.inherits(common.io.PhonegapAudioManager, common.io.NullAudioManager);

/**
 * Calls the handler when the audio manager is ready. If the audio manager
 * has already initialized, the handler is executed immediately.
 * @param {Function} handler The function to call when the audio manager
 *   is ready.
 */
common.io.PhonegapAudioManager.prototype.onReady = function(handler) {
  // No preloading required for phonegap audio, since all APIs are available
  // when deviceReady fires earlier.
  handler();
};

/**
 * Preloads the given sound, without playing it.
 * @param {String} soundName The name of the sound to preload.
 * @param {Function} opt_loadHandler Optional load handler that gets called
 *   when the sound is loaded.
 */
common.io.PhonegapAudioManager.prototype.preload = function(
    soundName, opt_loadHandler) {
  var sound = new Media(
      this.root + soundName + this.extension,
      function() {
        // called when sound finishes playing
        delete that.playingSounds[soundName];
      },
      null,
      function() {
        // called on downloadComplete.
        // NOTE(adam): this doesn't seem to work
        //opt_loadHandler && opt_loadHandler();
      });
  this.sounds[soundName] = sound;
  // NOTE(adam): since the download callback doesn't seem to get fired,
  // call handler here.
  opt_loadHandler && opt_loadHandler();
};

/**
 * Play given sound.
 *
 * @param {String} soundName
 * @param {Object} options
 *    Optional flags include:
 *    stopAll: stop any playing sounds before starting the new one.
 *    ignoreIfPlaying: if this sound is already playing do nothing.
 *    fadeOut: if stopAll is true, fade old sound out before fading new in.
 *    fadeIn: fade new sound in.
 *    loop: loop this sound.
 */

common.io.PhonegapAudioManager.prototype.playWithOptions = function(
    soundName, options) {
  var that = this;
  if (this.muted) {
    return;
  }

  if (options.ignoreIfPlaying && this.playingSounds[soundName]) {
    return;
  }

  var sound;
  if (this.sounds[soundName]) {
    sound = this.sounds[soundName];
  } else {
    var fullName = this.root + soundName + this.extension;
    sound = new Media(fullName, function(){
      delete that.playingSounds[soundName];
    }, function(err){
      alert('new Media fail: ' + fullName + ': ' + err.code +
      ": " + err.message);
    });
    this.sounds[soundName] = sound;
  }
  if (options.stopAll) {
    this.stopAll();
  } else if (this.pausedSounds[soundName]) {
    // Sound is currently paused. Stop the sound so that it will play
    // from the beginning.
    this.stop(soundName);
  }

  sound.play();
  this.playingSounds[soundName] = sound;
};

/**
 * Pauses the given sound.
 * @param {String} soundName the name of the sound to pause.
 */
common.io.PhonegapAudioManager.prototype.pause = function(soundName) {
  var sound = this.sounds[soundName];
  if (sound) {
    sound.pause();
    this.pausedSounds[soundName] = sound;
  }
};

/**
 * Resumes playback of the give sound. No action if sound is already
 * playing.
 * @param {String} soundName the name of the sound to unpause.
 */
common.io.PhonegapAudioManager.prototype.unpause = function(soundName) {
  var sound = this.pausedSounds[soundName];
  if (sound) {
    // play() is used to resume playback in addition to playing new sounds.
    sound.play();
    delete this.pausedSounds[soundName];
  }
};

/**
 * Stops the given sound.
 * @param {String} soundName The name of the sound to stop.
 */
common.io.PhonegapAudioManager.prototype.stop = function(soundName) {
  if (this.sounds[soundName]) {
    this.sounds[soundName].stop();
    delete this.pausedSounds[soundName];
    delete this.playingSounds[soundName];
  }
};

/**
 * Stops all sounds managed by this audio manager.
 */
common.io.PhonegapAudioManager.prototype.stopAll = function() {
  for (var soundName in this.sounds) {
    this.sounds[soundName].stop();
  }
  this.pausedSounds = {};
  this.playingSounds = {};
};

/**
 * Remove all references to the given sound and release OS resources.
 * @param {String} soundName The name of the sound to unload.
 */
common.io.PhonegapAudioManager.prototype.unload = function(soundName) {
  var sound = this.sounds[soundName];
  if (sound) {
    delete this.sounds[soundName];
    delete this.pausedSounds[soundName];
    delete this.playingSounds[soundName];
    // NOTE(adam): sound.release is currently not supported in iOS.
    //sound.release();
  }
};

common.io.PhonegapAudioManager.prototype.setMute = function(newMute) {
  if (newMute) {
    this.stopAll();
  }
  this.muted = newMute;
};

/**
 * @class Manager that plays sounds on Phonegap, hopefully without the odd
 * memory/behavior issues of PhonegapAudioManager.
 *
 * FIXME(dbanks)
 * Right now only the most rudimentary functionality is in: play a sound.
 * No real support for load, unload, play, pause, etc.
 *
 * @constructor
 */
common.io.PhonegapAudioManager2 = function() {
  this.mute = false;
  sound.install();
};
common.util.inherits(common.io.PhonegapAudioManager2, common.io.NullAudioManager);

common.io.PhonegapAudioManager2.prototype.onReady = function(handler) {
  handler();
};
common.io.PhonegapAudioManager2.prototype.preload = function(
    soundName, opt_loadHandler) {
  opt_loadHandler && window.setTimeout(function() {
    opt_loadHandler();
  }, 0);
};

/**
 * Play given sound.
 *
 * @param {String} soundName
 * @param {Object} options
 *    Optional flags include:
 *    stopAll: stop any playing sounds before starting the new one.
 *    ignoreIfPlaying: if this sound is already playing do nothing.
 *    fadeOut: if stopAll is true, fade old sound out before fading new in.
 *    fadeIn: fade new sound in.
 *    loop: loop this sound.
 */

common.io.PhonegapAudioManager2.prototype.playWithOptions = function(soundName, options) {
  if (!this.mute) {
    window.plugins.sound.play(soundName);
  }
};

/**
 * Mute/unmute the sounds.
 * FIXME(dbanks)
 * Current implementation just changes whether future sounds will play: doesn't
 * affect sounds previously played.
 *
 * @param {Object} newMute
 */
common.io.PhonegapAudioManager2.prototype.setMute = function(newMute) {
  this.mute = newMute;
};

common.io.PhonegapAudioManager2.prototype.pause = function(soundName) { };
common.io.PhonegapAudioManager2.prototype.unpause = function(soundName) { };
common.io.PhonegapAudioManager2.prototype.stop = function(soundName) { };
common.io.PhonegapAudioManager2.prototype.stopAll = function() { };
common.io.PhonegapAudioManager2.prototype.unload = function(soundName) { };

})();
