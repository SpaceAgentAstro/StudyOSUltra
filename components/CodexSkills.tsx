import React, { useEffect, useMemo, useState } from 'react';

interface SkillState {
  name: string;
  installed: boolean;
}

interface SkillCatalog {
  generatedAt: string;
  codexHome: string;
  source: {
    repo: string;
    curatedPath: string;
    experimentalPath: string;
  };
  curated: {
    total: number;
    installedCount: number;
    skills: SkillState[];
  };
  experimental:
    | {
        available: true;
        total: number;
        installedCount: number;
        skills: SkillState[];
      }
    | {
        available: false;
        error: string;
      };
  locallyInstalled: string[];
}

const CodexSkills: React.FC = () => {
  const [catalog, setCatalog] = useState<SkillCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.BASE_URL}codex-skills.json`);
        if (!response.ok) {
          throw new Error(`Failed to load catalog: ${response.status}`);
        }
        const data = (await response.json()) as SkillCatalog;
        setCatalog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown catalog error');
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, []);

  const curatedInstalled = useMemo(
    () => catalog?.curated.skills.filter((skill) => skill.installed) ?? [],
    [catalog]
  );

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-slate-500">Loading Codex skill catalog...</div>
      </div>
    );
  }

  if (error || !catalog) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-rose-50 rounded-2xl border border-rose-200 p-6 text-rose-700">
          Could not load `public/codex-skills.json`. Run `npm run sync:skills` and reload.
          {error ? <div className="mt-2 text-sm">{error}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Codex Skills Integration</h2>
        <p className="text-slate-500 text-sm mt-1">
          Installed skills are synced from your local Codex environment into this app.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Curated Skills</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{catalog.curated.installedCount}/{catalog.curated.total}</div>
          <div className="text-xs text-slate-400 mt-1">Installed from {catalog.source.repo}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Local Skill Packs</div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">{catalog.locallyInstalled.length}</div>
          <div className="text-xs text-slate-400 mt-1">From {catalog.codexHome}/skills</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Catalog Updated</div>
          <div className="text-lg font-bold text-slate-800 mt-2">{new Date(catalog.generatedAt).toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">Run `npm run sync:skills` to refresh</div>
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold mb-4 text-slate-900">Installed Curated Skills</h3>
        <div className="flex flex-wrap gap-2">
          {curatedInstalled.map((skill) => (
            <span
              key={skill.name}
              className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              {skill.name}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold mb-2 text-slate-900">Experimental Source</h3>
        {catalog.experimental.available ? (
          <p className="text-slate-600">
            {catalog.experimental.installedCount}/{catalog.experimental.total} experimental skills installed.
          </p>
        ) : (
          <p className="text-slate-600">
            Experimental catalog unavailable for this sync. The current upstream path may not exist.
          </p>
        )}
      </section>
    </div>
  );
};

export default CodexSkills;
