import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  CircleAlert,
  ImagePlus,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { createPost, getFeed, login, register } from "./api";
import faceLogo from "./assets/face.png";

const coverImage =
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=88";

export default function JackPapa() {
  const [session, setSession] = useState("checking");
  const [mode, setMode] = useState("login");
  const [posts, setPosts] = useState([]);
  const [feedError, setFeedError] = useState("");
  const [feedLoading, setFeedLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const captionRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    let active = true;
    getFeed()
      .then((data) => {
        if (!active) return;
        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setSession("authenticated");
      })
      .catch((error) => {
        if (!active) return;
        if (error.status === 401) setSession("guest");
        else {
          setFeedError(error.message);
          setSession("unavailable");
        }
      })
      .finally(() => {
        if (active) setFeedLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 3600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  async function refreshFeed() {
    setFeedLoading(true);
    setFeedError("");
    try {
      const data = await getFeed();
      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setSession("authenticated");
    } catch (error) {
      if (error.status === 401) setSession("guest");
      else setFeedError(error.message);
    } finally {
      setFeedLoading(false);
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError("");
    if (mode === "register" && !name.trim()) {
      setAuthError("Enter your name to create an account.");
      return;
    }
    if (!email.trim() || !password) {
      setAuthError("Enter your email and password to continue.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setAuthError("Enter a valid email address.");
      return;
    }

    setAuthLoading(true);
    try {
      const response =
        mode === "register"
          ? await register({ name: name.trim(), email: email.trim(), password })
          : await login({ email: email.trim(), password });
      setSession("authenticated");
      setPassword("");
      setNotice(response.msg || "You are signed in.");
      setFeedLoading(true);
      try {
        const feed = await getFeed();
        setPosts(Array.isArray(feed.posts) ? feed.posts : []);
        setFeedError("");
      } catch (error) {
        setFeedError(error.message);
      } finally {
        setFeedLoading(false);
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function acceptImage(file) {
    setUploadError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Choose an image file to create a post.");
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setImageFile(file);
  }

  async function handlePostSubmit(event) {
    event.preventDefault();
    setUploadError("");
    if (!imageFile || !caption.trim()) {
      setUploadError("Add a photo and a caption before publishing.");
      return;
    }
    const formData = new FormData();
    formData.append("img", imageFile);
    formData.append("caption", caption.trim());
    setUploading(true);
    try {
      const response = await createPost(formData);
      if (response.userPost)
        setPosts((current) => [response.userPost, ...current]);
      setCaption("");
      setImageFile(null);
      setPreviewUrl("");
      if (fileRef.current) fileRef.current.value = "";
      setNotice(response.msg || "Your post is published.");
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  }

  function handleSignOut() {
    document.cookie = "token=; Max-Age=0; Path=/; SameSite=Lax";
    setPosts([]);
    setSession("guest");
    setMode("login");
    setAuthError("");
  }

  function focusComposer() {
    document
      .querySelector("#composer")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    captionRef.current?.focus({ preventScroll: true });
  }

  if (session === "checking") return <LoadingScreen />;
  if (session === "guest")
    return (
      <AuthScreen
        mode={mode}
        setMode={(next) => {
          setAuthError("");
          setMode(next);
        }}
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={authError}
        loading={authLoading}
        onSubmit={handleAuthSubmit}
      />
    );
  if (session === "unavailable")
    return (
      <UnavailableScreen
        error={feedError}
        onRetry={refreshFeed}
        loading={feedLoading}
      />
    );

  return (
    <div className="min-h-screen bg-[#f4f6f2] text-[#18352f]">
      <header className="sticky top-0 z-20 border-b border-[#e5eae5] bg-[#f8faf7]/95 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-330 items-center justify-between px-4 sm:px-7 lg:px-10">
          <a
            href="#top"
            className="flex items-center gap-3"
            aria-label="Jack Papa home"
          >
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-[13px] bg-[#10110e] ring-1 ring-black/10">
              <img
                src={faceLogo}
                alt=""
                className="size-full object-contain p-0.5"
              />
            </span>
            <span className="font-display text-[25px] leading-none tracking-normal text-[#18352f]">
              Jack Papa
            </span>
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-xs font-semibold uppercase tracking-[0.13em] text-[#74827d] sm:inline">
              Your personal feed
            </span>
            <span
              className="grid size-9 place-items-center rounded-full border border-[#d7e0d9] bg-white text-sm font-bold text-[#285a4d]"
              aria-label="Your account"
            >
              Y
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="icon-button ml-1"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main
        id="top"
        className="mx-auto grid max-w-330 gap-8 px-4 pb-16 pt-8 sm:px-7 lg:grid-cols-[minmax(0,1fr)_270px] lg:gap-12 lg:px-10 lg:pt-12"
      >
        <section
          className="min-w-0 animate-rise"
          aria-labelledby="feed-heading"
        >
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">A little space of your own</p>
              <h1
                id="feed-heading"
                className="font-display text-[38px] leading-[1.08] tracking-normal text-[#18352f] sm:text-[46px]"
              >
                Your collection<span className="text-[#b4cf54]">.</span>
              </h1>
            </div>
            <button
              type="button"
              onClick={focusComposer}
              className="button-primary"
            >
              <ImagePlus size={17} aria-hidden="true" />
              <span>New post</span>
            </button>
          </div>

          <form
            id="composer"
            onSubmit={handlePostSubmit}
            className="mb-8 rounded-[20px] border border-[#e0e7e0] bg-white p-4 shadow-[0_8px_30px_rgba(33,65,53,0.045)] sm:p-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e6efdc] text-[#376c55]">
                <Sparkles size={18} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#25473d]">
                  Save a moment
                </h2>
                <p className="mt-0.5 text-xs text-[#788680]">
                  Add a photo and a few words.
                </p>
              </div>
            </div>
            <label className="sr-only" htmlFor="post-caption">
              Caption
            </label>
            <textarea
              ref={captionRef}
              id="post-caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="What caught your eye?"
              rows={2}
              className="field-textarea mb-4"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0eb] pt-4">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <input
                  ref={fileRef}
                  id="post-image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => acceptImage(event.target.files?.[0])}
                  aria-describedby={uploadError ? "upload-feedback" : undefined}
                />
                <label
                  htmlFor="post-image"
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    acceptImage(event.dataTransfer.files?.[0]);
                  }}
                  className={`flex max-w-full cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-[#94b94a] ${dragging ? "border-[#75943c] bg-[#f1f7e8]" : "border-[#e2e9e1] bg-[#fbfcfa] text-[#466458] hover:border-[#aac17b] hover:bg-[#f6f9f1]"}`}
                >
                  <Camera size={16} aria-hidden="true" />
                  <span className="max-w-42.5 truncate">
                    {imageFile ? imageFile.name : "Choose a photo"}
                  </span>
                </label>
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setPreviewUrl("");
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="icon-button size-9"
                    aria-label="Remove selected photo"
                    title="Remove photo"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Selected photo preview"
                    className="size-10 rounded-lg object-cover ring-1 ring-[#dce5dc]"
                  />
                )}
              </div>
              <button
                type="submit"
                disabled={uploading || !imageFile || !caption.trim()}
                className="button-primary min-w-33 justify-center disabled:cursor-not-allowed disabled:opacity-45"
              >
                {uploading ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowRight size={17} aria-hidden="true" />
                )}
                <span>{uploading ? "Publishing" : "Publish post"}</span>
              </button>
            </div>
            {uploadError && (
              <p
                id="upload-feedback"
                role="alert"
                className="mt-3 flex items-start gap-2 text-sm font-medium text-[#a84436]"
              >
                <CircleAlert
                  size={16}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                {uploadError}
              </p>
            )}
          </form>

          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-[#426055]">
                Recent posts
              </h2>
              {!feedLoading && (
                <span className="rounded-full bg-[#e8eee5] px-2 py-0.5 text-xs font-bold text-[#526e5e]">
                  {posts.length}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={refreshFeed}
              disabled={feedLoading}
              className="icon-button size-9"
              aria-label="Refresh posts"
              title="Refresh posts"
            >
              <RefreshCw
                size={16}
                className={feedLoading ? "animate-spin" : ""}
                aria-hidden="true"
              />
            </button>
          </div>

          {feedError && (
            <div
              role="alert"
              className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-[#eed4ce] bg-[#fff7f4] px-4 py-3 text-sm text-[#8d4338]"
            >
              <span>{feedError}</span>
              <button
                type="button"
                onClick={refreshFeed}
                className="shrink-0 font-bold underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}
          {feedLoading ? (
            <div
              className="grid gap-4 sm:grid-cols-2"
              aria-label="Loading posts"
              aria-busy="true"
            >
              {[0, 1].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-[18px] border border-[#e3e9e2] bg-white"
                >
                  <div className="aspect-4/3 animate-pulse bg-[#e8eee6]" />
                  <div className="h-18.5 animate-pulse bg-white p-4">
                    <div className="h-3 w-2/3 rounded bg-[#edf1eb]" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {posts.map((postItem, index) => (
                <article
                  key={postItem._id}
                  className="post-card animate-rise"
                  style={{ animationDelay: `${Math.min(index * 55, 275)}ms` }}
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-[#e5ebe4]">
                    <img
                      src={postItem.img}
                      alt={postItem.caption || "Photo in your collection"}
                      loading={index > 1 ? "lazy" : "eager"}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.025]"
                    />
                    <span className="absolute left-3 top-3 rounded-full border border-white/50 bg-[#18352f]/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-white backdrop-blur-sm">
                      Your post
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-[#365148]">
                      {postItem.caption}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[20px] border border-[#e0e7df] bg-white">
              <div className="grid min-h-70 sm:grid-cols-[0.9fr_1.1fr]">
                <div className="flex flex-col items-start justify-center p-6 sm:p-8">
                  <span className="mb-5 grid size-11 place-items-center rounded-[14px] bg-[#edf3e4] text-[#557641]">
                    <ImagePlus size={21} aria-hidden="true" />
                  </span>
                  <p className="eyebrow mb-2">A blank page</p>
                  <h3 className="font-display text-[28px] leading-tight text-[#18352f]">
                    Start with a moment.
                  </h3>
                  <p className="mt-3 max-w-70 text-sm leading-6 text-[#73817a]">
                    Your first photo will find its place here.
                  </p>
                  <button
                    type="button"
                    onClick={focusComposer}
                    className="button-secondary mt-5"
                  >
                    Add your first post{" "}
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
                <div className="relative min-h-47.5 overflow-hidden sm:min-h-full">
                  <img
                    src={coverImage}
                    alt="A calm mountain lake at sunrise"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#315348]">
                    A place for your eye
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-26 space-y-5">
            <div className="rounded-[18px] border border-[#e0e7df] bg-white p-5">
              <p className="eyebrow mb-4">Your space</p>
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-[#dfead4] font-display text-xl text-[#426548]">
                  Y
                </span>
                <div>
                  <p className="text-sm font-bold text-[#24463b]">
                    Personal collection
                  </p>
                  <p className="mt-0.5 text-xs text-[#77857d]">
                    {posts.length} {posts.length === 1 ? "post" : "posts"}
                  </p>
                </div>
              </div>
              <div className="my-5 h-px bg-[#edf0eb]" />
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6a7d71]">
                <span className="size-2 rounded-full bg-[#8cba54]" />
                Signed in
              </div>
            </div>
            <div className="rounded-[18px] bg-[#21483d] p-5 text-[#f4f7ec]">
              <span className="mb-6 grid size-9 place-items-center rounded-xl bg-white/10 text-[#d8ed8a]">
                <Sparkles size={17} aria-hidden="true" />
              </span>
              <p className="font-display text-[23px] leading-snug">
                Notice the small things.
              </p>
              <p className="mt-2 text-xs leading-5 text-[#d0ddd1]">
                A detail, a color, a passing light. Keep what stays with you.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d5e784]">
                <span className="h-px w-6 bg-[#d5e784]" />
                Jack Papa
              </div>
            </div>
          </div>
        </aside>
      </main>
      {notice && <Toast message={notice} onDismiss={() => setNotice("")} />}
    </div>
  );
}

function AuthScreen({
  mode,
  setMode,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  onSubmit,
}) {
  const registering = mode === "register";
  return (
    <main className="min-h-screen bg-[#f5f7f3] p-3 sm:p-5 lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:gap-5">
      <section
        className="relative flex min-h-60 flex-col justify-between overflow-hidden rounded-[22px] bg-[#284b40] p-5 text-white sm:min-h-77.5 sm:p-8 lg:min-h-[calc(100vh-40px)] lg:p-10"
        aria-label="Jack Papa introduction"
      >
        <img
          src={coverImage}
          alt="Mountain lake surrounded by forest"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#17372e]/35" />
        <a
          href="#auth-form"
          className="relative z-10 flex w-fit items-center gap-3 rounded-full border border-white/30 bg-[#17372e]/35 px-3 py-2 backdrop-blur-sm"
        >
          <img
            src={faceLogo}
            alt="Jack Papa"
            className="size-7 rounded-[5px] bg-[#10110e] object-contain p-0.5"
          />
          <span className="font-display text-[21px] leading-none tracking-normal">
            Jack Papa
          </span>
        </a>
        <div className="relative z-10 max-w-140 pb-1 sm:pb-3">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e1efa9]">
            A personal photo journal
          </p>
          <h1 className="font-display text-[35px] leading-[1.08] tracking-normal sm:text-[48px] lg:text-[58px]">
            Keep the things
            <br className="hidden sm:block" /> that catch your eye.
          </h1>
          <p className="mt-3 max-w-97.5 text-sm leading-6 text-white/85 sm:mt-4 sm:text-base">
            Little observations deserve a place to land.
          </p>
        </div>
      </section>
      <section
        id="auth-form"
        className="flex items-center justify-center px-3 py-8 sm:px-8 sm:py-12 lg:px-10"
      >
        <div className="w-full max-w-100 animate-rise">
          <div className="mb-8 lg:mb-10">
            <p className="eyebrow mb-2">
              {registering ? "A new beginning" : "Welcome back"}
            </p>
            <h2 className="font-display text-[34px] leading-tight text-[#18352f]">
              {registering ? "Make it yours." : "Come on in."}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#73817a]">
              {registering
                ? "Create your personal collection."
                : "Sign in to return to your collection."}
            </p>
          </div>
          <div
            className="mb-6 grid grid-cols-2 rounded-xl bg-[#e9eee8] p-1"
            role="group"
            aria-label="Account access"
          >
            <button
              type="button"
              aria-pressed={!registering}
              onClick={() => setMode("login")}
              className={`auth-tab ${!registering ? "auth-tab-active" : ""}`}
            >
              Sign in
            </button>
            <button
              type="button"
              aria-pressed={registering}
              onClick={() => setMode("register")}
              className={`auth-tab ${registering ? "auth-tab-active" : ""}`}
            >
              Create account
            </button>
          </div>
          <form onSubmit={onSubmit} noValidate>
            {registering && (
              <div className="mb-4">
                <label htmlFor="account-name" className="field-label">
                  Your name
                </label>
                <input
                  id="account-name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="field-input"
                  placeholder="Name"
                  required
                />
              </div>
            )}
            <div className="mb-4">
              <label htmlFor="account-email" className="field-label">
                Email address
              </label>
              <input
                id="account-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field-input"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="mb-5">
              <label htmlFor="account-password" className="field-label">
                Password
              </label>
              <input
                id="account-password"
                type="password"
                autoComplete={registering ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field-input"
                placeholder="Enter your password"
                required
              />
            </div>
            {error && (
              <p
                role="alert"
                className="mb-4 flex items-start gap-2 rounded-xl border border-[#efd5cf] bg-[#fff7f4] px-3 py-2.5 text-sm leading-5 text-[#98483d]"
              >
                <CircleAlert
                  size={16}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="button-primary h-12.5 w-full justify-center disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  {registering ? "Creating account" : "Signing in"}
                </>
              ) : (
                <>
                  {registering ? "Create account" : "Sign in"}
                  <ArrowRight size={17} aria-hidden="true" />
                </>
              )}
            </button>
          </form>
          <p className="mt-6 text-center text-xs leading-5 text-[#89948e]">
            Your account keeps your collection personal.
          </p>
        </div>
      </section>
    </main>
  );
}

function LoadingScreen() {
  return (
    <main
      className="grid min-h-screen place-items-center bg-[#f4f6f2]"
      aria-label="Loading your collection"
    >
      <div className="flex items-center gap-3 text-sm font-semibold text-[#4f6b5d]">
        <LoaderCircle size={20} className="animate-spin" aria-hidden="true" />
        Opening your collection
      </div>
    </main>
  );
}

function UnavailableScreen({ error, onRetry, loading }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6f2] px-4 py-10">
      <section
        className="w-full max-w-110 rounded-[20px] border border-[#e0e7df] bg-white p-7 text-center shadow-[0_10px_40px_rgba(33,65,53,0.06)] sm:p-9"
        aria-labelledby="connection-heading"
      >
        <span className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl bg-[#f9eee8] text-[#a05a43]">
          <CircleAlert size={22} aria-hidden="true" />
        </span>
        <p className="eyebrow mb-2">Connection issue</p>
        <h1
          id="connection-heading"
          className="font-display text-[30px] text-[#18352f]"
        >
          Your space is just out of reach.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#74817b]">
          {error ||
            "The server could not be reached. Check that the backend is running, then try again."}
        </p>
        <button
          type="button"
          onClick={onRetry}
          disabled={loading}
          className="button-primary mx-auto mt-6 justify-center disabled:opacity-60"
        >
          {loading ? (
            <LoaderCircle
              size={17}
              className="animate-spin"
              aria-hidden="true"
            />
          ) : (
            <RefreshCw size={16} aria-hidden="true" />
          )}
          <span>{loading ? "Checking" : "Try again"}</span>
        </button>
      </section>
    </main>
  );
}

function Toast({ message, onDismiss }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="toast-in fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-xl bg-[#21483d] px-4 py-3 text-sm font-semibold text-white shadow-xl sm:bottom-6"
    >
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/15">
        <Check size={14} aria-hidden="true" />
      </span>
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-1 rounded-md p-1 text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Dismiss notification"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
