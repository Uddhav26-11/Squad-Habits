import { useState } from "react";

function InviteLink({ inviteToken, inviteExpiresAt, onRegenerate }) {
  const [copied, setCopied] = useState(false);

  const link = inviteToken ? `${window.location.origin}/join/${inviteToken}` : null;
  const isExpired =
    !inviteToken || (inviteExpiresAt && new Date(inviteExpiresAt).getTime() < Date.now());

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!link) return;
    const text = encodeURIComponent(`Join my squad on Squad Habits! ${link}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Invite Members</h4>

      {isExpired ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">Invite link has expired.</p>
          <button
            onClick={onRegenerate}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg"
          >
            Generate New Link
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            <input
              readOnly
              value={link}
              className="flex-1 text-sm px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            />
            <button
              onClick={handleCopy}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Valid until {new Date(inviteExpiresAt).toLocaleString()}
            </p>
            <button
              onClick={handleWhatsAppShare}
              className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg"
            >
              Share on WhatsApp
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default InviteLink;