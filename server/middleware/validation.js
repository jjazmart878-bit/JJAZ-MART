const Joi = require('joi');

const stringEmail = Joi.string().email({ tlds: { allow: false } });

const registerSchema = Joi.object({
  email: Joi.string().min(5).max(255).required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(2).max(255).required(),
  phone: Joi.string().min(10).max(20).required(),
  sendOtp: Joi.boolean().optional(),
  verify: Joi.boolean().optional(),
  otp: Joi.string().when('verify', {
    is: true,
    then: Joi.string().length(6).required(),
    otherwise: Joi.string().allow('', null).optional()
  }),
  confirmPassword: Joi.string().allow('', null).optional()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().min(5).max(255).required()
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().min(5).max(255).required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().min(5).max(255).required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(255).optional(),
  phone: Joi.string().min(10).max(20).optional(),
  avatarUrl: Joi.string().uri().optional()
});

const addressSchema = Joi.object({
  label: Joi.string().max(50).required(),
  fullAddress: Joi.string().required(),
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100).required(),
  pincode: Joi.string().max(20).required(),
  isDefault: Joi.boolean().optional()
});

const productSchema = Joi.object({
  title: Joi.string().min(3).max(500).required(),
  description: Joi.string().optional(),
  shortDescription: Joi.string().max(500).optional(),
  categoryId: Joi.number().optional().allow(null),
  price: Joi.number().positive().required(),
  originalPrice: Joi.number().positive().optional().allow(null),
  quantity: Joi.number().integer().min(0).required(),
  images: Joi.array().items(Joi.string()).optional(),
  isFeatured: Joi.boolean().optional()
});

const categorySchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  slug: Joi.string().min(2).max(255).required(),
  description: Joi.string().optional(),
  imageUrl: Joi.string().uri().optional().allow('', null),
  parentId: Joi.number().optional().allow(null)
});

const orderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required(),
  shippingAddressId: Joi.number().required(),
  paymentMethod: Joi.string().valid('cod', 'online').required(),
  notes: Joi.string().allow('', null).optional()
});

const validate = (schema) => {
  return (req, res, next) => {
    console.log('Validation - req.body before:', JSON.stringify(req.body));
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      console.log('Validation error:', error.details);
      const errors = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({ error: errors });
    }
    console.log('Validation success, value.email:', value?.email);
    // Don't replace req.body - just validate and continue
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  addressSchema,
  productSchema,
  categorySchema,
  orderSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validate
};