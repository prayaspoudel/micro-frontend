import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { healthcareApi } from '../services/api';

const PatientsContainer = styled.div`
  padding: 2rem;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: ${props => props.theme.colors?.primary?.[600] || '#10b981'};
  }
  
  .actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    
    button {
      padding: 0.75rem 1.5rem;
      background: ${props => props.theme.colors?.primary?.[600] || '#10b981'};
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      
      &:hover {
        opacity: 0.9;
      }
    }
  }
  
  .patients-list {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    
    th {
      background: #f3f4f6;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }
    
    td {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    
    tr:hover {
      background: #f9fafb;
      cursor: pointer;
    }
  }
`;

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const Patients: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const result: any = await healthcareApi.getContacts();
      setContacts(result.data || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/patients/${id}`);
  };

  if (loading) {
    return <PatientsContainer><p>Loading patients...</p></PatientsContainer>;
  }

  return (
    <PatientsContainer>
      <h1>Patients</h1>
      
      <div className="actions">
        <button onClick={() => navigate('/patients/new')}>Add New Patient</button>
      </div>
      
      <div className="patients-list">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} onClick={() => handleRowClick(contact.id)}>
                <td>{contact.firstName} {contact.lastName}</td>
                <td>{contact.email}</td>
                <td>{contact.phone}</td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center' }}>No patients found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PatientsContainer>
  );
};

export default Patients;
