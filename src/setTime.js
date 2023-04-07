const MongoClient = require("mongodb").MongoClient;
const mongourl = process.env['mongodb']
const mongoClient = new MongoClient(mongourl);

async function setLastSaleTime(num,time){
    let result = await mongoClient.connect();
    let db = result.db("mf");
    let collection = db.collection('time');
    
    let data = await collection.findOne({number:num});
    if(!data){
        await collection.insertOne({number:num,time:time})
        data = await collection.findOne({number:num});
    } else {
      await collection.findOneAndUpdate({ number:num },{$set:{time:time}})
    }
    
    data = await collection.findOne({ number:num });
    return data?.time;
}

async function getLastSaleTime(num){
    let result = await mongoClient.connect();
    let db = result.db("mf");
    let collection = db.collection('time');
    
    let data = await collection.findOne({number:num});
    return data?.time
}

module.exports = {setLastSaleTime,getLastSaleTime}
