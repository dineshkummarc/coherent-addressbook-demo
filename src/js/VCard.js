/*jsl:import core.js*/
/*jsl:declare VCard*/

VCard= Class.create(coherent.KVO, {

  constructor: function()
  {
    this.addresses= [];
    this.phoneNumbers= [];
    this.emailAddresses= [];
    this.messengerAddresses= [];
    this.urls= [];
    this.organisation= "";
    this.department= "";
    this.categories= [];
    this.fullName='';
    this.title= '';
    this.adressBookUid= null;
    this.__extras= [];
  },
  
  render: function()
  {
    var escapeValue= VCard.escapeValue;
    
    var vcard= [];
    vcard.push('BEGIN:VCARD');
    vcard.push('VERSION:3.0');
    vcard.push('FN:' + this.fullName);
    if (this.name)
    {
      vcard.push('N:' + [this.name.family||"", this.name.given||"",
                         this.name.additional||"", this.name.prefixes||"",
                         this.name.suffixes||""].join(';'));
    }
    if (this.organisation)
    {
      var org= [escapeValue(this.organisation)];
      if (this.department)
        org.push(escapeValue(this.department));
      vcard.push('ORG:' + org.join(';'));
    }
    if (this.title)
      vcard.push('TITLE:' + escapeValue(this.title));

    if (this.adressBookUid)
      vcard.push('X-ABUID:' + escapeValue(this.adressBookUid));
      
      
    var key;
    var len;
    var item;
    var value;
    
    len= this.emailAddresses.length;
    while (len--)
    {
      item= this.emailAddresses[len];
      key= ['EMAIL'];
      if (item.type)
        key.push('type=' + escapeValue(item.type));
      if (item.preferred)
        key.push('type=pref');
      vcard.push(key.join(';') + ':' + escapeValue(item.address));
    }

    len= this.messengerAddresses.length;
    while (len--)
    {
      item= this.messengerAddresses[len];
      key= [item.key.toUpperCase()];
      if (item.type)
        key.push('type=' + escapeValue(item.type));
      if (item.preferred)
        key.push('type=pref');
      vcard.push(key.join(';') + ':' + escapeValue(item.username));
    }

    len= this.urls.length;
    while (len--)
    {
      item= this.urls[len];
      key= ['URL'];
      if (item.type)
        key.push('type=' + escapeValue(item.type));
      if (item.preferred)
        key.push('type=pref');
      vcard.push(key.join(';') + ':' + escapeValue(item.href));
    }

    len= this.phoneNumbers.length;
    while (len--)
    {
      item= this.phoneNumbers[len];
      key= ['TEL'];
      if (item.type)
        key.push('type=' + escapeValue(item.type));
      if (item.preferred)
        key.push('type=pref');
      vcard.push(key.join(';') + ':' + escapeValue(item.number));
    }
    
    len= this.addresses.length;
    while (len--)
    {
      item= this.addresses[len];
      key= ['ADR'];
      if (item.type)
        key.push('type=' + escapeValue(item.type));
      if (item.preferred)
        key.push('type=pref');
      value= [item.pobox, item.extended, item.street, item.city, item.state,
          item.zip, item.country].map(escapeValue);
      vcard.push(key.join(';') + ':' + value.join(';'));
    }

    if (this.photo)
    {
      item= this.photo;
      key= ['PHOTO'];
      if (item.properties.BASE64)
        key.push('BASE64');
      vcard.push(key.join(';') + ':' + escapeValue(item.data));
    }
    
    vcard.push('END:VCARD');
    return vcard.join('\r\n');
  }
  
});

