import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { UserPlus, ScanLine } from 'lucide-react';
import type { AdminUser, ScannerUser } from '../../types';
import {
  getSettings,
  listAdminUsers,
  listScannerUsers,
} from '../../services/adminService';
import { Card } from '../../components/ui/Card';
import { Field, Input, Switch } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingBlock, StateBlock } from '../../components/ui/Feedback';
import { useToast } from '../../components/ui/Toast';
import { plural } from '../../lib/format';

type Settings = Awaited<ReturnType<typeof getSettings>>;

/** A labelled settings section: description column + content column. */
function SettingsRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="settings-row">
      <div className="settings-row__label">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <div className="settings-row__content">{children}</div>
    </div>
  );
}

/** A person row used in the admin / scanner user lists. */
function UserRow({ name, email, badges }: { name: string; email: string; badges: ReactNode }) {
  return (
    <div
      className="row row--between"
      style={{
        gap: 'var(--space-4)',
        padding: 'var(--space-4) 0',
        borderBottom: '1px solid var(--line-soft)',
      }}
    >
      <div className="row" style={{ gap: 'var(--space-3)', minWidth: 0 }}>
        <Avatar name={name} />
        <div style={{ minWidth: 0 }}>
          <div className="t-1 truncate" style={{ fontSize: 'var(--fs-sm)' }}>
            {name}
          </div>
          <div className="meta truncate">{email}</div>
        </div>
      </div>
      <div className="row" style={{ gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {badges}
      </div>
    </div>
  );
}

export default function Settings() {
  const { toast } = useToast();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [scanners, setScanners] = useState<ScannerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getSettings(), listAdminUsers(), listScannerUsers()])
      .then(([s, a, sc]) => {
        if (!active) return;
        setSettings(s);
        setAdmins(a);
        setScanners(sc);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function save(section: string) {
    toast({ tone: 'success', title: 'Changes saved', body: `${section} settings updated.` });
  }

  // Typed updaters for each settings group.
  function setPayments<K extends keyof Settings['payments']>(key: K, value: Settings['payments'][K]) {
    setSettings((prev) => (prev ? { ...prev, payments: { ...prev.payments, [key]: value } } : prev));
  }
  function setEmail<K extends keyof Settings['email']>(key: K, value: Settings['email'][K]) {
    setSettings((prev) => (prev ? { ...prev, email: { ...prev.email, [key]: value } } : prev));
  }
  function setCloudinary<K extends keyof Settings['cloudinary']>(
    key: K,
    value: Settings['cloudinary'][K],
  ) {
    setSettings((prev) =>
      prev ? { ...prev, cloudinary: { ...prev.cloudinary, [key]: value } } : prev,
    );
  }

  if (loading) {
    return <LoadingBlock label="Loading settings…" />;
  }

  if (error || !settings) {
    return (
      <StateBlock
        title="We couldn't load settings"
        body="Something went wrong. Please refresh to try again."
      />
    );
  }

  return (
    <>
      <div className="adminhead">
        <div>
          <p className="eyebrow">Configuration</p>
          <h1 className="adminhead__title display">Settings</h1>
          <p className="adminhead__sub">
            Payment providers, transactional email, media and the people with access.
          </p>
        </div>
      </div>

      {/* ---- Payments ---- */}
      <Card pad="lg">
        <SettingsRow
          title="Payments"
          description="Merchant credentials for PayHere and Koko. Use sandbox until you go live."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="form-grid">
              <Field label="PayHere merchant ID" htmlFor="set-payhere">
                <Input
                  id="set-payhere"
                  value={settings.payments.payhereMerchantId}
                  onChange={(e) => setPayments('payhereMerchantId', e.target.value)}
                  placeholder="1226789"
                />
              </Field>
              <Field label="Koko merchant ID" htmlFor="set-koko">
                <Input
                  id="set-koko"
                  value={settings.payments.kokoMerchantId}
                  onChange={(e) => setPayments('kokoMerchantId', e.target.value)}
                  placeholder="KOKO-ARC-0000"
                />
              </Field>
            </div>
            <Field label="Sandbox mode" htmlFor="set-sandbox" helper="Route payments to provider test environments.">
              <Switch
                id="set-sandbox"
                checked={settings.payments.sandbox}
                onChange={(e) => setPayments('sandbox', e.target.checked)}
                label={settings.payments.sandbox ? 'Sandbox on' : 'Live'}
              />
            </Field>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <Button variant="gold" onClick={() => save('Payment')}>
                Save changes
              </Button>
            </div>
          </div>
        </SettingsRow>
      </Card>

      {/* ---- Email ---- */}
      <Card pad="lg" style={{ marginTop: 'var(--space-6)' }}>
        <SettingsRow
          title="Email"
          description="The sender identity used for ticket confirmations and receipts."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="form-grid">
              <Field label="From name" htmlFor="set-from-name">
                <Input
                  id="set-from-name"
                  value={settings.email.fromName}
                  onChange={(e) => setEmail('fromName', e.target.value)}
                  placeholder="Arcane"
                />
              </Field>
              <Field label="From email" htmlFor="set-from-email">
                <Input
                  id="set-from-email"
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) => setEmail('fromEmail', e.target.value)}
                  placeholder="tickets@arcane.lk"
                />
              </Field>
              <Field className="col-span-2" label="Reply-to" htmlFor="set-reply-to">
                <Input
                  id="set-reply-to"
                  type="email"
                  value={settings.email.replyTo}
                  onChange={(e) => setEmail('replyTo', e.target.value)}
                  placeholder="concierge@arcane.lk"
                />
              </Field>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <Button variant="gold" onClick={() => save('Email')}>
                Save changes
              </Button>
            </div>
          </div>
        </SettingsRow>
      </Card>

      {/* ---- Media ---- */}
      <Card pad="lg" style={{ marginTop: 'var(--space-6)' }}>
        <SettingsRow
          title="Media"
          description="Cloudinary account used to host event imagery and posters."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="form-grid">
              <Field label="Cloud name" htmlFor="set-cloud-name">
                <Input
                  id="set-cloud-name"
                  value={settings.cloudinary.cloudName}
                  onChange={(e) => setCloudinary('cloudName', e.target.value)}
                  placeholder="arcane-events"
                />
              </Field>
              <Field label="Upload preset" htmlFor="set-upload-preset">
                <Input
                  id="set-upload-preset"
                  value={settings.cloudinary.uploadPreset}
                  onChange={(e) => setCloudinary('uploadPreset', e.target.value)}
                  placeholder="arcane_unsigned"
                />
              </Field>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <Button variant="gold" onClick={() => save('Media')}>
                Save changes
              </Button>
            </div>
          </div>
        </SettingsRow>
      </Card>

      {/* ---- Admin users ---- */}
      <Card pad="lg" style={{ marginTop: 'var(--space-6)' }}>
        <SettingsRow
          title="Admin users"
          description="People with access to this control room and what they can do."
        >
          <div>
            {admins.length === 0 ? (
              <p className="meta">No admin users yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {admins.map((u) => (
                  <UserRow
                    key={u.id}
                    name={u.name}
                    email={u.email}
                    badges={
                      <>
                        <StatusBadge kind="role" value={u.role} />
                        <StatusBadge kind="account" value={u.status} />
                      </>
                    }
                  />
                ))}
              </div>
            )}
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-5)' }}>
              <Button
                variant="outline"
                onClick={() => toast({ title: 'Invite admin', body: 'Invitations are not wired up in this demo.' })}
              >
                <UserPlus size={16} /> Invite admin
              </Button>
            </div>
          </div>
        </SettingsRow>
      </Card>

      {/* ---- Scanner users ---- */}
      <Card pad="lg" style={{ marginTop: 'var(--space-6)' }}>
        <SettingsRow
          title="Scanner users"
          description="Gate crew who scan tickets at the door, and the events they cover."
        >
          <div>
            {scanners.length === 0 ? (
              <p className="meta">No scanner users yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {scanners.map((u) => (
                  <UserRow
                    key={u.id}
                    name={u.name}
                    email={u.email}
                    badges={
                      <>
                        <span className="meta" style={{ whiteSpace: 'nowrap' }}>
                          {plural(u.assignedEventIds.length, 'event')}
                        </span>
                        <StatusBadge kind="role" value={u.role} />
                        <StatusBadge kind="account" value={u.status} />
                      </>
                    }
                  />
                ))}
              </div>
            )}
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-5)' }}>
              <Button
                variant="outline"
                onClick={() => toast({ title: 'Add scanner', body: 'Adding gate crew is not wired up in this demo.' })}
              >
                <ScanLine size={16} /> Add scanner
              </Button>
            </div>
          </div>
        </SettingsRow>
      </Card>
    </>
  );
}
