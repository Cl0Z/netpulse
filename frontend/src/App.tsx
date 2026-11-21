import { useState } from 'react';
import { SideNav } from './components/layout/SideNav';
import { TopBar } from './components/layout/TopBar';
import { Dashboard } from './pages/Dashboard';
import { NetworkStats } from './pages/NetworkStats';
import { Connections } from './pages/Connections';

export type TabType = 'Dashboard' | 'Connections' | 'Network';

function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('Dashboard');
  const [isOnline, setIsOnline] = useState(false);
  const [nodeName, setNodeName] = useState('home-server');
  const [ipAddress, setIpAddress] = useState('Unknown');

  const handleStatusChange = (online: boolean, name: string, ip: string) => {
    setIsOnline(online);
    if (name) setNodeName(name);
    if (ip) setIpAddress(ip);
  };

  return (
    <div className="app-container">
      <SideNav 
        nodeName={nodeName} 
        ipAddress={ipAddress} 
        isOnline={isOnline} 
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
      <main className="main-content">
        <TopBar isOnline={isOnline} />
        {currentTab === 'Dashboard' && (
          <Dashboard nodeId="home-server" onStatusChange={handleStatusChange} />
        )}
        {currentTab === 'Connections' && (
          <Connections nodeId="home-server" onStatusChange={handleStatusChange} />
        )}
        {currentTab === 'Network' && (
          <NetworkStats nodeId="home-server" onStatusChange={handleStatusChange} />
        )}
      </main>
    </div>
  );
}

export default App;
