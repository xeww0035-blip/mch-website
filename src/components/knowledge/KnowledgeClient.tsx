'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  notes,
  docs,
  resources,
  skillTree,
  privateNotes,
  PRIVATE_PASSWORD_HASH,
  type Note,
  type Doc,
  type Resource,
  type SkillBranch,
} from '@/data/knowledge';
import { Reveal } from '@/components/ui/Reveal';
import styles from './KnowledgeClient.module.css';

/* ---------- Types ---------- */
type FilterKey = 'all' | 'notes' | 'docs' | 'resources' | 'skills' | 'files' | 'private';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt: number;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const STORAGE_KEY = 'mch-knowledge-files';

const FILTERS: { key: FilterKey; label: string; symbol: string }[] = [
  { key: 'all', label: '全部', symbol: 'sym-dot' },
  { key: 'notes', label: '笔记', symbol: 'sym-book' },
  { key: 'docs', label: '文档', symbol: 'sym-folder' },
  { key: 'resources', label: '资源', symbol: 'sym-link' },
  { key: 'skills', label: '技能树', symbol: 'sym-tree' },
  { key: 'files', label: '文件', symbol: 'sym-upload' },
  { key: 'private', label: '私密花园', symbol: 'sym-lock' },
];

/* ---------- Main Component ---------- */
export function KnowledgeClient() {
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  // Docs accordion
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

  // Files
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Private garden
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  /* ----- Search debounce ----- */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* ----- Load files from localStorage ----- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFiles(JSON.parse(stored));
      }
    } catch {
      // localStorage might be unavailable or corrupted
    }
  }, []);

  /* ----- Save files to localStorage ----- */
  const saveFiles = useCallback((newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFiles));
    } catch (e) {
      // Storage might be full
      console.warn('Failed to save files:', e);
    }
  }, []);

  /* ----- File upload handler ----- */
  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const validFiles: UploadedFile[] = [];

      Array.from(fileList).forEach((file) => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`「${file.name}」超过 4MB 限制，已跳过`);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const newFile: UploadedFile = {
            id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: reader.result as string,
            uploadedAt: Date.now(),
          };

          setFiles((prev) => {
            const updated = [...prev, newFile];
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (e) {
              console.warn('Storage full:', e);
              alert('存储空间已满，请先删除一些文件');
              return prev;
            }
            return updated;
          });
        };
        reader.readAsDataURL(file);
      });
    },
    []
  );

  /* ----- Drag & Drop ----- */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  /* ----- Delete file ----- */
  const deleteFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    saveFiles(updated);
    if (previewFile?.id === id) setPreviewFile(null);
  };

  /* ----- Download file ----- */
  const downloadFile = (file: UploadedFile) => {
    const a = document.createElement('a');
    a.href = file.dataUrl;
    a.download = file.name;
    a.click();
  };

  /* ----- Toggle doc accordion ----- */
  const toggleDoc = (id: string) => {
    setExpandedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ----- Password unlock ----- */
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const encoded = btoa(passwordInput);
    if (encoded === PRIVATE_PASSWORD_HASH) {
      setUnlocked(true);
      setPasswordError(false);
      setPasswordInput('');
    } else {
      setPasswordError(true);
    }
  };

  /* ----- Filter logic ----- */
  const query = debouncedQuery.toLowerCase().trim();

  const filteredNotes = useMemo(() => {
    if (!query) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.excerpt.toLowerCase().includes(query) ||
        n.tags.some((t) => t.label.toLowerCase().includes(query))
    );
  }, [query]);

  const filteredDocs = useMemo(() => {
    if (!query) return docs;
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(query) ||
        d.brief.toLowerCase().includes(query) ||
        d.tech.some((t) => t.toLowerCase().includes(query))
    );
  }, [query]);

  const filteredResources = useMemo(() => {
    if (!query) return resources;
    return resources.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.desc.toLowerCase().includes(query) ||
        r.type.toLowerCase().includes(query)
    );
  }, [query]);

  const filteredSkillTree = useMemo(() => {
    if (!query) return skillTree;
    return skillTree
      .map((branch) => ({
        ...branch,
        leaves: branch.leaves.filter((leaf) =>
          leaf.name.toLowerCase().includes(query)
        ),
      }))
      .filter((branch) => branch.leaves.length > 0);
  }, [query]);

  const filteredPrivateNotes = useMemo(() => {
    if (!query) return privateNotes;
    return privateNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.excerpt.toLowerCase().includes(query)
    );
  }, [query]);

  /* ----- Visibility flags ----- */
  const showNotes = activeFilter === 'all' || activeFilter === 'notes';
  const showDocs = activeFilter === 'all' || activeFilter === 'docs';
  const showResources = activeFilter === 'all' || activeFilter === 'resources';
  const showSkills = activeFilter === 'all' || activeFilter === 'skills';
  const showFiles = activeFilter === 'all' || activeFilter === 'files';
  const showPrivate = activeFilter === 'all' || activeFilter === 'private';

  const hasAnyResult =
    (showNotes && filteredNotes.length > 0) ||
    (showDocs && filteredDocs.length > 0) ||
    (showResources && filteredResources.length > 0) ||
    (showSkills && filteredSkillTree.length > 0) ||
    (showFiles) ||
    (showPrivate && unlocked && filteredPrivateNotes.length > 0);

  /* ---------- Render ---------- */
  return (
    <>
      {/* Page Header */}
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderDots} />
        <div className={styles.pageHeaderInner}>
          <svg className={styles.pageHeaderSymbol} viewBox="0 0 40 50">
            <use href="#sym-tree" />
          </svg>
          <h1>知识库</h1>
          <p>笔记、文档、资源、技能树——把学过的一切都种在这里，长成一片林子。</p>
        </div>
      </header>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarInner}>
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2.5" />
              <path d="M21 21L16.5 16.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="搜索笔记、文档、资源…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`${styles.filterBtn} ${
                  activeFilter === f.key ? styles.filterBtnActive : ''
                }`}
                onClick={() => setActiveFilter(f.key)}
              >
                <svg viewBox="0 0 40 40"><use href={`#${f.symbol}`} /></svg>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {!hasAnyResult && query && (
          <div className={styles.noResults}>
            <svg viewBox="0 0 40 40"><use href="#sym-eye" /></svg>
            <p>没找到「{debouncedQuery}」相关的内容</p>
          </div>
        )}

        {/* Notes */}
        {showNotes && filteredNotes.length > 0 && (
          <section className={styles.block}>
            <div className={styles.blockHeader}>
              <svg className={styles.blockSymbol} viewBox="0 0 40 40"><use href="#sym-book" /></svg>
              <h2 className={styles.blockTitle}>学习笔记</h2>
              <span className={styles.blockCount}>{filteredNotes.length}</span>
            </div>
            <div className={styles.notesGrid}>
              {filteredNotes.map((note, i) => (
                <Reveal key={note.id} delay={i * 50}>
                  <NoteCard note={note} />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Docs */}
        {showDocs && filteredDocs.length > 0 && (
          <section className={styles.block}>
            <div className={styles.blockHeader}>
              <svg className={styles.blockSymbol} viewBox="0 0 40 36"><use href="#sym-folder" /></svg>
              <h2 className={styles.blockTitle}>项目文档</h2>
              <span className={styles.blockCount}>{filteredDocs.length}</span>
            </div>
            <div className={styles.docsList}>
              {filteredDocs.map((doc, i) => (
                <Reveal key={doc.id} delay={i * 50}>
                  <DocAccordion
                    doc={doc}
                    isOpen={expandedDocs.has(doc.id)}
                    onToggle={() => toggleDoc(doc.id)}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Resources */}
        {showResources && filteredResources.length > 0 && (
          <section className={styles.block}>
            <div className={styles.blockHeader}>
              <svg className={styles.blockSymbol} viewBox="0 0 40 40"><use href="#sym-link" /></svg>
              <h2 className={styles.blockTitle}>收藏资源</h2>
              <span className={styles.blockCount}>{filteredResources.length}</span>
            </div>
            <div className={styles.resourcesGrid}>
              {filteredResources.map((res, i) => (
                <Reveal key={res.name} delay={i * 40}>
                  <ResourceCard resource={res} />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Skill Tree */}
        {showSkills && filteredSkillTree.length > 0 && (
          <section className={styles.block}>
            <div className={styles.blockHeader}>
              <svg className={styles.blockSymbol} viewBox="0 0 40 50"><use href="#sym-tree" /></svg>
              <h2 className={styles.blockTitle}>技能树</h2>
              <span className={styles.blockCount}>{filteredSkillTree.length}</span>
            </div>
            <div className={styles.skillTreeContainer}>
              {filteredSkillTree.map((branch, i) => (
                <Reveal key={branch.trunk} delay={i * 60}>
                  <SkillBranchView branch={branch} />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* File Upload */}
        {showFiles && (
          <section className={styles.block}>
            <div className={styles.blockHeader}>
              <svg className={styles.blockSymbol} viewBox="0 0 40 44"><use href="#sym-upload" /></svg>
              <h2 className={styles.blockTitle}>知识文件</h2>
              <span className={styles.blockCount}>{files.length}</span>
            </div>
            <div className={styles.fileSection}>
              <div
                className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleFileSelect}
              >
                <svg viewBox="0 0 40 44"><use href="#sym-upload" /></svg>
                <div className={styles.dropZoneTitle}>拖拽文件到这里，或点击选择</div>
                <div className={styles.dropZoneHint}>支持文本、图片等格式 · 单文件最大 4MB · 存储在本地浏览器</div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
              {files.length > 0 ? (
                <div className={styles.fileList}>
                  {files.map((file) => (
                    <div key={file.id} className={styles.fileItem}>
                      <svg className={styles.fileIcon} viewBox="0 0 40 48"><use href="#sym-file" /></svg>
                      <div className={styles.fileInfo}>
                        <div className={styles.fileName}>{file.name}</div>
                        <div className={styles.fileMeta}>
                          {formatSize(file.size)} · {formatDate(file.uploadedAt)}
                        </div>
                      </div>
                      <div className={styles.fileActions}>
                        <button
                          className={styles.fileBtn}
                          onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }}
                          title="预览"
                        >
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M2 12S5 5 12 5S22 12 22 12S19 19 12 19S2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        </button>
                        <button
                          className={styles.fileBtn}
                          onClick={(e) => { e.stopPropagation(); downloadFile(file); }}
                          title="下载"
                        >
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 4V16M6 10L12 16L18 10M4 20H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          className={`${styles.fileBtn} ${styles.fileBtnDelete}`}
                          onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                          title="删除"
                        >
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M5 7H19M10 11V17M14 11V17M6 7L7 20H17L18 7M9 7V4H15V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.fileEmpty}>还没有上传文件</div>
              )}
            </div>
          </section>
        )}

        {/* Private Garden */}
        {showPrivate && (
          <section className={styles.block}>
            <div className={styles.blockHeader}>
              <svg className={styles.blockSymbol} viewBox="0 0 40 44"><use href="#sym-lock" /></svg>
              <h2 className={styles.blockTitle}>私密花园</h2>
            </div>
            <div className={styles.privateSection}>
              {!unlocked ? (
                <div className={styles.privateLock}>
                  <svg viewBox="0 0 40 44"><use href="#sym-lock" /></svg>
                  <h3>这里种着还没公开的想法</h3>
                  <p>输入密码进入私密花园</p>
                  <form className={styles.passwordForm} onSubmit={handleUnlock}>
                    <input
                      className={styles.passwordInput}
                      type="password"
                      placeholder="密码"
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setPasswordError(false);
                      }}
                      autoFocus
                    />
                    <button type="submit" className={styles.passwordSubmit}>
                      进入
                    </button>
                  </form>
                  {passwordError && (
                    <div className={styles.passwordError}>密码不对，再试试？</div>
                  )}
                </div>
              ) : (
                <>
                  <div className={styles.privateNotesGrid}>
                    {filteredPrivateNotes.map((note) => (
                      <div key={note.id} className={styles.privateNoteCard}>
                        <div className={styles.privateNoteTitle}>{note.title}</div>
                        <div className={styles.privateNoteExcerpt}>{note.excerpt}</div>
                        <div className={styles.privateNoteMeta}>
                          <span>{note.date}</span>
                          <span>·</span>
                          <span>{note.readTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredPrivateNotes.length === 0 && query && (
                    <div className={styles.fileEmpty} style={{ color: 'var(--paper)', opacity: 0.4 }}>
                      没有匹配的私密笔记
                    </div>
                  )}
                  <button
                    className={styles.privateUnlockBtn}
                    onClick={() => setUnlocked(false)}
                  >
                    锁上花园
                  </button>
                </>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </>
  );
}

/* ---------- Sub Components ---------- */

function NoteCard({ note }: { note: Note }) {
  return (
    <article className={styles.noteCard}>
      <div className={styles.noteMeta}>
        <span>{note.date}</span>
        <span>·</span>
        <span>{note.readTime}</span>
      </div>
      <h3 className={styles.noteTitle}>{note.title}</h3>
      <p className={styles.noteExcerpt}>{note.excerpt}</p>
      <div className={styles.noteTags}>
        {note.tags.map((tag, i) => (
          <span key={i} className={styles.noteTag} data-color={tag.color}>
            {tag.label}
          </span>
        ))}
      </div>
    </article>
  );
}

function DocAccordion({
  doc,
  isOpen,
  onToggle,
}: {
  doc: Doc;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={styles.docItem}>
      <div className={styles.docHeader} onClick={onToggle}>
        <svg className={styles.docIcon} viewBox="0 0 40 36"><use href="#sym-folder" /></svg>
        <div className={styles.docTitleGroup}>
          <div className={styles.docTitle}>{doc.title}</div>
          <div className={styles.docBrief}>{doc.brief}</div>
        </div>
        <svg
          className={`${styles.docChevron} ${isOpen ? styles.docChevronOpen : ''}`}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className={`${styles.docBody} ${isOpen ? styles.docBodyOpen : ''}`}>
        <div className={styles.docBodyInner}>
          {doc.sections.map((section, i) => (
            <div key={i} className={styles.docSection}>
              <h4>{section.heading}</h4>
              <ul>
                {section.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
          <div className={styles.docTech}>
            {doc.tech.map((t, i) => (
              <span key={i} className={styles.docTechTag}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <a
      className={styles.resourceCard}
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.resourceTop}>
        <div
          className={styles.resourceFavicon}
          style={{ background: resource.faviconColor, color: '#F4ECD8' }}
        >
          {resource.faviconText}
        </div>
        <span className={styles.resourceType}>{resource.type}</span>
      </div>
      <div className={styles.resourceName}>{resource.name}</div>
      <div className={styles.resourceDesc}>{resource.desc}</div>
      <div className={styles.resourceArrow}>
        访问 →
      </div>
    </a>
  );
}

function SkillBranchView({ branch }: { branch: SkillBranch }) {
  return (
    <div className={styles.skillBranch}>
      <div className={styles.skillTrunk} style={{ background: branch.trunkColor }}>
        <span
          className={styles.skillTrunkDot}
          style={{ background: branch.trunkColor }}
        />
        {branch.trunk}
      </div>
      {branch.leaves.map((leaf, i) => (
        <div key={i} className={styles.skillLeaf} data-level={leaf.level}>
          {leaf.name}
          <span className={styles.skillLevel}>
            {leaf.level === 'master' && '精通'}
            {leaf.level === 'solid' && '扎实'}
            {leaf.level === 'growing' && '成长中'}
            {leaf.level === 'new' && '新学'}
          </span>
        </div>
      ))}
    </div>
  );
}

function PreviewModal({ file, onClose }: { file: UploadedFile; onClose: () => void }) {
  const isImage = file.type.startsWith('image/');
  const isText =
    file.type.startsWith('text/') ||
    file.type === 'application/json' ||
    file.type === 'application/javascript' ||
    file.type === 'application/typescript' ||
    /\.(txt|md|json|js|ts|tsx|jsx|css|html|xml|yml|yaml|csv|py|go|rs|java|c|cpp|h|sh)$/i.test(file.name);

  // Extract text content from dataUrl for text files
  const textContent = useMemo(() => {
    if (!isText) return '';
    try {
      const base64 = file.dataUrl.split(',')[1] || '';
      return decodeURIComponent(escape(atob(base64)));
    } catch {
      return '（无法解码文本内容）';
    }
  }, [file, isText]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>{file.name}</span>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          {isImage ? (
            <img src={file.dataUrl} alt={file.name} />
          ) : isText ? (
            <pre className={styles.modalTextPreview}>{textContent}</pre>
          ) : (
            <div className={styles.modalUnsupported}>
              <svg viewBox="0 0 40 48"><use href="#sym-file" /></svg>
              <p>此文件类型不支持在线预览</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>
                <a
                  href={file.dataUrl}
                  download={file.name}
                  style={{ color: 'var(--ocean)', fontWeight: 700, textDecoration: 'underline' }}
                >
                  点击下载查看
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Utils ---------- */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
