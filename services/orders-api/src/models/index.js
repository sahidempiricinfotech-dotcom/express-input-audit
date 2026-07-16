const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: false
});

const Order = sequelize.define('Order', {
  customerEmail: DataTypes.STRING,
  items: DataTypes.JSON,
  total: DataTypes.FLOAT,
  couponCode: DataTypes.STRING,
  shippingAddress: DataTypes.JSON,
  notes: DataTypes.TEXT,
  dryRun: DataTypes.BOOLEAN
}, {
  tableName: 'orders',
  timestamps: true
});

module.exports = { sequelize, Order };
