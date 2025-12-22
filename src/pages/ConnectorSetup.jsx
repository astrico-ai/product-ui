import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SetupWizard } from '@/components/setup/SetupWizard';

export default function ConnectorSetup() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <SetupWizard
      connectorTypeId={id}
      onClose={() => navigate('/connectors')}
    />
  );
}
