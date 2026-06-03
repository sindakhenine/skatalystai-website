import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import logo from './assets/logo.png';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Disclaimer from './pages/legal/Disclaimer';
import Billing from './pages/Billing';
import Beta from './pages/Beta';
import RunReport from './pages/RunReport';
import RunsIndex from './pages/RunsIndex';
import RunDetail from './pages/RunDetail';
import InventoryResults from './pages/InventoryResults';
import StructuringPlan from './pages/StructuringPlan';
import ExecutionPreview from './pages/ExecutionPreview';
import BuildApp from './pages/BuildApp';
import OrganizationPreview from './pages/OrganizationPreview';
import KPIDiscovery from './pages/KPIDiscovery';
import AnalyticsPreview from './pages/AnalyticsPreview';
import TestEnvironment from './pages/TestEnvironment';
import BuildSummary from './pages/BuildSummary';
import PreviewPage from './pages/PreviewPage';
import VerifyEmail from './pages/VerifyEmail';
import WorkspaceSettings from './pages/WorkspaceSettings';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingWizard, { OnboardingBanner } from './components/OnboardingWizard';
import SessionTimeoutHandler from './components/SessionTimeoutHandler';
import EmptyState from './components/EmptyState';
import WorkspaceSelector from './components/WorkspaceSelector';
import Connectors from './pages/Connectors';
import Contexts from './pages/Contexts';
import DataIngestionHub from './pages/DataIngestionHub';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Admin from './pages/Admin';
import OutputTargets from './pages/OutputTargets';
import AgentsAdmin from './pages/AgentsAdmin';
import { BugReportButton } from './components/BugReportModal';
import VersionFooter from './components/VersionFooter';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { useLanguage } from './contexts/LanguageContext';
import { languages } from './i18n';

// Enable credentials for cross-origin requests (cookies)
axios.defaults.withCredentials = true;

