const { Address, User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');

exports.getAddresses = catchAsync(async (req, res, next) => {
  const addresses = await Address.findAll({
    where: { userId: req.user.id },
    order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
  });
  res.status(200).json({ status: 'success', data: addresses });
});

exports.getAddress = catchAsync(async (req, res, next) => {
  const address = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!address) return next(new AppError('Address not found', 404));
  res.status(200).json({ status: 'success', data: address });
});

exports.createAddress = catchAsync(async (req, res, next) => {
  if (req.body.isDefault) await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
  const address = await Address.create({ ...req.body, userId: req.user.id });
  res.status(201).json({ status: 'success', data: address });
});

exports.updateAddress = catchAsync(async (req, res, next) => {
  const address = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!address) return next(new AppError('Address not found', 404));
  if (req.body.isDefault) await Address.update({ isDefault: false }, { where: { userId: req.user.id, id: { [Op.ne]: req.params.id } } });
  await address.update(req.body);
  res.status(200).json({ status: 'success', data: address });
});

exports.deleteAddress = catchAsync(async (req, res, next) => {
  const address = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!address) return next(new AppError('Address not found', 404));
  await address.destroy();
  res.status(200).json({ status: 'success', message: 'Address deleted' });
});

exports.setDefaultAddress = catchAsync(async (req, res, next) => {
  await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
  const address = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!address) return next(new AppError('Address not found', 404));
  await address.update({ isDefault: true });
  res.status(200).json({ status: 'success', data: address });
});

exports.getDefaultAddresses = catchAsync(async (req, res, next) => {
  const address = await Address.findOne({ where: { userId: req.user.id, isDefault: true } });
  res.status(200).json({ status: 'success', data: { default: address } });
});

exports.validatePincode = catchAsync(async (req, res, next) => {
  const isValid = /^[1-9][0-9]{5}$/.test(req.params.pincode);
  res.status(200).json({ status: 'success', data: { isValid } });
});

exports.getPincodeDetails = catchAsync(async (req, res, next) => {
  res.status(200).json({ status: 'success', data: { pincode: req.params.pincode, available: true } });
});
