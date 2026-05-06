const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getAddressesByUserId, createAddress, updateAddress, deleteAddress, setDefaultAddress } = require('../queries/addresses');
const { validate, addressSchema } = require('../middleware/validation');

router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const addresses = await getAddressesByUserId(req.user.id);
    res.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Failed to get addresses' });
  }
});

router.post('/addresses', authenticateToken, validate(addressSchema), async (req, res) => {
  try {
    const { label, fullAddress, city, state, pincode, isDefault } = req.body;

    const address = await createAddress(req.user.id, label, fullAddress, city, state, pincode, isDefault);

    res.status(201).json(address);
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ error: 'Failed to create address' });
  }
});

router.put('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { label, fullAddress, city, state, pincode, isDefault } = req.body;

    const address = await updateAddress(parseInt(id), req.user.id, label, fullAddress, city, state, pincode, isDefault);

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json(address);
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

router.delete('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteAddress(parseInt(id), req.user.id);

    if (!result) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

router.put('/addresses/:id/default', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const address = await setDefaultAddress(parseInt(id), req.user.id);

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json(address);
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ error: 'Failed to set default address' });
  }
});

module.exports = router;