// API base URL (uses env var in production, localhost for dev)
const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api`;

// Icon components
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Ingest: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  Folder: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Help: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  File: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Info: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Blueprint: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Billing: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Beta: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Database: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  ChatBubble: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Code: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Layers: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Sun: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Moon: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  Connector: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  Context: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Support: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Admin: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Server: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  ),
  OutputTarget: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  Runs: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// Navigation items - using i18n keys for translation
const navItems = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: Icons.Dashboard },
  { id: 'connectors', labelKey: 'nav.connectors', icon: Icons.Connector },
  { id: 'runs', labelKey: 'nav.runs', icon: Icons.Runs },
  { id: 'contexts', labelKey: 'nav.contexts', icon: Icons.Context },
  { id: 'ingest', labelKey: 'nav.dataIngestion', icon: Icons.Ingest },
  { id: 'organized', labelKey: 'nav.organizedData', icon: Icons.Folder },
  { id: 'output-targets', labelKey: 'nav.outputTargets', icon: Icons.OutputTarget },
  { id: 'metrics', labelKey: 'nav.metrics', icon: Icons.Chart },
  { id: 'blueprints', labelKey: 'nav.blueprints', icon: Icons.Blueprint },
  { id: 'billing', labelKey: 'nav.billing', icon: Icons.Billing },
  { id: 'beta', labelKey: 'nav.beta', icon: Icons.Beta },
  { id: 'support', labelKey: 'nav.support', icon: Icons.Support },
  { id: 'admin', labelKey: 'nav.admin', icon: Icons.Admin },
  { id: 'agents', labelKey: 'nav.agents', icon: Icons.Server },
  { id: 'settings', labelKey: 'nav.settings', icon: Icons.Settings },
];

// Step indicator component
function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center py-6 px-4 bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                index < currentStep
                  ? 'bg-success text-white shadow-lg shadow-sm'
                  : index === currentStep
                  ? 'bg-slate text-white shadow-lg shadow-sm'
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
              }`}
            >
              {index < currentStep ? <Icons.Check /> : index + 1}
            </div>
            <span className={`mt-2 text-xs font-medium ${
              index === currentStep ? 'text-slate' : index < currentStep ? 'text-success' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-24 h-1 mx-3 rounded-full transition-all duration-300 ${
              index < currentStep ? 'bg-success' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Status badge component
function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-gray-100 text-gray-600 border-gray-200',
    processing: 'bg-light-soft text-slate border-light-border animate-pulse',
    completed: 'bg-success-bg text-success border-success/20',
    failed: 'bg-error-bg text-error border-error/20',
  };

  const labels = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
      {status === 'processing' && <span className="w-2 h-2 bg-slate rounded-full mr-2 animate-pulse" />}
      {status === 'completed' && <span className="w-2 h-2 bg-success rounded-full mr-2" />}
      {labels[status] || status}
    </span>
  );
}

// Header component
function Header({ onNavChange }) {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { changeLanguage: setLanguage } = useLanguage();
  const { user, logout, authFetch } = useAuth();
  const navigate = useNavigate();

  // Navigation helper - use prop if available, otherwise use router
  const handleNavigate = (page) => {
    if (onNavChange) {
      onNavChange(page);
    } else {
      navigate(`/${page}`);
    }
  };
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [betaStatus, setBetaStatus] = useState(null);
  const [betaCountdown, setBetaCountdown] = useState('');

  // Fetch beta status
  useEffect(() => {
    const fetchBetaStatus = async () => {
      try {
        const response = await authFetch('/beta/status');
        if (response.ok) {
          const data = await response.json();
          setBetaStatus(data);
        }
      } catch (err) {
        // Beta status fetch failed - user might not have beta access
      }
    };
    if (authFetch) {
      fetchBetaStatus();
    }
  }, [authFetch]);

  // Update countdown timer
  useEffect(() => {
    if (!betaStatus?.active || !betaStatus?.expiresAt) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(betaStatus.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setBetaCountdown('Expired');
        setBetaStatus(prev => ({ ...prev, active: false }));
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setBetaCountdown(`${days}d ${hours % 24}h`);
      } else {
        setBetaCountdown(`${hours}h ${minutes}m`);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [betaStatus?.active, betaStatus?.expiresAt]);

  const toggleTheme = () => {
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setLangDropdownOpen(false);
  };

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="flex items-center">
        <img src={logo} alt="SkatalystAI" className="h-9 w-auto" />
        <div className="ml-3">
          <span className="text-lg font-bold text-gray-900 dark:text-white">SkatalystAI</span>
          <span className="ml-2 px-2 py-0.5 bg-slate text-white text-[10px] font-semibold rounded-full">BETA</span>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-8">
        <div className="relative">
          <input
            type="text"
            placeholder={t('header.searchPlaceholder')}
            className="w-full h-10 pl-10 pr-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ion/20 focus:border-ion transition-all"
          />
          <Icons.Search />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-slate dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={t('settings.language.title')}
          >
            <Icons.Globe />
          </button>
          {langDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setLangDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                      i18n.language === lang.code
                        ? 'text-ion font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-slate dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title={effectiveTheme === 'dark' ? t('settings.theme.light') : t('settings.theme.dark')}
        >
          {effectiveTheme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
        </button>

        <button className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-slate dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm">
          <Icons.Help />
          <span>{t('common.help')}</span>
        </button>
        <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-slate dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors relative">
          <Icons.Bell />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </button>

        {/* Beta Tester Badge */}
        {betaStatus?.active && (
          <button
            onClick={() => onNavChange ? onNavChange('beta') : navigate('/app')}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-ion rounded-full hover:opacity-90 transition-opacity ml-2"
            title="Click to view beta status"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="text-white text-xs font-bold uppercase tracking-wide">Beta Tester</span>
            <span className="text-white/80 text-xs font-mono">{betaCountdown}</span>
          </button>
        )}

        {/* Profile dropdown */}
        <div className="relative ml-2">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {user?.picture || user?.avatar_url ? (
              <img
                src={user.picture || user.avatar_url}
                alt={user.name || 'User'}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-slate rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </button>
          {profileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || ''}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleNavigate('settings');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t('settings.profile.title') || 'Profile'}
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleNavigate('settings');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t('nav.settings') || 'Settings'}
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-error hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t('auth.logout') || 'Logout'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// Sidebar component
function Sidebar({ activeNav, onNavChange, storageUsage = { used: 0, limit: 10 } }) {
  const { t } = useTranslation();
  const { isSuperAdmin } = useAuth();
  const usedGB = storageUsage.used.toFixed(2);
  const limitGB = storageUsage.limit.toFixed(0);
  const usagePercent = Math.min((storageUsage.used / storageUsage.limit) * 100, 100);

  // Filter nav items - only show admin tab to super admins
  const filteredNavItems = navItems.filter(item => {
    if (item.id === 'admin') {
      return isSuperAdmin;
    }
    return true;
  });

  return (
    <aside className="w-64 bg-slate fixed left-0 top-16 bottom-0 flex flex-col shadow-xl">
      {/* Workspace Selector */}
      <div className="p-3 border-b border-white/10">
        <WorkspaceSelector />
      </div>

      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <div className="mb-6 px-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('nav.mainMenu')}</p>
        </div>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`w-full flex items-center px-4 py-3 mb-1 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? 'bg-slate text-white shadow-lg shadow-md'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon />
              <span className="ml-3 text-sm font-medium">{t(item.labelKey)}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mx-3 mb-4 bg-white/5 rounded-lg">
        <p className="text-xs text-gray-500">{t('nav.storageUsed')}</p>
        <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${usagePercent > 90 ? 'bg-error' : usagePercent > 70 ? 'bg-warning' : 'bg-ion'}`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">{t('nav.storageAmount', { used: usedGB, total: limitGB })}</p>
      </div>

      <VersionFooter />
    </aside>
  );
}

// Page Header component
function PageHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="bg-slate rounded-xl p-6 mb-6 shadow-lg shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {Icon && (
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
              <Icon />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-white/70 mt-1">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}

// File upload step
function UploadStep({ files, setFiles, context, setContext, onNext }) {
  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/json': ['.json'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
    },
  });

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (name) => {
    const ext = name.split('.').pop()?.toLowerCase();
    const colors = {
      pdf: 'bg-error-bg text-error',
      docx: 'bg-light-soft text-slate',
      xlsx: 'bg-success-bg text-success',
      csv: 'bg-success-bg text-success',
      json: 'bg-warning-bg text-warning',
      txt: 'bg-gray-100 text-gray-600',
      md: 'bg-purple-100 text-purple-600',
    };
    return colors[ext] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-slate bg-light-soft scale-[1.02]'
            : 'border-gray-200 hover:border-ion/50 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all ${
          isDragActive ? 'bg-slate text-white' : 'bg-gray-100 text-gray-400'
        }`}>
          <Icons.Upload />
        </div>
        {isDragActive ? (
          <p className="text-slate font-semibold text-lg">Drop your files here...</p>
        ) : (
          <>
            <p className="text-gray-900 font-semibold text-lg mb-2">
              Drag & drop files here
            </p>
            <p className="text-gray-500 mb-4">or click to browse from your computer</p>
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {['PDF', 'DOCX', 'XLSX', 'CSV', 'TXT', 'JSON'].map((type) => (
                <span key={type} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                  {type}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {['PNG', 'JPG', 'GIF', 'WebP'].map((type) => (
                <span key={type} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded">
                  {type}
                </span>
              ))}
              {['MP4', 'MOV', 'AVI'].map((type) => (
                <span key={type} className="px-2 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded">
                  {type}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Uploaded Files <span className="text-gray-500 font-normal">({files.length})</span>
            </h3>
            <button
              onClick={() => setFiles([])}
              className="text-sm text-error hover:text-error font-medium"
            >
              Clear all
            </button>
          </div>
          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${getFileIcon(file.name)}`}>
                    <span className="text-xs font-bold uppercase">
                      {file.name.split('.').pop()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 text-gray-400 hover:text-error hover:bg-error-bg rounded-lg transition-all"
                >
                  <Icons.X />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context input */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Context <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Describe the purpose of this data to improve classification accuracy (e.g., 'Q4 2024 financial documents for audit review')"
          className="w-full h-28 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ion/20 focus:border-ion transition-all"
        />
        <p className="mt-2 text-xs text-gray-500">
          Providing context helps the AI classify your documents more accurately.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">
          Cancel
        </button>
        <button
          onClick={onNext}
          disabled={files.length === 0}
          className="px-6 py-2.5 bg-slate text-white font-semibold rounded-lg hover:bg-slate-hover disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-md disabled:shadow-none flex items-center gap-2"
        >
          Continue
          <Icons.ChevronRight />
        </button>
      </div>
    </div>
  );
}

// Processing step
function ProcessingStep({ jobId, onComplete }) {
  const { authFetch } = useAuth();
  const [job, setJob] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!jobId) return;

    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    const pollInterval = setInterval(async () => {
      try {
        const response = await authFetch(`/jobs/${jobId}`);
        const data = await response.json();
        setJob(data);

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(pollInterval);
          clearInterval(timerInterval);
          if (data.status === 'completed') {
            onComplete(data);
          }
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timerInterval);
    };
  }, [jobId, onComplete, authFetch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <span className="w-5 h-5 bg-success rounded-full flex items-center justify-center text-white"><Icons.Check /></span>;
      case 'processing':
        return <span className="w-5 h-5 bg-slate rounded-full animate-pulse" />;
      default:
        return <span className="w-5 h-5 bg-gray-200 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-slate rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Processing Job</p>
            <p className="font-mono text-sm text-gray-300">{jobId}</p>
          </div>
          <div className="flex items-center gap-6">
            <StatusBadge status={job?.status || 'processing'} />
            <div className="flex items-center gap-2 text-gray-300">
              <Icons.Clock />
              <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">{job?.currentStep || 'Initializing...'}</span>
            <span className="text-white font-semibold">{job?.progress || 0}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-ion rounded-full transition-all duration-500"
              style={{ width: `${job?.progress || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* File status */}
      {job?.files && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">Files ({job.files.length})</h4>
          </div>
          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {job.files.map((file, index) => {
              const result = job.results?.fileResults?.find(r => r.originalName === file.originalName);
              const status = result?.success ? 'completed' : job.status === 'completed' ? 'failed' : 'processing';

              return (
                <div key={index} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(status)}
                    <span className="text-sm text-gray-900">{file.originalName}</span>
                  </div>
                  {result && (
                    <span className="px-3 py-1 bg-light-soft text-slate text-xs font-medium rounded-full">
                      {result.category}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Confidence Bar component
function ConfidenceBar({ confidence, showLabel = true }) {
  const percentage = Math.round(confidence * 100);
  const isLow = confidence < 0.6;
  const isMedium = confidence >= 0.6 && confidence < 0.8;

  const barColor = isLow
    ? 'bg-error'
    : isMedium
    ? 'bg-warning'
    : 'bg-success';

  const textColor = isLow ? 'text-error' : isMedium ? 'text-warning' : 'text-success';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden min-w-[100px]">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-sm font-semibold ${textColor} min-w-[45px] text-right`}>
          {percentage}%
        </span>
      )}
    </div>
  );
}

// Job Summary component
function JobSummary({ results }) {
  const fileResults = results?.results?.fileResults || [];
  const categories = results?.results?.categories || {};

  const totalFiles = fileResults.length;
  const totalCategories = Object.keys(categories).length;
  const avgConfidence = totalFiles > 0
    ? fileResults.reduce((sum, f) => sum + (f.confidence || 0), 0) / totalFiles
    : 0;
  const lowConfidenceCount = fileResults.filter(f => (f.confidence || 0) < 0.6).length;

  const stats = [
    {
      label: 'Total Files',
      value: totalFiles,
      icon: Icons.File,
      color: 'bg-light-soft text-slate'
    },
    {
      label: 'Categories',
      value: totalCategories,
      icon: Icons.Folder,
      color: 'bg-success-bg text-success'
    },
    {
      label: 'Avg Confidence',
      value: `${Math.round(avgConfidence * 100)}%`,
      icon: Icons.TrendingUp,
      color: avgConfidence >= 0.7 ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
    },
    {
      label: 'Needs Review',
      value: lowConfidenceCount,
      icon: Icons.Warning,
      color: lowConfidenceCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <Icon />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// File Result Card component
function FileResultCard({ file, isLowConfidence }) {
  const [expanded, setExpanded] = useState(false);

  const getFileTypeColor = (name) => {
    const ext = name.split('.').pop()?.toLowerCase();
    const colors = {
      pdf: 'bg-error-bg text-error border-error/20',
      docx: 'bg-light-soft text-slate border-light-border',
      xlsx: 'bg-success-bg text-success border-success/20',
      csv: 'bg-success-bg text-success border-success/20',
      json: 'bg-warning-bg text-warning border-warning/20',
      txt: 'bg-gray-100 text-gray-600 border-gray-200',
      md: 'bg-purple-100 text-purple-600 border-purple-200',
    };
    return colors[ext] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <div className={`rounded-lg border ${isLowConfidence ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200 bg-white'} overflow-hidden transition-all`}>
      <div
        className="p-4 cursor-pointer hover:bg-gray-50/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* File type badge */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getFileTypeColor(file.originalName)} flex-shrink-0`}>
              <span className="text-xs font-bold uppercase">
                {file.originalName.split('.').pop()}
              </span>
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-900 truncate">{file.originalName}</h4>
                {isLowConfidence && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex-shrink-0">
                    <Icons.Warning />
                    Low Confidence
                  </span>
                )}
                {file.llm && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex-shrink-0">
                    LLM
                  </span>
                )}
              </div>

              {/* Category */}
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-slate/10 text-slate text-xs font-medium rounded">
                  {file.category}
                </span>
              </div>
            </div>
          </div>

          {/* Confidence */}
          <div className="w-40 flex-shrink-0">
            <ConfidenceBar confidence={file.confidence || 0} />
          </div>

          {/* Expand toggle */}
          <button className={`p-1 text-gray-400 hover:text-gray-600 transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <Icons.ChevronDown />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100 bg-gray-50/50">
          <div className="mt-3 space-y-3">
            {/* Reason */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Icons.Info />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Classification Reason</span>
              </div>
              <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">
                {file.reason || 'No reason provided'}
              </p>
            </div>

            {/* Additional details */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-xs text-gray-500">Confidence</span>
                <p className="font-semibold text-gray-900">{Math.round((file.confidence || 0) * 100)}%</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Method</span>
                <p className="font-semibold text-gray-900">{file.llm ? 'LLM Classification' : 'Heuristic'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Category</span>
                <p className="font-semibold text-gray-900">{file.category}</p>
              </div>
            </div>

            {/* Alternatives if present */}
            {file.alternatives && file.alternatives.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Alternative Classifications</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {file.alternatives.map((alt, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {alt.category} ({Math.round((alt.confidence || 0) * 100)}%)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Results step - Enhanced Manifest Viewer
function ResultsStep({ results, onViewManifest, onNewJob }) {
  const [filter, setFilter] = useState('all'); // 'all', 'low-confidence', 'high-confidence'

  const fileResults = results?.results?.fileResults || [];
  const lowConfidenceThreshold = 0.6;

  // Filter files based on selection
  const filteredFiles = fileResults.filter(file => {
    if (filter === 'low-confidence') return (file.confidence || 0) < lowConfidenceThreshold;
    if (filter === 'high-confidence') return (file.confidence || 0) >= lowConfidenceThreshold;
    return true;
  });

  // Sort: low confidence first
  const sortedFiles = [...filteredFiles].sort((a, b) => (a.confidence || 0) - (b.confidence || 0));

  const lowConfidenceCount = fileResults.filter(f => (f.confidence || 0) < lowConfidenceThreshold).length;

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className="bg-success rounded-xl p-6 text-white shadow-lg shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Icons.Check />
            </div>
            <div>
              <h3 className="text-xl font-bold">Organization Complete</h3>
              <p className="text-white/80">
                Successfully classified {fileResults.length} files
              </p>
            </div>
          </div>
          {lowConfidenceCount > 0 && (
            <div className="bg-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
              <Icons.Warning />
              <span className="text-sm font-medium">{lowConfidenceCount} file{lowConfidenceCount !== 1 ? 's' : ''} need review</span>
            </div>
          )}
        </div>
      </div>

      {/* Job Summary */}
      <JobSummary results={results} />

      {/* File Results Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">File Classifications</h4>

          {/* Filter buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 mr-2">Filter:</span>
            {[
              { id: 'all', label: 'All Files' },
              { id: 'low-confidence', label: 'Needs Review', count: lowConfidenceCount },
              { id: 'high-confidence', label: 'Confident' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === option.id
                    ? 'bg-slate text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
                {option.count !== undefined && option.count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                    filter === option.id ? 'bg-white/20' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* File list */}
        <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
          {sortedFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No files match the selected filter
            </div>
          ) : (
            sortedFiles.map((file, index) => (
              <FileResultCard
                key={`${file.originalName}-${index}`}
                file={file}
                isLowConfidence={(file.confidence || 0) < lowConfidenceThreshold}
              />
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onViewManifest}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Icons.File />
          View Raw Manifest
        </button>
        <button
          onClick={onNewJob}
          className="px-6 py-2.5 bg-slate text-white font-semibold rounded-lg hover:bg-slate-hover transition-all shadow-lg shadow-md flex items-center gap-2"
        >
          Start New Ingestion
        </button>
      </div>
    </div>
  );
}

// Manifest viewer
function ManifestViewer({ jobId, onBack }) {
  const { authFetch } = useAuth();
  const [manifest, setManifest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchManifest = async () => {
      try {
        const response = await authFetch(`/jobs/${jobId}`);
        const data = await response.json();
        setManifest(data);
      } catch (error) {
        console.error('Error fetching manifest:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchManifest();
  }, [jobId, authFetch]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading manifest...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Manifest Viewer</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `manifest-${jobId}.json`;
              a.click();
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
          >
            <Icons.Download />
            Download JSON
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            Back to Results
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
          <span className="font-mono text-sm text-gray-400">{jobId}</span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              copied
                ? 'bg-success/20 text-ion'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            {copied ? (
              <>
                <Icons.CheckCircle />
                Copied!
              </>
            ) : (
              <>
                <Icons.Copy />
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="p-4 overflow-auto max-h-[500px] text-sm text-ion font-mono">
          {JSON.stringify(manifest, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// Dashboard view
function DashboardView({ onNavigate }) {
  const { t } = useTranslation();
  const { authFetch } = useAuth();
  const [stats, setStats] = useState({ connectors: 0, jobs: 0, files: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [connectorsRes, jobsRes] = await Promise.all([
          authFetch('/connectors').catch(() => ({ ok: false })),
          authFetch('/uploads').catch(() => ({ ok: false }))
        ]);

        let connectorCount = 0;
        if (connectorsRes.ok) {
          const data = await connectorsRes.json();
          connectorCount = (data.connectors || data || []).length;
        }

        let jobs = [];
        if (jobsRes.ok) {
          const data = await jobsRes.json();
          jobs = data.uploads || data || [];
        }
        const completedJobs = jobs.filter(j => j.status === 'completed');
        const totalFiles = completedJobs.reduce((sum, j) => sum + (j.fileCount || j.results?.fileResults?.length || 0), 0);

        setStats({
          connectors: connectorCount,
          jobs: completedJobs.length,
          files: totalFiles
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [authFetch]);

  const hasData = stats.connectors > 0 || stats.jobs > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.dashboard')}
        subtitle={t('dashboard.subtitle', "Welcome back! Here's an overview of your workspace.")}
        icon={() => <Icons.Dashboard />}
      />

      {/* Show empty state if no data */}
      {!loading && !hasData && (
        <EmptyState
          type="dashboard"
          onAction={() => onNavigate('connectors')}
        />
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-slate/30 transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-light-soft rounded-xl flex items-center justify-center text-slate mb-4 group-hover:bg-slate group-hover:text-white transition-colors">
            <Icons.Ingest />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Data Ingestion</h3>
          <p className="text-gray-500 text-sm mb-4">
            Upload and organize your documents using AI-powered classification.
          </p>
          <button
            onClick={() => onNavigate('ingest')}
            className="w-full py-2.5 bg-slate text-white font-semibold rounded-lg hover:bg-slate-hover transition-all"
          >
            Start Ingestion
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-ion transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-success-bg rounded-xl flex items-center justify-center text-success mb-4 group-hover:bg-success group-hover:text-white transition-colors">
            <Icons.Folder />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Organized Data</h3>
          <p className="text-gray-500 text-sm mb-4">
            View and manage your organized document collections.
          </p>
          <button
            onClick={() => onNavigate('organized')}
            className="w-full py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
          >
            View Data
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 mb-4 group-hover:bg-gray-600 group-hover:text-white transition-colors">
            <Icons.Settings />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Settings</h3>
          <p className="text-gray-500 text-sm mb-4">
            Configure your workspace and integration settings.
          </p>
          <button
            onClick={() => onNavigate('settings')}
            className="w-full py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
          >
            Open Settings
          </button>
        </div>
      </div>

      {/* Quick Stats - only show when there's data */}
      {hasData && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: t('dashboard.stats.sources', 'Data Sources'), value: stats.connectors },
            { label: t('dashboard.stats.files', 'Total Files'), value: stats.files },
            { label: t('dashboard.stats.jobs', 'Completed Jobs'), value: stats.jobs },
            { label: t('dashboard.stats.storage', 'Storage Used'), value: '—' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
              <p className="text-sm text-gray-500 dark:text-text-dark-secondary">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-text-dark-primary mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Ingest view
function IngestView({ onNavigateToConnectors, onBack }) {
  const { t } = useTranslation();
  const { authFetch } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [context, setContext] = useState('');
  const [jobId, setJobId] = useState(null);
  const [results, setResults] = useState(null);
  const [viewingManifest, setViewingManifest] = useState(false);
  const [hasConnectors, setHasConnectors] = useState(true); // Assume true initially
  const [checkingConnectors, setCheckingConnectors] = useState(true);

  // Check if user has any connectors
  useEffect(() => {
    const checkConnectors = async () => {
      try {
        const res = await authFetch('/connectors');
        if (res.ok) {
          const data = await res.json();
          const connectors = data.connectors || data || [];
          setHasConnectors(connectors.length > 0);
        }
      } catch (err) {
        console.error('Error checking connectors:', err);
      } finally {
        setCheckingConnectors(false);
      }
    };
    checkConnectors();
  }, [authFetch]);

  const steps = [
    { id: 'upload', label: t('ingest.steps.upload', 'Upload') },
    { id: 'process', label: t('ingest.steps.processing', 'Processing') },
    { id: 'results', label: t('ingest.steps.results', 'Results') },
  ];

  const handleStartProcessing = async () => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      if (context) {
        formData.append('context', context);
      }

      const response = await authFetch('/ingest', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      setJobId(data.jobId);
      setCurrentStep(1);
    } catch (error) {
      console.error('Error starting ingestion:', error);
      alert('Failed to start ingestion. Please try again.');
    }
  };

  const handleProcessingComplete = (jobResults) => {
    setResults(jobResults);
    setCurrentStep(2);
  };

  const handleNewJob = () => {
    setCurrentStep(0);
    setFiles([]);
    setContext('');
    setJobId(null);
    setResults(null);
    setViewingManifest(false);
  };

  if (viewingManifest) {
    return <ManifestViewer jobId={jobId} onBack={() => setViewingManifest(false)} />;
  }

  // Show locked state if no connectors
  if (!checkingConnectors && !hasConnectors) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('nav.ingest', 'Data Ingestion')}
          subtitle={t('ingest.subtitle', 'Upload your documents and let AI organize them automatically.')}
          icon={() => <Icons.Ingest />}
        />
        <EmptyState
          type="ingest"
          onLockedClick={onNavigateToConnectors}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Data Sources</span>
        </button>
      )}
      <PageHeader
        title={t('nav.ingest', 'Data Ingestion')}
        subtitle={t('ingest.subtitle', 'Upload your documents and let AI organize them automatically.')}
        icon={() => <Icons.Ingest />}
      />

      <StepIndicator steps={steps} currentStep={currentStep} />

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 shadow-sm">
        {currentStep === 0 && (
          <UploadStep
            files={files}
            setFiles={setFiles}
            context={context}
            setContext={setContext}
            onNext={handleStartProcessing}
          />
        )}
        {currentStep === 1 && (
          <ProcessingStep jobId={jobId} onComplete={handleProcessingComplete} />
        )}
        {currentStep === 2 && (
          <ResultsStep
            results={results}
            onViewManifest={() => setViewingManifest(true)}
            onNewJob={handleNewJob}
          />
        )}
      </div>
    </div>
  );
}

// Organized Data view
function OrganizedView({ onNavigateToIngest }) {
  const { t } = useTranslation();
  const { authFetch } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await authFetch('/jobs');
        const data = await response.json();
        const completedJobs = (data.jobs || []).filter(j => j.status === 'completed');
        setJobs(completedJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [authFetch]);

  const hasData = jobs.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.organized', 'Organized Data')}
        subtitle={t('organized.subtitle', 'View and manage your organized document collections.')}
        icon={() => <Icons.Folder />}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t('common.loading', 'Loading...')}</div>
        </div>
      ) : !hasData ? (
        <EmptyState
          type="organized"
          onAction={onNavigateToIngest}
        />
      ) : (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-text-dark-primary mb-4">
            {t('organized.recentJobs', 'Recent Completed Jobs')}
          </h3>
          <div className="space-y-3">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.jobId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-soft rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-text-dark-primary">{job.jobId}</p>
                  <p className="text-sm text-gray-500 dark:text-text-dark-secondary">
                    {job.results?.fileResults?.length || 0} {t('organized.filesProcessed', 'files processed')}
                  </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-text-dark-secondary">
                  {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Settings view
function SettingsView() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Configure your workspace and integration settings."
        icon={() => <Icons.Settings />}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">LLM Configuration</h3>
          <p className="text-sm text-gray-500">Configure the AI model for document classification</p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Provider</label>
            <select className="w-full max-w-xs h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ion/20 focus:border-ion">
              <option value="heuristic">Heuristic (Default)</option>
              <option value="claude">Claude (Anthropic)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">API Key</label>
            <input
              type="password"
              placeholder="Enter your API key"
              className="w-full max-w-md h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ion/20 focus:border-ion"
            />
            <p className="mt-1 text-xs text-gray-500">Required for Claude provider</p>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <button className="px-5 py-2.5 bg-slate text-white font-semibold rounded-lg hover:bg-slate-hover transition-all">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metrics View
function MetricsView() {
  const { authFetch } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await authFetch('/jobs');
        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load metrics data');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [authFetch]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await authFetch('/jobs');
      const data = await response.json();
      setJobs(data.jobs || []);
      setError(null);
    } catch (err) {
      setError('Failed to refresh metrics');
    } finally {
      setLoading(false);
    }
  };

  // Compute metrics from jobs
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const allFiles = completedJobs.flatMap(j => j.results?.fileResults || []);

  const totalJobs = completedJobs.length;
  const totalFiles = allFiles.length;
  const avgConfidence = totalFiles > 0
    ? allFiles.reduce((sum, f) => sum + (f.confidence || 0), 0) / totalFiles
    : 0;
  const lowConfidenceCount = allFiles.filter(f => (f.confidence || 0) < 0.6).length;
  const llmUsedCount = allFiles.filter(f => f.llm).length;

  // Context effectiveness: compare jobs with vs without context
  const jobsWithContext = completedJobs.filter(j => j.context && j.context.trim() !== '');
  const jobsWithoutContext = completedJobs.filter(j => !j.context || j.context.trim() === '');

  const avgConfWithContext = jobsWithContext.length > 0
    ? jobsWithContext.flatMap(j => j.results?.fileResults || []).reduce((sum, f) => sum + (f.confidence || 0), 0) /
      jobsWithContext.flatMap(j => j.results?.fileResults || []).length || 0
    : 0;
  const avgConfWithoutContext = jobsWithoutContext.length > 0
    ? jobsWithoutContext.flatMap(j => j.results?.fileResults || []).reduce((sum, f) => sum + (f.confidence || 0), 0) /
      jobsWithoutContext.flatMap(j => j.results?.fileResults || []).length || 0
    : 0;

  // Category breakdown
  const categoryStats = {};
  allFiles.forEach(file => {
    const cat = file.category || 'other';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { count: 0, totalConfidence: 0, lowConfidence: 0 };
    }
    categoryStats[cat].count++;
    categoryStats[cat].totalConfidence += file.confidence || 0;
    if ((file.confidence || 0) < 0.6) categoryStats[cat].lowConfidence++;
  });

  const categoryBreakdown = Object.entries(categoryStats)
    .map(([category, stats]) => ({
      category,
      count: stats.count,
      avgConfidence: stats.count > 0 ? stats.totalConfidence / stats.count : 0,
      lowConfidenceCount: stats.lowConfidence,
    }))
    .sort((a, b) => b.count - a.count);

  // Quality trend (last 5 jobs)
  const recentJobs = completedJobs
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5)
    .reverse();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Metrics Dashboard"
          subtitle="Analyzing classification performance and quality trends"
          icon={() => <Icons.Chart />}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading metrics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Metrics Dashboard"
          subtitle="Analyzing classification performance and quality trends"
          icon={() => <Icons.Chart />}
        />
        <div className="bg-error-bg border border-error/20 rounded-xl p-6 text-center">
          <p className="text-error">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-error text-white rounded-lg hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no completed jobs
  if (completedJobs.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Metrics Dashboard"
          subtitle="Analyzing classification performance and quality trends"
          icon={() => <Icons.Chart />}
        />
        <EmptyState type="metrics" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Metrics Dashboard"
        subtitle="Analyzing classification performance and quality trends"
        icon={() => <Icons.Chart />}
        action={
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            <Icons.Refresh />
            Refresh
          </button>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total Jobs', value: totalJobs, icon: Icons.Folder, color: 'bg-light-soft text-slate' },
          { label: 'Total Files', value: totalFiles, icon: Icons.File, color: 'bg-success-bg text-success' },
          { label: 'Avg Confidence', value: `${Math.round(avgConfidence * 100)}%`, icon: Icons.TrendingUp, color: avgConfidence >= 0.7 ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning' },
          { label: 'Needs Review', value: lowConfidenceCount, icon: Icons.Warning, color: lowConfidenceCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400' },
          { label: 'LLM Used', value: llmUsedCount, icon: Icons.Info, color: 'bg-purple-50 text-purple-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Quality Trend */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">Quality Trend (Last 5 Jobs)</h4>
          </div>
          <div className="p-4">
            {recentJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No completed jobs yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job, index) => {
                  const jobFiles = job.results?.fileResults || [];
                  const jobAvgConf = jobFiles.length > 0
                    ? jobFiles.reduce((sum, f) => sum + (f.confidence || 0), 0) / jobFiles.length
                    : 0;
                  return (
                    <div key={job.jobId || index} className="flex items-center gap-4">
                      <div className="w-20 text-xs text-gray-500 truncate">
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : `Job ${index + 1}`}
                      </div>
                      <div className="flex-1">
                        <ConfidenceBar confidence={jobAvgConf} />
                      </div>
                      <div className="text-xs text-gray-500 w-16 text-right">
                        {jobFiles.length} files
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Context Effectiveness */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">Context Effectiveness</h4>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">With Context ({jobsWithContext.length} jobs)</span>
                  <span className="text-sm font-semibold text-gray-900">{Math.round(avgConfWithContext * 100)}%</span>
                </div>
                <ConfidenceBar confidence={avgConfWithContext} showLabel={false} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Without Context ({jobsWithoutContext.length} jobs)</span>
                  <span className="text-sm font-semibold text-gray-900">{Math.round(avgConfWithoutContext * 100)}%</span>
                </div>
                <ConfidenceBar confidence={avgConfWithoutContext} showLabel={false} />
              </div>
              {(jobsWithContext.length > 0 && jobsWithoutContext.length > 0) && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Icons.TrendingUp />
                    <span className="text-sm text-gray-600">
                      Context improves confidence by{' '}
                      <span className={`font-semibold ${avgConfWithContext > avgConfWithoutContext ? 'text-success' : 'text-error'}`}>
                        {avgConfWithContext > avgConfWithoutContext ? '+' : ''}{Math.round((avgConfWithContext - avgConfWithoutContext) * 100)}%
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Category Breakdown</h4>
        </div>
        {categoryBreakdown.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No classification data available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Files</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Confidence</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Needs Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categoryBreakdown.map((cat) => (
                  <tr key={cat.category} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-slate/10 text-slate text-xs font-medium rounded">
                        {cat.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900 font-medium">
                      {cat.count}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-32">
                        <ConfidenceBar confidence={cat.avgConfidence} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {cat.lowConfidenceCount > 0 ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          {cat.lowConfidenceCount}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Blueprint Proposal Generator Logic
function generateProposals(job) {
  if (!job || !job.results?.fileResults) return [];

  const fileResults = job.results.fileResults;
  const categories = job.results.categories || {};

  // Infer entities from categories
  const entities = Object.entries(categories).map(([category, files]) => {
    const sampleFile = fileResults.find(f => f.category === category);
    return {
      name: category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' '),
      source: files.slice(0, 3).join(', '),
      fileCount: files.length,
      attributes: inferAttributes(category, sampleFile),
    };
  });

  const entityCount = entities.length || 1;

  // CRUD Application Proposal
  const crudProposal = {
    id: 'crud',
    type: 'crud',
    name: 'CRUD Application',
    icon: 'Database',
    description: 'A full create, read, update, delete application for managing your data entities.',
    entities: entities.map(e => ({
      ...e,
      operations: ['create', 'read', 'update', 'delete', 'list', 'search'],
    })),
    uiComponents: [
      { name: 'DataTable', type: 'data-table', purpose: 'List and manage records', count: entityCount },
      { name: 'EntityForm', type: 'form', purpose: 'Create and edit records', count: entityCount },
      { name: 'DetailView', type: 'detail-view', purpose: 'View record details', count: entityCount },
      { name: 'SearchFilter', type: 'filter', purpose: 'Search and filter data', count: 1 },
      { name: 'Navigation', type: 'navigation', purpose: 'App navigation', count: 1 },
    ],
    backendComponents: [
      { name: 'Controllers', type: 'api-controller', count: entityCount, endpoints: entityCount * 4 },
      { name: 'Services', type: 'service', count: entityCount, methods: entityCount * 6 },
      { name: 'Repositories', type: 'data-access', count: entityCount, queries: entityCount * 5 },
      { name: 'Models', type: 'data-model', count: entityCount },
    ],
    estimation: {
      effort: entityCount <= 2 ? '1-2 weeks' : entityCount <= 5 ? '2-3 weeks' : '3-5 weeks',
      complexity: entityCount <= 2 ? 'Low' : entityCount <= 5 ? 'Medium' : 'High',
      frontendLoc: 500 + (entityCount * 300),
      backendLoc: 200 + (entityCount * 150),
    },
  };

  // Dashboard Proposal
  const dashboardProposal = {
    id: 'dashboard',
    type: 'dashboard',
    name: 'Analytics Dashboard',
    icon: 'Chart',
    description: 'An interactive visualization dashboard for exploring trends and insights from your data.',
    entities: entities.map(e => ({
      ...e,
      operations: ['aggregate', 'filter', 'visualize'],
    })),
    uiComponents: [
      { name: 'BarChart', type: 'chart', purpose: 'Category distribution', count: entityCount },
      { name: 'LineChart', type: 'chart', purpose: 'Trend over time', count: Math.ceil(entityCount / 2) },
      { name: 'PieChart', type: 'chart', purpose: 'Proportion breakdown', count: Math.ceil(entityCount / 2) },
      { name: 'StatCard', type: 'metric', purpose: 'Key metrics display', count: entityCount * 2 },
      { name: 'FilterPanel', type: 'filter', purpose: 'Data filtering', count: 1 },
      { name: 'DateRangePicker', type: 'input', purpose: 'Time range selection', count: 1 },
    ],
    backendComponents: [
      { name: 'AggregationService', type: 'service', count: 1, methods: entityCount * 3 },
      { name: 'QueryBuilder', type: 'utility', count: 1 },
      { name: 'DataConnector', type: 'data-access', count: entityCount },
    ],
    estimation: {
      effort: entityCount <= 2 ? '1 week' : entityCount <= 5 ? '1-2 weeks' : '2-3 weeks',
      complexity: entityCount <= 2 ? 'Low' : entityCount <= 5 ? 'Medium' : 'Medium',
      frontendLoc: 400 + (entityCount * 200),
      backendLoc: 150 + (entityCount * 80),
    },
  };

  // Chatbot Proposal
  const chatbotProposal = {
    id: 'chatbot',
    type: 'chatbot',
    name: 'Query Chatbot',
    icon: 'ChatBubble',
    description: 'An AI-powered conversational interface for querying and exploring your data with natural language.',
    entities: entities.map(e => ({
      ...e,
      operations: ['query', 'search', 'explain', 'summarize'],
    })),
    uiComponents: [
      { name: 'ChatInterface', type: 'chat', purpose: 'Conversation UI', count: 1 },
      { name: 'MessageBubble', type: 'display', purpose: 'Message rendering', count: 1 },
      { name: 'QuerySuggestions', type: 'suggestions', purpose: 'Query hints', count: 1 },
      { name: 'ResultCard', type: 'display', purpose: 'Display query results', count: entityCount },
      { name: 'ContextPanel', type: 'sidebar', purpose: 'Show related info', count: 1 },
    ],
    backendComponents: [
      { name: 'IntentClassifier', type: 'ai-service', count: 1, intents: entityCount * 4 },
      { name: 'QueryProcessor', type: 'service', count: 1 },
      { name: 'ResponseGenerator', type: 'ai-service', count: 1, templates: entityCount * 6 },
      { name: 'KnowledgeBase', type: 'data-access', count: 1, topics: entityCount },
    ],
    estimation: {
      effort: entityCount <= 2 ? '2-3 weeks' : entityCount <= 5 ? '3-4 weeks' : '4-6 weeks',
      complexity: entityCount <= 2 ? 'Medium' : 'High',
      frontendLoc: 600 + (entityCount * 150),
      backendLoc: 400 + (entityCount * 200),
    },
  };

  return [crudProposal, dashboardProposal, chatbotProposal];
}

function inferAttributes(category, sampleFile) {
  // Simple heuristic-based attribute inference
  const baseAttributes = ['id', 'name', 'createdAt', 'updatedAt'];

  const categoryAttributes = {
    data: ['value', 'metric', 'timestamp', 'source'],
    config: ['key', 'value', 'type', 'description'],
    notes: ['title', 'content', 'author', 'tags'],
    product_catalog: ['sku', 'price', 'description', 'category'],
    legal_documents: ['title', 'parties', 'effectiveDate', 'status'],
    reports: ['title', 'period', 'metrics', 'summary'],
    other: ['title', 'description', 'type'],
  };

  return [...baseAttributes, ...(categoryAttributes[category] || categoryAttributes.other)];
}

// Blueprint Proposal Card Component
function BlueprintProposalCard({ proposal, onViewDetails, onGenerate, isSelected, onToggleSelect }) {
  const iconMap = {
    Database: Icons.Database,
    Chart: Icons.Chart,
    ChatBubble: Icons.ChatBubble,
  };
  const Icon = iconMap[proposal.icon] || Icons.File;

  const totalLoc = proposal.estimation.frontendLoc + proposal.estimation.backendLoc;
  const totalComponents = proposal.uiComponents.reduce((sum, c) => sum + c.count, 0);
  const totalEndpoints = proposal.backendComponents.reduce((sum, c) => sum + (c.endpoints || c.methods || c.count || 0), 0);

  return (
    <div className={`bg-white rounded-xl border-2 transition-all ${
      isSelected ? 'border-slate shadow-lg' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate/10 rounded-xl flex items-center justify-center text-slate">
              <Icon />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{proposal.name}</h3>
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Preview Only</span>
            </div>
          </div>
          <button
            onClick={() => onToggleSelect(proposal.id)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected ? 'bg-slate border-slate' : 'border-gray-300'
            }`}
          >
            {isSelected && <Icons.Check />}
          </button>
        </div>
        <p className="mt-3 text-sm text-gray-600">{proposal.description}</p>
      </div>

      {/* Stats */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">{proposal.entities.length}</p>
            <p className="text-xs text-gray-500">Entities</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">{totalComponents}</p>
            <p className="text-xs text-gray-500">Components</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">{totalEndpoints}</p>
            <p className="text-xs text-gray-500">Endpoints</p>
          </div>
        </div>

        {/* Estimation */}
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-500">Effort:</span>
            <span className="ml-2 font-semibold text-gray-900">{proposal.estimation.effort}</span>
          </div>
          <div>
            <span className="text-gray-500">~</span>
            <span className="ml-1 font-semibold text-gray-900">{totalLoc.toLocaleString()} LOC</span>
          </div>
        </div>

        {/* Complexity Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Complexity:</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            proposal.estimation.complexity === 'Low' ? 'bg-success-bg text-success' :
            proposal.estimation.complexity === 'Medium' ? 'bg-warning-bg text-warning' :
            'bg-error-bg text-error'
          }`}>
            {proposal.estimation.complexity}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 space-y-2">
        <button
          onClick={() => onViewDetails(proposal)}
          className="w-full py-2.5 border border-slate text-slate font-medium rounded-lg hover:bg-light-soft transition-colors flex items-center justify-center gap-2"
        >
          <Icons.Eye />
          View Details
        </button>
        <button
          onClick={() => onGenerate(proposal)}
          className="w-full py-2.5 bg-slate text-white font-medium rounded-lg hover:bg-slate-hover transition-colors flex items-center justify-center gap-2"
        >
          <Icons.Download />
          Generate Artifact
        </button>
      </div>
    </div>
  );
}

// Blueprint Detail Modal
function BlueprintDetailModal({ proposal, onClose }) {
  if (!proposal) return null;

  const totalLoc = proposal.estimation.frontendLoc + proposal.estimation.backendLoc;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{proposal.name}</h2>
            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Preview Only — Not Executable</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg">
            <Icons.X />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          <div>
            <p className="text-gray-600">{proposal.description}</p>
          </div>

          {/* Estimation Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-light-soft rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-slate">{proposal.estimation.effort}</p>
              <p className="text-xs text-slate">Est. Effort</p>
            </div>
            <div className="bg-success-bg rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-success">{totalLoc.toLocaleString()}</p>
              <p className="text-xs text-success">Lines of Code</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-700">{proposal.entities.length}</p>
              <p className="text-xs text-purple-600">Entities</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{proposal.estimation.complexity}</p>
              <p className="text-xs text-amber-600">Complexity</p>
            </div>
          </div>

          {/* Data Entities */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icons.Database />
              Data Entities
            </h3>
            <div className="space-y-2">
              {proposal.entities.map((entity, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{entity.name}</span>
                    <span className="text-xs text-gray-500">{entity.fileCount} files</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {entity.attributes.slice(0, 6).map((attr, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-gray-200 text-xs text-gray-600 rounded">
                        {attr}
                      </span>
                    ))}
                    {entity.attributes.length > 6 && (
                      <span className="px-2 py-0.5 text-xs text-gray-400">+{entity.attributes.length - 6} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UI Components */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icons.Grid />
              UI Components
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {proposal.uiComponents.map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{comp.name}</span>
                    <span className="ml-2 text-xs text-gray-500">×{comp.count}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-light-soft text-slate rounded">{comp.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Backend Components */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icons.Code />
              Backend Components
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {proposal.backendComponents.map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{comp.name}</span>
                    <span className="ml-2 text-xs text-gray-500">×{comp.count}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{comp.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LOC Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Estimated Lines of Code</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Frontend</span>
                <span className="font-medium">{proposal.estimation.frontendLoc.toLocaleString()} LOC</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-light-soft0 rounded-full"
                  style={{ width: `${(proposal.estimation.frontendLoc / totalLoc) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backend</span>
                <span className="font-medium">{proposal.estimation.backendLoc.toLocaleString()} LOC</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${(proposal.estimation.backendLoc / totalLoc) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-amber-50">
          <div className="flex items-center gap-2 text-amber-700">
            <Icons.Warning />
            <span className="text-sm">This is a preview only. No code has been generated and nothing has been deployed.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Artifact Generation Templates
function generateArtifactFiles(proposal, jobId) {
  const timestamp = new Date().toISOString();
  const entityNames = proposal.entities.map(e => e.name);

  // Generate ownership manifest
  const ownershipManifest = {
    manifestVersion: '1.0',
    generatedAt: timestamp,
    generatedBy: {
      product: 'SkatalystAI',
      version: '1.0.0',
    },
    artifact: {
      type: proposal.type,
      name: proposal.name,
      entities: entityNames,
      estimatedLoc: proposal.estimation.frontendLoc + proposal.estimation.backendLoc,
    },
    ownership: {
      statement: 'This artifact is fully owned by the recipient with no restrictions.',
      skatalystDependency: false,
      subscriptionRequired: false,
      transferable: true,
      modifiable: true,
    },
    source: {
      jobId: jobId,
      proposalId: proposal.id,
      generatedFrom: 'SkatalystAI Blueprint',
    },
    license: 'MIT',
    contents: {
      frontend: {
        files: 12,
        loc: proposal.estimation.frontendLoc,
        framework: 'React',
      },
      backend: {
        files: 8,
        loc: proposal.estimation.backendLoc,
        framework: 'Express.js',
      },
      database: {
        type: 'PostgreSQL',
        tables: entityNames.length,
      },
    },
    disclaimer: 'Generated code is provided as-is. No warranty implied. User is responsible for security, testing, and maintenance.',
  };

  // Generate README
  const readme = `# ${proposal.name}

Generated by SkatalystAI on ${new Date(timestamp).toLocaleDateString()}

## Overview

${proposal.description}

## Entities

${entityNames.map(e => `- ${e}`).join('\n')}

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Quick Start with Docker

\`\`\`bash
docker-compose up
\`\`\`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Manual Setup

1. Install dependencies:
\`\`\`bash
cd src/frontend && npm install
cd ../backend && npm install
\`\`\`

2. Set up the database:
\`\`\`bash
psql -f src/database/schema.sql
\`\`\`

3. Start the backend:
\`\`\`bash
cd src/backend && npm start
\`\`\`

4. Start the frontend:
\`\`\`bash
cd src/frontend && npm start
\`\`\`

## Ownership

This artifact is fully owned by the recipient. See OWNERSHIP_MANIFEST.json for details.

## License

MIT License - see LICENSE file.
`;

  // Generate SETUP.md
  const setupMd = `# Setup Guide

## Environment Variables

### Backend (.env)

\`\`\`
DATABASE_URL=postgresql://user:password@localhost:5432/app
PORT=3001
NODE_ENV=development
\`\`\`

### Frontend (.env)

\`\`\`
REACT_APP_API_URL=http://localhost:3001
\`\`\`

## Database Setup

1. Create the database:
\`\`\`sql
CREATE DATABASE app;
\`\`\`

2. Run the schema:
\`\`\`bash
psql -d app -f src/database/schema.sql
\`\`\`

## Deployment Options

### Docker (Recommended)

\`\`\`bash
docker-compose up -d
\`\`\`

### Manual Deployment

Deploy frontend and backend to your preferred hosting:
- Frontend: Vercel, Netlify, or any static host
- Backend: Heroku, Railway, or any Node.js host
- Database: Any PostgreSQL provider

## Support

This is a generated artifact. For modifications, consult the source code directly.
`;

  // Generate API.md
  const apiMd = `# API Documentation

## Base URL

\`http://localhost:3001/api\`

## Endpoints

${entityNames.map(entity => {
  const lower = entity.toLowerCase();
  return `### ${entity}

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /${lower}s | List all ${lower}s |
| GET | /${lower}s/:id | Get ${lower} by ID |
| POST | /${lower}s | Create ${lower} |
| PUT | /${lower}s/:id | Update ${lower} |
| DELETE | /${lower}s/:id | Delete ${lower} |
`;
}).join('\n')}

## Response Format

\`\`\`json
{
  "success": true,
  "data": { ... }
}
\`\`\`

## Error Format

\`\`\`json
{
  "success": false,
  "error": "Error message"
}
\`\`\`
`;

  // Generate frontend package.json
  const frontendPackageJson = {
    name: proposal.name.toLowerCase().replace(/\s+/g, '-') + '-frontend',
    version: '1.0.0',
    private: true,
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'react-router-dom': '^6.8.0',
      axios: '^1.3.0',
    },
    scripts: {
      start: 'react-scripts start',
      build: 'react-scripts build',
      test: 'react-scripts test',
    },
  };

  // Generate backend package.json
  const backendPackageJson = {
    name: proposal.name.toLowerCase().replace(/\s+/g, '-') + '-backend',
    version: '1.0.0',
    main: 'server.js',
    dependencies: {
      express: '^4.18.2',
      cors: '^2.8.5',
      pg: '^8.9.0',
      dotenv: '^16.0.3',
    },
    scripts: {
      start: 'node server.js',
      dev: 'nodemon server.js',
    },
  };

  // Generate frontend App.jsx
  const frontendApp = `import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
${entityNames.map(e => `import ${e}List from './pages/${e}List';`).join('\n')}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold">${proposal.name}</h1>
              ${entityNames.map(e => `<Link to="/${e.toLowerCase()}s" className="text-slate hover:underline">${e}s</Link>`).join('\n              ')}
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<${entityNames[0] || 'Home'}List />} />
            ${entityNames.map(e => `<Route path="/${e.toLowerCase()}s" element={<${e}List />} />`).join('\n            ')}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
`;

  // Generate sample entity list page
  const generateEntityPage = (entity) => `import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function ${entity}List() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(\`\${API_URL}/api/${entity.toLowerCase()}s\`);
        setItems(response.data.data || []);
      } catch (error) {
        console.error('Error fetching ${entity.toLowerCase()}s:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">${entity}s</h2>
        <button className="bg-slate text-white px-4 py-2 rounded-button hover:bg-slate-hover shadow-button">
          Add ${entity}
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">No ${entity.toLowerCase()}s found</td></tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">{item.id}</td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-slate hover:underline mr-2">Edit</button>
                    <button className="text-error hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ${entity}List;
`;

  // Generate backend server.js
  const backendServer = `const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

${entityNames.map(entity => {
  const lower = entity.toLowerCase();
  return `// ${entity} routes
const ${lower}Routes = require('./routes/${lower}Routes');
app.use('/api/${lower}s', ${lower}Routes);`;
}).join('\n\n')}

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;

  // Generate entity routes
  const generateEntityRoutes = (entity) => {
    const lower = entity.toLowerCase();
    return `const express = require('express');
const router = express.Router();
const ${lower}Service = require('../services/${lower}Service');

// List all
router.get('/', async (req, res) => {
  try {
    const items = await ${lower}Service.findAll();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await ${lower}Service.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const item = await ${lower}Service.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const item = await ${lower}Service.update(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await ${lower}Service.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
`;
  };

  // Generate entity service
  const generateEntityService = (entity) => {
    const lower = entity.toLowerCase();
    return `const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const ${lower}Service = {
  async findAll() {
    const result = await pool.query('SELECT * FROM ${lower}s ORDER BY created_at DESC');
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM ${lower}s WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create(data) {
    const result = await pool.query(
      'INSERT INTO ${lower}s (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *',
      [data.name]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const result = await pool.query(
      'UPDATE ${lower}s SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [data.name, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM ${lower}s WHERE id = $1', [id]);
  },
};

module.exports = ${lower}Service;
`;
  };

  // Generate database schema
  const dbSchema = `-- SkatalystAI Generated Schema
-- Generated: ${timestamp}
-- Artifact: ${proposal.name}

${entityNames.map(entity => {
  const lower = entity.toLowerCase();
  return `-- ${entity} table
CREATE TABLE IF NOT EXISTS ${lower}s (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
}).join('\n\n')}
`;

  // Generate docker-compose.yml
  const dockerCompose = `version: '3.8'

services:
  frontend:
    build:
      context: ./src/frontend
      dockerfile: ../../Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:3001
    depends_on:
      - backend

  backend:
    build:
      context: ./src/backend
      dockerfile: ../../Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/app
      - PORT=3001
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=app
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./src/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

volumes:
  postgres_data:
`;

  // Generate Dockerfiles
  const dockerfileFrontend = `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
`;

  const dockerfileBackend = `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
`;

  // Generate LICENSE
  const license = `MIT License

Copyright (c) ${new Date().getFullYear()}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

  // Build file structure
  const files = {
    'OWNERSHIP_MANIFEST.json': JSON.stringify(ownershipManifest, null, 2),
    'LICENSE': license,
    'docker-compose.yml': dockerCompose,
    'Dockerfile.frontend': dockerfileFrontend,
    'Dockerfile.backend': dockerfileBackend,
    'docs/README.md': readme,
    'docs/SETUP.md': setupMd,
    'docs/API.md': apiMd,
    'src/frontend/package.json': JSON.stringify(frontendPackageJson, null, 2),
    'src/frontend/App.jsx': frontendApp,
    'src/frontend/index.js': `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(<App />);`,
    'src/backend/package.json': JSON.stringify(backendPackageJson, null, 2),
    'src/backend/server.js': backendServer,
    'src/database/schema.sql': dbSchema,
  };

  // Add entity-specific files
  entityNames.forEach(entity => {
    files[`src/frontend/pages/${entity}List.jsx`] = generateEntityPage(entity);
    files[`src/backend/routes/${entity.toLowerCase()}Routes.js`] = generateEntityRoutes(entity);
    files[`src/backend/services/${entity.toLowerCase()}Service.js`] = generateEntityService(entity);
  });

  return files;
}

// Artifact Generation Modal
function ArtifactGenerationModal({ proposal, jobId, onClose }) {
  const [generating, setGenerating] = useState(false);
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false);
  const [generated, setGenerated] = useState(false);

  if (!proposal) return null;

  const totalLoc = proposal.estimation.frontendLoc + proposal.estimation.backendLoc;

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const files = generateArtifactFiles(proposal, jobId);
      const zip = new JSZip();

      // Add all files to the ZIP
      Object.entries(files).forEach(([path, content]) => {
        zip.file(path, content);
      });

      // Generate and download
      const blob = await zip.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().slice(0, 10);
      saveAs(blob, `skatalystai-${proposal.type}-${timestamp}.zip`);

      setGenerated(true);
    } catch (error) {
      console.error('Error generating artifact:', error);
      alert('Failed to generate artifact. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate">
          <div className="text-white">
            <h2 className="text-xl font-bold">Generate Artifact</h2>
            <p className="text-white/70 text-sm">{proposal.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg text-white">
            <Icons.X />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {generated ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-success-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.CheckCircle />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Artifact Generated!</h3>
              <p className="text-gray-600 mb-4">Your download should begin automatically.</p>
              <div className="bg-success-bg border border-success/20 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-success mb-2">What's included:</h4>
                <ul className="text-sm text-success space-y-1">
                  <li>• Complete frontend and backend source code</li>
                  <li>• Database schema</li>
                  <li>• Docker configuration for easy deployment</li>
                  <li>• Documentation (README, SETUP, API)</li>
                  <li>• OWNERSHIP_MANIFEST.json proving your ownership</li>
                  <li>• MIT License</li>
                </ul>
              </div>
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-700">
                  <strong>You own this code.</strong> No subscriptions, no callbacks to SkatalystAI,
                  no dependencies. Deploy anywhere you want.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* What will be generated */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">What will be generated:</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icons.Code />
                      <span className="font-medium">Frontend</span>
                    </div>
                    <p className="text-sm text-gray-500">React application</p>
                    <p className="text-xs text-gray-400">{proposal.estimation.frontendLoc} LOC</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icons.Database />
                      <span className="font-medium">Backend</span>
                    </div>
                    <p className="text-sm text-gray-500">Express.js API</p>
                    <p className="text-xs text-gray-400">{proposal.estimation.backendLoc} LOC</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icons.Layers />
                      <span className="font-medium">Database</span>
                    </div>
                    <p className="text-sm text-gray-500">PostgreSQL schema</p>
                    <p className="text-xs text-gray-400">{proposal.entities.length} tables</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icons.File />
                      <span className="font-medium">Documentation</span>
                    </div>
                    <p className="text-sm text-gray-500">README, SETUP, API</p>
                    <p className="text-xs text-gray-400">3 files</p>
                  </div>
                </div>
              </div>

              {/* Entities */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Entities ({proposal.entities.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {proposal.entities.map((entity, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate/10 text-slate text-sm rounded-full">
                      {entity.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ownership Confirmation */}
              <div className="bg-light-soft border border-light-border rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ownershipConfirmed}
                    onChange={(e) => setOwnershipConfirmed(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300"
                  />
                  <div>
                    <span className="font-medium text-slate">I understand that:</span>
                    <ul className="text-sm text-slate mt-1 space-y-1">
                      <li>• This artifact will be fully mine with no restrictions</li>
                      <li>• There are no subscriptions or ongoing payments</li>
                      <li>• SkatalystAI will have no access to my deployed application</li>
                      <li>• I am responsible for deployment, security, and maintenance</li>
                    </ul>
                  </div>
                </label>
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                <span>Total: ~{totalLoc.toLocaleString()} lines of code</span>
                <span>Estimated effort: {proposal.estimation.effort}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          {generated ? (
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate text-white font-medium rounded-lg hover:bg-slate-hover transition-colors"
            >
              Done
            </button>
          ) : (
            <>
              <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!ownershipConfirmed || generating}
                className="px-6 py-2.5 bg-slate text-white font-medium rounded-lg hover:bg-slate-hover disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <Icons.Download />
                    Generate & Download
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Blueprints View
function BlueprintsView() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [selectedProposals, setSelectedProposals] = useState([]);
  const [detailProposal, setDetailProposal] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [generateProposal, setGenerateProposal] = useState(null);
  // New: Orchestrated runs with builds
  const [orchestratedRuns, setOrchestratedRuns] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both jobs and orchestrated runs in parallel
        const [jobsResponse, runsResponse] = await Promise.all([
          authFetch('/jobs'),
          authFetch('/orchestrated-runs')
        ]);

        const jobsData = await jobsResponse.json();
        const completedJobs = (jobsData.jobs || []).filter(j => j.status === 'completed');
        setJobs(completedJobs);
        if (completedJobs.length > 0) {
          setSelectedJobId(completedJobs[0].jobId);
        }

        // Fetch orchestrated runs that have builds
        const runsData = await runsResponse.json();
        const runsWithBuilds = (runsData.runs || runsData || []).filter(r =>
          r.status === 'building' || r.status === 'build_ready' || r.status === 'ready' ||
          r.status === 'ready_for_architecture' || r.status === 'planned'
        );
        setOrchestratedRuns(runsWithBuilds);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authFetch]);

  useEffect(() => {
    if (selectedJobId) {
      const job = jobs.find(j => j.jobId === selectedJobId);
      if (job) {
        const generated = generateProposals(job);
        setProposals(generated);
        setSelectedProposals([]);
      }
    }
  }, [selectedJobId, jobs]);

  const handleToggleSelect = (proposalId) => {
    setSelectedProposals(prev =>
      prev.includes(proposalId)
        ? prev.filter(id => id !== proposalId)
        : [...prev, proposalId]
    );
  };

  const selectedJob = jobs.find(j => j.jobId === selectedJobId);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Blueprints"
          subtitle="Explore what you could build from your data"
          icon={() => <Icons.Blueprint />}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading jobs...</div>
        </div>
      </div>
    );
  }

  // Show empty state only if both jobs AND orchestrated runs are empty
  if (jobs.length === 0 && orchestratedRuns.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Blueprints"
          subtitle="Explore what you could build from your data"
          icon={() => <Icons.Blueprint />}
        />
        <EmptyState type="blueprints" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blueprints"
        subtitle="Explore what you could build from your data"
        icon={() => <Icons.Blueprint />}
        action={
          selectedProposals.length >= 2 && (
            <button
              onClick={() => setShowComparison(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <Icons.Layers />
              Compare ({selectedProposals.length})
            </button>
          )
        }
      />

      {/* Orchestrated Runs Section - NEW */}
      {orchestratedRuns.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Icons.Folder />
              Orchestrated Runs
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Runs with generated structuring plans and blueprints
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {orchestratedRuns.map(run => (
              <div key={run.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{run.name || 'Untitled Run'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      run.status === 'ready' ? 'bg-green-100 text-green-700' :
                      run.status === 'ready_for_architecture' ? 'bg-amber-100 text-amber-700' :
                      run.status === 'building' ? 'bg-blue-100 text-blue-700' :
                      run.status === 'build_ready' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {run.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Created {new Date(run.created_at).toLocaleDateString()}
                    {run.inventory?.sources?.length > 0 && ` • ${run.inventory.sources.length} source${run.inventory.sources.length !== 1 ? 's' : ''}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {run.status === 'planned' && (
                    <button
                      onClick={() => navigate(`/app/runs/${run.id}/plan`)}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      View Plan
                    </button>
                  )}
                  {run.status === 'ready_for_architecture' && (
                    <button
                      onClick={() => navigate(`/app/runs/${run.id}/organization-preview`)}
                      className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Review Architecture
                    </button>
                  )}
                  {run.status === 'ready' && (
                    <button
                      onClick={() => navigate(`/app/runs/${run.id}/build`)}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Build App
                    </button>
                  )}
                  {(run.status === 'building' || run.status === 'build_ready') && (
                    <button
                      onClick={() => navigate(`/app/runs/${run.id}/build`)}
                      className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      View Build
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer Banner */}
      {jobs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Icons.Warning />
          <div>
            <h4 className="font-semibold text-amber-800">Preview Only</h4>
            <p className="text-sm text-amber-700">
              These are conceptual blueprints. No code has been generated and nothing has been deployed.
              Estimates are approximations based on typical development patterns.
            </p>
          </div>
        </div>
      )}

      {/* Job-based Blueprints Section - Only show if jobs exist */}
      {jobs.length > 0 && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Icons.File />
                Ingestion Jobs
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Conceptual blueprints from completed file ingestion jobs
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Select Job:</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="flex-1 max-w-md h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ion/20 focus:border-ion"
                >
                  {jobs.map(job => (
                    <option key={job.jobId} value={job.jobId}>
                      {job.jobId} — {job.results?.fileResults?.length || 0} files, {Object.keys(job.results?.categories || {}).length} categories
                    </option>
                  ))}
                </select>
                {selectedJob && (
                  <div className="text-sm text-gray-500">
                    Context: {selectedJob.context ? `"${selectedJob.context.slice(0, 50)}..."` : 'None'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Proposals Grid */}
          {proposals.length > 0 && (
            <div className="grid grid-cols-3 gap-6">
              {proposals.map(proposal => (
                <BlueprintProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onViewDetails={setDetailProposal}
                  onGenerate={setGenerateProposal}
                  isSelected={selectedProposals.includes(proposal.id)}
                  onToggleSelect={handleToggleSelect}
                />
              ))}
            </div>
          )}

          {/* Selection Info */}
          {selectedProposals.length > 0 && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Icons.CheckCircle />
                <span>{selectedProposals.length} proposal{selectedProposals.length !== 1 ? 's' : ''} selected for comparison</span>
              </div>
              {selectedProposals.length >= 2 && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="px-4 py-2 bg-slate text-white font-medium rounded-lg hover:bg-slate-hover transition-colors"
                >
                  Compare Proposals
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {detailProposal && (
        <BlueprintDetailModal
          proposal={detailProposal}
          onClose={() => setDetailProposal(null)}
        />
      )}

      {/* Comparison Modal */}
      {showComparison && selectedProposals.length >= 2 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Compare Proposals</h2>
                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Preview Only</span>
              </div>
              <button onClick={() => setShowComparison(false)} className="p-2 hover:bg-gray-200 rounded-lg">
                <Icons.X />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6">
                {selectedProposals.map(id => {
                  const proposal = proposals.find(p => p.id === id);
                  if (!proposal) return null;
                  const totalLoc = proposal.estimation.frontendLoc + proposal.estimation.backendLoc;
                  return (
                    <div key={id} className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-4">{proposal.name}</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Entities</span>
                          <span className="font-medium">{proposal.entities.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">UI Components</span>
                          <span className="font-medium">{proposal.uiComponents.reduce((s, c) => s + c.count, 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Backend Components</span>
                          <span className="font-medium">{proposal.backendComponents.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Est. Effort</span>
                          <span className="font-medium">{proposal.estimation.effort}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Est. LOC</span>
                          <span className="font-medium">{totalLoc.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Complexity</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            proposal.estimation.complexity === 'Low' ? 'bg-success-bg text-success' :
                            proposal.estimation.complexity === 'Medium' ? 'bg-warning-bg text-warning' :
                            'bg-error-bg text-error'
                          }`}>
                            {proposal.estimation.complexity}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-light-soft">
              <div className="flex items-center gap-2 text-slate">
                <Icons.Info />
                <span className="text-sm">Close this modal and click "Generate Artifact" on any proposal card to create a downloadable artifact.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Artifact Generation Modal */}
      {generateProposal && (
        <ArtifactGenerationModal
          proposal={generateProposal}
          jobId={selectedJobId}
          onClose={() => setGenerateProposal(null)}
        />
      )}
    </div>
  );
}

// Pilot Program Banner - Shows pilot status and rate limit warnings
function PilotBanner({ storageUsage }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  // Calculate usage percentage
  const usagePercent = storageUsage?.limit > 0
    ? (storageUsage.used / storageUsage.limit) * 100
    : 0;

  // Show rate limit warning if above 80%
  const showRateLimitWarning = usagePercent >= 80;

  if (dismissed && !showRateLimitWarning) return null;

  return (
    <div className={`border-b ${showRateLimitWarning ? 'bg-amber-50 border-amber-200' : 'bg-purple-50 border-purple-200'}`}>
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${showRateLimitWarning ? 'bg-amber-200 text-amber-700' : 'bg-purple-200 text-purple-700'}`}>
              {showRateLimitWarning ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </div>

            {/* Message */}
            <div className="flex items-center gap-2">
              {showRateLimitWarning ? (
                <>
                  <span className="text-sm font-medium text-amber-800">
                    {t('pilot.rateLimitWarning', 'Approaching data limit')}
                  </span>
                  <span className="text-sm text-amber-700">
                    ({usagePercent.toFixed(0)}% {t('pilot.used', 'used')})
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium text-purple-800">
                    {t('pilot.banner', 'Pilot Program')}
                  </span>
                  <span className="text-sm text-purple-600 hidden sm:inline">
                    {t('pilot.bannerSubtext', '– Subject to data limits. Contact sales for enterprise access.')}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/app/billing')}
              className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                showRateLimitWarning
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {t('pilot.upgrade', 'Upgrade')}
            </button>
            {!showRateLimitWarning && (
              <button
                onClick={() => setDismissed(true)}
                className="text-purple-500 hover:text-purple-700 p-1"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Layout (authenticated app shell)
function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  // Parse URL path to get active nav (e.g., /app/billing -> billing)
  const getNavFromPath = () => {
    const pathname = location.pathname;
    // Explicit mappings to prevent fallback issues
    if (pathname.startsWith('/app/beta')) return 'beta';
    if (pathname.startsWith('/app/dashboard')) return 'dashboard';
    if (pathname.startsWith('/app/connectors')) return 'connectors';
    if (pathname.startsWith('/app/contexts')) return 'contexts';
    if (pathname.startsWith('/app/ingest')) return 'ingest';
    if (pathname.startsWith('/app/organized')) return 'organized';
    if (pathname.startsWith('/app/output-targets')) return 'output-targets';
    if (pathname.startsWith('/app/metrics')) return 'metrics';
    if (pathname.startsWith('/app/blueprints')) return 'blueprints';
    if (pathname.startsWith('/app/billing')) return 'billing';
    if (pathname.startsWith('/app/support')) return 'support';
    if (pathname.startsWith('/app/admin')) return 'admin';
    if (pathname.startsWith('/app/agents')) return 'agents';
    if (pathname.startsWith('/app/settings')) return 'settings';
    // Default to ingest for /app or /app/
    if (pathname === '/app' || pathname === '/app/') return 'ingest';
    // Fallback: try to extract from path
    const path = pathname.replace('/app/', '').replace('/app', '');
    return path.split('/')[0] || 'ingest';
  };

  const [activeNav, setActiveNav] = useState(() => {
    // Explicit initialization to prevent stale closure issues
    const pathname = location.pathname;
    if (pathname.startsWith('/app/beta')) return 'beta';
    if (pathname.startsWith('/app/dashboard')) return 'dashboard';
    if (pathname.startsWith('/app/connectors')) return 'connectors';
    if (pathname.startsWith('/app/contexts')) return 'contexts';
    if (pathname.startsWith('/app/ingest')) return 'ingest';
    if (pathname.startsWith('/app/organized')) return 'organized';
    if (pathname.startsWith('/app/output-targets')) return 'output-targets';
    if (pathname.startsWith('/app/metrics')) return 'metrics';
    if (pathname.startsWith('/app/blueprints')) return 'blueprints';
    if (pathname.startsWith('/app/billing')) return 'billing';
    if (pathname.startsWith('/app/support')) return 'support';
    if (pathname.startsWith('/app/admin')) return 'admin';
    if (pathname.startsWith('/app/agents')) return 'agents';
    if (pathname.startsWith('/app/settings')) return 'settings';
    return 'ingest';
  });
  const [storageUsage, setStorageUsage] = useState({ used: 0, limit: 10 });

  // Fetch storage usage
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await authFetch('/usage/summary');
        if (res.ok) {
          const data = await res.json();
          // gb_scanned is in GB, limit from quota
          setStorageUsage({
            used: parseFloat(data.gbScanned || 0),
            limit: parseFloat(data.quota?.gb_scanned_limit || 10)
          });
        }
      } catch (err) {
        console.error('Failed to fetch usage:', err);
      }
    };
    fetchUsage();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, [authFetch]);

  // Sync URL when activeNav changes
  const handleNavChange = (nav) => {
    setActiveNav(nav);
    navigate(`/app/${nav}`);
  };

  // Sync activeNav when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const nav = getNavFromPath();
    setActiveNav(nav);
  }, [location.pathname]);

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <DashboardView onNavigate={handleNavChange} />;
      case 'connectors':
        return <Connectors />;
      case 'contexts':
        return <Contexts />;
      case 'ingest':
        return <DataIngestionHub onNavigateToConnectors={() => handleNavChange('connectors')} />;
      case 'ingest-local-select':
        return <DataIngestionHub onNavigateToConnectors={() => handleNavChange('connectors')} showLocalSelector={true} />;
      case 'organized':
        return <OrganizedView onNavigateToIngest={() => handleNavChange('ingest')} />;
      case 'output-targets':
        return <OutputTargets />;
      case 'metrics':
        return <MetricsView />;
      case 'blueprints':
        return <BlueprintsView />;
      case 'billing':
        return <Billing />;
      case 'beta':
        return <Beta />;
      case 'support':
        return <Support />;
      case 'admin':
        return <Admin />;
      case 'agents':
        return <AgentsAdmin />;
      case 'settings':
        return <Settings />;
      default:
        // Prevent silent fallback to Dashboard - render nothing for unknown views
        console.warn(`Unknown activeNav: ${activeNav}`);
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavChange={handleNavChange} />
      <Sidebar activeNav={activeNav} onNavChange={handleNavChange} storageUsage={storageUsage} />
      <main className="ml-64 pt-16 min-h-screen">
        <PilotBanner storageUsage={storageUsage} />
        <div className="p-8 max-w-6xl">
          {renderContent()}
        </div>
      </main>
      <BugReportButton />
    </div>
  );
}

// Protected App Shell with sidebar
function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active nav from current path
  const getActiveNav = () => {
    const pathname = location.pathname;
    if (pathname === '/app/runs' || pathname === '/app/runs/') return 'runs';
    if (pathname.startsWith('/app/runs/')) return 'runs'; // Run details pages
    if (pathname.startsWith('/app/connectors')) return 'connectors';
    if (pathname.startsWith('/app/ingest')) return 'ingest';
    if (pathname.startsWith('/app/agents')) return 'agents';
    if (pathname.startsWith('/app/settings')) return 'settings';
    return 'ingest';
  };

  const handleNavChange = (nav) => {
    navigate(`/app/${nav}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar activeNav={getActiveNav()} onNavChange={handleNavChange} />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}

// Main App with routing
function App() {
  return (
    <Routes>
      {/* Public marketing pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/about" element={<About />} />
      <Route path="/legal/privacy" element={<Privacy />} />
      <Route path="/legal/terms" element={<Terms />} />
      <Route path="/legal/disclaimer" element={<Disclaimer />} />

      {/* Public preview page (no auth required) */}
      <Route path="/preview/:token" element={<PreviewPage />} />

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected app routes */}
      <Route
        path="/app/runs"
        element={
          <ProtectedRoute>
            <AppShell>
              <RunsIndex />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/runs/:id"
        element={
          <ProtectedRoute>
            <AppShell>
              <RunDetail />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/runs/:id/report"
        element={
          <ProtectedRoute>
            <AppShell>
              <RunReport />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/runs/:id/inventory"
        element={
          <ProtectedRoute>
            <AppShell>
              <InventoryResults />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/runs/:id/plan"
        element={
          <ProtectedRoute>
            <AppShell>
              <StructuringPlan />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/runs/:id/organization-preview"
        element={
          <ProtectedRoute>
            <AppShell>
              <OrganizationPreview />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/runs/:id/kpi-discovery"
        element={
          <ProtectedRoute>
            <AppShell>
              <KPIDiscovery />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/runs/:id/analytics-preview"
        element={
          <ProtectedRoute>
            <AppShell>
              <AnalyticsPreview />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/runs/:id/build"
        element={
          <ProtectedRoute>
            <AppShell>
              <BuildApp />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/runs/:id/test-environment"
        element={
          <ProtectedRoute>
            <AppShell>
              <TestEnvironment />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/runs/:id/summary"
        element={
          <ProtectedRoute>
            <AppShell>
              <BuildSummary />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/runs/:id/preview"
        element={
          <ProtectedRoute>
            <AppShell>
              <ExecutionPreview />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/workspace/settings"
        element={
          <ProtectedRoute>
            <AppShell>
              <WorkspaceSettings />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
