import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftIcon as ArrowLeft,
  ArrowSquareOutIcon as ArrowSquareOut,
  BriefcaseIcon as Briefcase,
  CheckCircleIcon as CheckCircle,
  EyeIcon as Eye,
  EyeSlashIcon as EyeSlash,
  FloppyDiskIcon as FloppyDisk,
  LockKeyIcon as LockKey,
  PencilSimpleIcon as PencilSimple,
  PlusIcon as Plus,
  SignOutIcon as SignOut,
  TrashIcon as Trash,
  UserIcon as User,
  WarningCircleIcon as WarningCircle,
  XIcon as X,
  ArrowUpIcon as ArrowUp,
  ArrowDownIcon as ArrowDown,
  MagnifyingGlassIcon as MagnifyingGlass,
  SquaresFourIcon as SquaresFour,
  ListBulletsIcon as ListBullets,
  StarIcon as Star,
  GlobeIcon as Globe,
  RobotIcon as Robot,
  UsersIcon as Users,
  SparkleIcon as Sparkle,
  ShieldCheckIcon as ShieldCheck,
} from "@phosphor-icons/react";
import { supabase } from "../../db/supabase.js";
import { hashPassword, generateSalt, generateSessionToken } from "../../lib/authCrypto.ts";
import { defaultProfile, type DBProfile } from "../../lib/portfolioData.ts";

const SESSION_KEY = "phumitch_admin_session";

const AVAILABLE_COVERS = [
  { label: "Zexta Studio", url: "/works/zexta.jpg" },
  { label: "Fuyuri TR", url: "/works/fuyuri.jpg" },
  { label: "Aven Labs", url: "/works/aven-labs.jpg" },
  { label: "FiguraTH", url: "/works/figurath.jpg" },
  { label: "phumitch.space", url: "/works/phumitch.jpg" },
  { label: "studio.lol", url: "/works/studio-lol.jpg" },
];

