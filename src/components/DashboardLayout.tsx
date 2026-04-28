import { useState } from 'react';
import { Sidebar } from '../Sidebar';
import { CreateDiscussionDialog } from '@/components/CreateDiscussionDialog';
import { useAuth } from '@/context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleCreateClick = () => {
    if (isAuthenticated) {
      setIsCreateOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar onCreateClick={handleCreateClick} />

      {/* Main Content - margin-right on desktop for sidebar, padding-bottom on mobile for bottom nav */}
      <main className="md:mr-[4.5rem] pb-20 md:pb-0 min-h-screen transition-all">
        {children}
      </main>

      {/* Create Discussion Dialog */}
      <CreateDiscussionDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
