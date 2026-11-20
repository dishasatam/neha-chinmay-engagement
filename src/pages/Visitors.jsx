import React from 'react';
import AdminDashboard from './AdminDashboard';

export default function Visitors(props) {
  return <AdminDashboard {...props} initialTab="visitors" />;
}