Object.extend(VCard, {

  __networks: {
    'x-aim': 'AIM',
    'x-icq': 'ICQ',
    'x-jabber': 'Jabber',
    'x-msn': 'MSN',
    'x-yahoo': 'Yahoo!',
    'x-skype': 'Skype'
  },
  
  __messengerProtocolPrefix: {
    'x-aim': 'aim:goim?screenname=',
    'x-icq': 'http://www.icq.com/people/cmd.php?action=message&uin=',
    'x-jabber': 'xmpp:',
    'x-msn': 'msnim:chat?contact=',
    'x-yahoo': 'ymsgr:sendIM?',
    'x-skype': 'skype:'
  },

  makeSplitRegex: function(c)
  {
    var cache= VCard.makeSplitRegex;
    if (!cache)
      cache= VCard.makeSplitRegex.cache= {};
    else if (c in cache)
      return cache[c];
    
    return (cache[c]= new RegExp(c+"|([^\\"+c+"\\\\]+(?:\\\\.[^\\"+c+"\\\\]*)*|(?:\\\\.[^\\"+c+"\\\\]*)+)(?:\\"+c+"|$)", "g"));
  },

  splitValue: function(value, c)
  {
    var regex= VCard.makeSplitRegex(c);
    var result= [];
    var match;
  
    while ((match=regex.exec(value)))
      result.push(match[1]);
    return result;
  },

  unescapeValue: function(value)
  {
    if ('string'!==typeof(value))
      return null;
    return value.replace(/\\(.)/g, function(all, c) { return eval('"'+all+'"'); });
  },
  
  /** Todo: actually implement escaping special characters.
   */
  escapeValue: function(value)
  {
    return value;
  },

  parse: function(input)
  {
    //  Remove carriage returns and unfold lines
    input= input.replace(/\r/g, '');
    input= input.replace(/\n\s+/g, '');
  
    var cards= [];
    var lines= input.split('\n');
    var line;
    var results;
    var key;
    var value;
    var properties;
    var group;
    var groupedValues= {};
    var item;
    var parts;
    var vcard;
    
    var split= VCard.splitValue;
    var unescapeValue= VCard.unescapeValue;
  
    while ((line=lines.shift()))
    {
      if ('BEGIN:VCARD'===line)
      {
        groupedValues= {};
        vcard= new VCard();
        cards.push(vcard);
        continue;
      }

      if ('END:VCARD'===line)
      {
        vcard= null;
        groupedValues= {};
        continue;
      }
      
      if (!vcard)
        continue;
        
      results= line.match(/^(?:([^\:\.\;]+)\.)?([^\:\;]+)(?:;([^\:]+))?\:(.*)$/);
      if (!results)
      {
        console.log('mismatch:', "'"+line+"'", results);
        continue;
      }
      group= results[1];
      key= results[2].toLowerCase();
      properties= results[3];
      value= results[4];
    
      if (group)
        item= groupedValues[group] || (groupedValues[group]=new coherent.KVO());
      else
        item= new coherent.KVO();
      
      if (properties && (properties= split(properties,';')))
        properties.forEach( function(prop) {
          var parts= prop.split('=');
          var key;
          if (1===parts.length)
          {
            if (!('properties' in item))
              item.properties= new coherent.KVO();
            item.properties[parts[0]]= true;
            return;
          }
          if ('type'!==(key=parts.shift().toLowerCase()))
          {
            if (!('properties' in item))
              item.properties= new coherent.KVO();
            if (key in item.properties)
              item.properties.push(parts[0]);
            else
              item.properties= [parts[0]];
            return;
          }
          var type= parts[0].toLowerCase();
          if ('pref'===type)
            item.preferred= true;
          else
          {
            item.type= type;
            item.label= type;
          }
        });
    
      switch (key)
      {
        case 'fn':
          vcard.fullName= unescapeValue(value);
          break;
      
        case 'x-aim':
        case 'x-icq':
        case 'x-jabber':
        case 'x-msn':
        case 'x-yahoo':
        case 'x-skype':
          item.network= VCard.__networks[key];
          item.username= unescapeValue(value);
          item.key= key;
          item.href= VCard.__messengerProtocolPrefix[key] + item.username;
          vcard.messengerAddresses.push(item);
          break;
      
        case 'categories':
          vcard.categories.addObjects(split(value, ',').map(unescapeValue));
          break;
        
        case 'org':
          parts= split(value, ';').map(unescapeValue);
          vcard.organisation= parts[0];
          vcard.department= parts[1];
          break;
      
        case 'title':
          vcard.title= unescapeValue(value);
          break;
      
        case 'role':
          vcard.role= unescapeValue(value);
          break;
      
        case 'n':
          parts= split(value, ';').map(unescapeValue);
          item.family= parts[0];
          item.given= parts[1];
          item.additional= parts[2];
          item.prefixes= parts[3];
          item.suffixes= parts[4];
          vcard.name= item;
          break;
        
        case 'nickname':
          vcard.nickname= unescapeValue(value);
          break;
      
        case 'bday':
          //  format as ISO date
          break;
      
        case 'adr':
          parts= split(value, ';').map(unescapeValue);
          item.pobox= parts[0];
          item.extended= parts[1];
          item.street= parts[2];
          item.city= parts[3];
          item.state= parts[4];
          item.zip= parts[5];
          item.country= parts[6];
          vcard.addresses.push(item);
          break;
        
        case 'tel':
          item.number= unescapeValue(value);
          item.href= "tel:" + item.number;
          vcard.phoneNumbers.push(item);
          break;
      
        case 'email':
          item.address= unescapeValue(value);
          item.href= "mailto:"+item.address;
          vcard.emailAddresses.push(item);
          break;
        
        case 'photo':
          item.data= unescapeValue(value);
          item.url= 'data:;base64,'+unescapeValue(value);
          vcard.photo= item;
          break;
      
        case 'url':
          item.href= unescapeValue(value);
          vcard.urls.push(item);
          break;
        
        case 'x-ablabel':
          item.label= unescapeValue(value);
          break;
        
        case 'x-abuid':
          vcard.adressBookUid= unescapeValue(value);
          break;
          
        default:
          //  remember parts we didn't parse
          vcard.__extras.push(line);
          break;
      }
    }
    
    return cards;
  }
  
});