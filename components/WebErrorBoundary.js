import React from 'react';
import { Platform } from 'react-native';

// This is a simplified version for web that avoids using ErrorHandler
export function WebErrorBoundary({ children }) {
  return <>{children}</>;
}
