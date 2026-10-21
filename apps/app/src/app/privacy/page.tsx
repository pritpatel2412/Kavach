'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Modal,
  KavachLogo,
  Badge,
} from '@kavach/ui';
import { MockBanner } from '../../components/MockBanner';

export default function PrivacyRightsPage() {
  const router = useRouter();
  const [voiceDeleted, setVoiceDeleted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDeleteVoice = () => {
    setVoiceDeleted(true);
    setTimeout(() => {
      alert('Voice embedding vectors and pre-rendered emergency audio files permanently deleted from storage.');
    }, 200);
  };

  const handleExportData = () => {
    const mockExport = {
      household: 'Iyer Residence',
      elder: 'Kamala-ji',
      registeredDate: '2026-10-15',
      incidentsLogged: 3,
      voiceCloningActive: !voiceDeleted,
      rawAudioSaved: false,
      retentionPolicyDays: 7,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(mockExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'kavach_household_export_dpdp.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePurgeAccount = () => {
    setDeleteModalOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col">
      <MockBanner />

      {/* Header */}
      <header className="bg-surface border-b border-hairline px-4 sm:px-6 lg:px-8 py-3.5 sticky top-8 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 focus:outline-none">
              <KavachLogo size={28} showWordmark={true} />
            </a>
            <span className="text-muted">/</span>
            <span className="text-ui font-bold text-ink">Privacy Rights &amp; Data Control</span>
          </div>

          <Button variant="outline-neutral" size="sm" href="/">
            Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <Badge variant="neutral">
              Digital Personal Data Protection Act (DPDP 2023) Controls
            </Badge>
          </div>

          <h1 className="text-display font-bold text-ink tracking-tight">
            Household Data Governance &amp; Erasure
          </h1>

          <p className="text-body font-medium text-body leading-relaxed max-w-2xl">
            Designed toward DPDP 2023 principles. You control your household voice profiles, data portability, and instant data erasure.
          </p>
        </div>

        {/* 1-Click Voice Deletion Card */}
        <Card padding="lg" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
            <div>
              <div className="text-caption text-primary uppercase tracking-wider font-bold">
                Voice Biometric Embedding
              </div>
              <h2 className="text-heading font-bold text-ink mt-0.5">Consented Familial Voice Profile</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-caption text-muted font-medium">Status:</span>
              {!voiceDeleted ? (
                <Badge variant="primary">Active</Badge>
              ) : (
                <Badge variant="alert">Purged</Badge>
              )}
            </div>
          </div>

          <p className="text-body font-medium text-body leading-relaxed">
            If you no longer wish for Kavach to speak in the daughter’s voice during emergency escalations, you can instantaneously erase your voice profile and all pre-rendered audio clips. Kavach will immediately revert to our standard neutral synthesized voice.
          </p>

          <div className="pt-2">
            {!voiceDeleted ? (
              <Button
                variant="destructive"
                size="md"
                onClick={handleDeleteVoice}
                icon="trash-bin-trash-bold"
              >
                1-Click Delete Voice Profile &amp; Cached Audio
              </Button>
            ) : (
              <div className="p-3.5 rounded-md bg-canvas border border-hairline text-caption text-body font-medium">
                ✓ Voice profile purged. Tabletop tablet will use standard neutral synthesized speech.
              </div>
            )}
          </div>
        </Card>

        {/* Data Export Card */}
        <Card padding="lg" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
            <div>
              <div className="text-caption text-primary uppercase tracking-wider font-bold">
                Data Portability (DPDP Section 12)
              </div>
              <h2 className="text-heading font-bold text-ink mt-0.5">Export Household Data</h2>
            </div>
            <span className="text-caption text-muted font-medium">JSON Format</span>
          </div>

          <p className="text-body font-medium text-body leading-relaxed">
            Download a complete portable archive containing all logged incident timestamps, detection scores, paired tablet device identifiers, and elder configuration records.
          </p>

          <Button
            variant="outline-green"
            size="md"
            onClick={handleExportData}
            icon="download-square-bold"
          >
            Download Machine-Readable JSON Export
          </Button>
        </Card>

        {/* Total Account Purge (Danger Zone) */}
        <Card padding="lg" className="space-y-4 border-hot/30">
          <div className="space-y-1">
            <h2 className="text-heading font-bold text-hot">
              Immediate Household Account Erasure
            </h2>
            <p className="text-body font-medium text-body leading-relaxed">
              Permanently terminate this household account, unlink all paired tabletop tablets, cancel any active subscriptions, and immediately purge all incident records from our database. This action is irreversible.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="destructive"
              size="md"
              onClick={() => setDeleteModalOpen(true)}
              icon="shield-cross-bold"
            >
              Request Immediate Account Deletion
            </Button>
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Confirm Permanent Account Erasure"
          description="Are you sure you want to permanently delete Iyer Residence and all associated monitoring records?"
        >
          <div className="space-y-4 text-caption font-medium">
            <div className="p-3.5 rounded-md bg-risk-alert-surface border border-risk-alert-border text-hot font-bold">
              Warning: All paired tablets will disconnect immediately and cease scam protection.
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline-neutral" size="sm" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handlePurgeAccount}
              >
                Yes, Purge Everything Now
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
