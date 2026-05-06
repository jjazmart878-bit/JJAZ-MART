import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails, Grid, Card, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PrivacyPage = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Information We Collect',
      content: `We collect information that you provide directly to us, including:
• Name and contact information
• Payment and billing information
• Shipping addresses
• Shopping history and preferences
• Communication history with our support team`,
    },
    {
      title: 'How We Use Your Information',
      content: `We use the information we collect to:
• Process your orders and payments
• Provide customer support
• Send you promotional offers and updates
• Improve our website and services
• Comply with legal obligations`,
    },
    {
      title: 'Information Sharing',
      content: `We do not sell your personal information. We may share information with:
• Service providers who assist in our operations
• Payment processors for transaction handling
• Legal authorities when required by law`,
    },
    {
      title: 'Data Security',
      content: `We implement appropriate security measures to protect your personal information, including:
• SSL encryption for all data transmission
• Secure storage of payment information
• Regular security audits
• Access controls for employee data`,
    },
    {
      title: 'Your Rights',
      content: `You have the right to:
• Access your personal information
• Correct inaccurate data
• Request deletion of your data
• Opt-out of marketing communications
• Export your data`,
    },
  ];

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>Privacy Policy</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            {[
              { icon: <SecurityIcon />, title: 'Secure Shopping', description: '256-bit SSL encryption on all transactions' },
              { icon: <VisibilityIcon />, title: 'Transparent Practices', description: 'Clear data usage policies' },
              { icon: <DeleteIcon />, title: 'Right to Delete', description: 'Request deletion of your data anytime' },
              { icon: <AssignmentIcon />, title: 'Data Portability', description: 'Export your data in standard formats' },
            ].map((item, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <Box sx={{ color: 'primary.main', mb: 2, display: 'flex', justifyContent: 'center' }}>{item.icon}</Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card sx={{ p: 4 }}>
            {sections.map((section, i) => (
              <Accordion key={i} defaultExpanded={i === 0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{section.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{section.content}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Card>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Last updated: {new Date().toLocaleDateString()}
            </Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' }}
              onClick={() => navigate('/terms')}
            >
              View Terms & Conditions
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default PrivacyPage;