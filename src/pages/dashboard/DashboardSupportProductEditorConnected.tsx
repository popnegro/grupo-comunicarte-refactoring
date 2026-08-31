import DashboardSupportProductEditor from './DashboardSupportProductEditor';
import DashboardSupportMediaUpload from './DashboardSupportMediaUpload';
import { useParams } from 'react-router-dom';

export default function DashboardSupportProductEditorConnected({ mode }: { mode?: 'create' | 'edit' }) {
  const { canonicalId } = useParams();
  return (
    <>
      <DashboardSupportProductEditor mode={mode} />
      {canonicalId && (
        <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <DashboardSupportMediaUpload canonicalId={canonicalId} />
        </div>
      )}
    </>
  );
}
