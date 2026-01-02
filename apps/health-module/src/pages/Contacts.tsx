import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { healthcareApi } from '../services/api';

const ContactsContainer = styled.div`
  padding: 2rem;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: ${props => props.theme.colors?.primary?.[600] || '#10b981'};
  }
  
  .contacts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .contact-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    
    h3 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      color: ${props => props.theme.colors?.primary?.[600] || '#10b981'};
    }
    
    p {
      margin: 0.5rem 0;
      color: #6b7280;
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

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <ContactsContainer><p>Loading contacts...</p></ContactsContainer>;
  }

  return (
    <ContactsContainer>
      <h1>Contacts</h1>
      
      <div className="contacts-grid">
        {contacts.map((contact) => (
          <div key={contact.id} className="contact-card">
            <h3>{contact.firstName} {contact.lastName}</h3>
            <p>Email: {contact.email}</p>
            <p>Phone: {contact.phone}</p>
          </div>
        ))}
        {contacts.length === 0 && <p>No contacts found</p>}
      </div>
    </ContactsContainer>
  );
};

export default Contacts;
