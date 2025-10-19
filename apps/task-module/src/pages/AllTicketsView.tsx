import React, { useEffect, useState } from 'react';
import { PageContainer, PageTitle } from '@shared/ui-components';
import { useTicketStore } from '../stores/ticketStore';
import { TicketCard } from '../components/TicketCard';
import { Ticket, TicketStatus, User, UserRole } from '../types';
import {
  PageHeader,
  PageSubtitle,
  FilterBar,
  FilterGroup,
  FilterLabel,
  Select,
  TabsContainer,
  TabsList,
  Tab,
  Grid,
  EmptyState,
  EmptyStateTitle,
  EmptyStateText
} from '../components/CommonControls';

// Mock users
const mockUsers: User[] = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com', role: UserRole.USER },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', role: UserRole.USER },
  { id: 'user-3', name: 'Bob Johnson', email: 'bob@example.com', role: UserRole.USER },
  { id: 'user-4', name: 'Alice Brown', email: 'alice@example.com', role: UserRole.USER },
];

export const AllTicketsView: React.FC = () => {
  const { tickets, fetchTickets, getTicketsByAssignee } = useTicketStore();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState<string>('all');

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = React.useMemo(() => {
    if (selectedUser === 'all') {
      return tickets;
    }
    return getTicketsByAssignee(selectedUser);
  }, [tickets, selectedUser, getTicketsByAssignee]);

  const ticketsByStatus = React.useMemo(() => {
    return {
      all: filteredTickets,
      assigned: filteredTickets.filter((t) => t.status === TicketStatus.ASSIGNED),
      inQueue: filteredTickets.filter((t) => t.status === TicketStatus.IN_QUEUE),
      picked: filteredTickets.filter((t) => t.status === TicketStatus.PICKED),
      completed: filteredTickets.filter((t) => t.status === TicketStatus.COMPLETED),
      rerouted: filteredTickets.filter((t) => t.status === TicketStatus.REROUTED),
    };
  }, [filteredTickets]);

  const getTicketsForTab = (tab: number): Ticket[] => {
    switch (tab) {
      case 0:
        return ticketsByStatus.all;
      case 1:
        return ticketsByStatus.assigned;
      case 2:
        return ticketsByStatus.inQueue;
      case 3:
        return ticketsByStatus.picked;
      case 4:
        return ticketsByStatus.completed;
      case 5:
        return ticketsByStatus.rerouted;
      default:
        return [];
    }
  };

  const currentTickets = getTicketsForTab(selectedTab);

  const tabs = [
    { label: `All (${ticketsByStatus.all.length})`, index: 0 },
    { label: `Assigned (${ticketsByStatus.assigned.length})`, index: 1 },
    { label: `In Queue (${ticketsByStatus.inQueue.length})`, index: 2 },
    { label: `Picked (${ticketsByStatus.picked.length})`, index: 3 },
    { label: `Completed (${ticketsByStatus.completed.length})`, index: 4 },
    { label: `Rerouted (${ticketsByStatus.rerouted.length})`, index: 5 },
  ];

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>All Tickets Overview</PageTitle>
        <PageSubtitle>View and manage all tickets assigned to team members</PageSubtitle>
      </PageHeader>

      <FilterBar>
        <FilterGroup>
          <FilterLabel htmlFor="user-filter">Filter by User:</FilterLabel>
          <Select
            id="user-filter"
            name="user-filter"
            aria-label="Filter tickets by user"
            title="Filter tickets by user"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="all">All Users</option>
            {mockUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </Select>
        </FilterGroup>
      </FilterBar>

      <TabsContainer>
        <TabsList>
          {tabs.map((tab) => (
            <Tab
              key={tab.index}
              $active={selectedTab === tab.index}
              onClick={() => setSelectedTab(tab.index)}
            >
              {tab.label}
            </Tab>
          ))}
        </TabsList>
      </TabsContainer>

      <Grid>
        {currentTickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
        {currentTickets.length === 0 && (
          <EmptyState>
            <EmptyStateTitle>No tickets found</EmptyStateTitle>
            <EmptyStateText>
              {selectedUser === 'all' 
                ? 'There are no tickets in this status yet.'
                : `No tickets found for the selected user in this status.`}
            </EmptyStateText>
          </EmptyState>
        )}
      </Grid>
    </PageContainer>
  );
};

export default AllTicketsView;
