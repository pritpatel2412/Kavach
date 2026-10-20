'use client';

import React, { useState } from 'react';
import {
  Button,
  Input,
  DealCard,
  SidebarCard,
  TimestampPill,
  DiscountBadge,
  Badge,
  TemperatureControl,
  PriceLockup,
  Avatar,
  CountrySelector,
  Modal,
  Toast,
  Tabs,
  Table,
  EmptyState,
  Skeleton,
  Chip,
  StageChip,
  KavachLogo,
} from '@kavach/ui';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';

export default function StyleguidePage() {
  const [tempValue, setTempValue] = useState(84);
  const [activeTab, setActiveTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(true);

  const sampleTableData = [
    { id: 1, name: 'CBI Extortion Call', type: 'Digital Arrest', heat: '+94°', status: 'Active Threat' },
    { id: 2, name: 'FedEx Customs Parcel', type: 'Narcotics Scam', heat: '+78°', status: 'Blocked' },
    { id: 3, name: 'TRAI SIM Disconnection', type: 'Telecom KYC', heat: '+62°', status: 'Neutralized' },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <SiteHeader currentPath="/styleguide" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <div className="bg-surface border border-hairline rounded-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <KavachLogo size={36} showWordmark={true} />
            <span className="bg-primary text-on-primary text-micro font-bold px-2 py-0.5 rounded-full">
              DESIGN.md LIVING SYSTEM
            </span>
          </div>
          <h1 className="text-display font-bold text-ink tracking-tight">
            Design System Styleguide
          </h1>
          <p className="text-lead text-body mt-2">
            Deals-community high-density specification: cool-gray canvas, white cards, hairline borders, Deal Green actions, functional temperature voting, Mulish 500/700 typography.
          </p>
        </div>

        {/* 1. Buttons */}
        <section className="bg-surface border border-hairline rounded-md p-6 space-y-4">
          <div className="border-b border-hairline pb-2 flex items-center justify-between">
            <h2 className="text-heading font-bold text-ink">Buttons (Shape: 540px Full Pill & 8px Tag)</h2>
            <span className="text-caption text-body">DESIGN.md § Buttons</span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-ui font-bold text-ink mb-2">Variants (Default, Hover, Active):</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">button-primary ("Zum Deal")</Button>
                <Button variant="outline-green">button-outline-green ("+ Beitrag")</Button>
                <Button variant="outline-neutral">button-outline-neutral ("Menü")</Button>
                <Button variant="muted">button-muted</Button>
                <Button variant="tag">button-tag</Button>
                <Button variant="danger">button-danger</Button>
              </div>
            </div>

            <div>
              <p className="text-ui font-bold text-ink mb-2">Sizes & States (Disabled, Loading):</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">Small (28px)</Button>
                <Button variant="primary" size="md">Medium (36px)</Button>
                <Button variant="primary" size="lg">Large (44px)</Button>
                <Button variant="primary" disabled>Disabled State</Button>
                <Button variant="primary" loading>Loading State</Button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Inputs & Forms */}
        <section className="bg-surface border border-hairline rounded-md p-6 space-y-4">
          <div className="border-b border-hairline pb-2 flex items-center justify-between">
            <h2 className="text-heading font-bold text-ink">Inputs & Fields</h2>
            <span className="text-caption text-body">DESIGN.md § Inputs & Forms</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                variant="search-pill"
                label="search-pill (540px full-round)"
                placeholder="Search community deals..."
                icon="magnifer-linear"
              />
            </div>
            <div>
              <Input
                variant="text-input"
                label="text-input (540px full-round)"
                placeholder="Caller Phone Number"
                defaultValue="+91 98765 43210"
              />
            </div>
            <div>
              <Input
                variant="email-input"
                label="email-input (8px rounded-md)"
                placeholder="guardian@family.org"
                helperText="Guardian notification address"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Input
              label="Input with Error State"
              defaultValue="invalid-caller-id"
              error="Must be a valid E.164 phone number"
            />
            <Input
              label="Disabled Input"
              defaultValue="Fixed Telco Carrier"
              disabled
            />
          </div>
        </section>

        {/* 3. Signature Components */}
        <section className="bg-surface border border-hairline rounded-md p-6 space-y-6">
          <div className="border-b border-hairline pb-2 flex items-center justify-between">
            <h2 className="text-heading font-bold text-ink">Signature Components (Temperature & Price Lockup)</h2>
            <span className="text-caption text-body">DESIGN.md § Signature Components</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <h3 className="text-ui font-bold text-ink">temperature-control (Interactive Vote Pill)</h3>
              <p className="text-caption text-body">
                Cold-blue (<span className="text-cold font-bold">#1877f2</span>) down-arrow, Hot-red (<span className="text-hot font-bold">#e02828</span>) reading & up-arrow.
              </p>
              <div className="flex items-center gap-4">
                <TemperatureControl
                  value={tempValue}
                  onUpVote={() => setTempValue(tempValue + 1)}
                  onDownVote={() => setTempValue(tempValue - 1)}
                />
                <span className="text-caption text-body">Click arrows to vote live</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-ui font-bold text-ink">price-lockup (Brand Green + Muted + Mint Badge)</h3>
              <p className="text-caption text-body">
                Brand green price in <span className="font-bold text-primary">heading-lg</span>, struck-through original, mint discount badge.
              </p>
              <div>
                <PriceLockup
                  price="74.50"
                  originalPrice="149"
                  discount="50% OFF"
                  currency="₹"
                  period="/ month"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Badges, Chips, Avatars */}
        <section className="bg-surface border border-hairline rounded-md p-6 space-y-4">
          <div className="border-b border-hairline pb-2 flex items-center justify-between">
            <h2 className="text-heading font-bold text-ink">Badges, Status Chips & Avatars</h2>
            <span className="text-caption text-body">DESIGN.md § Status Spectrum</span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-ui font-bold text-ink mb-2">Badges (4px & 8px):</p>
              <div className="flex flex-wrap items-center gap-2">
                <DiscountBadge>50% OFF</DiscountBadge>
                <Badge variant="neutral-subtle">badge-neutral-subtle</Badge>
                <Badge variant="filled">badge-filled</Badge>
                <Badge variant="premium">premium-badge</Badge>
                <Badge variant="warning">warning-badge</Badge>
                <Badge variant="hot">hot-badge</Badge>
                <Badge variant="cold">cold-badge</Badge>
              </div>
            </div>

            <div>
              <p className="text-ui font-bold text-ink mb-2">Scam Stage Chips (S1–S5):</p>
              <div className="flex flex-wrap items-center gap-2">
                <StageChip stage="S1" />
                <StageChip stage="S2" />
                <StageChip stage="S3" />
                <StageChip stage="S4" />
                <StageChip stage="S5" />
              </div>
            </div>

            <div>
              <p className="text-ui font-bold text-ink mb-2">Avatars & Dropdowns:</p>
              <div className="flex items-center gap-4">
                <Avatar name="Prit Patel" size="sm" />
                <Avatar name="Prit Patel" size="md" />
                <Avatar name="Kavach Guardian" size="lg" />
                <CountrySelector />
              </div>
            </div>
          </div>
        </section>

        {/* 5. Content Cards & Layout Feed Atom */}
        <section className="space-y-4">
          <div className="bg-surface border border-hairline rounded-md p-4 flex items-center justify-between">
            <div>
              <h2 className="text-heading font-bold text-ink">Deal Cards (Feed Atom)</h2>
              <p className="text-caption text-body">
                White surface, hairline border, 8px radius, 16px padding, level-2 shadow on hover.
              </p>
            </div>
            <TimestampPill>Gepostet vor 12m</TimestampPill>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              <DealCard
                thumbnail={
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    {/* @ts-expect-error solar icon */}
                    <iconify-icon icon="solar:shield-warning-bold" width="36" height="36" class="text-hot" />
                    <span className="text-micro font-bold text-hot mt-1">S5 PAYMENT</span>
                  </div>
                }
                temperature={94}
                merchant="CBI Extortion Scheme"
                author="Community Alert #841"
                timestamp="Gepostet vor 8m"
                title="Fake Arrest Warrant & Safe Account Demand: +91 98210 99841"
                price="₹2,50,000"
                originalPrice="Demand"
                discount="CRITICAL"
                commentCount={19}
                primaryActionLabel="Block & Shield"
                onPrimaryAction={() => alert('Blocked via Kavach Guard')}
              >
                <p className="text-body font-medium text-body line-clamp-2 mt-1">
                  Impersonating CBI Superintendent from New Delhi headquarters demanding immediate RTGS transfer to avoid midnight arrest.
                </p>
              </DealCard>

              <DealCard
                thumbnail={
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    {/* @ts-expect-error solar icon */}
                    <iconify-icon icon="solar:box-minimalistic-bold" width="36" height="36" class="text-warm" />
                    <span className="text-micro font-bold text-warm mt-1">S2 ACCUSATION</span>
                  </div>
                }
                temperature={67}
                merchant="FedEx Customs Fraud"
                author="Kavach Sensor"
                timestamp="Gepostet vor 1h"
                title="Illegal Narcotics in Taiwan Parcel: IVR Robocall Phishing"
                price="₹0"
                discount="HIGH RISK"
                commentCount={7}
                primaryActionLabel="Inspect Audio"
                primaryActionHref="/learn/courier-parcel"
              >
                <p className="text-body font-medium text-body line-clamp-2 mt-1">
                  Automated IVR claiming parcel seized at Mumbai airport with 140g MDMA and passport photocopy.
                </p>
              </DealCard>
            </div>

            {/* Sidebar Rail */}
            <div className="space-y-3">
              <SidebarCard title="Guardian Live Status" action={<span className="text-primary font-bold">ONLINE</span>}>
                <div className="space-y-2 text-caption">
                  <div className="flex justify-between py-1 border-b border-hairline">
                    <span className="text-body">Elder Kiosk:</span>
                    <span className="font-bold text-ink">Connected (16kHz)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-hairline">
                    <span className="text-body">Active Interventions:</span>
                    <span className="font-bold text-primary">0 Active</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-body">Confidence Score:</span>
                    <span className="font-bold text-ink">99.4% Verified</span>
                  </div>
                </div>
              </SidebarCard>

              <SidebarCard title="Recommended Actions">
                <p className="text-caption text-body mb-3">
                  Set up elder speed dial for instant guardian call-drop intervention.
                </p>
                <Button variant="outline-green" size="sm" className="w-full">
                  Configure Alerts
                </Button>
              </SidebarCard>
            </div>
          </div>
        </section>

        {/* 6. Tabs, Tables, Modal, Toast */}
        <section className="bg-surface border border-hairline rounded-md p-6 space-y-6">
          <div className="border-b border-hairline pb-2 flex items-center justify-between">
            <h2 className="text-heading font-bold text-ink">Interactive Overlays, Tables & Tabs</h2>
            <span className="text-caption text-body">DESIGN.md § Elevation & Depth</span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-ui font-bold text-ink mb-2">Filter Chip Tabs (540px Full Pill):</p>
              <Tabs
                activeTab={activeTab}
                onChange={setActiveTab}
                tabs={[
                  { id: 'all', label: 'All Threats', badge: 3 },
                  { id: 'digital-arrest', label: 'Digital Arrest', badge: 1 },
                  { id: 'customs', label: 'Customs & Courier' },
                  { id: 'banking', label: 'Bank KYC' },
                ]}
              />
            </div>

            <div>
              <p className="text-ui font-bold text-ink mb-2">Data Table (White Surface, Hairline, Hover Row):</p>
              <Table
                columns={[
                  { header: 'Threat Subject', accessorKey: 'name' },
                  { header: 'Category', accessorKey: 'type' },
                  { header: 'Community Heat', accessorKey: 'heat', className: 'text-hot font-bold' },
                  { header: 'Status', accessorKey: 'status', className: 'text-primary font-bold' },
                ]}
                data={sampleTableData}
                keyExtractor={(item) => item.id}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-hairline">
              <Button variant="primary" onClick={() => setModalOpen(true)}>
                Open Modal Dialog (Level-3 Elevation)
              </Button>
              <Button variant="outline-neutral" onClick={() => setShowToast(!showToast)}>
                Toggle Toast Notification
              </Button>
            </div>

            {showToast && (
              <Toast
                title="Alert Intercepted"
                message="Kavach detector successfully blocked S5 payment request."
                variant="primary"
                onClose={() => setShowToast(false)}
              />
            )}
          </div>
        </section>

        {/* 7. Empty State & Skeletons */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EmptyState
            title="No Active Threats Detected"
            description="Elder speaker audio stream is calm. All active background detector stages report 0% risk."
            actionLabel="Run Audio Self-Check"
            onAction={() => alert('Self check completed: Green')}
          />

          <div className="bg-surface border border-hairline rounded-md p-6 space-y-4">
            <h3 className="text-ui font-bold text-ink">Skeleton Loaders (Canvas Pulse)</h3>
            <div className="space-y-3">
              <Skeleton width="100%" height={24} rounded="md" />
              <Skeleton width="75%" height={16} rounded="md" />
              <div className="flex items-center gap-3">
                <Skeleton width={40} height={40} rounded="full" />
                <Skeleton width="50%" height={16} rounded="md" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal Dialog */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirm Emergency Intervention"
        description="This will send an immediate family TTS intervention and siren to the elder screen."
      >
        <div className="space-y-4 pt-2">
          <p className="text-body font-medium text-body">
            Are you sure you want to trigger the remote override warning on the elder device?
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-hairline">
            <Button variant="outline-neutral" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setModalOpen(false)}>
              Trigger Siren Warning
            </Button>
          </div>
        </div>
      </Modal>

      <SiteFooter />
    </div>
  );
}
