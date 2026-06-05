export const metadata = {
  title: "Privacy",
  description: "How goread handles your data.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-semibold text-fg">Privacy</h1>
      <div className="mt-6 space-y-5 font-reading text-base leading-relaxed text-fg/90">
        <p>
          goread is built to need as little of your data as possible. You can use the entire app as
          a guest — browsing, reading, bookmarking, saving quotes, and keeping a streak — with{" "}
          <strong>no account at all</strong>.
        </p>
        <h2 className="font-display text-xl font-semibold text-fg">Guest mode</h2>
        <p>
          Your reading progress, bookmarks, saved books, quotes, streak, and reading-theme
          preferences are stored only in your browser (localStorage), on your device. They are
          never sent anywhere. Clearing your browser data removes them.
        </p>
        <h2 className="font-display text-xl font-semibold text-fg">Signed in</h2>
        <p>
          If you choose to sign in (with Google or Apple, via Clerk), we store an account identifier
          so your library and progress can sync across your devices. We don’t sell your data or use
          it for advertising. You can export everything you’ve saved, or delete your account and all
          associated data, at any time.
        </p>
        <h2 className="font-display text-xl font-semibold text-fg">Book delivery</h2>
        <p>
          Book files are fetched on your behalf from Project Gutenberg through our server and cached
          for performance and offline reading. We don’t track which passages you read.
        </p>
      </div>
    </article>
  );
}
