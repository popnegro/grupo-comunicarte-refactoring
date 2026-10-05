import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../../lib/api';
import { calculateSupportTotal } from '../../../lib/supportPricing';
import { getSupportEditorThemeConfig } from '../supportEditorThemes';
import type { InventoryItem, MobileRoute } from '../../../types';
import { emptyForm, type EditorTab, type FormState } from './types';
import { familyFor, isFormDirty, normalize, payloadFrom } from './formUtils';

export function useSupportForm(explicitMode?: 'create' | 'edit') {
  const { canonicalId } = useParams();
  const navigate = useNavigate();
  const mode = explicitMode || (canonicalId ? 'edit' : 'create');

  const [form, setForm] = useState<FormState>(emptyForm);
  const [baseline, setBaseline] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<EditorTab>('general');
  const [coordHelperVal, setCoordHelperVal] = useState('');
  const [coordHelperError, setCoordHelperError] = useState('');
  const [coordHelperSuccess, setCoordHelperSuccess] = useState(false);

  useEffect(() => {
    if (mode !== 'edit' || !canonicalId) {
      setBaseline(emptyForm);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return navigate('/login');
        const r = await apiFetch(`/api/admin/supports/${encodeURIComponent(canonicalId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = await r.json();
        if (r.status === 401) return navigate('/login');
        if (!r.ok || j.status !== 'success') throw new Error(j.message || 'No se pudo cargar el soporte.');
        if (cancelled) return;
        const normalized = normalize(j.data);
        setForm(normalized);
        setBaseline(normalized);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudo cargar el soporte.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, canonicalId, navigate]);

  const theme = useMemo(() => getSupportEditorThemeConfig(form.tipo_soporte), [form.tipo_soporte]);
  const pricingTotal = useMemo(
    () =>
      calculateSupportTotal({
        exhibition_price: form.pricing.exhibition,
        installation_price: form.pricing.installation,
        printing_price: form.pricing.printing,
      }),
    [form.pricing.exhibition, form.pricing.installation, form.pricing.printing],
  );

  const isDirty = useMemo(() => isFormDirty(form, baseline), [form, baseline]);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const handleInternalNavigationClick = (e: MouseEvent) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || !(href.startsWith('/') || href.startsWith('http'))) return;
      const isCurrentEdit = canonicalId && href.includes(`/dashboard/soportes/${canonicalId}/edit`);
      const isCurrentPreview =
        canonicalId && href.includes(`/dashboard/soportes/${canonicalId}/preview`);
      if (isCurrentEdit || isCurrentPreview) return;
      const confirmDiscard = window.confirm(
        '¿Descartar cambios? Tenés modificaciones sin guardar. Si salís ahora, perderás todo el trabajo realizado.',
      );
      if (!confirmDiscard) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('click', handleInternalNavigationClick, true);
    return () => document.removeEventListener('click', handleInternalNavigationClick, true);
  }, [isDirty, canonicalId]);

  const handleNavigateWithConfirm = useCallback(
    (targetPath: string) => {
      if (isDirty) {
        const confirmDiscard = window.confirm(
          '¿Descartar cambios? Tenés modificaciones sin guardar. Si salís ahora, perderás todo el trabajo realizado.',
        );
        if (!confirmDiscard) return;
      }
      navigate(targetPath);
    },
    [isDirty, navigate],
  );

  const set = useCallback((patch: Partial<FormState>) => {
    setForm((c) => ({ ...c, ...patch }));
  }, []);

  const setNested = useCallback((key: 'traditional' | 'led' | 'mobile' | 'pricing', patch: any) => {
    setForm((c) => ({ ...c, [key]: { ...c[key], ...patch } }));
  }, []);

  const addRest = useCallback(() => {
    setForm((c) => (c.restMedia.length < 2 ? { ...c, restMedia: [...c.restMedia, ''] } : c));
  }, []);

  const updateRest = useCallback((i: number, v: string) => {
    setForm((c) => ({ ...c, restMedia: c.restMedia.map((x, n) => (n === i ? v : x)) }));
  }, []);

  const removeRest = useCallback((i: number) => {
    setForm((c) => ({ ...c, restMedia: c.restMedia.filter((_, n) => n !== i) }));
  }, []);

  const previewItem = useMemo<InventoryItem>(() => {
    const family = familyFor(form.tipo_soporte);
    const technical: any =
      form.tipo_soporte === 'tradicional'
        ? {
            measures: form.traditional.medidas,
            summary: form.traditional.formato,
            caras: Number(form.traditional.caras || 0),
            impresion: form.traditional.impresion,
            monthly_impacts:
              form.traditional.monthly_impacts === ''
                ? null
                : Number(form.traditional.monthly_impacts),
            metadata: { cover_media_type: form.coverKind },
          }
        : form.tipo_soporte === 'led'
          ? {
              measures: form.led.medidas,
              resolution: form.led.resolucion,
              daily_frequency: form.led.frecuencia,
              spot_duration_seconds: Number(form.led.spot_duration || 0),
              monthly_impacts:
                form.led.monthly_impacts === '' ? null : Number(form.led.monthly_impacts),
              metadata: { cover_media_type: form.coverKind },
            }
          : {
              measures: form.mobile.pantalla,
              resolution: form.mobile.resolucion,
              spot_duration_seconds: Number(form.mobile.spot_duration || 0),
              minimum_daily_outings: Number(form.mobile.minimum_daily_outings || 0),
              monthly_impacts:
                form.mobile.monthly_impacts === '' ? null : Number(form.mobile.monthly_impacts),
              metadata: { cover_media_type: form.coverKind },
            };
    const base: any = {
      canonical_id: canonicalId || 'preview',
      name: form.publicName || 'Nombre público',
      ciudad: form.ciudad,
      tipo_soporte: form.tipo_soporte,
      family,
      active: form.active,
      description: form.description,
      characteristics:
        form.tipo_soporte === 'tradicional'
          ? form.traditional.impresion
          : form.tipo_soporte === 'led'
            ? form.led.video_mode
            : form.mobile.recorrido,
      mapa_url: form.mapa_url,
      imageUrls: [form.coverUrl, ...form.restMedia].filter(Boolean).slice(0, 3),
      disponibilidad: form.disponibilidad,
      availableFrom:
        form.disponibilidad === 'reservado' ? `${form.reservedFrom}|${form.reservedUntil}` : undefined,
      reservedFrom: form.disponibilidad === 'reservado' ? form.reservedFrom : undefined,
      reservedUntil: form.disponibilidad === 'reservado' ? form.reservedUntil : undefined,
      address: form.address || 'Ubicación del soporte',
      isFeatured: form.isFeatured,
      technical,
    };
    return family === 'led_mobile'
      ? ({
          ...base,
          routePath: [],
          waypoints: [],
          schedule: form.mobile.operation_days,
          duration: form.mobile.duration,
          technical: {
            ...technical,
            monthly_impacts:
              form.mobile.monthly_impacts === '' ? null : Number(form.mobile.monthly_impacts),
          },
          route: undefined,
        } as MobileRoute)
      : (base as InventoryItem);
  }, [canonicalId, form]);

  const save = useCallback(async () => {
    setError('');
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return navigate('/login');
      const payload = payloadFrom(form);
      const url =
        mode === 'create'
          ? '/api/admin/supports'
          : `/api/admin/supports/${encodeURIComponent(canonicalId || '')}`;
      const r = await apiFetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (r.status === 401) return navigate('/login');
      if (!r.ok || j.status !== 'success') {
        throw new Error(j.message || 'No se pudo guardar el soporte.');
      }
      const id = j.data?.canonical_id || canonicalId;
      if (id) {
        const savedForm = j.data ? normalize(j.data) : form;
        setForm(savedForm);
        setBaseline(savedForm);
        navigate(`/dashboard/soportes/${encodeURIComponent(id)}/edit`, { replace: true });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el soporte.');
    } finally {
      setSaving(false);
    }
  }, [form, mode, canonicalId, navigate]);

  const typeLabel =
    form.tipo_soporte === 'led' ? 'LED' : form.tipo_soporte === 'led_movil' ? 'LED móvil' : 'Tradicional';

  return {
    mode,
    canonicalId,
    form,
    loading,
    saving,
    error,
    activeTab,
    setActiveTab,
    coordHelperVal,
    setCoordHelperVal,
    coordHelperError,
    setCoordHelperError,
    coordHelperSuccess,
    setCoordHelperSuccess,
    theme,
    pricingTotal,
    isDirty,
    set,
    setNested,
    addRest,
    updateRest,
    removeRest,
    previewItem,
    save,
    handleNavigateWithConfirm,
    typeLabel,
    navigate,
  };
}
