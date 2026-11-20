import React from 'react';
import AdminDashboard from './AdminDashboard';

export default function Settings(props) {
  return <AdminDashboard {...props} initialTab="settings" />;
}
