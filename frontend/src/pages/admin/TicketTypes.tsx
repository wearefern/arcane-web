import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Pencil, Trash2, Tags } from 'lucide-react';
import type { EventItem, TicketType, TicketTypeStatus } from '../../types';
import { listAllEvents } from '../../services/eventsService';
import {
  listByEvent,
  createTicketType,
  updateTicketType,
  removeTicketType,
} from '../../services/ticketTypesService';
import { Button } from '../../components/ui/Button';
import { Field, Input, Textarea, Select } from '../../components/ui/Field';
import { StatusBadge } from '../../components/ui/Badge';
import { Meter } from '../../components/ui/Stat';
import { Modal } from '../../components/ui/Modal';
import { LoadingBlock, StateBlock } from '../../components/ui/Feedback';
import { useToast } from '../../components/ui/Toast';
import { formatLkr, formatDateShort } from '../../lib/format';

const STATUSES: { value: TicketTypeStatus; label: string }[] = [
  { value: 'active', label: 'On sale' },
  { value: 'paused', label: 'Paused' },
  { value: 'sold_out', label: 'Sold out' },
  { value: 'scheduled', label: 'Scheduled' },
];

interface FormState {
  eventId: string;
  name: string;
  description: string;
  priceLkr: string;
  totalQty: string;
  soldQty: string;
  heldQty: string;
  perOrderLimit: string;
  saleStartAt: string;
  saleEndAt: string;
  status: TicketTypeStatus;
}

const EMPTY_FORM: FormState = {
  eventId: '',
  name: '',
  description: '',
  priceLkr: '',
  totalQty: '',
  soldQty: '0',
  heldQty: '0',
  perOrderLimit: '6',
  saleStartAt: '',
  saleEndAt: '',
  status: 'active',
};

