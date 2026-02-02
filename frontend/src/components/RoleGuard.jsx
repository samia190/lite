import React from 'react';
export default function RoleGuard({user, allowed = [], children}){
  if(!allowed || allowed.length === 0) return children;
  const role = user?.role || 'guest';
  if(allowed.includes(role)) return children;
  return <div><h3>Access denied</h3><p>You do not have permission to view this page.</p></div>
}