export default function AdminApp() {
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [sessionUser, setSessionUser] = useState<string | null>(null);

  // Tabs: "projects" | "profile" | "account"
  const [activeTab, setActiveTab] = useState<"projects" | "profile" | "account">("projects");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Auth forms
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Projects State
  const [projects, setProjects] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  // Delete Confirmation Modal
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; title: string } | null>(null);

  // Profile State
  const [profile, setProfile] = useState<DBProfile>(defaultProfile);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileHasChanges, setProfileHasChanges] = useState(false);

  // Account State
  const [newUsername, setNewUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Lock body scroll and pause Lenis smooth scroll while any modal is open
  useEffect(() => {
    const isModalOpen = Boolean(editingProject || deleteConfirmTarget);
    const html = document.documentElement;
    const body = document.body;

    if (isModalOpen) {
      if (typeof window !== "undefined" && (window as any).__lenis) {
        (window as any).__lenis.stop();
      }
      const prevHtml = html.style.overflow;
      const prevBody = body.style.overflow;
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";

      return () => {
        if (typeof window !== "undefined" && (window as any).__lenis) {
          (window as any).__lenis.start();
        }
        html.style.overflow = prevHtml;
        body.style.overflow = prevBody;
      };
    } else {
      if (typeof window !== "undefined" && (window as any).__lenis) {
        (window as any).__lenis.start();
      }
      html.style.overflow = "";
      body.style.overflow = "";
    }
  }, [editingProject, deleteConfirmTarget]);

  const checkAuthStatus = async () => {
    setLoading(true);
    setTableMissing(false);
    try {
      const { data: admins, error } = await supabase
        .from("portfolio_admins")
        .select("id, username, session_token");

      if (error) {
        if (
          error.code === "42P01" ||
          error.message?.includes("schema cache") ||
          error.message?.includes("not found")
        ) {
          setTableMissing(true);
          setLoading(false);
          return;
        }
      }

      if (!admins || admins.length === 0) {
        setHasAdmin(false);
        setSessionUser(null);
        setLoading(false);
        return;
      }

      setHasAdmin(true);

      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const matched = admins.find(
            (a) => a.username === parsed.username && a.session_token === parsed.token
          );
          if (matched) {
            setSessionUser(matched.username);
            loadDashboardData();
            setLoading(false);
            return;
          }
        } catch {}
      }

      setSessionUser(null);
      setLoading(false);
    } catch (err: any) {
      console.error("Auth check error:", err);
      setTableMissing(true);
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    loadProjects();
    loadProfile();
  };

  const loadProjects = async () => {
    setProjectsLoading(true);
    try {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading projects:", error);
      } else {
        setProjects(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("portfolio_profile")
        .select("data")
        .eq("id", "main")
        .maybeSingle();

      if (!error && data && data.data) {
        setProfile({
          ...defaultProfile,
          ...data.data,
          personal: { ...defaultProfile.personal, ...(data.data.personal || {}) },
          home: { ...defaultProfile.home, ...(data.data.home || {}) },
          about: { ...defaultProfile.about, ...(data.data.about || {}) },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // First-time Setup
  const handleFirstTimeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!usernameInput.trim() || usernameInput.length < 3) {
      setAuthError("ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร");
      return;
    }
    if (!passwordInput || passwordInput.length < 6) {
      setAuthError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setAuthError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setAuthLoading(true);
    try {
      const salt = generateSalt(16);
      const password_hash = await hashPassword(passwordInput, salt);
      const session_token = generateSessionToken();

      const { error } = await supabase.from("portfolio_admins").insert([
        {
          username: usernameInput.trim(),
          password_hash,
          salt,
          session_token,
        },
      ]);

      if (error) throw error;

      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ username: usernameInput.trim(), token: session_token })
      );

      setSessionUser(usernameInput.trim());
      setHasAdmin(true);
      showToast("สร้างบัญชีผู้ดูแลสำเร็จและเข้าสู่ระบบแล้ว!", "success");
      loadDashboardData();
    } catch (err: any) {
      setAuthError(err.message || "เกิดข้อผิดพลาดในการสร้างบัญชี");
    } finally {
      setAuthLoading(false);
    }
  };

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!usernameInput.trim() || !passwordInput) {
      setAuthError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    setAuthLoading(true);
    try {
      const { data: user, error } = await supabase
        .from("portfolio_admins")
        .select("*")
        .eq("username", usernameInput.trim())
        .maybeSingle();

      if (error || !user) {
        setAuthError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        setAuthLoading(false);
        return;
      }

      const inputHash = await hashPassword(passwordInput, user.salt);
      if (inputHash !== user.password_hash) {
        setAuthError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        setAuthLoading(false);
        return;
      }

      const newToken = generateSessionToken();
      await supabase
        .from("portfolio_admins")
        .update({ session_token: newToken, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ username: user.username, token: newToken })
      );

      setSessionUser(user.username);
      showToast("เข้าสู่ระบบสำเร็จ!", "success");
      loadDashboardData();
    } catch (err: any) {
      setAuthError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        await supabase
          .from("portfolio_admins")
          .update({ session_token: null })
          .eq("username", parsed.username);
      }
    } catch {}
    localStorage.removeItem(SESSION_KEY);
    setSessionUser(null);
    setUsernameInput("");
    setPasswordInput("");
    showToast("ออกจากระบบแล้ว", "success");
  };

  // Projects Filtering & Search
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.desc_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.desc_th?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === "all" ||
        (p.categories || []).includes(selectedCategory);

      return matchesSearch && matchesCat;
    });
  }, [projects, searchQuery, selectedCategory]);

  // Project Add / Edit
  const handleOpenAddProject = () => {
    setIsNewProject(true);
    setNewTagInput("");
    setEditingProject({
      title: "",
      desc_en: "",
      desc_th: "",
      href: "",
      tags: ["Website"],
      categories: ["website"],
      year: new Date().getFullYear().toString(),
      role_en: "Design + Build",
      role_th: "ออกแบบและพัฒนา",
      monogram: "",
      cover_url: "/works/zexta.jpg",
      featured: false,
      sort_order: projects.length,
    });
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject.title.trim()) {
      showToast("กรุณากรอกชื่อโปรเจกต์", "error");
      return;
    }

    const payload = {
      title: editingProject.title.trim(),
      desc_en: editingProject.desc_en || "",
      desc_th: editingProject.desc_th || "",
      href: editingProject.href || "",
      tags: Array.isArray(editingProject.tags) ? editingProject.tags : [],
      categories: Array.isArray(editingProject.categories) && editingProject.categories.length > 0 ? editingProject.categories : ["website"],
      year: editingProject.year || "2026",
      role_en: editingProject.role_en || "",
      role_th: editingProject.role_th || "",
      monogram: editingProject.monogram || editingProject.title.slice(0, 2),
      cover_url: editingProject.cover_url || "",
      featured: Boolean(editingProject.featured),
      sort_order: Number(editingProject.sort_order ?? 0),
      updated_at: new Date().toISOString(),
    };

    try {
      if (isNewProject) {
        const { error } = await supabase.from("portfolio_projects").insert([payload]);
        if (error) throw error;
        showToast("เพิ่มผลงานสำเร็จ!", "success");
      } else {
        const { error } = await supabase
          .from("portfolio_projects")
          .update(payload)
          .eq("id", editingProject.id);
        if (error) throw error;
        showToast("บันทึกการแก้ไขผลงานสำเร็จ!", "success");
      }

      setEditingProject(null);
      loadProjects();
    } catch (err: any) {
      showToast(err.message || "เกิดข้อผิดพลาดในการบันทึกผลงาน", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    try {
      const { error } = await supabase
        .from("portfolio_projects")
        .delete()
        .eq("id", deleteConfirmTarget.id);
      if (error) throw error;
      showToast(`ลบผลงาน "${deleteConfirmTarget.title}" เรียบร้อย`, "success");
      setDeleteConfirmTarget(null);
      loadProjects();
    } catch (err: any) {
      showToast(err.message || "เกิดข้อผิดพลาดในการลบผลงาน", "error");
    }
  };

  const handleToggleFeatured = async (project: any) => {
    try {
      const updatedStatus = !project.featured;
      const { error } = await supabase
        .from("portfolio_projects")
        .update({ featured: updatedStatus })
        .eq("id", project.id);
      if (error) throw error;
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, featured: updatedStatus } : p))
      );
      showToast(
        updatedStatus ? `ตั้ง "${project.title}" เป็นผลงานเด่นแล้ว` : `ยกเลิกผลงานเด่นแล้ว`,
        "success"
      );
    } catch (err: any) {
      showToast(err.message || "เกิดข้อผิดพลาด", "error");
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const newProjects = [...projects];
    const temp = newProjects[index];
    newProjects[index] = newProjects[targetIndex];
    newProjects[targetIndex] = temp;

    setProjects(newProjects);

    try {
      await Promise.all([
        supabase.from("portfolio_projects").update({ sort_order: index }).eq("id", newProjects[index].id),
        supabase.from("portfolio_projects").update({ sort_order: targetIndex }).eq("id", newProjects[targetIndex].id),
      ]);
      showToast("ปรับลำดับผลงานแล้ว", "success");
    } catch (err) {
      loadProjects();
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    try {
      const { error } = await supabase.from("portfolio_profile").upsert({
        id: "main",
        data: profile,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setProfileHasChanges(false);
      showToast("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว!", "success");
    } catch (err: any) {
      showToast(err.message || "เกิดข้อผิดพลาดในการบันทึก", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast("รหัสผ่านใหม่ไม่ตรงกัน", "error");
      return;
    }

    try {
      const { data: user, error: fetchErr } = await supabase
        .from("portfolio_admins")
        .select("*")
        .eq("username", sessionUser)
        .single();

      if (fetchErr || !user) throw new Error("ไม่พบข้อมูลผู้ใช้");

      const oldHash = await hashPassword(oldPassword, user.salt);
      if (oldHash !== user.password_hash) {
        showToast("รหัสผ่านเดิมไม่ถูกต้อง", "error");
        return;
      }

      const newSalt = generateSalt(16);
      const newHash = await hashPassword(newPassword, newSalt);

      const targetUsername = newUsername.trim() || sessionUser;
      const { error: updateErr } = await supabase
        .from("portfolio_admins")
        .update({
          password_hash: newHash,
          salt: newSalt,
          username: targetUsername,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateErr) throw updateErr;

      if (targetUsername !== sessionUser) {
        setSessionUser(targetUsername);
        const saved = localStorage.getItem(SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.username = targetUsername;
          localStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
        }
      }

      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setNewUsername("");
      showToast("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว!", "success");
    } catch (err: any) {
      showToast(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน", "error");
    }
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <div className="relative flex size-14 items-center justify-center">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent/20" />
          <div className="size-10 animate-spin rounded-full border-2 border-line border-t-accent" />
        </div>
        <p className="mt-5 text-[14px] font-medium text-fg-muted">กำลังโหลดข้อมูลระบบ...</p>
      </div>
    );
  }

  // --- SCHEMA MISSING STATE ---
  if (tableMissing) {
    return (
      <div className="mx-auto max-w-lg p-6 py-20">
        <div className="rounded-3xl border border-line bg-mist p-8 shadow-[var(--shadow-panel)]">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <WarningCircle size={32} weight="duotone" />
          </div>
          <h2 className="mt-5 text-center text-[22px] font-semibold text-fg">
            ยังไม่พบตารางใน Supabase
          </h2>
          <p className="mt-2 text-center text-[14px] text-fg-muted">
            กรุณานำสคริปต์ SQL จาก <code>supabase-schema.sql</code> ไปรันใน Supabase SQL Editor
          </p>
          <div className="mt-6 flex justify-center">
            <button onClick={() => checkAuthStatus()} className="btn-primary cursor-pointer">
              ตรวจสอบอีกครั้ง
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- UNAUTHENTICATED: FIRST-TIME SETUP OR LOGIN ---
  if (!sessionUser) {
    return (
      <div className="relative flex min-h-[90vh] items-center justify-center px-4 py-16">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border border-line bg-surface/80 p-8 shadow-[var(--shadow-panel)] backdrop-blur-2xl ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
            {/* Header Icon */}
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent to-accent-hover text-white shadow-lg shadow-accent/25">
              <LockKey size={28} weight="bold" />
            </div>

            <div className="mt-5 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-[11px] font-semibold tracking-wider text-fg-dim uppercase">
                <ShieldCheck size={14} weight="bold" className="text-accent" />
                phumitch.space
              </span>
              <h1 className="mt-3 text-[24px] font-semibold tracking-[-0.02em] text-fg">
                {hasAdmin ? "ยินดีต้อนรับกลับ" : "ตั้งค่าผู้ดูแลครั้งแรก"}
              </h1>
              <p className="mt-1.5 text-[14px] text-fg-muted">
                {hasAdmin
                  ? "ลงชื่อเข้าใช้เพื่อจัดการผลงานและข้อมูลส่วนตัว"
                  : "ยังไม่มีบัญชีผู้ดูแล กำหนดชื่อผู้ใช้และรหัสผ่านเพื่อเริ่มใช้งาน"}
              </p>
            </div>

            {authError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-5 flex items-center gap-2.5 rounded-2xl bg-red-500/10 px-4 py-3 text-[13px] text-red-500"
              >
                <WarningCircle size={18} weight="fill" className="shrink-0" />
                <span>{authError}</span>
              </motion.div>
            )}

            <form
              onSubmit={hasAdmin ? handleLogin : handleFirstTimeSetup}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="block text-[13px] font-medium text-fg-body">
                  ชื่อผู้ใช้ (Username)
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-dim">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="เช่น admin"
                    className="w-full rounded-2xl border border-line bg-mist/60 px-4 py-3 pl-10 text-[14px] text-fg outline-none transition-all placeholder:text-fg-dim focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent-soft"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-fg-body">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-dim">
                    <LockKey size={18} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-line bg-mist/60 px-4 py-3 pl-10 pr-11 text-[14px] text-fg outline-none transition-all placeholder:text-fg-dim focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent-soft"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-dim transition-colors hover:text-fg"
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {!hasAdmin && (
                <div>
                  <label className="block text-[13px] font-medium text-fg-body">
                    ยืนยันรหัสผ่าน (Confirm Password)
                  </label>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-dim">
                      <LockKey size={18} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-line bg-mist/60 px-4 py-3 pl-10 text-[14px] text-fg outline-none transition-all placeholder:text-fg-dim focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent-soft"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="btn-primary mt-6 w-full cursor-pointer justify-center py-3.5 text-[14px] font-medium shadow-lg shadow-accent/20 transition-all hover:shadow-xl"
              >
                {authLoading ? (
                  <div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : hasAdmin ? (
                  "เข้าสู่ระบบ"
                ) : (
                  "สร้างบัญชีและเริ่มต้นใช้งาน"
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-line pt-5 text-center">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted transition-colors hover:text-fg"
              >
                <ArrowLeft size={14} />
                <span>กลับสู่หน้าแรกเว็บไซต์</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- AUTHENTICATED DASHBOARD ---
  return (
    <div className="min-h-screen bg-bg pb-24 text-fg-body">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-5 py-3.5 text-[13px] font-semibold shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "bg-accent text-white shadow-accent/30"
                : "bg-red-500 text-white shadow-red-500/30"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={20} weight="fill" />
            ) : (
              <WarningCircle size={20} weight="fill" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex size-9 items-center justify-center rounded-xl bg-accent-soft text-accent transition-transform hover:scale-105"
            >
              <Sparkle size={18} weight="fill" />
            </a>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold tracking-tight text-fg">
                  Portfolio Admin
                </span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Supabase Live
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="btn-ghost hidden text-[13px] sm:inline-flex"
            >
              <span>ดูหน้าเว็บ</span>
              <ArrowSquareOut size={14} />
            </a>

            <div className="h-5 w-px bg-line" />

            <div className="flex items-center gap-2 rounded-full border border-line bg-mist/60 px-3 py-1 text-[13px]">
              <span className="flex size-5 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-accent shadow-sm">
                {sessionUser.slice(0, 1).toUpperCase()}
              </span>
              <span className="max-w-[100px] truncate font-medium text-fg sm:max-w-none">
                {sessionUser}
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="ออกจากระบบ"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-fg-dim transition-colors hover:bg-red-500/10 hover:text-red-500"
            >
              <SignOut size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {[
              { id: "projects", label: "ผลงาน", labelFull: "ผลงาน (Projects)", count: projects.length, icon: Briefcase },
              { id: "profile", label: "ข้อมูลส่วนตัว", labelFull: "ข้อมูลส่วนตัว (Profile)", icon: User },
              { id: "account", label: "บัญชีผู้ดูแล", labelFull: "บัญชีผู้ดูแล (Account)", icon: LockKey },
            ].map((tab) => {
              const IconCmp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors whitespace-nowrap ${
                    isActive ? "text-fg" : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-active-tab"
                      className="absolute inset-0 rounded-full bg-mist-strong shadow-sm"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                    <IconCmp size={16} weight={isActive ? "bold" : "regular"} />
                    <span className="hidden sm:inline">{tab.labelFull}</span>
                    <span className="sm:hidden">{tab.label}</span>
                    {typeof tab.count === "number" && (
                      <span className="rounded-full bg-surface px-1.5 py-0.2 text-[11px] font-semibold text-fg-dim shadow-xs">
                        {tab.count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {/* TAB 1: PROJECTS */}
        {activeTab === "projects" && (
          <section className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-line bg-surface p-4 shadow-xs">
                <p className="text-[12px] font-medium text-fg-dim">ผลงานทั้งหมด</p>
                <p className="mt-1 text-[26px] font-bold tracking-tight text-fg">
                  {projects.length}
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-4 shadow-xs">
                <p className="text-[12px] font-medium text-fg-dim">ผลงานเด่น (Featured)</p>
                <p className="mt-1 text-[26px] font-bold tracking-tight text-accent">
                  {projects.filter((p) => p.featured).length}
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-4 shadow-xs">
                <p className="text-[12px] font-medium text-fg-dim">หมวดหมู่ที่ใช้งาน</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="rounded-md bg-mist px-2 py-0.5 text-[11px] font-medium text-fg-muted">
                    Web
                  </span>
                  <span className="rounded-md bg-mist px-2 py-0.5 text-[11px] font-medium text-fg-muted">
                    Bot
                  </span>
                  <span className="rounded-md bg-mist px-2 py-0.5 text-[11px] font-medium text-fg-muted">
                    Community
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-4 shadow-xs">
                <p className="text-[12px] font-medium text-fg-dim">สถานะฐานข้อมูล</p>
                <div className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-emerald-500">
                  <CheckCircle size={16} weight="fill" />
                  <span>ออนไลน์ปกติ</span>
                </div>
              </div>
            </div>

            {/* Filter & Action Bar */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                {/* Search Input */}
                <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-dim">
                    <MagnifyingGlass size={16} />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาผลงานหรือแท็ก..."
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 pl-9 text-[13px] text-fg outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent-soft"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-dim hover:text-fg"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center overflow-x-auto scrollbar-none flex-nowrap rounded-xl border border-line bg-mist/60 p-1 text-[12px] max-w-full">
                  {[
                    { id: "all", label: "ทั้งหมด" },
                    { id: "website", label: "Website" },
                    { id: "bot", label: "Bot" },
                    { id: "community", label: "Community" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`cursor-pointer shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1 font-medium transition-all ${
                        selectedCategory === cat.id
                          ? "bg-surface text-fg shadow-xs"
                          : "text-fg-muted hover:text-fg"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: View Toggle + Add Button */}
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <div className="flex items-center rounded-xl border border-line bg-mist/60 p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    title="Grid View"
                    className={`cursor-pointer rounded-lg p-1.5 transition-all ${
                      viewMode === "grid" ? "bg-surface text-fg shadow-xs" : "text-fg-dim hover:text-fg"
                    }`}
                  >
                    <SquaresFour size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    title="List View"
                    className={`cursor-pointer rounded-lg p-1.5 transition-all ${
                      viewMode === "list" ? "bg-surface text-fg shadow-xs" : "text-fg-dim hover:text-fg"
                    }`}
                  >
                    <ListBullets size={16} />
                  </button>
                </div>

                <button
                  onClick={handleOpenAddProject}
                  className="btn-primary cursor-pointer text-[13px] flex-1 sm:flex-initial justify-center"
                >
                  <Plus size={16} weight="bold" />
                  <span>เพิ่มผลงาน</span>
                </button>
              </div>
            </div>

            {/* Projects List/Grid */}
            {projectsLoading ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-line bg-surface p-12 text-fg-muted">
                <div className="size-6 animate-spin rounded-full border-2 border-line border-t-accent" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-line bg-surface p-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-mist text-fg-dim">
                  <Briefcase size={28} />
                </div>
                <h3 className="mt-4 text-[16px] font-semibold text-fg">
                  {searchQuery ? "ไม่พบผลงานที่ตรงกับการค้นหา" : "ยังไม่มีผลงานในระบบ"}
                </h3>
                <p className="mt-1 max-w-sm text-[13px] text-fg-muted">
                  {searchQuery
                    ? `ไม่พบคำว่า "${searchQuery}" ในชื่อผลงานหรือแท็ก`
                    : "เริ่มต้นเพิ่มผลงานแรกของคุณเพื่อแสดงผลบนหน้าเว็บไซต์"}
                </p>
                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="btn-ghost mt-4 text-[13px]"
                  >
                    ล้างการค้นหา
                  </button>
                ) : (
                  <button
                    onClick={handleOpenAddProject}
                    className="btn-primary mt-4 cursor-pointer text-[13px]"
                  >
                    <Plus size={16} weight="bold" />
                    <span>เพิ่มผลงานใหม่</span>
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((proj, idx) => (
                  <motion.div
                    key={proj.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface p-4 shadow-sm transition-all hover:border-line-strong hover:shadow-md"
                  >
                    {/* Top Media Thumbnail */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-mist ring-1 ring-black/[0.04]">
                      {proj.cover_url ? (
                        <img
                          src={proj.cover_url}
                          alt={proj.title}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center font-bold text-fg-dim text-[24px]">
                          {proj.monogram || proj.title.slice(0, 2)}
                        </div>
                      )}

                      {/* Featured Star Toggle */}
                      <button
                        onClick={() => handleToggleFeatured(proj)}
                        title={proj.featured ? "ยกเลิก Featured" : "ตั้งเป็น Featured"}
                        className={`absolute left-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all ${
                          proj.featured
                            ? "bg-amber-400 text-white hover:scale-110"
                            : "bg-surface/85 text-fg-dim hover:text-amber-500"
                        }`}
                      >
                        <Star size={16} weight={proj.featured ? "fill" : "bold"} />
                      </button>

                      {/* Monogram tag */}
                      <span className="absolute right-3 top-3 rounded-full bg-surface/85 px-2.5 py-1 text-[11px] font-bold text-fg-muted backdrop-blur-md">
                        {proj.monogram || proj.title.slice(0, 2)}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="mt-4 flex-1">
                      <div className="flex items-center justify-between text-[12px] text-fg-dim">
                        <span className="truncate">{proj.role_th || proj.role_en}</span>
                        <span className="tabular-nums">{proj.year}</span>
                      </div>

                      <h3 className="mt-1 text-[18px] font-semibold tracking-tight text-fg">
                        {proj.title}
                      </h3>

                      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-fg-muted">
                        {proj.desc_th || proj.desc_en}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {(proj.tags || []).slice(0, 3).map((t: string) => (
                          <span
                            key={t}
                            className="rounded-md bg-mist px-2 py-0.5 text-[11px] font-medium text-fg-dim"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                      <div className="flex items-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleReorder(idx, "up")}
                          title="เลื่อนขึ้น"
                          className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-fg-dim hover:bg-mist hover:text-fg disabled:opacity-20"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          disabled={idx === filteredProjects.length - 1}
                          onClick={() => handleReorder(idx, "down")}
                          title="เลื่อนลง"
                          className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-fg-dim hover:bg-mist hover:text-fg disabled:opacity-20"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setIsNewProject(false);
                            setNewTagInput("");
                            setEditingProject({ ...proj });
                          }}
                          className="flex cursor-pointer items-center gap-1 rounded-xl bg-mist px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-mist-strong"
                        >
                          <PencilSimple size={14} />
                          <span>แก้ไข</span>
                        </button>

                        <button
                          onClick={() =>
                            setDeleteConfirmTarget({ id: proj.id, title: proj.title })
                          }
                          className="flex size-8 cursor-pointer items-center justify-center rounded-xl text-fg-dim transition-colors hover:bg-red-500/10 hover:text-red-500"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="overflow-x-auto rounded-3xl border border-line bg-surface shadow-xs">
                <table className="w-full min-w-[560px] text-left text-[13px]">
                  <thead className="border-b border-line bg-mist/50 text-[11px] font-semibold tracking-wider text-fg-dim uppercase">
                    <tr>
                      <th className="py-3 pl-4 pr-2">ลำดับ</th>
                      <th className="px-4 py-3">ผลงาน</th>
                      <th className="px-4 py-3 hidden sm:table-cell">หมวดหมู่</th>
                      <th className="px-4 py-3 hidden md:table-cell">ปี</th>
                      <th className="px-4 py-3 text-center">Featured</th>
                      <th className="py-3 pl-2 pr-4 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredProjects.map((proj, idx) => (
                      <tr key={proj.id} className="transition-colors hover:bg-mist/40">
                        <td className="py-3 pl-4 pr-2 text-fg-dim tabular-nums">
                          <div className="flex items-center gap-1">
                            <span>#{idx + 1}</span>
                            <div className="flex flex-col">
                              <button
                                disabled={idx === 0}
                                onClick={() => handleReorder(idx, "up")}
                                className="cursor-pointer text-fg-dim hover:text-fg disabled:opacity-20"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                disabled={idx === filteredProjects.length - 1}
                                onClick={() => handleReorder(idx, "down")}
                                className="cursor-pointer text-fg-dim hover:text-fg disabled:opacity-20"
                              >
                                <ArrowDown size={12} />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="size-10 shrink-0 overflow-hidden rounded-xl bg-mist ring-1 ring-black/[0.04]">
                              {proj.cover_url ? (
                                <img
                                  src={proj.cover_url}
                                  alt={proj.title}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center font-bold text-fg-dim text-[11px]">
                                  {proj.monogram || proj.title.slice(0, 2)}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-fg">{proj.title}</p>
                              <p className="text-[12px] text-fg-dim">{proj.role_th || proj.role_en}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex gap-1">
                            {(proj.categories || []).map((cat: string) => (
                              <span
                                key={cat}
                                className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-medium text-fg-muted"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell tabular-nums text-fg-muted">
                          {proj.year}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleFeatured(proj)}
                            className={`cursor-pointer rounded-full p-1.5 transition-colors ${
                              proj.featured
                                ? "text-amber-500 hover:text-amber-600"
                                : "text-fg-dim hover:text-fg"
                            }`}
                          >
                            <Star size={18} weight={proj.featured ? "fill" : "regular"} />
                          </button>
                        </td>
                        <td className="py-3 pl-2 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setIsNewProject(false);
                                setNewTagInput("");
                                setEditingProject({ ...proj });
                              }}
                              className="rounded-lg p-1.5 text-fg-dim transition-colors hover:bg-mist hover:text-fg cursor-pointer"
                            >
                              <PencilSimple size={16} />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirmTarget({ id: proj.id, title: proj.title })
                              }
                              className="rounded-lg p-1.5 text-fg-dim transition-colors hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: PROFILE & PERSONAL INFO */}
        {activeTab === "profile" && (
          <section className="space-y-6">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Personal Details */}
              <div className="rounded-3xl border border-line bg-surface p-6 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-line pb-4">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <User size={18} weight="bold" />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-semibold text-fg">ข้อมูลส่วนตัว (Personal Details)</h3>
                    <p className="text-[12px] text-fg-muted">ชื่อ วันเกิด สถานะ และการศึกษา</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12px] font-medium text-fg-body">ชื่อ-นามสกุล (EN)</label>
                    <input
                      type="text"
                      value={profile.personal.fullName[0]}
                      onChange={(e) => {
                        setProfileHasChanges(true);
                        setProfile({
                          ...profile,
                          personal: { ...profile.personal, fullName: [e.target.value, profile.personal.fullName[1]] },
                        });
                      }}
                      className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2.5 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-fg-body">ชื่อ-นามสกุล (TH)</label>
                    <input
                      type="text"
                      value={profile.personal.fullName[1]}
                      onChange={(e) => {
                        setProfileHasChanges(true);
                        setProfile({
                          ...profile,
                          personal: { ...profile.personal, fullName: [profile.personal.fullName[0], e.target.value] },
                        });
                      }}
                      className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2.5 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-fg-body">ชื่อเล่น (EN)</label>
                    <input
                      type="text"
                      value={profile.personal.nickname[0]}
                      onChange={(e) => {
                        setProfileHasChanges(true);
                        setProfile({
                          ...profile,
                          personal: { ...profile.personal, nickname: [e.target.value, profile.personal.nickname[1]] },
                        });
                      }}
                      className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2.5 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-fg-body">ชื่อเล่น (TH)</label>
                    <input
                      type="text"
                      value={profile.personal.nickname[1]}
                      onChange={(e) => {
                        setProfileHasChanges(true);
                        setProfile({
                          ...profile,
                          personal: { ...profile.personal, nickname: [profile.personal.nickname[0], e.target.value] },
                        });
                      }}
                      className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2.5 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-fg-body">วันเกิด (EN)</label>
                    <input
                      type="text"
                      value={profile.personal.birthday[0]}
                      onChange={(e) => {
                        setProfileHasChanges(true);
                        setProfile({
                          ...profile,
                          personal: { ...profile.personal, birthday: [e.target.value, profile.personal.birthday[1]] },
                        });
                      }}
                      className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2.5 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-fg-body">วันเกิด (TH)</label>
                    <input
                      type="text"
                      value={profile.personal.birthday[1]}
                      onChange={(e) => {
                        setProfileHasChanges(true);
                        setProfile({
                          ...profile,
                          personal: { ...profile.personal, birthday: [profile.personal.birthday[0], e.target.value] },
                        });
                      }}
                      className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2.5 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-fg-body">ที่อยู่ (EN)</label>
                    <input
                      type="text"
                      value={profile.personal.location[0]}
                      onChange={(e) => {
                        setProfileHasChanges(true);
                        setProfile({
                          ...profile,
                          personal: { ...profile.personal, location: [e.target.value, profile.personal.location[1]] },
                        });
                      }}
                      className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2.5 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-fg-body">ที่อยู่ (TH)</label>
                    <input
                      type="text"
                      value={profile.personal.location[1]}
                      onChange={(e) => {
                        setProfileHasChanges(true);
                        setProfile({
                          ...profile,
                          personal: { ...profile.personal, location: [profile.personal.location[0], e.target.value] },
                        });
                      }}
                      className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2.5 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-fg-body">การศึกษา (EN)</label>
                    <input
                      type="text"
                      value={profile.personal.education[0]}
                      onChange={(e) => {
                        setProfileHasChanges(true);
                        setProfile({
                          ...profile,
                          personal: { ...profile.personal, education: [e.target.value, profile.personal.education[1]] },
                        });
                      }}
                      className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2.5 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-fg-body">การศึกษา (TH)</label>
                    <input
                      type="text"
                      value={profile.personal.education[1]}
                      onChange={(e) => {
                        setProfileHasChanges(true);
                        setProfile({
                          ...profile,
                          personal: { ...profile.personal, education: [profile.personal.education[0], e.target.value] },
                        });
                      }}
                      className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2.5 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                    />
                  </div>
                </div>
              </div>

              {/* Taglines & About */}
              <div className="rounded-3xl border border-line bg-surface p-6 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-line pb-4">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Sparkle size={18} weight="bold" />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-semibold text-fg">สโลแกน & ข้อความแนะนำตัว (Hero & About)</h3>
                    <p className="text-[12px] text-fg-muted">ข้อความคำโปรยที่แสดงในหน้าแรกและหน้า About</p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12px] font-medium text-fg-body">หน้าแรก สโลแกน 1 (EN)</label>
                      <input
                        type="text"
                        value={profile.home.tag1_en}
                        onChange={(e) => {
                          setProfileHasChanges(true);
                          setProfile({ ...profile, home: { ...profile.home, tag1_en: e.target.value } });
                        }}
                        className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2.5 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-fg-body">หน้าแรก สโลแกน 1 (TH)</label>
                      <input
                        type="text"
                        value={profile.home.tag1_th}
                        onChange={(e) => {
                          setProfileHasChanges(true);
                          setProfile({ ...profile, home: { ...profile.home, tag1_th: e.target.value } });
                        }}
                        className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2.5 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12px] font-medium text-fg-body">หน้าแรก สโลแกน 2 (EN)</label>
                      <input
                        type="text"
                        value={profile.home.tag2_en}
                        onChange={(e) => {
                          setProfileHasChanges(true);
                          setProfile({ ...profile, home: { ...profile.home, tag2_en: e.target.value } });
                        }}
                        className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2.5 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-fg-body">หน้าแรก สโลแกน 2 (TH)</label>
                      <input
                        type="text"
                        value={profile.home.tag2_th}
                        onChange={(e) => {
                          setProfileHasChanges(true);
                          setProfile({ ...profile, home: { ...profile.home, tag2_th: e.target.value } });
                        }}
                        className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2.5 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12px] font-medium text-fg-body">เกี่ยวกับตัวเอง (About Desc EN)</label>
                      <textarea
                        rows={3}
                        value={profile.about.desc_en}
                        onChange={(e) => {
                          setProfileHasChanges(true);
                          setProfile({ ...profile, about: { ...profile.about, desc_en: e.target.value } });
                        }}
                        className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-fg-body">เกี่ยวกับตัวเอง (About Desc TH)</label>
                      <textarea
                        rows={3}
                        value={profile.about.desc_th}
                        onChange={(e) => {
                          setProfileHasChanges(true);
                          setProfile({ ...profile, about: { ...profile.about, desc_th: e.target.value } });
                        }}
                        className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* What I Do */}
              <div className="rounded-3xl border border-line bg-surface p-6 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-line pb-4">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Briefcase size={18} weight="bold" />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-semibold text-fg">สิ่งที่ฉันทำ (What I Do)</h3>
                    <p className="text-[12px] text-fg-muted">จุดเด่น 3 ข้อที่แสดงในหน้าแรกและหน้า About</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {profile.what_i_do.map((item, idx) => (
                    <div key={idx} className="rounded-2xl border border-line bg-mist/40 p-4">
                      <span className="text-[11px] font-bold tracking-wider text-accent uppercase">
                        ข้อ 0{idx + 1}
                      </span>
                      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11px] text-fg-dim">ภาษาอังกฤษ (EN)</label>
                          <input
                            type="text"
                            value={item.en}
                            onChange={(e) => {
                              setProfileHasChanges(true);
                              const next = [...profile.what_i_do];
                              next[idx].en = e.target.value;
                              setProfile({ ...profile, what_i_do: next });
                            }}
                            className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-fg"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-fg-dim">ภาษาไทย (TH)</label>
                          <input
                            type="text"
                            value={item.th}
                            onChange={(e) => {
                              setProfileHasChanges(true);
                              const next = [...profile.what_i_do];
                              next[idx].th = e.target.value;
                              setProfile({ ...profile, what_i_do: next });
                            }}
                            className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-fg"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="rounded-3xl border border-line bg-surface p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <Globe size={18} weight="bold" />
                    </span>
                    <div>
                      <h3 className="text-[16px] font-semibold text-fg">ช่องทางติดต่อ (Social Media)</h3>
                      <p className="text-[12px] text-fg-muted">ลิงก์โซเชียลมีเดียสำหรับผู้ติดต่อ</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileHasChanges(true);
                      setProfile({
                        ...profile,
                        socials: [...profile.socials, { label: "New", handle: "@handle", href: "https://" }],
                      });
                    }}
                    className="flex cursor-pointer items-center gap-1 text-[13px] font-semibold text-accent hover:underline"
                  >
                    <Plus size={14} weight="bold" />
                    <span>เพิ่มช่องทาง</span>
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {profile.socials.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-2xl border border-line bg-mist/40 p-3 transition-colors hover:bg-mist/70"
                    >
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
                        <input
                          type="text"
                          placeholder="Label"
                          value={s.label}
                          onChange={(e) => {
                            setProfileHasChanges(true);
                            const next = [...profile.socials];
                            next[idx].label = e.target.value;
                            setProfile({ ...profile, socials: next });
                          }}
                          className="w-full sm:w-28 rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-fg"
                        />
                        <input
                          type="text"
                          placeholder="@handle"
                          value={s.handle}
                          onChange={(e) => {
                            setProfileHasChanges(true);
                            const next = [...profile.socials];
                            next[idx].handle = e.target.value;
                            setProfile({ ...profile, socials: next });
                          }}
                          className="w-full sm:w-36 rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-fg"
                        />
                      </div>
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          type="text"
                          placeholder="https://..."
                          value={s.href}
                          onChange={(e) => {
                            setProfileHasChanges(true);
                            const next = [...profile.socials];
                            next[idx].href = e.target.value;
                            setProfile({ ...profile, socials: next });
                          }}
                          className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-[13px] text-fg"
                        />
                        <a
                          href={s.href}
                          target="_blank"
                          rel="noopener"
                          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-fg-dim hover:bg-surface hover:text-fg"
                          title="ทดสอบเปิดลิงก์"
                        >
                          <ArrowSquareOut size={16} />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileHasChanges(true);
                            setProfile({
                              ...profile,
                              socials: profile.socials.filter((_, i) => i !== idx),
                            });
                          }}
                          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-fg-dim hover:bg-red-500/10 hover:text-red-500"
                          title="ลบ"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Save Bar */}
              <div className="sticky bottom-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-line bg-surface/90 p-4 shadow-xl backdrop-blur-xl">
                <span className="text-[13px] font-medium text-fg-muted text-center sm:text-left">
                  {profileHasChanges ? "⚠️ มีการแก้ไขที่ยังไม่ได้บันทึก" : "ข้อมูลเป็นปัจจุบันแล้ว"}
                </span>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary cursor-pointer w-full sm:w-auto justify-center px-6 py-2.5 text-[14px]"
                >
                  <FloppyDisk size={16} weight="bold" />
                  <span>{savingProfile ? "กำลังบันทึก..." : "บันทึกข้อมูลทั้งหมด"}</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* TAB 3: ACCOUNT & SECURITY */}
        {activeTab === "account" && (
          <section className="mx-auto max-w-xl space-y-6">
            <div className="rounded-3xl border border-line bg-surface p-6 shadow-xs">
              <div className="flex items-center gap-2.5 border-b border-line pb-4">
                <span className="flex size-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <LockKey size={18} weight="bold" />
                </span>
                <div>
                  <h3 className="text-[16px] font-semibold text-fg">ความปลอดภัยของบัญชีผู้ดูแล</h3>
                  <p className="text-[12px] text-fg-muted">
                    คุณกำลังเข้าสู่ระบบในชื่อผู้ใช้ <strong>@{sessionUser}</strong>
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-fg-body">
                    เปลี่ยนชื่อผู้ใช้ใหม่ (เว้นว่างไว้ถ้าใช้ชื่อเดิม)
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder={sessionUser || ""}
                    className="mt-1.5 w-full rounded-2xl border border-line bg-mist/60 px-4 py-2.5 text-[14px] text-fg outline-none focus:border-accent focus:bg-surface"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-fg-body">
                    รหัสผ่านปัจจุบัน (Current Password) *
                  </label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-2xl border border-line bg-mist/60 px-4 py-2.5 text-[14px] text-fg outline-none focus:border-accent focus:bg-surface"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-fg-body">
                    รหัสผ่านใหม่ (New Password) *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="ความยาวอย่างน้อย 6 ตัวอักษร"
                    className="mt-1.5 w-full rounded-2xl border border-line bg-mist/60 px-4 py-2.5 text-[14px] text-fg outline-none focus:border-accent focus:bg-surface"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-fg-body">
                    ยืนยันรหัสผ่านใหม่ (Confirm New Password) *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-2xl border border-line bg-mist/60 px-4 py-2.5 text-[14px] text-fg outline-none focus:border-accent focus:bg-surface"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary mt-2 w-full cursor-pointer justify-center py-3 text-[14px]"
                >
                  <FloppyDisk size={16} weight="bold" />
                  <span>บันทึกการเปลี่ยนรหัสผ่าน</span>
                </button>
              </form>
            </div>
          </section>
        )}
      </main>

      {/* PROJECT ADD / EDIT MODAL WITH LIVE PREVIEW */}
      <AnimatePresence>
        {editingProject && (
          <div
            data-lenis-prevent
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-black/60 p-4 sm:p-6 backdrop-blur-md"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingProject(null);
            }}
          >
            <motion.div
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative my-auto flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-line bg-surface px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Briefcase size={18} weight="bold" />
                  </span>
                  <h3 className="text-[18px] font-semibold text-fg">
                    {isNewProject ? "เพิ่มผลงานใหม่" : `แก้ไขผลงาน: ${editingProject.title}`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-full text-fg-dim hover:bg-mist hover:text-fg"
                >
                  <X size={18} />
                </button>
              </div>

              <div
                data-lenis-prevent
                onWheel={(e) => e.stopPropagation()}
                className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
              >
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                  {/* Form Inputs (7 Cols) */}
                <form onSubmit={handleSaveProject} className="space-y-4 lg:col-span-7">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[12px] font-medium text-fg-body">ชื่อโปรเจกต์ (Title) *</label>
                      <input
                        type="text"
                        required
                        value={editingProject.title}
                        onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                        placeholder="เช่น Zexta Studio"
                        className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-fg-body">Monogram (ตัวย่อ)</label>
                      <input
                        type="text"
                        value={editingProject.monogram || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, monogram: e.target.value })}
                        placeholder="Zx"
                        className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[12px] font-medium text-fg-body">ลิงก์เว็บไซต์ (URL)</label>
                      <input
                        type="text"
                        value={editingProject.href || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, href: e.target.value })}
                        placeholder="https://..."
                        className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-fg-body">ปี (Year)</label>
                      <input
                        type="text"
                        value={editingProject.year || "2026"}
                        onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                      />
                    </div>
                  </div>

                  {/* Cover URL with quick chips */}
                  <div>
                    <label className="block text-[12px] font-medium text-fg-body">รูปภาพหน้าปก (Cover URL)</label>
                    <input
                      type="text"
                      value={editingProject.cover_url || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, cover_url: e.target.value })}
                      placeholder="/works/zexta.jpg หรือ https://..."
                      className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent focus:bg-surface"
                    />
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      <span className="text-[11px] text-fg-dim">รูปภาพที่มีในระบบ:</span>
                      {AVAILABLE_COVERS.map((cov) => (
                        <button
                          key={cov.url}
                          type="button"
                          onClick={() => setEditingProject({ ...editingProject, cover_url: cov.url })}
                          className={`cursor-pointer rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                            editingProject.cover_url === cov.url
                              ? "bg-accent text-white"
                              : "bg-mist text-fg-muted hover:bg-mist-strong"
                          }`}
                        >
                          {cov.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categories Pills */}
                  <div>
                    <label className="block text-[12px] font-medium text-fg-body">หมวดหมู่ Categories</label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {[
                        { id: "website", label: "Website", icon: Globe },
                        { id: "bot", label: "Bot", icon: Robot },
                        { id: "community", label: "Community", icon: Users },
                      ].map((cat) => {
                        const isSelected = (editingProject.categories || []).includes(cat.id);
                        const IconCmp = cat.icon;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              const set = new Set(editingProject.categories || []);
                              if (isSelected) set.delete(cat.id);
                              else set.add(cat.id);
                              setEditingProject({ ...editingProject, categories: Array.from(set) });
                            }}
                            className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[12px] font-medium transition-all ${
                              isSelected
                                ? "border-accent bg-accent-soft text-accent"
                                : "border-line bg-mist/40 text-fg-muted hover:text-fg"
                            }`}
                          >
                            <IconCmp size={15} />
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Roles */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12px] font-medium text-fg-body">บทบาท (Role EN)</label>
                      <input
                        type="text"
                        value={editingProject.role_en || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, role_en: e.target.value })}
                        placeholder="Studio · Full-stack"
                        className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-fg-body">บทบาท (Role TH)</label>
                      <input
                        type="text"
                        value={editingProject.role_th || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, role_th: e.target.value })}
                        placeholder="สตูดิโอ · Full-stack"
                        className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div>
                    <label className="block text-[12px] font-medium text-fg-body">คำอธิบายภาษาอังกฤษ (Desc EN)</label>
                    <textarea
                      rows={2}
                      value={editingProject.desc_en || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, desc_en: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-fg-body">คำอธิบายภาษาไทย (Desc TH)</label>
                    <textarea
                      rows={2}
                      value={editingProject.desc_th || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, desc_th: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-line bg-mist/60 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent"
                    />
                  </div>

                  {/* Tag Chips Editor */}
                  <div>
                    <label className="block text-[12px] font-medium text-fg-body">แท็ก (Tags)</label>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-mist/40 p-2">
                      {(editingProject.tags || []).map((t: string, i: number) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 rounded-lg bg-surface px-2.5 py-1 text-[11px] font-medium text-fg shadow-xs"
                        >
                          #{t}
                          <button
                            type="button"
                            onClick={() => {
                              const next = (editingProject.tags || []).filter((_: any, idx: number) => idx !== i);
                              setEditingProject({ ...editingProject, tags: next });
                            }}
                            className="cursor-pointer text-fg-dim hover:text-red-500"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}

                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newTagInput.trim()) {
                            e.preventDefault();
                            const set = new Set([...(editingProject.tags || []), newTagInput.trim()]);
                            setEditingProject({ ...editingProject, tags: Array.from(set) });
                            setNewTagInput("");
                          }
                        }}
                        placeholder="+ พิมพ์แท็กแล้วกด Enter"
                        className="flex-1 min-w-[120px] bg-transparent px-2 py-0.5 text-[12px] text-fg outline-none"
                      />
                    </div>
                  </div>

                  {/* Featured Toggle */}
                  <div className="flex items-center justify-between rounded-xl border border-line bg-mist/40 p-3">
                    <div>
                      <p className="text-[13px] font-medium text-fg">แสดงเป็นผลงานเด่น (Featured)</p>
                      <p className="text-[11px] text-fg-muted">ผลงานเด่นจะแสดงขนาดใหญ่ที่ตำแหน่งแรกของหน้าแรก</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingProject({ ...editingProject, featured: !editingProject.featured })
                      }
                      className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${
                        editingProject.featured ? "bg-accent" : "bg-mist-strong"
                      }`}
                    >
                      <span
                        className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                          editingProject.featured ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingProject(null)}
                      className="w-full sm:w-auto cursor-pointer rounded-xl px-4 py-2 text-[13px] text-fg-muted hover:bg-mist text-center"
                    >
                      ยกเลิก
                    </button>
                    <button type="submit" className="btn-primary w-full sm:w-auto cursor-pointer text-[13px] justify-center">
                      <FloppyDisk size={16} weight="bold" />
                      <span>{isNewProject ? "เพิ่มผลงานใหม่" : "บันทึกการแก้ไข"}</span>
                    </button>
                  </div>
                </form>

                {/* Right: Real-time Live Preview (5 Cols) */}
                <div className="lg:col-span-5">
                  <div className="sticky top-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-fg-dim uppercase tracking-wider">
                      <Eye size={14} />
                      <span>ตัวอย่างแสดงผลจริง (Live Preview)</span>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-line bg-mist p-4 shadow-md ring-1 ring-black/[0.04]">
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-surface ring-1 ring-black/[0.04]">
                        {editingProject.cover_url ? (
                          <img
                            src={editingProject.cover_url}
                            alt={editingProject.title || "Preview"}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center font-bold text-fg-dim text-[24px]">
                            {editingProject.monogram || editingProject.title?.slice(0, 2) || "P."}
                          </div>
                        )}

                        {editingProject.featured && (
                          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-semibold text-accent backdrop-blur-md">
                            <Star size={12} weight="fill" />
                            Featured
                          </span>
                        )}

                        <span className="absolute right-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-bold text-fg-muted backdrop-blur-md">
                          {editingProject.monogram || editingProject.title?.slice(0, 2) || "P."}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[12px] text-fg-dim">
                          <span>{editingProject.role_th || editingProject.role_en || "บทบาท"}</span>
                          <span className="tabular-nums">{editingProject.year || "2026"}</span>
                        </div>
                        <h4 className="mt-1 text-[18px] font-bold text-fg">
                          {editingProject.title || "ชื่อโปรเจกต์"}
                        </h4>
                        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-fg-muted">
                          {editingProject.desc_th || editingProject.desc_en || "คำอธิบายโปรเจกต์จะแสดงผลตรงนี้"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {(editingProject.tags || ["Tag"]).map((t: string) => (
                            <span
                              key={t}
                              className="rounded-md bg-surface px-2 py-0.5 text-[11px] font-medium text-fg-dim"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* CUSTOM DELETE CONFIRMATION DIALOG */}
    <AnimatePresence>
      {deleteConfirmTarget && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm rounded-3xl border border-line bg-surface p-6 shadow-2xl"
          >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                <Trash size={24} weight="bold" />
              </div>
              <h3 className="mt-4 text-[17px] font-semibold text-fg">ยืนยันการลบผลงาน?</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
                คุณแน่ใจหรือไม่ว่าต้องการลบผลงาน <strong>"{deleteConfirmTarget.title}"</strong> ออกจากฐานข้อมูล? การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="w-full sm:w-auto cursor-pointer rounded-xl px-4 py-2 text-[13px] font-medium text-fg-muted hover:bg-mist text-center"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="w-full sm:w-auto cursor-pointer rounded-xl bg-red-500 px-4 py-2 text-[13px] font-medium text-white shadow-md shadow-red-500/20 transition-all hover:bg-red-600 text-center"
                >
                  ลบผลงาน
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
