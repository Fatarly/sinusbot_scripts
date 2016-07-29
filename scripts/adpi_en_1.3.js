registerPlugin({
    name: 'Advanced display playback information',
    version: '1.3',
    description: 'It can replace the channel name on the current radio/track and add the playback indicator ►/■, replace the bot nick on the artist + track, radiostation or ►/■ + the nickname of your choice. In addition, all information is duplicated in the description of the bot. Attention! The maximum length of the nickname 30 characters, name of the channel 40, the excess will be cut off!',
    author: 'kapabac',
    vars: {
        chc: {
            title: 'Allow to change the channel name on the name of the current station (for this function, the bot need privileges b_channel_modify_name and perhaps i_channel_modify_power)',
            type: 'select',
            options: [
                'no',
                'yes'
            ]
        },
        chcn: {
            title: 'Channel bot whose name will be changed',
            type: 'channel'
        },
        chn: {
            title: 'Allow to change the nick bot',
            type: 'select',
            options: [
                'no',
                'yes'
            ]
        },
        chns: {
            title: 'Options for replacing the nick bot',
            type: 'select',
            options: [
                'artist + track',
                'radiostation name',
                '►/■ + the nickname of your choice'
            ]
        },
        checkpl: {
            title: 'Display the playback indicator ►/■',
            type: 'select',
            options: [
                'no',
                'yes'
            ]
        },
        nnick: {
            title: 'Your chosen nickname of the bot. Fill this field only if you have chosen the option of replacing nick bot "► / ■ + the nickname of your choice" and turn on the playback indicator',
            type: 'string',
            placeholder: 'for example: Radio Bot'
        },
        sep: {
            title: 'Symbol, which will separate the name of the radio station, artist and track',
            type: 'string',
            placeholder: 'default: ~'
        },
        str: {
            title: 'Allow to replace the URL to your phrase when using chat command "!stream"',
            type: 'select',
            options: [
                'no',
                'yes'
            ]
        },
        strs: {
            title: 'The phrase which can be replaced with the URL when using chat command "!stream".  It must be unique for each bot on a server',
            type: 'string',
            placeholder: 'default: Streaming internet audio'
        },
        undef: {
            title: 'The symbol or the word to be replaced by a null value "undefined" radiostation, artist or track. It must be unique for each bot on a server',
            type: 'string',
            placeholder: 'default: ---'
        }
    }
}, function(sinusbot, config) {
    var desc;
    var nick;
    var title;
    var odesc;
    var onick;
    var otitle;
    var cp = '';
    if(typeof config.chc == 'undefined') {
        config.chc = 0;
    }
    if(typeof config.chn == 'undefined') {
        config.chn = 0;
    }
    if(typeof config.chns == 'undefined') {
        config.chns = 0;
    }
    if(typeof config.checkpl == 'undefined') {
        config.checkpl = 0;
    }
    if (config.chns == 2 && config.checkpl == 1) {
        if (typeof config.nnick == 'undefined' || !config.nnick) return;
    }
    if (typeof config.sep == 'undefined' || !config.sep) {
        var sep = '~';
    } else {
        var sep = config.sep;
    }
    if(typeof config.str == 'undefined') {
        config.str = 0;
    }
    if (typeof config.strs == 'undefined' || !config.strs) {
        config.strs = 'Streaming internet audio';
    }
    if (typeof config.undef == 'undefined' || !config.undef) {
        var undef = '---';
    } else {
        var undef = config.undef;
    }
    if (!config.chcn && config.chc == 1) return;
    setInterval(function() {
        var track = sinusbot.getCurrentTrack();
        if (!track) return;
        var tArt = track.tempArtist;
        var tTit = track.tempTitle;
        var talb = track.album;
        var tit = track.title;
        var typ = track.type;
        if (typeof talb == 'undefined' || talb == '') {
            talb = undef;
        }
        if (typeof tArt == 'undefined' || tArt == '') {
            tArt = undef;
        }
        if (typeof tTit == 'undefined' || tTit == '') {
            tTit = undef;
        }
        if (typeof tit == 'undefined' || tit == '') {
            tit = undef;
        }
        if (config.checkpl == 1) {
            if (playing()) {
                cp = 'Playing ► ';
            } else {
                cp = 'Stopped ■ ';
            }
        }
        var dm = Math.floor(track.duration / 60000);
        var ds = Math.floor(track.duration / 1000) - dm * 60;
        if (ds < 10) {
            ds = '0' + ds;
        }
        if (typ == 'url') {
            if (tit.substring(0,7) == 'http://' && config.str == 1) {
                tit = config.strs;
            }
            desc = cp + tit + ' ' + sep + ' ' + tArt + ' ' + sep + ' ' + tTit;
        } else {
            tArt = track.artist;
            if (typeof tArt == 'undefined' || tArt == '') {
                tArt = undef;
            }
            if (typ == 'ytdl') {
                desc = cp + talb + ' ' + sep + ' ' + tit;
            } else {
                desc = cp + tArt + ' ' + sep + ' ' + tit + ' ' + sep + ' ' + talb    + ' ' + sep + ' ' + dm + ':' + ds;
            }
        }
        if (desc != odesc) {
            setDescription(desc);
            odesc = desc;
        }
        if (config.chn == 1) {
            if (typ == 'url') {
                nick = tArt + sep + tTit;
            } else {
                if (typ == 'ytdl') {
                    nick = talb + sep + tit;
                } else {
                    nick = tArt + sep + tit;
                }
            }
            if (config.chns == 1) {
                nick = cp.substring(8) + tit;
            }
            if (config.chns == 2) {
                nick = cp.substring(8) + config.nnick;
            }
            if (nick.length > 30) {
                nick = nick.substring(0,29);
            }
            if (nick != onick) {
                setNick(nick);
                onick = nick;
            }
        }
        if (config.chc == 1) {
            if (typ != 'url') {
                if (typ == 'ytdl') {
                    tit = talb;
                } else {
                    tit = tArt;
                }
            }
            title = cp.substring(8) + tit;
            if (title.length > 40) {
                title = title.substring(0,39);
            }
            if (title != otitle) {
                sinusbot.channelUpdate(parseInt(config.chcn, 10), { name: title });
                otitle = title;
            }
        }
    }, 1000);
});