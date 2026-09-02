import DashboardSupportProductEditor from './DashboardSupportProductEditor';

export default function DashboardSupportProductEditorConnected({ mode }: { mode?: 'create' | 'edit' }) {
  return <DashboardSupportProductEditor mode={mode} />;
}
