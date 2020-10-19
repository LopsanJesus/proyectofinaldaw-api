
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const envConfigs =  require('../config/config');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = envConfigs[env];
const db = {};

let sequelize;
if (config.url) {
  //console.log(config);
  //console.log(config.url);
  sequelize = new Sequelize(config.url, config);
} else {
  //console.log(config);
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    //console.log(file);
    //const model = sequelize['import'](path.join(__dirname, file));
    var model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  console.log(modelName);
  if (db[modelName].associate) {    
    db[modelName].associate(db);  
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;