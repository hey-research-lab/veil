"use client";

import React, { useState, useRef } from "react";
import { Copy, Download, FileText, Check, Upload } from "lucide-react";
import { isBowNote, serializeAnyNote, deserializeAnyNote, type AnyShieldedNote } from "../../lib/note";
import { formatNoteAmount, getNoteAssetSymbol } from "../../lib/note-format";
import { TokenIcon } from "../TokenLogos";

export interface VaultPanelProps {
  notes: AnyShieldedNote[];
  onBackup?: () => void;
  onBackupNote: (nullifier: string) => void;
  onWithdrawNote: (nullifier: string) => void;
  onRemoveNote: (nullifier: string) => void;
  // Optional way out of the zero-notes dead end.
  onGoShield?: () => void;
  onImportNotes?: (importedNotes: AnyShieldedNote[]) => number | void;
}

/** Vault tab: local encrypted-note list with copy + withdraw shortcuts. */
export const VaultPanel: React.FC<VaultPanelProps> = ({
  notes,
  onBackup,
  onBackupNote,
  onWithdrawNote,
  onRemoveNote,
  onGoShield,
  onImportNotes,
}) => {
  const [copiedCommitment, setCopiedCommitment] = useState<string | null>(null);
  const [copiedReceiptIndex, setCopiedReceiptIndex] = useState<number | null>(null);
  // Confirm-remove modal target. Removing only drops the LOCAL entry
  // (onchain funds are untouched) — used for spent/duplicate notes.
  const [confirmRemove, setConfirmRemove] = useState<AnyShieldedNote | null>(null);
  const [exported, setExported] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleCopyCommitment(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedCommitment(text);
    setTimeout(() => setCopiedCommitment(null), 2000);
  }

  function handleExportAll() {
    if (notes.length === 0) return;
    try {
      const exportPayload = {
        protocol: "Veil Protocol",
        app: "Veil Shielded Vault",
        version: "v1.2.1",
        exportedAt: new Date().toISOString(),
        notesCount: notes.length,
        rawNotes: notes.map(serializeAnyNote),
        notes: notes.map((n) => {
          const bow = isBowNote(n);
          return {
            type: bow ? n.type : "legacy",
            version: bow ? n.version : "v1",
            chainId: bow ? n.chainId : 4663,
            asset: n.asset,
            denomination: n.denomination.toString(),
            formattedAmount: formatNoteAmount(n.denomination, n.asset),
            commitment: bow ? n.commitmentHash : n.commitment,
            nullifier: n.nullifier,
            secret: n.secret,
            precommitment: bow ? n.precommitment : undefined,
            label: bow ? n.label : undefined,
            scope: bow ? n.scope : undefined,
            txHash: bow ? n.txHash : undefined,
            blockNumber: bow ? n.blockNumber : undefined,
            timestamp: n.timestamp,
          };
        }),
      };

      const jsonStr = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `veil-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExported(true);
      setTimeout(() => setExported(false), 2500);
    } catch (err) {
      console.error("Export all notes failed:", err);
    }
  }

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error("Empty file content");
        const parsed = JSON.parse(text);

        let parsedNotes: AnyShieldedNote[] = [];

        if (Array.isArray(parsed)) {
          parsedNotes = parsed.map((item) => (typeof item === "string" ? deserializeAnyNote(item) : item));
        } else if (parsed.rawNotes && Array.isArray(parsed.rawNotes)) {
          parsedNotes = parsed.rawNotes.map((str: string) => deserializeAnyNote(str));
        } else if (parsed.raw && Array.isArray(parsed.raw)) {
          parsedNotes = parsed.raw.map((str: string) => deserializeAnyNote(str));
        } else if (typeof parsed === "string") {
          parsedNotes = [deserializeAnyNote(parsed)];
        } else if (parsed.version === 1 && parsed.ciphertext) {
          setImportError("This file is a password-encrypted single note backup. Use note restore instead.");
          setTimeout(() => setImportError(null), 4000);
          return;
        }

        if (parsedNotes.length === 0) {
          throw new Error("No valid notes found in JSON file");
        }

        if (onImportNotes) {
          const added = onImportNotes(parsedNotes);
          setImportStatus(`Successfully imported ${added ?? parsedNotes.length} note(s)!`);
          setTimeout(() => setImportStatus(null), 3000);
        }
      } catch (err) {
        setImportError("Failed to parse JSON file. Ensure it is a valid Veil notes backup.");
        setTimeout(() => setImportError(null), 3500);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Hidden file input for importing notes */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".json,application/json"
        style={{ display: "none" }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <span style={{ fontSize: "var(--text-caption)", fontWeight: 600, color: "var(--color-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Active Encrypted Notes ({notes.length})
        </span>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {onImportNotes && (
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              title="Import notes from JSON backup file"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                minHeight: "28px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "rgba(26, 26, 26, 0.04)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
                fontSize: "var(--text-caption)",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all var(--duration-fast)",
              }}
            >
              <Upload className="w-3.5 h-3.5 text-[#FF8C00]" aria-hidden="true" />
              <span>Import JSON</span>
            </button>
          )}

          <button
            onClick={handleExportAll}
            type="button"
            disabled={notes.length === 0}
            title={notes.length === 0 ? "No active notes to export" : "Export all encrypted notes as JSON file"}
            className={notes.length === 0 ? "opacity-50 cursor-not-allowed" : "lp-btn lp-btn--outline"}
            style={{
              padding: "6px 12px",
              minHeight: "28px",
              fontSize: "var(--text-caption)",
              fontWeight: 600,
              cursor: notes.length === 0 ? "not-allowed" : "pointer",
              ...(notes.length === 0 ? {
                backgroundColor: "rgba(26, 26, 26, 0.03)",
                border: "1px solid var(--color-border)",
                color: "var(--color-muted)",
              } : {}),
            }}
          >
            {exported ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#FF8C00]" aria-hidden="true" />
                <span>Exported!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-[#FF8C00]" aria-hidden="true" />
                <span>Export All JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {importStatus && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "rgba(255, 140, 0, 0.08)",
            border: "1px solid rgba(255, 140, 0, 0.3)",
            color: "var(--color-accent-ink)",
            fontSize: "12px",
            fontFamily: "var(--font-mono)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Check size={14} style={{ color: "var(--color-accent)" }} />
          <span>{importStatus}</span>
        </div>
      )}

      {importError && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "rgba(180, 83, 9, 0.08)",
            border: "1px solid rgba(180, 83, 9, 0.3)",
            color: "#b45309",
            fontSize: "12px",
            fontFamily: "var(--font-mono)",
          }}
        >
          {importError}
        </div>
      )}

      {notes.length === 0 ? (
        <div
          style={{
            padding: "var(--space-8)",
            textAlign: "center",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(26, 26, 26, 0.02)",
            border: "1px dashed var(--color-border-strong)",
            color: "var(--color-muted)",
            fontSize: "var(--text-body-sm)",
          }}
        >
          No active shielded notes. Use Shield to create your first encrypted commitment.
          <div style={{ marginTop: "12px", display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
            {onGoShield && (
              <button
                type="button"
                onClick={onGoShield}
                style={{
                  padding: "6px 14px",
                  minHeight: "30px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--color-text)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Go to Shield →
              </button>
            )}
            {onImportNotes && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "6px 14px",
                  minHeight: "30px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "transparent",
                  border: "1px solid var(--color-border-strong)",
                  color: "var(--color-text)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Upload size={13} style={{ color: "var(--color-accent)" }} />
                <span>Import JSON Backup</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {notes.map((note, index) => (
            <div
              key={note.nullifier}
              style={{
                padding: "var(--space-4) var(--space-5)",
                borderRadius: "var(--radius-md)",
                backgroundColor: "#ffffff",
                border: "1px solid var(--color-border-strong)",
                boxShadow: "0 2px 8px rgba(26, 26, 26, 0.04)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: 700, color: "var(--color-text)", fontSize: "var(--text-body)" }}>
                    Note #{index + 1}
                  </span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "rgba(255, 140, 0, 0.1)",
                      border: "1px solid rgba(255, 140, 0, 0.25)",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: "var(--color-accent-ink)",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <TokenIcon symbol={getNoteAssetSymbol(note.asset)} size={12} />
                    <span>{getNoteAssetSymbol(note.asset)}</span>
                  </span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "rgba(26, 26, 26, 0.04)",
                      border: "1px solid var(--color-border)",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      color: "var(--color-muted)",
                      fontWeight: 500,
                    }}
                  >
                    0xbow v1.2.1 · Groth16
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <TokenIcon symbol={getNoteAssetSymbol(note.asset)} size={16} />
                  <span style={{ fontFamily: "monospace", fontSize: "1.1rem", color: "var(--color-accent-ink)", fontWeight: 700 }}>
                    {formatNoteAmount(note.denomination, note.asset)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "rgba(26, 26, 26, 0.025)",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  fontSize: "11px",
                  fontFamily: "monospace",
                }}
              >
                {(() => {
                  const commitmentStr = isBowNote(note) ? note.commitmentHash : note.commitment;
                  return (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--color-muted)" }}>Commitment (sealed deposit):</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "var(--color-text)", fontWeight: 600 }}>
                          {commitmentStr.slice(0, 12)}...{commitmentStr.slice(-8)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCommitment(commitmentStr)}
                          title="Copy full commitment hash"
                          aria-label="Copy full commitment hash"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--color-accent-ink)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                            fontWeight: 600,
                            padding: "4px 8px",
                            minHeight: "24px",
                            borderRadius: "4px",
                          }}
                        >
                          <Copy className="w-3 h-3" aria-hidden="true" />
                          <span>{copiedCommitment === commitmentStr ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--color-muted)" }}>Nullifier (spend key):</span>
                  <span style={{ color: "var(--color-text)", fontWeight: 600 }}>
                    {note.nullifier.slice(0, 12)}...{note.nullifier.slice(-8)}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", paddingTop: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--color-muted)", fontFamily: "monospace" }}>
                  Storage: Encrypted on this device
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => {
                      const commitmentStr = isBowNote(note) ? note.commitmentHash : note.commitment;
                      const text = [
                        "================================================================",
                        "             VEIL PROTOCOL · ENCRYPTED NOTE RECEIPT",
                        "             0xbow Privacy Pool (v1.2.1 · Cancun EVM)",
                        "================================================================",
                        `Note ID:          #${index + 1}`,
                        `Asset:            ${getNoteAssetSymbol(note.asset)}`,
                        `Denomination:     ${formatNoteAmount(note.denomination, note.asset)}`,
                        `Commitment:       ${commitmentStr}`,
                        `Nullifier:        ${note.nullifier}`,
                        `Cryptography:     Groth16 SNARK / Poseidon / LeanIMT Depth 20`,
                        `Network:          Robinhood Chain (Chain ID: 4663)`,
                        `Storage:          Client-Side Encrypted Local Storage`,
                        "================================================================",
                      ].join("\n");
                      navigator.clipboard.writeText(text);
                      setCopiedReceiptIndex(index);
                      setTimeout(() => setCopiedReceiptIndex(null), 2000);
                    }}
                    aria-label={`Copy anonymous receipt for note ${index + 1}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "5px 10px",
                      minHeight: "28px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: copiedReceiptIndex === index ? "rgba(255, 140, 0, 0.1)" : "transparent",
                      border: copiedReceiptIndex === index ? "1px solid rgba(255, 140, 0, 0.4)" : "1px solid var(--color-border)",
                      color: copiedReceiptIndex === index ? "var(--color-accent-ink)" : "var(--color-muted)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all var(--duration-fast)",
                    }}
                  >
                    {copiedReceiptIndex === index ? (
                      <>
                        <Check className="w-3 h-3 text-[#FF8C00]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3 h-3" />
                        <span>Receipt</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onBackupNote(note.nullifier)}
                    aria-label={`Back up note ${index + 1} as encrypted JSON`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 12px",
                      minHeight: "28px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "transparent",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-muted)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all var(--duration-fast)",
                    }}
                  >
                    <span>Backup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onWithdrawNote(note.nullifier)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 12px",
                      minHeight: "28px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "rgba(26, 26, 26, 0.04)",
                      border: "1px solid var(--color-border-strong)",
                      color: "var(--color-text)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all var(--duration-fast)",
                    }}
                  >
                    <span>Withdraw Note ➔</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(note)}
                    title="Remove a spent or duplicate note from this vault (back up first)"
                    aria-label={`Remove note ${index + 1} from vault`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 12px",
                      minHeight: "28px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "transparent",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-muted)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all var(--duration-fast)",
                    }}
                  >
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmRemove !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm note removal"
          onClick={() => setConfirmRemove(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(26, 26, 26, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              backgroundColor: "#ffffff",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border-strong)",
              boxShadow: "0 24px 64px -12px rgba(26, 26, 26, 0.25)",
              padding: "var(--space-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            <div style={{ fontWeight: 700, color: "var(--color-text)", fontSize: "var(--text-body)" }}>
              Remove this note from the vault?
            </div>
            <div style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text)", fontFamily: "monospace" }}>
              {formatNoteAmount(confirmRemove.denomination, confirmRemove.asset)} · {getNoteAssetSymbol(confirmRemove.asset)}
            </div>
            <div style={{ fontSize: "12px", color: "var(--color-muted)", fontFamily: "monospace", lineHeight: 1.5 }}>
              Only removes the LOCAL entry. Onchain funds are untouched. Only remove spent or duplicate notes — back up anything unspent first, or it can never be recovered.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setConfirmRemove(null)}
                style={{
                  padding: "8px 16px",
                  minHeight: "36px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "transparent",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemoveNote(confirmRemove.nullifier);
                  setConfirmRemove(null);
                }}
                style={{
                  padding: "8px 16px",
                  minHeight: "36px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "#b42318",
                  border: "1px solid #b42318",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Remove note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultPanel;
