import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { healthcareApi } from '../services/api';

const DetailsContainer = styled.div`
  padding: 2rem;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    
    h1 {
      font-size: 2rem;
      color: ${props => props.theme.colors?.primary?.[600] || '#10b981'};
    }
    
    button {
      padding: 0.75rem 1.5rem;
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      
      &:hover {
        opacity: 0.9;
      }
    }
  }
  
  .content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .info-section {
    margin-bottom: 2rem;
    
    h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      color: ${props => props.theme.colors?.primary?.[600] || '#10b981'};
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    
    .info-item {
      label {
        display: block;
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 0.25rem;
      }
      
      .value {
        font-size: 1rem;
        color: #111827;
      }
    }
  }
`;

interface ContactDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<ContactDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPatientDetails(id);
    }
  }, [id]);

  const fetchPatientDetails = async (patientId: string) => {
    try {
      const result: any = await healthcareApi.getContact(patientId);
      setPatient(result.data);
    } catch (error) {
      console.error('Failed to fetch patient details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DetailsContainer><p>Loading patient details...</p></DetailsContainer>;
  }

  if (!patient) {
    return <DetailsContainer><p>Patient not found</p></DetailsContainer>;
  }

  return (
    <DetailsContainer>
      <div className="header">
        <h1>Patient Details</h1>
        <button onClick={() => navigate('/patients')}>Back to Patients</button>
      </div>
      
      <div className="content">
        <div className="info-section">
          <h2>Personal Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>First Name</label>
              <div className="value">{patient.firstName}</div>
            </div>
            <div className="info-item">
              <label>Last Name</label>
              <div className="value">{patient.lastName}</div>
            </div>
            <div className="info-item">
              <label>Email</label>
              <div className="value">{patient.email}</div>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <div className="value">{patient.phone}</div>
            </div>
          </div>
        </div>
      </div>
    </DetailsContainer>
  );
};

export default PatientDetails;
