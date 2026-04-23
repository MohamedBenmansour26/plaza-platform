/**
 * Admin — Settings (P0 placeholder).
 *
 * Renders the refreshed settings form shell per brief §2.2: inputs, selects,
 * toggles with admin density (`h-11`, `rounded-[8px]`), primary accent on
 * focus. No server actions are wired — inputs are disabled placeholders.
 * Real persistence ships in a later phase.
 */
export default function AdminSettingsPage() {
  const tabs = [
    { key: 'general', label: 'Général', active: true },
    { key: 'pricing', label: 'Tarification' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'team', label: 'Équipe' },
    { key: 'integrations', label: 'Intégrations' },
  ];

  const toggles = [
    {
      id: 'maintenance-mode',
      label: 'Mode maintenance',
      description:
        'Quand activé, les marchands voient une bannière et les paiements sont mis en pause.',
      checked: false,
    },
    {
      id: 'new-signups',
      label: 'Ouvrir les nouvelles inscriptions marchandes',
      description:
        "Désactiver pour bloquer la création de nouvelles boutiques le temps d'un événement.",
      checked: true,
    },
    {
      id: 'driver-signups',
      label: 'Ouvrir les inscriptions livreurs',
      description:
        "Désactiver pour bloquer les candidatures livreurs dans l'application.",
      checked: true,
    },
  ];

  return (
    <div className="mx-auto max-w-[960px] px-8 pt-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#1C1917]">Paramètres</h1>
        <p className="mt-1 text-[13px] text-[#78716C]">
          Configuration de la plateforme. Démonstration visuelle — les champs
          ne sont pas encore enregistrés.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="mb-6 flex gap-1 border-b border-[#E7E5E4]"
        data-testid="admin-settings-tabs"
      >
        {tabs.map((tab) => (
          <span
            key={tab.key}
            className={
              tab.active
                ? 'border-b-2 border-[var(--admin-color-primary)] px-4 py-3 text-[13px] font-medium text-[var(--admin-color-primary)]'
                : 'border-b-2 border-transparent px-4 py-3 text-[13px] font-medium text-[#78716C]'
            }
          >
            {tab.label}
          </span>
        ))}
      </div>

      {/* General form card */}
      <section
        className="rounded-[8px] border border-[#E7E5E4] bg-white p-6"
        data-testid="admin-settings-general"
      >
        <h2 className="text-[15px] font-semibold text-[#1C1917]">
          Informations plateforme
        </h2>
        <p className="mt-1 text-[13px] text-[#78716C]">
          Ces informations apparaissent dans les emails transactionnels et sur
          les factures.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-5">
          <Field label="Nom commercial" htmlFor="admin-settings-name">
            <input
              id="admin-settings-name"
              type="text"
              defaultValue="Plaza"
              disabled
              className="h-11 w-full rounded-[8px] border border-[#E7E5E4] bg-[#FAFAF9] px-3 text-[14px] text-[#1C1917]"
            />
          </Field>

          <Field label="Email support" htmlFor="admin-settings-email">
            <input
              id="admin-settings-email"
              type="email"
              defaultValue="support@plaza.ma"
              disabled
              className="h-11 w-full rounded-[8px] border border-[#E7E5E4] bg-[#FAFAF9] px-3 text-[14px] text-[#1C1917]"
            />
          </Field>

          <Field label="Devise" htmlFor="admin-settings-currency">
            <select
              id="admin-settings-currency"
              disabled
              className="h-11 w-full rounded-[8px] border border-[#E7E5E4] bg-[#FAFAF9] px-3 text-[14px] text-[#1C1917]"
              defaultValue="MAD"
            >
              <option value="MAD">MAD — Dirham marocain</option>
            </select>
          </Field>

          <Field label="Fuseau horaire" htmlFor="admin-settings-tz">
            <select
              id="admin-settings-tz"
              disabled
              className="h-11 w-full rounded-[8px] border border-[#E7E5E4] bg-[#FAFAF9] px-3 text-[14px] text-[#1C1917]"
              defaultValue="Africa/Casablanca"
            >
              <option value="Africa/Casablanca">Casablanca (UTC+1)</option>
            </select>
          </Field>
        </div>
      </section>

      {/* Toggles card */}
      <section
        className="mt-6 rounded-[8px] border border-[#E7E5E4] bg-white p-6"
        data-testid="admin-settings-toggles"
      >
        <h2 className="text-[15px] font-semibold text-[#1C1917]">
          Statuts globaux
        </h2>
        <p className="mt-1 text-[13px] text-[#78716C]">
          Basculez ces réglages pour affecter immédiatement la plateforme
          entière.
        </p>
        <ul className="mt-4 divide-y divide-[#F5F5F4]">
          {toggles.map((toggle) => (
            <li
              key={toggle.id}
              className="flex items-start justify-between gap-6 py-4"
            >
              <div className="min-w-0">
                <div className="text-[14px] font-medium text-[#1C1917]">
                  {toggle.label}
                </div>
                <p className="mt-1 text-[13px] text-[#78716C]">
                  {toggle.description}
                </p>
              </div>
              <Toggle checked={toggle.checked} id={toggle.id} />
            </li>
          ))}
        </ul>
      </section>

      {/* Footer buttons — disabled, primary solid */}
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          disabled
          className="h-10 rounded-[8px] border border-[#E7E5E4] bg-white px-4 text-[14px] font-medium text-[#1C1917] hover:bg-[#F5F5F4] disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="button"
          disabled
          className="h-10 rounded-[8px] bg-[var(--admin-color-primary)] px-4 text-[14px] font-semibold text-white hover:bg-[var(--admin-color-primary-dark)] disabled:opacity-50"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-[13px] font-medium text-[#1C1917]"
      >
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Toggle({ id, checked }: { id: string; checked: boolean }) {
  return (
    <span
      role="switch"
      aria-checked={checked}
      aria-labelledby={`${id}-label`}
      className={
        checked
          ? 'relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full bg-[var(--admin-color-primary)] transition-colors'
          : 'relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full bg-[#E7E5E4] transition-colors'
      }
      data-testid="admin-settings-toggle"
      data-id={id}
    >
      <span
        className={
          checked
            ? 'absolute left-[22px] top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform'
            : 'absolute left-0.5 top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform'
        }
      />
    </span>
  );
}
