import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Upload } from 'lucide-react';
import type { EventStatus, EventTone } from '../../types';
import {
  createEvent,
  getEventById,
  listCategories,
  updateEvent,
} from '../../services/eventsService';
import { Card } from '../../components/ui/Card';
import { Field, Input, Textarea, Select, Switch } from '../../components/ui/Field';
import { Button, buttonClass } from '../../components/ui/Button';
import { LoadingBlock, StateBlock } from '../../components/ui/Feedback';
import { useToast } from '../../components/ui/Toast';

interface FormState {
  title: string;
  slug: string;
  slugTouched: boolean;
  description: string;
  category: string;
  venue: string;
  city: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  doorsTime: string;
  tone: EventTone;
  status: EventStatus;
  featured: boolean;
  agePolicy: string;
  dressCode: string;
}

const TONES: { value: EventTone; label: string }[] = [
  { value: 'amber', label: 'Amber' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'slate', label: 'Slate' },
  { value: 'crimson', label: 'Crimson' },
  { value: 'violet', label: 'Violet' },
  { value: 'mono', label: 'Mono' },
];

const STATUSES: { value: EventStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'paused', label: 'Paused' },
  { value: 'unpublished', label: 'Unpublished' },
];

const EMPTY: FormState = {
  title: '',
  slug: '',
  slugTouched: false,
  description: '',
  category: '',
  venue: '',
  city: 'Colombo',
  eventDate: '',
  startTime: '21:00',
  endTime: '02:00',
  doorsTime: '',
  tone: 'mono',
  status: 'draft',
  featured: false,
  agePolicy: '',
  dressCode: '',
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "2025-07-12T..." → "2025-07-12" for a <input type="date">. */
function toDateInput(iso: string): string {
  if (!iso) return '';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '';
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const work: Promise<unknown>[] = [
      listCategories().then((cats) => {
        if (active) setCategories(cats);
      }),
    ];

    if (id) {
      work.push(
        getEventById(id).then((event) => {
          if (!active) return;
          if (!event) {
            setLoadError(true);
            return;
          }
          setForm({
            title: event.title,
            slug: event.slug,
            slugTouched: true,
            description: event.description,
            category: event.category,
            venue: event.venue,
            city: event.city,
            eventDate: toDateInput(event.eventDate),
            startTime: event.startTime,
            endTime: event.endTime,
            doorsTime: event.doorsTime ?? '',
            tone: event.tone,
            status: event.status,
            featured: event.featured,
            agePolicy: event.agePolicy ?? '',
            dressCode: event.dressCode ?? '',
          });
        }),
      );
    }

    Promise.all(work)
      .catch(() => active && setLoadError(true))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onTitleChange(value: string) {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: prev.slugTouched ? prev.slug : slugify(value),
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      category: form.category,
      venue: form.venue.trim(),
      city: form.city.trim(),
      eventDate: form.eventDate,
      startTime: form.startTime,
      endTime: form.endTime,
      doorsTime: form.doorsTime || undefined,
      tone: form.tone,
      status: form.status,
      featured: form.featured,
      agePolicy: form.agePolicy.trim() || undefined,
      dressCode: form.dressCode.trim() || undefined,
    };

    try {
      if (id) {
        await updateEvent(id, payload);
      } else {
        await createEvent(payload);
      }
      toast({
        tone: 'success',
        title: isEdit ? 'Event updated' : 'Event created',
        body: form.title.trim() || 'Untitled event',
      });
      navigate('/admin/events');
    } catch {
      toast({ tone: 'error', title: "Couldn't save event", body: 'Please try again.' });
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading event…" />;
  }

  if (loadError) {
    return (
      <StateBlock
        title="We couldn't load this event"
        body="It may have been removed, or something went wrong. Head back and try again."
        action={
          <Link to="/admin/events" className={buttonClass('outline')}>
            Back to events
          </Link>
        }
      />
    );
  }

  const actions = (
    <div className="adminhead__actions">
      <Link to="/admin/events" className={buttonClass('ghost')}>
        Cancel
      </Link>
      <Button type="submit" form="event-form" variant="gold" loading={saving}>
        {isEdit ? 'Save changes' : 'Create event'}
      </Button>
    </div>
  );

  return (
    <form id="event-form" onSubmit={handleSubmit} noValidate>
      <div className="adminhead">
        <div>
          <p className="eyebrow">{isEdit ? 'Edit' : 'New'}</p>
          <h1 className="adminhead__title display">{isEdit ? 'Edit event' : 'Create event'}</h1>
          <p className="adminhead__sub">
            {isEdit
              ? 'Update the details, schedule and visibility for this night.'
              : 'Set up a new night — details, schedule and how it appears on the door.'}
          </p>
        </div>
        {actions}
      </div>

      <div className="form-layout">
        <div className="form-main">
          {/* ---- Details ---- */}
          <Card pad="lg">
            <h2 className="form-section-title">Details</h2>
            <div className="form-grid">
              <Field className="col-span-2" label="Title" required htmlFor="ev-title">
                <Input
                  id="ev-title"
                  value={form.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Solstice — Rooftop Sessions"
                  required
                />
              </Field>

              <Field
                className="col-span-2"
                label="Slug"
                htmlFor="ev-slug"
                helper="Auto-generated from the title. Edit to override the public URL."
              >
                <Input
                  id="ev-slug"
                  value={form.slug}
                  onChange={(e) => set('slug', slugify(e.target.value))}
                  onBlur={() => set('slugTouched', true)}
                  placeholder="solstice-rooftop-sessions"
                  inputMode="text"
                />
              </Field>

              <Field
                className="col-span-2"
                label="Description"
                htmlFor="ev-description"
                helper="Sets the tone — keep it considered and concise."
              >
                <Textarea
                  id="ev-description"
                  rows={4}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="What makes this night worth showing up for."
                />
              </Field>

              <Field label="Category" required htmlFor="ev-category">
                <Select
                  id="ev-category"
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  {form.category && !categories.includes(form.category) && (
                    <option value={form.category}>{form.category}</option>
                  )}
                </Select>
              </Field>

              <Field label="City" required htmlFor="ev-city">
                <Input
                  id="ev-city"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="Colombo"
                  required
                />
              </Field>

              <Field className="col-span-2" label="Venue" required htmlFor="ev-venue">
                <Input
                  id="ev-venue"
                  value={form.venue}
                  onChange={(e) => set('venue', e.target.value)}
                  placeholder="The Kingsbury Rooftop"
                  required
                />
              </Field>
            </div>
          </Card>

          {/* ---- Schedule ---- */}
          <Card pad="lg">
            <h2 className="form-section-title">Schedule</h2>
            <div className="form-grid">
              <Field label="Event date" required htmlFor="ev-date">
                <Input
                  id="ev-date"
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => set('eventDate', e.target.value)}
                  required
                />
              </Field>
              <Field label="Doors" htmlFor="ev-doors" helper="When the gate opens.">
                <Input
                  id="ev-doors"
                  type="time"
                  value={form.doorsTime}
                  onChange={(e) => set('doorsTime', e.target.value)}
                />
              </Field>
              <Field label="Start time" required htmlFor="ev-start">
                <Input
                  id="ev-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => set('startTime', e.target.value)}
                  required
                />
              </Field>
              <Field label="End time" required htmlFor="ev-end">
                <Input
                  id="ev-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => set('endTime', e.target.value)}
                  required
                />
              </Field>
            </div>
          </Card>

          {/* ---- Presentation ---- */}
          <Card pad="lg">
            <h2 className="form-section-title">Presentation</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <Field label="Banner image" htmlFor="ev-banner">
                <div className="uploader" id="ev-banner" role="button" tabIndex={0}>
                  <Upload size={20} aria-hidden style={{ color: 'var(--text-3)' }} />
                  <p className="t-2" style={{ marginTop: 'var(--space-3)' }}>
                    Drop banner image or browse
                  </p>
                  <p className="helper" style={{ marginTop: 'var(--space-2)' }}>
                    Recommended 1600×1000
                  </p>
                </div>
              </Field>

              <Field
                label="Tone"
                htmlFor="ev-tone"
                helper="The muted duotone used for the poster placeholder."
              >
                <Select
                  id="ev-tone"
                  value={form.tone}
                  onChange={(e) => set('tone', e.target.value as EventTone)}
                >
                  {TONES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          <div className="form-actions">
            <Link to="/admin/events" className={buttonClass('ghost')}>
              Cancel
            </Link>
            <Button type="submit" variant="gold" loading={saving}>
              {isEdit ? 'Save changes' : 'Create event'}
            </Button>
          </div>
        </div>

        {/* ---- Aside ---- */}
        <aside className="form-aside">
          <Card pad="lg">
            <h2 className="form-section-title">Status</h2>
            <Field
              label="Status"
              htmlFor="ev-status"
              helper="Only published events appear on the public site."
            >
              <Select
                id="ev-status"
                value={form.status}
                onChange={(e) => set('status', e.target.value as EventStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
          </Card>

          <Card pad="lg">
            <h2 className="form-section-title">Visibility</h2>
            <Field label="Featured" htmlFor="ev-featured" helper="Surface this night in the spotlight slot.">
              <Switch
                id="ev-featured"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                label={form.featured ? 'Featured' : 'Not featured'}
              />
            </Field>
          </Card>

          <Card pad="lg">
            <h2 className="form-section-title">Entry</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <Field label="Age policy" htmlFor="ev-age" helper="e.g. 21+">
                <Input
                  id="ev-age"
                  value={form.agePolicy}
                  onChange={(e) => set('agePolicy', e.target.value)}
                  placeholder="21+"
                />
              </Field>
              <Field label="Dress code" htmlFor="ev-dress">
                <Input
                  id="ev-dress"
                  value={form.dressCode}
                  onChange={(e) => set('dressCode', e.target.value)}
                  placeholder="Smart — no sportswear"
                />
              </Field>
            </div>
          </Card>
        </aside>
      </div>
    </form>
  );
}
