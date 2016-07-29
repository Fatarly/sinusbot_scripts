 //
 //Copyright (C) 2015 Zento <zento@own-salvation.de>
 //
 //This program is free software: you can redistribute it and/or modify
 //it under the terms of the GNU General Public License as published by
 //the Free Software Foundation, either version 3 of the License, or
 //(at your option) any later version.
 //*
 //This program is distributed in the hope that it will be useful,
 //but WITHOUT ANY WARRANTY; without even the implied warranty of
 //MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 //GNU General Public License for more details.
 //
 //You should have received a copy of the GNU General Public License
 //along with this program.  If not, see <http://www.gnu.org/licenses/>.
 //
 //Author of Script: Zento <zento@own-salvation.de>
 //
registerPlugin(
{
  name: 'ZTSupport',
  version: '0.9.4',
  description: 'Message to ServerGroup when User joins specified Channel',
  author: 'Zento',
  vars: {
    ZTchannelID: { title: 'Supportchannel', type: 'channel' },
    ZTgrpID: { title: 'Supporter - GroupID - Comma seperated list', type: 'string' },
    ZTIgnoreGrpID: { title: 'Ignore when joining Support Channel - GroupID - Comma seperated list', type: 'string' },
    ZTUserMessage: {title: "Message to user - %u for Username", type: 'string', placeholder: "Hello %u! A Supporter will hellp you soon!"},
    ZTSupporterMessage: {title: "Message to supporter - %u for Username", type: 'string', placeholder: "User %u has joined the support waitingroom!"},
    ZTmsgType: {title: "Supporter message type", type: 'select', options: ['Chat','Poke']}
  }
},
function(sinusbot, config, info)
{
    log('Loading ' + info.name + ' v' + info.version + '  - by ' + info.author);
    log('Settings:');
    log('Support ChannelID: ' + config.ZTchannelID);
    log('Support GroupID:' + config.ZTgrpID);
    log('GroupIDs to ignore:' + config.ZTIgnoreGrpID);
    
    
    var ZTIgnoreGrpID = config.ZTIgnoreGrpID.split(',');
    var ZTUserMessage = config.ZTUserMessage.split('%u');
    var ZTSupporterMessage = config.ZTSupporterMessage.split('%u');

    set(config.ZTSupporter, []);
    
    var ZTgrpID = config.ZTgrpID.split(',');
    
    sinusbot.on('clientMove', function(e)
    {
      
      var ZTisSupporter = false;
      e.clientServerGroups.forEach(function(group)
      {
        ZTgrpID.forEach(function(group2)
        {
          if (group.i == group2)
            ZTisSupporter = true;
        });
      });
      ZTSupporter = get(config.ZTSupporter);
      if (ZTisSupporter == true)
      {
          if (e.newChannel == 0)
          {
            var ZTSupporter_new = [];
            ZTSupporter.forEach(function(id)
            {
              if (id != e.clientId)
              {
                ZTSupporter_new.push(id);
              }
            });
            set(config.ZTSupporter, ZTSupporter_new);
          }
          else if (ZTSupporter.indexOf(e.clientId) == -1)
          {
            ZTSupporter.push(e.clientId);
            set(config.ZTSupporter, ZTSupporter);
          }
      }
      else if(ZTSupporter.indexOf(e.clientId) >= 0)
      {
        var ZTSupporter_new = [];
        ZTSupporter.forEach(function(id)
        {
          if (id != e.clientId)
          {
            ZTSupporter_new.push(id);
          }
        });
        set(config.ZTSupporter, ZTSupporter_new);
      }

      
      var ignore = false;
      ZTIgnoreGrpID.forEach(function(key,i ,o)
      {
        e.clientServerGroups.forEach(function(group)
        {
          if (group.i == key)
            ignore = true;
        });
      });
      if (e.newChannel == config.ZTchannelID && ignore == false)
      {
        if (ZTUserMessage.length == 2)
          ZTUserMessage_temp = ZTUserMessage[0] + '[b]' + e.clientNick + '[/b]' + ZTUserMessage[1];
        else
          ZTUserMessage_temp = ZTUserMessage[0];
          
        if (ZTSupporterMessage.length == 2)
          ZTSupporterMessage_temp = ZTSupporterMessage[0] + '[b]' + e.clientNick + '[/b]' + ZTSupporterMessage[1];
        else
          ZTSupporterMessage_temp = ZTSupporterMessage[0];
        get(config.ZTSupporter).forEach(function(ZTClientID)
        {
          if (config.ZTmsgType == 0)
            chatPrivate(ZTClientID, ZTSupporterMessage_temp);
          else if (config.ZTmsgType == 1)
            poke(ZTClientID, ZTSupporterMessage_temp);
          else
            chatPrivate(ZTClientID, ZTSupporterMessage_temp);
        });          
        chatPrivate(e.clientId, ZTUserMessage_temp);
      }
    });
});