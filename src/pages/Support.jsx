import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import BugReportModal from '../components/BugReportModal';

// Icons
const SupportIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

// Status badge component
function StatusBadge({ status, t }) {
  const statusConfig = {
    open: { bg: 'bg-info-bg', text: 'text-info', label: t('support.status.open') },
    in_progress: { bg: 'bg-warning-bg', text: 'text-warning', label: t('support.status.inProgress') },
    resolved: { bg: 'bg-success-bg', text: 'text-success', label: t('support.status.resolved') },
    closed: { bg: 'bg-light-soft dark:bg-dark-soft', text: 'text-text-secondary dark:text-text-dark-secondary', label: t('support.status.closed') },
  };

  const config = statusConfig[status] || statusConfig.open;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

// Type icon component
function TypeIcon({ type }) {
  const icons = {
    bug: '🐛',
    feature: '💡',
    question: '❓',
    support: '🎧',
    other: '📝',
  };
  return <span className="text-lg">{icons[type] || icons.other}</span>;
}

// Ticket detail modal
function TicketDetailModal({ ticket, onClose, t }) {
  const { authFetch } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Load comments
    const fetchComments = async () => {
      try {
        const response = await authFetch(`/tickets/${ticket.id}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments || []);
        }
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      }
    };

    // Use mock data
    setComments([
      {
        id: '1',
        content: 'Thanks for reporting this issue. We\'re looking into it.',
        user: { name: 'Support Team', avatar: null },
        createdAt: '2024-12-15T10:30:00Z',
        isSupport: true,
      },
    ]);
  }, [ticket.id, authFetch]);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      await authFetch(`/tickets/${ticket.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment }),
      });
      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          content: newComment,
          user: { name: 'You', avatar: null },
          createdAt: new Date().toISOString(),
          isSupport: false,
        },
      ]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to send comment:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-light-surface dark:bg-dark-surface rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <TypeIcon type={ticket.type} />
              <div>
                <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
                  {ticket.subject}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-text-secondary dark:text-text-dark-secondary font-mono">
                    #{ticket.id}
                  </span>
                  <StatusBadge status={ticket.status} t={t} />
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary dark:text-text-dark-secondary dark:hover:text-text-dark-primary"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Original description */}
            <div className="mb-6">
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-2">
                {t('support.detail.description')}
              </p>
              <div className="p-4 bg-light-soft dark:bg-dark-soft rounded-lg text-text-primary dark:text-text-dark-primary whitespace-pre-wrap">
                {ticket.description}
              </div>
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-2">
                {t('support.detail.created')}: {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Comments */}
            <div className="space-y-4">
              <h3 className="font-medium text-text-primary dark:text-text-dark-primary">
                {t('support.detail.comments')} ({comments.length})
              </h3>
              {comments.length === 0 ? (
                <p className="text-text-secondary dark:text-text-dark-secondary text-sm">
                  {t('support.detail.noComments')}
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-lg ${
                        comment.isSupport
                          ? 'bg-ion/10 border border-ion/20'
                          : 'bg-light-soft dark:bg-dark-soft'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-ion/20 flex items-center justify-center text-ion text-xs font-bold">
                          {comment.user.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                          {comment.user.name}
                        </span>
                        {comment.isSupport && (
                          <span className="text-xs bg-ion text-white px-2 py-0.5 rounded-full">
                            {t('support.detail.support')}
                          </span>
                        )}
                        <span className="text-xs text-text-secondary dark:text-text-dark-secondary ml-auto">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-text-primary dark:text-text-dark-primary text-sm">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reply input */}
          {ticket.status !== 'closed' && (
            <div className="p-4 border-t border-light-border dark:border-dark-border">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t('support.detail.replyPlaceholder')}
                  className="flex-1 px-4 py-2 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                />
                <button
                  onClick={handleSendComment}
                  disabled={!newComment.trim() || sending}
                  className="px-4 py-2 bg-slate text-white rounded-button hover:bg-slate-hover disabled:opacity-50 transition-colors"
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Support page
export default function Support() {
  const { t } = useTranslation();
  const { authFetch } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicket, setShowNewTicket] = useState(false);

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await authFetch('/tickets');
        if (response.ok) {
          const data = await response.json();
          setTickets(data.tickets || []);
        }
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
      } finally {
        setLoading(false);
      }
    };

    // Use mock data
    setTickets([
      {
        id: 'TKT-ABC123',
        type: 'bug',
        status: 'in_progress',
        subject: 'File upload fails for large files',
        description: 'When I try to upload files larger than 100MB, the upload fails with a timeout error. I\'ve tried multiple times with different files.',
        createdAt: '2024-12-14T09:30:00Z',
        updatedAt: '2024-12-15T10:30:00Z',
      },
      {
        id: 'TKT-DEF456',
        type: 'feature',
        status: 'open',
        subject: 'Add support for Google Drive integration',
        description: 'It would be great to have direct integration with Google Drive to import files without downloading them first.',
        createdAt: '2024-12-12T14:00:00Z',
        updatedAt: '2024-12-12T14:00:00Z',
      },
      {
        id: 'TKT-GHI789',
        type: 'question',
        status: 'resolved',
        subject: 'How to export reports as PDF?',
        description: 'I can\'t find the option to export my analysis reports as PDF files. Is this feature available?',
        createdAt: '2024-12-10T11:00:00Z',
        updatedAt: '2024-12-11T09:00:00Z',
      },
    ]);
    setLoading(false);
  }, [authFetch]);

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  const statusCounts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ion"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-ion/10 flex items-center justify-center text-ion">
              <SupportIcon />
            </div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
              {t('support.title')}
            </h1>
          </div>
          <p className="text-text-secondary dark:text-text-dark-secondary ml-13">
            {t('support.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover transition-colors"
        >
          <PlusIcon />
          {t('support.newTicket')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <FilterIcon className="text-text-secondary dark:text-text-dark-secondary" />
        {['all', 'open', 'in_progress', 'resolved'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-button text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-ion text-white'
                : 'bg-light-soft dark:bg-dark-soft text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary'
            }`}
          >
            {t(`support.filter.${status}`)} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {/* Ticket list */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-12 bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border">
          <SupportIcon className="w-12 h-12 mx-auto text-text-secondary dark:text-text-dark-secondary mb-4" />
          <h3 className="text-lg font-medium text-text-primary dark:text-text-dark-primary mb-2">
            {t('support.empty.title')}
          </h3>
          <p className="text-text-secondary dark:text-text-dark-secondary mb-4">
            {t('support.empty.description')}
          </p>
          <button
            onClick={() => setShowNewTicket(true)}
            className="px-4 py-2 bg-ion text-white font-medium rounded-button hover:bg-ion/90 transition-colors"
          >
            {t('support.newTicket')}
          </button>
        </div>
      ) : (
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
          <div className="divide-y divide-light-border dark:divide-dark-border">
            {filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="w-full p-4 flex items-center gap-4 hover:bg-light-soft dark:hover:bg-dark-soft transition-colors text-left"
              >
                <TypeIcon type={ticket.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-text-secondary dark:text-text-dark-secondary">
                      #{ticket.id}
                    </span>
                    <StatusBadge status={ticket.status} t={t} />
                  </div>
                  <h3 className="font-medium text-text-primary dark:text-text-dark-primary truncate">
                    {ticket.subject}
                  </h3>
                  <p className="text-sm text-text-secondary dark:text-text-dark-secondary truncate">
                    {ticket.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                    {new Date(ticket.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRightIcon className="text-text-secondary dark:text-text-dark-secondary" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ticket detail modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          t={t}
        />
      )}

      {/* New ticket modal */}
      <BugReportModal isOpen={showNewTicket} onClose={() => setShowNewTicket(false)} />
    </div>
  );
}
