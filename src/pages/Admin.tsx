import React from 'react';
import AdminBatchManager from '../components/AdminBatchManager';
import { useWallet } from '../hooks/useWallet';
import { Card, CardContent } from '../components/ui/card';

const AdminPage: React.FC = () => {
  const { address, isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="container mx-auto py-8">
        <Card className="glass-card border border-white/10 backdrop-blur-md bg-black/30">
          <CardContent className="py-8">
            <div className="text-center text-white/70">
              Please connect your wallet to access the admin panel
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        Admin Panel
      </h1>
      <AdminBatchManager isAdmin={true} />
    </div>
  );
};

export default AdminPage;
