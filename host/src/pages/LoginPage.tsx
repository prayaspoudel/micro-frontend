import React, { useState } from 'react';
import styled from 'styled-components';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@shared/state';
import { Button, SSOLoginButton, SSOError } from '@shared/ui-components';
import { isSSOEnabled, getSSOConfig } from '@shared/utils';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.primary[500]} 0%, 
    ${props => props.theme.colors.primary[700]} 100%);
`;

const LoginCard = styled.div`
  background-color: ${props => props.theme.colors.background.primary};
  padding: ${props => props.theme.spacing['3xl']};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.xl};
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.base};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[100]};
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: center;
  margin-top: ${props => props.theme.spacing.sm};
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: ${props => props.theme.spacing.lg} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${props => props.theme.colors.gray[300]};
  }
  
  &::before {
    margin-right: ${props => props.theme.spacing.md};
  }
  
  &::after {
    margin-left: ${props => props.theme.spacing.md};
  }
`;

const DividerText = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const SSOButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@techcorp.com');
  const [password, setPassword] = useState('password123');
  const [ssoError, setSSOError] = useState<string | null>(null);
  const { login, loginWithSSO, isLoading, error, isAuthenticated } = useAuthStore();
  
  const ssoEnabled = isSSOEnabled();
  const ssoConfig = ssoEnabled ? getSSOConfig() : null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleSSOLogin = async () => {
    setSSOError(null);
    try {
      await loginWithSSO();
    } catch (err) {
      setSSOError(err instanceof Error ? err.message : 'SSO login failed');
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>Login</Title>
        
        {ssoError && <SSOError error={ssoError} onRetry={handleSSOLogin} />}
        
        {ssoEnabled && ssoConfig && (
          <>
            <SSOButtonGroup>
              <SSOLoginButton
                provider={ssoConfig.provider}
                onClick={handleSSOLogin}
                disabled={isLoading}
              />
            </SSOButtonGroup>
            
            <Divider>
              <DividerText>or continue with email</DividerText>
            </Divider>
          </>
        )}
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>
          
          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
