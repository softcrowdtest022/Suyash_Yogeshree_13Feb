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
  Build as BuildIcon,
  Settings as SettingsIcon,
  Engineering as EngineeringIcon,
  AutoFixHigh as AutoFixHighIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

const OperationMaster = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 8 },
          borderRadius: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
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
            top: -60,
            left: -60,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
            opacity: 0.08,
            zIndex: 0
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            bottom: -70,
            right: -70,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
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
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)',
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { 
                transform: 'scale(1)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)'
              },
              '50%': { 
                transform: 'scale(1.05)',
                boxShadow: '0 12px 40px rgba(139, 92, 246, 0.3)'
              }
            }
          }}
        >
          <BuildIcon sx={{ fontSize: 60, color: 'white' }} />
        </Box>

        {/* Main text */}
        <Typography
          variant="h1"
          component="h1"
          sx={{
            mb: 2,
            fontWeight: 800,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #5B21B6 100%)',
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
            color: '#7C3AED',
            fontWeight: 600,
            position: 'relative',
            zIndex: 1
          }}
        >
          Operation Master
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
          Advanced operation management system is under development
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
            { icon: <SettingsIcon />, label: 'Settings', color: '#8B5CF6' },
            { icon: <EngineeringIcon />, label: 'Engineering', color: '#7C3AED' },
            { icon: <AutoFixHighIcon />, label: 'Automation', color: '#5B21B6' },
            { icon: <TimeIcon />, label: 'Scheduling', color: '#8B5CF6' }
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
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: alpha(item.color, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${alpha(item.color, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    background: alpha(item.color, 0.15),
                    borderColor: alpha(item.color, 0.3)
                  }
                }}
              >
                <Box sx={{ color: item.color, fontSize: 32 }}>
                  {item.icon}
                </Box>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: item.color,
                  fontWeight: 600,
                  fontSize: '0.875rem'
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
                color: '#7C3AED',
                fontWeight: 600
              }}
            >
              72%
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
                width: '72%',
                background: 'linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%)',
                borderRadius: 4,
                animation: 'progress 2s ease-out',
                '@keyframes progress': {
                  '0%': { width: '0%' },
                  '100%': { width: '72%' }
                }
              }}
            />
          </Box>
        </Box>

        {/* Additional decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '30%',
            right: '12%',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: alpha('#8B5CF6', 0.3),
            animation: 'bounce 3s ease-in-out infinite',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' }
            }
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            bottom: '40%',
            left: '12%',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: alpha('#7C3AED', 0.3),
            animation: 'bounce 2.5s ease-in-out infinite 0.5s',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-15px)' }
            }
          }}
        />

        {/* Information text */}
        <Typography
          variant="body2"
          sx={{
            mt: 4,
            color: '#94A3B8',
            maxWidth: 500,
            mx: 'auto',
            position: 'relative',
            zIndex: 1
          }}
        >
          This module will include workflow management, process automation, 
          operation scheduling, and real-time monitoring capabilities.
        </Typography>
      </Paper>
    </Container>
  );
};

export default OperationMaster;