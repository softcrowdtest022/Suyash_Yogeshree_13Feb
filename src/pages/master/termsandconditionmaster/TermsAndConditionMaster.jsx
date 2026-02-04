import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Stack,
  alpha
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Policy as PolicyIcon,
  Description as DescriptionIcon,
  Verified as VerifiedIcon,
  Balance as BalanceIcon,
  Article as ArticleIcon
} from '@mui/icons-material';

const TermsAndConditionMaster = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 8 },
          borderRadius: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #fef7ff 0%, #f5f3ff 100%)',
          border: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 500,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {/* Background decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            opacity: 0.08,
            zIndex: 0
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #065F46 0%, #059669 100%)',
            opacity: 0.06,
            zIndex: 0
          }}
        />

        {/* Main icon */}
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 8px 32px rgba(5, 150, 105, 0.2)',
            animation: 'rotate 20s linear infinite',
            '@keyframes rotate': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }}
        >
          <Box sx={{ 
            animation: 'counterRotate 20s linear infinite',
            '@keyframes counterRotate': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(-360deg)' }
            }
          }}>
            <GavelIcon sx={{ fontSize: 60, color: 'white' }} />
          </Box>
        </Box>

        {/* Main text */}
        <Typography
          variant="h1"
          component="h1"
          sx={{
            mb: 2,
            fontWeight: 800,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            background: 'linear-gradient(135deg, #065F46 0%, #059669 50%, #10B981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            position: 'relative',
            zIndex: 1
          }}
        >
          Coming Soon
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h5"
          component="h2"
          sx={{
            mb: 1,
            color: '#059669',
            fontWeight: 600,
            position: 'relative',
            zIndex: 1
          }}
        >
          Terms & Conditions Master
        </Typography>

        <Typography
          variant="h6"
          component="h2"
          sx={{
            mb: 4,
            color: '#64748B',
            fontWeight: 400,
            maxWidth: 600,
            mx: 'auto',
            position: 'relative',
            zIndex: 1
          }}
        >
          Comprehensive terms and conditions management system in development
        </Typography>

        {/* Feature icons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={4}
          sx={{
            mb: 6,
            position: 'relative',
            zIndex: 1
          }}
        >
          {[
            { icon: <PolicyIcon />, label: 'Policies', color: '#065F46' },
            { icon: <DescriptionIcon />, label: 'Documents', color: '#059669' },
            { icon: <VerifiedIcon />, label: 'Compliance', color: '#10B981' },
            { icon: <BalanceIcon />, label: 'Legal', color: '#065F46' },
            { icon: <ArticleIcon />, label: 'Agreements', color: '#059669' }
          ].map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box
                sx={{
                  width: 65,
                  height: 65,
                  borderRadius: '12px',
                  background: alpha(item.color, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${alpha(item.color, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    background: alpha(item.color, 0.15),
                    borderColor: alpha(item.color, 0.3),
                    boxShadow: `0 6px 20px ${alpha(item.color, 0.2)}`
                  }
                }}
              >
                <Box sx={{ color: item.color, fontSize: 28 }}>
                  {item.icon}
                </Box>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: item.color,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textAlign: 'center'
                }}
              >
                {item.label}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Status indicator */}
        <Box
          sx={{
            maxWidth: 400,
            width: '100%',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography variant="body2" color="#64748B">
              Development Progress
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#059669',
                fontWeight: 600
              }}
            >
              58%
            </Typography>
          </Stack>
          <Box
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e2e8f0',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '58%',
                background: 'linear-gradient(90deg, #065F46 0%, #10B981 100%)',
                borderRadius: 4,
                animation: 'progress 2s ease-out',
                '@keyframes progress': {
                  '0%': { width: '0%' },
                  '100%': { width: '58%' }
                }
              }}
            />
          </Box>
        </Box>

        {/* Decorative shapes */}
        <Box
          sx={{
            position: 'absolute',
            top: '25%',
            left: '15%',
            width: 24,
            height: 24,
            borderRadius: '4px',
            background: alpha('#059669', 0.2),
            transform: 'rotate(45deg)',
            animation: 'float 4s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'rotate(45deg) translateY(0px)' },
              '50%': { transform: 'rotate(45deg) translateY(-15px)' }
            }
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            bottom: '35%',
            right: '15%',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: alpha('#10B981', 0.2),
            animation: 'pulse 3s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { 
                transform: 'scale(1)',
                opacity: 0.8
              },
              '50%': { 
                transform: 'scale(1.3)',
                opacity: 0.4
              }
            }
          }}
        />

        {/* Additional info */}
        <Box sx={{ 
          mt: 4, 
          maxWidth: 500,
          position: 'relative',
          zIndex: 1
        }}>
          <Typography
            variant="body2"
            sx={{
              color: '#94A3B8',
              fontStyle: 'italic',
              lineHeight: 1.6
            }}
          >
            This module will include legal document management, 
            terms versioning, compliance tracking, and automated 
            agreement generation features.
          </Typography>
          
          <Typography
            variant="caption"
            sx={{
              mt: 2,
              color: '#059669',
              fontWeight: 500,
              display: 'block'
            }}
          >
            • Legal compliance • Version control • Document templates •
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsAndConditionMaster;