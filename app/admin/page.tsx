'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getProjects, saveProject, deleteProject, verifyAdmin, getAdminSession, logoutAdmin, uploadImage, getFeatured, saveFeatured, type Project, type FeaturedStartup } from '@/app/actions';
import { Trash2, Plus, Save, Lock, Image as ImageIcon, Sparkles } from 'lucide-react';
import { TagInput } from '@/components/admin/TagInput';

export default function AdminPage() {
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'signed-out'>('checking');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [featured, setFeatured] = useState<FeaturedStartup | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'featured'>('projects');

  useEffect(() => {
    let cancelled = false;
    getAdminSession().then((session) => {
      if (!cancelled) setAuthStatus(session.authenticated ? 'authenticated' : 'signed-out');
    }).catch(() => {
      if (cancelled) return;
      setAuthStatus('signed-out');
      setError('Could not restore your session. Please sign in again.');
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    let cancelled = false;
    Promise.all([getProjects(), getFeatured()]).then(([data, feat]) => {
      if (cancelled) return;
      setProjects(data);
      // Preserve an unsaved featured draft when signing back in after session expiry.
      setFeatured((current) => current ?? feat);
    }).catch(() => {
      if (!cancelled) setError('Could not load admin data. Please try refreshing.');
    });
    return () => { cancelled = true; };
  }, [authStatus]);

  async function runAction<T extends { success: boolean; error?: string; code?: string }>(
    action: () => Promise<T>,
    onSuccess?: (result: T) => void | Promise<void>,
  ) {
    if (pending) return;
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const result = await action();
      if (!result.success) {
        if (result.code === 'UNAUTHORIZED') setAuthStatus('signed-out');
        setError(result.error ?? 'The request failed. Please try again.');
        return;
      }
      await onSuccess?.(result);
    } catch {
      setError('The request failed. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    await runAction(() => verifyAdmin(password), () => {
      setPassword('');
      setAuthStatus('authenticated');
    });
  }

  async function handleLogout() {
    await runAction(logoutAdmin, () => {
      setAuthStatus('signed-out');
      setPassword('');
      setEditing(null);
      setProjects([]);
      setFeatured(null);
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    await runAction(() => saveProject(editing), async () => {
      setProjects(await getProjects());
      setEditing(null);
      setNotice('Project saved.');
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return;
    await runAction(() => deleteProject(id), async () => {
      setProjects(await getProjects());
      setEditing((current) => current?.id === id ? null : current);
      setNotice('Project deleted.');
    });
  }

  async function handleUpload(file: File) {
    if (!editing) return;
    if (file.size === 0 || file.size > 900 * 1024) {
      setError('Please choose a JPEG, PNG, or WebP image no larger than 900 KB.');
      return;
    }
    const projectId = editing.id;
    const formData = new FormData();
    formData.append('file', file);
    await runAction(() => uploadImage(formData), (result) => {
      if (result.success) {
        setEditing((current) => current?.id === projectId ? { ...current, imageUrl: result.url } : current);
      }
    });
  }

  function createNew() {
    setEditing({
      id: Date.now().toString(),
      title: 'New Project',
      mode: 'tech',
      stack: [],
    });
  }

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen bg-deep-charcoal text-white flex items-center justify-center p-4" role="status">
        Checking admin session…
      </div>
    );
  }

  if (authStatus !== 'authenticated') {
    return (
      <div className="min-h-screen bg-deep-charcoal flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-xl backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-electric-cyan/10 rounded-full">
              <Lock className="w-8 h-8 text-electric-cyan" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-6 font-mono">Admin Access</h2>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            aria-label="Admin password"
            maxLength={1024}
            required
            disabled={pending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Passphrase"
            className="w-full bg-black/40 border border-white/10 p-3 rounded text-white focus:border-electric-cyan outline-none mb-4 text-center font-mono"
          />
          {error && <p role="alert" className="text-red-300 text-sm mb-4">{error}</p>}
          <button type="submit" disabled={pending} className="w-full bg-electric-cyan text-deep-charcoal font-bold py-3 rounded hover:bg-cyan-300 transition-colors font-mono disabled:opacity-50">
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-charcoal text-white p-8 font-mono" aria-busy={pending}>
      {error && <p role="alert" className="text-red-300 mb-4">{error}</p>}
      {notice && <p role="status" className="text-electric-cyan mb-4">{notice}</p>}
      <fieldset disabled={pending} className="min-w-0">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-electric-cyan">ADMIN // DASHBOARD</h1>
        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white"
          >
            Logout
          </button>
          <button
            onClick={createNew}
            className="flex items-center gap-2 bg-electric-cyan text-deep-charcoal px-4 py-2 rounded font-bold hover:bg-cyan-300 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </header>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded text-sm font-bold transition-colors ${activeTab === 'projects' ? 'bg-electric-cyan text-deep-charcoal' : 'border border-white/20 text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab('featured')}
          className={`px-4 py-2 rounded text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'featured' ? 'bg-electric-cyan text-deep-charcoal' : 'border border-white/20 text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Sparkles className="w-3 h-3" /> Featured Startup
        </button>
      </div>

      {activeTab === 'projects' ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Project List */}
        <div className="space-y-4">
          {projects.map((p) => (
            <div key={p.id} className="border border-white/10 p-4 rounded bg-white/5 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-electric-cyan" />
                  <h3 className="font-bold">{p.title}</h3>
                </div>
                <p className="text-xs text-gray-400 mt-1">TECH</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(p)} className="px-3 py-1 text-sm border border-white/20 rounded hover:bg-white/10">
                  Edit
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400 hover:bg-red-900/20 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Editor */}
        {editing && (
          <div className="border border-electric-cyan/30 p-6 rounded bg-black/40 sticky top-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Save className="w-5 h-5 text-electric-cyan" />
              Edit Project
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title</label>
                <input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-2 rounded text-white focus:border-electric-cyan outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Project Image
                </label>
                <div className="flex items-center gap-4">
                  {editing.imageUrl && (
                    <div className="relative w-16 h-16 rounded overflow-hidden border border-white/20 group">
                      <Image src={editing.imageUrl} alt="Preview" fill sizes="64px" className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, imageUrl: '' })}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      aria-label="Upload project image"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (file) void handleUpload(file);
                      }}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-electric-cyan file:text-deep-charcoal hover:file:bg-cyan-300 transition-colors cursor-pointer"
                    />
                    <p className="text-xs text-gray-400 mt-2">JPEG, PNG, or WebP · maximum 900 KB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <textarea
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-2 rounded text-white focus:border-electric-cyan outline-none h-24"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tech Stack</label>
                <TagInput
                  tags={editing.stack || []}
                  onChange={(newTags) => setEditing({ ...editing, stack: newTags })}
                  placeholder="Type and press Enter..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Project Link</label>
                <input
                  value={editing.link || ''}
                  onChange={(e) => setEditing({ ...editing, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 p-2 rounded text-white focus:border-electric-cyan outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">GitHub Link</label>
                <input
                  value={editing.githubLink || ''}
                  onChange={(e) => setEditing({ ...editing, githubLink: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full bg-white/5 border border-white/10 p-2 rounded text-white focus:border-electric-cyan outline-none"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-electric-cyan text-deep-charcoal font-bold py-2 rounded hover:bg-cyan-300 transition-colors">
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 border border-white/10 rounded hover:bg-white/5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      ) : (
        /* Featured Startup Editor */
        <div className="max-w-2xl">
          {featured ? (
            <div className="border border-electric-cyan/30 p-6 rounded bg-black/40 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-electric-cyan" />
                Edit Featured Startup
              </h2>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Title</label>
                <input
                  value={featured.title}
                  onChange={(e) => setFeatured({ ...featured, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-2 rounded text-white focus:border-electric-cyan outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Tagline</label>
                <input
                  value={featured.tagline}
                  onChange={(e) => setFeatured({ ...featured, tagline: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-2 rounded text-white focus:border-electric-cyan outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <textarea
                  value={featured.description}
                  onChange={(e) => setFeatured({ ...featured, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-2 rounded text-white focus:border-electric-cyan outline-none h-24"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Tech Stack</label>
                <TagInput
                  tags={featured.stack}
                  onChange={(newTags) => setFeatured({ ...featured, stack: newTags })}
                  placeholder="Type and press Enter..."
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Live URL</label>
                <input
                  value={featured.liveUrl}
                  onChange={(e) => setFeatured({ ...featured, liveUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 p-2 rounded text-white focus:border-electric-cyan outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">GitHub URL</label>
                <input
                  value={featured.githubUrl}
                  onChange={(e) => setFeatured({ ...featured, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full bg-white/5 border border-white/10 p-2 rounded text-white focus:border-electric-cyan outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Case Study</label>
                <textarea
                  value={featured.caseStudy}
                  onChange={(e) => setFeatured({ ...featured, caseStudy: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-2 rounded text-white focus:border-electric-cyan outline-none h-24"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Case Study Points (one per line)</label>
                <textarea
                  value={featured.caseStudyPoints.join('\n')}
                  onChange={(e) => setFeatured({ ...featured, caseStudyPoints: e.target.value.split('\n').filter(Boolean) })}
                  className="w-full bg-white/5 border border-white/10 p-2 rounded text-white focus:border-electric-cyan outline-none h-32"
                  placeholder="One point per line..."
                />
              </div>

              <button
                onClick={() => runAction(() => saveFeatured(featured), () => setNotice('Featured startup saved.'))}
                className="w-full bg-electric-cyan text-deep-charcoal font-bold py-2 rounded hover:bg-cyan-300 transition-colors"
              >
                Save Featured Startup
              </button>
            </div>
          ) : (
            <p className="text-gray-500">No featured data found.</p>
          )}
        </div>
      )}
      </fieldset>
    </div>
  );
}