/** ISO → "YYYY-MM-DDTHH:mm" for <input type="datetime-local">. */
function toLocalInput(iso: string): string {
  if (!iso) return '';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

function fromForm(form: FormState): Partial<TicketType> {
  return {
    eventId: form.eventId,
    name: form.name.trim(),
    description: form.description.trim(),
    priceLkr: Number(form.priceLkr) || 0,
    totalQty: Number(form.totalQty) || 0,
    soldQty: Number(form.soldQty) || 0,
    heldQty: Number(form.heldQty) || 0,
    perOrderLimit: Number(form.perOrderLimit) || 0,
    saleStartAt: form.saleStartAt ? new Date(form.saleStartAt).toISOString() : '',
    saleEndAt: form.saleEndAt ? new Date(form.saleEndAt).toISOString() : '',
    status: form.status,
  };
}

export default function TicketTypes() {
  const { toast } = useToast();

  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [eventId, setEventId] = useState('');
  const [eventsError, setEventsError] = useState(false);

  const [rows, setRows] = useState<TicketType[] | null>(null);
  const [loadedFor, setLoadedFor] = useState('');
  const [listError, setListError] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TicketType | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Load all events once; default the filter to the first event.
  useEffect(() => {
    let active = true;
    listAllEvents()
      .then((list) => {
        if (!active) return;
        setEvents(list);
        if (list.length) setEventId(list[0].id);
      })
      .catch(() => active && setEventsError(true));
    return () => {
      active = false;
    };
  }, []);

  // Load ticket types whenever the scoped event changes. `rows` belong to
  // `loadedFor`; while it differs from `eventId` the list reads as loading.
  useEffect(() => {
    if (!eventId) return;
    let active = true;
    listByEvent(eventId)
      .then((list) => {
        if (!active) return;
        setRows(list);
        setLoadedFor(eventId);
        setListError(false);
      })
      .catch(() => active && setListError(true));
    return () => {
      active = false;
    };
  }, [eventId]);

  const loadingRows = !listError && (rows === null || loadedFor !== eventId);

  const eventName = useMemo(
    () => events?.find((e) => e.id === eventId)?.title ?? '',
    [events, eventId],
  );

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, eventId: eventId || events?.[0]?.id || '' });
    setModalOpen(true);
  }

  function openEdit(t: TicketType) {
    setEditing(t);
    setForm({
      eventId: t.eventId,
      name: t.name,
      description: t.description,
      priceLkr: String(t.priceLkr),
      totalQty: String(t.totalQty),
      soldQty: String(t.soldQty),
      heldQty: String(t.heldQty),
      perOrderLimit: String(t.perOrderLimit),
      saleStartAt: toLocalInput(t.saleStartAt),
      saleEndAt: toLocalInput(t.saleEndAt),
      status: t.status,
    });
    setModalOpen(true);
  }

  function reloadCurrent() {
    if (!eventId) return;
    listByEvent(eventId)
      .then((list) => {
        setRows(list);
        setLoadedFor(eventId);
      })
      .catch(() => setListError(true));
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const payload = fromForm(form);
    try {
      if (editing) {
        await updateTicketType(editing.id, payload);
        toast({ tone: 'success', title: 'Ticket type updated', body: form.name.trim() });
      } else {
        await createTicketType(payload);
        toast({ tone: 'success', title: 'Ticket type created', body: form.name.trim() });
      }
      setModalOpen(false);
      // If the saved type belongs to the event in view, refresh the list.
      if (payload.eventId === eventId) reloadCurrent();
    } catch {
      toast({ tone: 'error', title: "Couldn't save ticket type", body: 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(t: TicketType) {
    setRemovingId(t.id);
    try {
      await removeTicketType(t.id);
      setRows((prev) => prev?.filter((r) => r.id !== t.id) ?? null);
      toast({ tone: 'success', title: 'Ticket type removed', body: t.name });
    } catch {
      toast({ tone: 'error', title: "Couldn't remove ticket type", body: 'Please try again.' });
    } finally {
      setRemovingId(null);
    }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <div className="adminhead">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1 className="adminhead__title display">Ticket types</h1>
          <p className="adminhead__sub">
            Price tiers, allocations and sale windows for each night.
          </p>
        </div>
        <div className="adminhead__actions">
          <Button variant="gold" onClick={openCreate} disabled={!events || events.length === 0}>
            <Plus size={16} /> New ticket type
          </Button>
        </div>
      </div>

      {/* ---- Event filter ---- */}
      <div className="toolbar">
        <div style={{ minWidth: 260 }}>
          <Field label="Event" htmlFor="tt-event-filter">
            <Select
              id="tt-event-filter"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              disabled={!events || events.length === 0}
            >
              {eventsError && <option value="">Couldn't load events</option>}
              {!events && <option value="">Loading…</option>}
              {events?.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      {/* ---- List ---- */}
      {eventsError ? (
        <StateBlock
          icon={<Tags />}
          title="We couldn't load events"
          body="Ticket types are scoped to an event. Please refresh to try again."
        />
      ) : listError ? (
        <StateBlock
          icon={<Tags />}
          title="We couldn't load ticket types"
          body="Something went wrong. Please refresh to try again."
        />
      ) : loadingRows || rows === null ? (
        <LoadingBlock label="Loading ticket types…" />
      ) : rows.length === 0 ? (
        <StateBlock
          icon={<Tags />}
          title="No ticket types yet"
          body={
            eventName
              ? `${eventName} has no tiers. Create the first one to open sales.`
              : 'Create the first tier to open sales.'
          }
          action={
            <Button variant="gold" onClick={openCreate}>
              <Plus size={16} /> New ticket type
            </Button>
          }
        />
      ) : (
        <div className="table-wrap">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="cell-num">Price</th>
                  <th style={{ minWidth: 160 }}>Sold</th>
                  <th className="cell-num">Held</th>
                  <th className="cell-num">Per order</th>
                  <th>Sale window</th>
                  <th>Status</th>
                  <th className="cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="cell-strong">{t.name}</div>
                      {t.description && (
                        <div className="meta" style={{ marginTop: 2, maxWidth: '36ch' }}>
                          {t.description}
                        </div>
                      )}
                    </td>
                    <td className="cell-mono cell-num">{formatLkr(t.priceLkr)}</td>
                    <td>
                      <div className="mono" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-2)' }}>
                        {t.soldQty} / {t.totalQty}
                      </div>
                      <div style={{ marginTop: 6, maxWidth: 130 }}>
                        <Meter value={t.soldQty} max={t.totalQty} />
                      </div>
                    </td>
                    <td className="cell-mono cell-num">{t.heldQty}</td>
                    <td className="cell-mono cell-num">{t.perOrderLimit}</td>
                    <td className="meta" style={{ whiteSpace: 'nowrap' }}>
                      {formatDateShort(t.saleStartAt)} – {formatDateShort(t.saleEndAt)}
                    </td>
                    <td>
                      <StatusBadge kind="ticketType" value={t.status} />
                    </td>
                    <td className="cell-actions">
                      <div className="row" style={{ gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        <button
                          className="icon-btn icon-btn--plain"
                          onClick={() => openEdit(t)}
                          aria-label={`Edit ${t.name}`}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-btn icon-btn--plain"
                          onClick={() => handleRemove(t)}
                          disabled={removingId === t.id}
                          aria-label={`Delete ${t.name}`}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- Create / edit modal ---- */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit ticket type' : 'New ticket type'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="tt-form" variant="gold" loading={saving}>
              {editing ? 'Save changes' : 'Create ticket type'}
            </Button>
          </>
        }
      >
        <form id="tt-form" onSubmit={handleSave} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Field label="Event" required htmlFor="tt-event">
              <Select
                id="tt-event"
                value={form.eventId}
                onChange={(e) => setField('eventId', e.target.value)}
                required
              >
                <option value="" disabled>
                  Select an event
                </option>
                {events?.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Name" required htmlFor="tt-name">
              <Input
                id="tt-name"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="General Admission"
                required
              />
            </Field>

            <Field label="Description" htmlFor="tt-description">
              <Textarea
                id="tt-description"
                rows={2}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="What this tier includes."
              />
            </Field>

            <div className="form-grid">
              <Field label="Price (LKR)" required htmlFor="tt-price">
                <Input
                  id="tt-price"
                  type="number"
                  min={0}
                  step={100}
                  inputMode="numeric"
                  value={form.priceLkr}
                  onChange={(e) => setField('priceLkr', e.target.value)}
                  placeholder="6500"
                  required
                />
              </Field>
              <Field label="Per-order limit" htmlFor="tt-limit" helper="Max per checkout.">
                <Input
                  id="tt-limit"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={form.perOrderLimit}
                  onChange={(e) => setField('perOrderLimit', e.target.value)}
                  placeholder="6"
                />
              </Field>
            </div>

            <div className="form-grid form-grid--3">
              <Field label="Total" required htmlFor="tt-total" helper="Allocation.">
                <Input
                  id="tt-total"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={form.totalQty}
                  onChange={(e) => setField('totalQty', e.target.value)}
                  placeholder="500"
                  required
                />
              </Field>
              <Field label="Sold" htmlFor="tt-sold">
                <Input
                  id="tt-sold"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={form.soldQty}
                  onChange={(e) => setField('soldQty', e.target.value)}
                />
              </Field>
              <Field label="Held" htmlFor="tt-held">
                <Input
                  id="tt-held"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={form.heldQty}
                  onChange={(e) => setField('heldQty', e.target.value)}
                />
              </Field>
            </div>

            <div className="form-grid">
              <Field label="Sale starts" htmlFor="tt-start">
                <Input
                  id="tt-start"
                  type="datetime-local"
                  value={form.saleStartAt}
                  onChange={(e) => setField('saleStartAt', e.target.value)}
                />
              </Field>
              <Field label="Sale ends" htmlFor="tt-end">
                <Input
                  id="tt-end"
                  type="datetime-local"
                  value={form.saleEndAt}
                  onChange={(e) => setField('saleEndAt', e.target.value)}
                />
              </Field>
            </div>

            <Field label="Status" htmlFor="tt-status">
              <Select
                id="tt-status"
                value={form.status}
                onChange={(e) => setField('status', e.target.value as TicketTypeStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </form>
      </Modal>
    </>
  );
}
