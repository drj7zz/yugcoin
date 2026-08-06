import React from 'react';
import { ExternalLink, FolderKanban, Github, HeartHandshake, Instagram, Mail, Sparkles, Users } from 'lucide-react';

export default function ProjectView() {
  return (
    <main className="project-view animate-slide-in">
      <section className="glass-card project-page-hero">
        <div className="project-page-icon"><FolderKanban size={28} /></div>
        <div>
          <span className="qr-receive-label">YugCoin project</span>
          <h1 className="hero-title" style={{ fontSize: '3rem', marginTop: '0.3rem' }}>Built for learning in public.</h1>
          <p>YugCoin is an educational wallet experience that makes digital money movement, wallet activity, and ledger concepts easier to explore.</p>
        </div>
      </section>

      <section className="project-page-grid">
        <article className="glass-card project-page-card">
          <div className="project-page-heading"><Users size={20} /><h2>Developers</h2></div>
          <p>Designed and published by Drj7zz with coder-khushi. The project is shaped through practical learning, clear product thinking, and open collaboration.</p>
          <div className="project-page-links">
            <a href="https://drj7zz.vercel.app/" target="_blank" rel="noreferrer"><ExternalLink size={16} /> Developer portfolio</a>
            <a href="https://github.com/drj7zz" target="_blank" rel="noreferrer"><Github size={16} /> drj7zz on GitHub</a>
            <a href="https://github.com/coder-khushi" target="_blank" rel="noreferrer"><Github size={16} /> coder-khushi on GitHub</a>
          </div>
        </article>

        <article className="glass-card project-page-card">
          <div className="project-page-heading"><Sparkles size={20} /><h2>Kaalyug ecosystem</h2></div>
          <p>YugCoin is made under Kaalyug: an open-project ecosystem focused on creating a marketplace for practical digital projects, ideas, and contributors.</p>
          <p className="project-page-note">The goal is to turn learning projects into useful, discoverable work that people can build on together.</p>
        </article>
      </section>

      <section className="glass-card project-page-card">
        <div className="project-page-heading"><HeartHandshake size={20} /><h2>Support & updates</h2></div>
        <p>For customer support, collaboration, or project updates, use the official channels below.</p>
        <div className="project-page-links project-page-contact-links">
          <a href="https://workkaalyug.com" target="_blank" rel="noreferrer"><HeartHandshake size={16} /> workkaalyug.com</a>
          <a href="https://instagram.com/kaalyug.in" target="_blank" rel="noreferrer"><Instagram size={16} /> @kaalyug.in</a>
          <a href="mailto:giridirghraj@gmail.com"><Mail size={16} /> giridirghraj@gmail.com</a>
        </div>
      </section>
    </main>
  );
}
