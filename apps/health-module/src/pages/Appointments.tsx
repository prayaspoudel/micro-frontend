import React from 'react';
import styled from 'styled-components';

const AppointmentsContainer = styled.div`
  padding: 2rem;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: ${props => props.theme.colors?.primary?.[600] || '#10b981'};
  }
  
  .appointments-list {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const Appointments: React.FC = () => {
  return (
    <AppointmentsContainer>
      <h1>Appointments</h1>
      
      <div className="appointments-list">
        <p>Appointments management coming soon...</p>
      </div>
    </AppointmentsContainer>
  );
};

export default Appointments;
