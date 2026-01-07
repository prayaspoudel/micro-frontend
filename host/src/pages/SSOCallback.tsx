/**
 * SSO Callback Page
 * Handles OAuth callback after SSO authentication
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '@shared/state';

const CallbackContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.primary[500]} 0%, 
    ${props => props.theme.colors.primary[700]} 100%);
  padding: ${props => props.theme.spacing.xl};
`;

const CallbackCard = styled.div`
  background-color: ${props => props.theme.colors.background.primary};
  padding: ${props => props.theme.spacing['3xl']};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.xl};
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Spinner = styled.div`
  border: 4px solid ${props => props.theme.colors.gray[300]};
  border-top: 4px solid ${props => props.theme.colors.primary[500]};
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto ${props => props.theme.spacing.lg};

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Message = styled.p`
  font-size: ${props => props.theme.typography.fontSize.base};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.typography.fontSize.sm};
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.error}10;
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.error};
  margin-top: ${props => props.theme.spacing.lg};
`;

const SSOCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleSSOCallback, error: authError } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get code and state from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for error response
        if (errorParam) {
          setError(errorDescription || errorParam);
          setProcessing(false);
          return;
        }

        // Validate required parameters
        if (!code || !state) {
          setError('Invalid callback parameters. Please try logging in again.');
          setProcessing(false);
          return;
        }

        // Handle SSO callback
        await handleSSOCallback(code, state);

        // Redirect to dashboard on success
        setProcessing(false);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('SSO callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setProcessing(false);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, handleSSOCallback, navigate]);

  return (
    <CallbackContainer>
      <CallbackCard>
        {processing ? (
          <>
            <Spinner />
            <Title>Completing Sign-In</Title>
            <Message>Please wait while we authenticate you...</Message>
          </>
        ) : error || authError ? (
          <>
            <Title>Authentication Failed</Title>
            <ErrorMessage>{error || authError}</ErrorMessage>
            <Message>Redirecting to login...</Message>
          </>
        ) : (
          <>
            <Title>Success!</Title>
            <Message>Redirecting to dashboard...</Message>
          </>
        )}
      </CallbackCard>
    </CallbackContainer>
  );
};

export default SSOCallback;
