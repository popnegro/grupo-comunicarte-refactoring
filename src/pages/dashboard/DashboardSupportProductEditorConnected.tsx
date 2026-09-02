import DashboardSupportProductEditor from './DashboardSupportProductEditor';
import DashboardSupportMediaUpload from './DashboardSupportMediaUpload';
import { useParams } from 'react-router-dom';

export default function DashboardSupportProductEditorConnected({ mode }: { mode?: 'create' | 'edit' }) {
  const { canonicalId } = useParams();

  return (
    <>
      <DashboardSupportProductEditor mode={mode} />
      <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        {canonicalId ? (
          <DashboardSupportMediaUpload canonicalId={canonicalId} />
        ) : (
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
            <div className="text-eyebrow text-gray-500">MULTIMEDIA · R2</div>
            <h2 className="mt-1 text-lg font-bold text-gray-900">Imágenes y videos</h2>
            <p className="mt-2 text-sm text-gray-500">
              Primero creá el soporte. Una vez generado su ID, vas a poder cargar imágenes y videos directamente desde tu equipo.
            </p>
            <div className="mt-4 inline-flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-500">
              Disponible después de crear el soporte
            </div>
          </section>
        )}
      </div>
    </>
  );
}
