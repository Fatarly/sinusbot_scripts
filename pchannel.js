registerPlugin({
    name: 'Private Channel',
    version: '1.2',
    description: 'Allows certain users to create their own private channel',
    author: 'good_live',
    vars: {
        parent: {
            title: 'The parent channel. If set to none the channels will be main channels',
            type: 'channel',
        },
        groupids: {
            title: 'IDs of the groups or clients that are allowed to create a channel. (Leave it empty to allow everybody)',
            type: 'string',
            placeholder: '12 120 319EN4I/TuSji8VPdK7drJtELn0= 49'
        }
		key: {
            title: 'Encryption Key (This is used to save the created channels. Just hit something randomly.)',
            type: 'string',
            placeholder: '_private'
        }
        command_private: {
            title: 'The base chat command to use the script',
            type: 'string',
            placeholder: '.private'
        }
    }
}, function(sinusbot, config, info) {

    // -- Load messages --
    log('Loading...');
    var author = info.author.split(',');
    if(author.length == 1){
        author = author[0];
        author = author.replace(/<.*>/gi, '').trim();
    } else {
        author = author.map(function(e){
            return e.replace(/<.*>/gi, '').trim();
        });
        author = author.join(' & ');
    }
    log(info.name + ' v' + info.version + ' by ' + author + ' for SinusBot v0.9.9-50e8ba1 (and above)');
	
	//Loading config params
	
	//Loading parentid
	if(!config.parent) {
		var parentid = 0;
		log('No parent channel set.');
	}else{
		var parentid = parseInt(config.parent, 10);
	}
	
	//Loading group/clientids
	if(typeof config.groupids == 'undefined' || config.groupids == '') {
		log('No group/client ids set! Everybody is allowed to create a private channel.');
		var groupids = "0";
	}else{
		var groupids = config.groupids.split(' ');
	}
	
	//Loading base chat command
	log(config.command_private);
	if(typeof config.command_private == 'undefined' || config.command_private == '') {
		log('No chat command set, using the default one: .private');
		var cmd_private = '.private';
	}else{
		var cmd_private = config.command_private.trim();
		log('Using ' + cmd_private + ' as base chat command');
	}
	
	//Loading encription key.
	if(typeof config.key == 'undefined') {
		config.key = "_private";
		log('No Encription Key Set, using the default one: _private');
	}
    
	// -- Recreating "startsWith()" function which isn't included in ECMAScript 5 --
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }
	
	//Function to get the channelid based on the channelname and the parentid
    getcid = function(cname, pid){
        var channels = getChannels();
        var c = channels.length;
        while(c--) {
            if (channels[c].name == cname && channels[c].parent == pid) {
                return channels[c].id;
            }
        }
        return false;
	}
	
    sinusbot.on('chat', function(ev) {
        if(ev.mode != 1) return;
        if(ev.msg.startsWith(cmd_private)){
            var key = ev.clientUid + config.key;
            var obj = get(key);
            var buffer = ev.msg.replace(cmd_private, '').trim();
            var s = groupids.length;
            while (s--) {
                var i = ev.clientServerGroups.length;
                while (i--) {
                    if (groupids == '0' || ev.clientServerGroups[i].i == groupids[s] || groupids[s] == ev.clientUid) {
                        switch(true) {
                            case buffer.startsWith('create'):
                                var buffer = buffer.replace("create", "").trim();
                                if(buffer == ""){
                                    chatPrivate(ev.clientId, 'Usage: ' + cmd_private + ' create <channelname>');
                                }else if(obj != undefined){
                                    chatPrivate(ev.clientId, 'You already have a private channel: "' + obj + '"');
                                }else{
									if (getcid(buffer, parentid) != false){
										chatPrivate(ev.clientId, 'A private channel with this name already exists');
									}else{
										if (buffer.length > 40){
											chatPrivate(ev.clientId, 'The given channelname is too long.');
											return;
										}else{
											channelCreate({ name: buffer, parent: parentid, topic: ev.clientNick, enc: 1, perm: 1,sperm: 0, order: 0});
											chatPrivate(ev.clientId, 'Channel: "' + buffer + '" created.');
											chatPrivate(ev.clientId, 'Set your password with ' + cmd_private +' password <password>');
											set(key, buffer);
										}
									}
                                }
                                break;
							case buffer.startsWith('remove'):
                                if(obj != undefined){
                                    var cid = getcid(obj, parentid);
                                    if (cid != false) {
                                        channelDelete(cid, true)
                                        chatPrivate(ev.clientId, 'Channel "' + obj + '" removed');
                                        unset(key);
                                    }else{
                                        chatPrivate(ev.clientId, 'Channel has been renamed or deleted by an Admin. Please report this to an admin.');
										unset(key);
                                    }
                                }else{
                                    chatPrivate(ev.clientId, 'No private channel found.');
                                }
                                break;
                            case buffer.startsWith('password'):
                                if(obj != undefined){
                                    var cid = getcid(obj, parentid);
                                    var buffer = buffer.replace("password", "").trim();
                                    channelUpdate(cid, { password: buffer });
                                    chatPrivate(ev.clientId, 'Password updated: ' + buffer);
                                }else{
                                    chatPrivate(ev.clientId, 'No private channel found.');
                                }
                                break;
                            default:
                                chatPrivate(ev.clientId, 'Usage: ' + cmd_private + ' <create|remove|password>');
                        }
                        return;
                    }
                }
            }
            chatPrivate(ev.clientId, 'You are not allowed to manage your own private channel');
            return;
        }
        return;
    });
	
	
    // -- Information --
    log('Loaded !');
});