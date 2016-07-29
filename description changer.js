registerPlugin({
	name: 'Channel description changer',
	version: '0.3',
	description: 'Channel description changer for Playing music',
	author: 'Filtik <filtik@gmx.net>',
	vars: {
        FrontArtistText: {
            title: 'Front Artist Text.',
            type: 'string',
            placeholder: 'Artist'
        },
        FrontTitleText: {
            title: 'Front Title Text.',
            type: 'string',
            placeholder: 'Title'
        },
        artistSort: {
            title: 'Set Artist befor Title or after Title',
            type: 'select',
            options: [
                'before',
                'after'
            ]
        },
        PlayingLines: {
            title: 'Show Artist and Title in 1 or 3 Lines',
            type: 'select',
            options: [
                '1',
                '3'
            ]
        },
        alignMusicText: {
            title: 'Align Artist and Songtext',
            type: 'select',
            options: [
                'Left',
                'Center',
                'Right'
            ]
        },
        otherTextBefor: {
            title: 'Other text befor Playing info:',
            type: 'multiline',
            placeholder: '' 
        },
        otherTextAfter: {
            title: 'Other text after Playing info:',
            type: 'multiline',
            placeholder: '' 
        },
        OfflineText: {
            title: 'Offline Text.',
            type: 'string',
            placeholder: 'Music is stopped'
        }
    }
},  function(sinusbot, config, info) {
    
    // Loading + Script Infos
    var sinusv = '0.9.12-6bb0227'
    sinusbot.log('Loading... | Script: "' + info.name + '" | Version: "' + info.version + '" | for "Sinusbot over ' + sinusv + '"');
    
    // vars
	var aSort = config.artistSort;
	var oTB = config.otherTextBefor;
	var oTA = config.otherTextAfter;
	var OffT = config.OfflineText;
	var PL = config.PlayingLines;
	var FAT = config.FrontArtistText;
	var FTT = config.FrontTitleText;
	var aMT = config.alignMusicText;
	
	
    // Check undefined settings, when undefined set it to default
    if (typeof PL == 'undefined' || PL == '') {
        var PL = 0;
    }
    if (typeof aSort == 'undefined' || aSort == '') {
        var aSort = 0;
    }
    if (typeof aMT == 'undefined' || aMT == '') {
		var aMT = 0;
	}
	
    if (typeof FAT == 'undefined' || FAT == '') {
		var FAT = '';
	} else {
		var FAT = FAT + ' ';
	}
    if (typeof FTT == 'undefined' || FTT == '') {
		var FTT = '';
	} else {
		var FTT = FTT + ' ';
	}
	
    if (typeof oTB == 'undefined' || oTB == '') {
		var oTBnew = '';
	} else {
		var oTBnew = oTB;
	}
    if (typeof oTA == 'undefined' || oTA == '') {
		var oTAnew = '';
	} else {
		var oTAnew = oTA;
	}
	
	
    // Function: Interval
    var old;
	var old2;
	var old3;
    setInterval(function() {
        var track = sinusbot.getCurrentTrack();
        if (sinusbot.playing() == true) {
            if (old != track.title) {
                old = track.title;
                chUpdate();
            } else if (old2 != track.tempTitle) {
				old2 = track.tempTitle;
				chUpdate();
			}
			old3 = 0;
        } else {
			if (old3 != 1) {
				chUpdate();
				old3 = 1;
			}
        }
    }, 5000);
    
     // Function chUpdate
    function chUpdate() {
        var track = sinusbot.getCurrentTrack();
		
		if (typeof track.tempTitle != 'undefined') {
			var tt = track.tempTitle;
		} else if (typeof track.title != 'undefined') {
			var tt = track.title;
		} else {
			var tt = 'unknown track';
		}
		
		if (typeof track.tempArtist != 'undefined') {
			var ta = track.tempArtist;
        } else if (typeof track.artist != 'undefined') {
			var ta = track.artist;
		} else {
			var ta = 'unknown artist';
		}
		
        
		if (tt != '' && ta != '') {
			var middletrack = ' - ';
		} else {
			var middletrack = '';
		}
		
		
		if (aSort == 0) {
			if (PL == 0) {
				var OnlineText = FAT + ta + middletrack + FTT + tt;
			} else if (PL == 1) {
				var OnlineText = FAT + ta + '\n' + middletrack + '\n' + FTT + tt;
			}
		} else if (aSort == 1) {
			if (PL == 0) {
				var OnlineText = FTT + tt + middletrack + FAT + ta;
			} else if (PL == 1) {
				var OnlineText = FTT + tt + '\n' + middletrack + '\n' + FAT + ta;
			}
		}
		
		
        if (sinusbot.playing() == true) {
			var EndText = OnlineText;
        } else {
			var EndText = OffT;
		}
		
		if (aMT == 1) {
			EndText = '[center]' + EndText + '\n[/center]';
		} else if (aMT == 2) {
			EndText = '[right]' + EndText + '\n[/right]';
		} else {
			EndText = EndText + '\n';
		}
		
		
		var FinishText = oTBnew + '\n\n' + EndText + '\n' + oTAnew;
		
        // Update channel
        if (sinusbot.playing() == true) {
			sinusbot.channelUpdate(getCurrentChannelId(), {description: FinishText});
        }
    }
	
    // Loading Info
    sinusbot.log ('Script: "' + info.name + '" loaded succsesfully.');
	
});