const fs = require('node:fs');
const path = require('node:path');
const { Client,Collection,Events , ButtonBuilder, ModalBuilder, TextInputBuilder, ButtonStyle, ActionRowBuilder, TextInputStyle, GatewayIntentBits,WebhookClient,PermissionsBitField,InteractionType  } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const keepAlive = require("./server.js");
require('dotenv').config({ path: '.env' })
const axios = require('axios');
const token = process.env['token']
const oskey = process.env['OSKEY']
const tpf = process.env['tpfwebhook']
const kandy = process.env['kandyWebhook']

const {channelId,contract_address} = require('./config.json')

const {setLastSaleTime, getLastSaleTime} = require("./src/setTime")
const {saleEmbed} = require('./src/saleEmbed')

const tpfSales = new WebhookClient({url:tpf});
const kandySales = new WebhookClient({url:kandy});

client.commands = new Collection();
const mongoose = require('mongoose')
const MongoClient = require('mongodb').MongoClient;
const mongourl = process.env['mongodb']
const WalletModel = require('./models/time')

mongoose.connect(mongourl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then( (db) => {
        db.model('time')
        
        console.log(`connected to mongodb`) 
    });
mongoose.set('strictQuery', true);
const mongodb = mongoose.connection;

mongodb.on('error', console.error.bind(console, 'Connection error:'));

const mongoClient = new MongoClient(mongourl);
const databaseName = "mf";



client.on(Events.ClientReady, () => {
  const Guilds = client.guilds.cache.size;
  const totalMembers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

  console.log(Guilds, totalMembers)
  console.log(`Logged in as ${client.user.tag}!`);
    setInterval(() => {
        setTimeout(async function () {
          handleEvents();
          handleKandySales();
        }, 60000);
    }, 60000);
   /*client.user.setPresence({ activities: [{ name: `movinfrens.com` }], status: 'online' });*/
});


const handleEvents = async () => {
	let getTime = await getLastSaleTime(2)
  let timestamp = Date.now();
    // getTime = 0
//   console.log(getTime)
  const options = {
  method: 'GET',
  url: `https://api.opensea.io/api/v1/events?only_opensea=false&asset_contract_address=${contract_address.tpf}&event_type=successful&occurred_after=${getTime?getTime:0}`,
  headers: {accept: 'application/json', 'X-API-KEY': oskey}
};

  axios
  .request(options)
  .then(function (response) {
    // console.log(response?.data?.asset_events[0]);
    sendSaleInfo(2,response?.data?.asset_events);
    
    // console.log(parseInt(timestamp/1000))
    setLastSaleTime(2,parseInt(timestamp/1000))
  })
  .catch(function (error) {
    console.error(error);
  });
}

const handleKandySales = async () => {
	let getTime = await getLastSaleTime(3)
  let timestamp = Date.now();
    // getTime = 0
//   console.log(getTime)
  const options = {
  method: 'GET',
  url: `https://api.opensea.io/api/v1/events?only_opensea=false&asset_contract_address=${contract_address.kandy}&event_type=successful&occurred_after=${getTime?getTime:0}`,
  headers: {accept: 'application/json', 'X-API-KEY': oskey}
};

  axios
  .request(options)
  .then(function (response) {
    // console.log(response?.data?.asset_events[0]);
    sendSaleInfo(3,response?.data?.asset_events);
    // console.log(parseInt(timestamp/1000))
    setLastSaleTime(3,parseInt(timestamp/1000))
  })
  .catch(function (error) {
    console.error(error);
  });
}

const sendSaleInfo = async (num,events) => {
    const channel = client.channels.cache.find(channel =>     channel.id === channelId)
    for(let i = 0;i<events?.length;i++) {
    let sale = await saleEmbed(events[i])
    // console.log(sale)
    if(num == 2) {
      await channel.send({embeds:[sale]})
      await tpfSales.send({embeds:[sale]})
    } if(num==3) {
      await kandySales.send({embeds:[sale]})
    }
    
    }
}



keepAlive()
client.login(token);