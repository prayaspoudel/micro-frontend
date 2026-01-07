/**
 * SSO Login Button Component
 */

import React from 'react';
import styled from 'styled-components';

interface SSOLoginButtonProps {
  provider: 'auth0' | 'okta' | 'keycloak' | 'azure-ad' | 'google' | 'mock';
  onClick: () => void;
  disabled?: boolean;
}

const Button = styled.button<{ provider: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  &:hover:not(:disabled) {
    background-color: ${props => props.theme.colors.gray[50]};
    border-color: ${props => props.theme.colors.primary[500]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${props => props.provider === 'google' && `
    background-color: #fff;
    border-color: #dadce0;
    
    &:hover:not(:disabled) {
      background-color: #f8f9fa;
      border-color: #4285f4;
    }
  `}

  ${props => props.provider === 'azure-ad' && `
    background-color: #0078d4;
    color: white;
    border-color: #0078d4;
    
    &:hover:not(:disabled) {
      background-color: #106ebe;
    }
  `}
`;

const ProviderIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProviderLogos: Record<string, string> = {
  'auth0': '🔐',
  'okta': '🔑',
  'keycloak': '🛡️',
  'azure-ad': '🔷',
  'google': '🔴',
  'mock': '🧪',
};

const ProviderNames: Record<string, string> = {
  'auth0': 'Auth0',
  'okta': 'Okta',
  'keycloak': 'Keycloak',
  'azure-ad': 'Microsoft',
  'google': 'Google',
  'mock': 'Mock SSO (Dev)',
};

export const SSOLoginButton: React.FC<SSOLoginButtonProps> = ({
  provider,
  onClick,
  disabled = false,
}) => {
  return (
    <Button
      provider={provider}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      <ProviderIcon>{ProviderLogos[provider]}</ProviderIcon>
      <span>Sign in with {ProviderNames[provider]}</span>
    </Button>
  );
};
