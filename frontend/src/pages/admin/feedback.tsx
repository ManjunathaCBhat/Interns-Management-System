import React, { useState } from 'react';
import {
  MessageSquare,
  Users,
  Star,
  Send,
} from 'lucide-react';

// ---- Interfaces ----
interface Intern {
  _id: string;
  name: string;
  domain: string;
  mentor: string;
}

interface Feedback {
  _id: string;
  internId: string;
  rating: number;
  comment: string;
  date: string;
}

// ---- Mock Data ----
const MOCK_INTERNS: Intern[] = [
  { _id: '1', name: 'Priya Sharma', domain: 'Frontend', mentor: 'Rajesh Kumar' },
  { _id: '2', name: 'Arjun Patel', domain: 'Backend', mentor: 'Sneha Reddy' },
  { _id: '3', name: 'Karthik Nair', domain: 'Full Stack', mentor: 'Amit Singh' },
];

const MOCK_FEEDBACKS: Feedback[] = [
  { _id: 'f1', internId: '1', rating: 4, comment: 'Good progress, needs better documentation.', date: '2026-01-18' },
  { _id: 'f2', internId: '2', rating: 5, comment: 'Excellent backend ownership.', date: '2026-01-17' },
];

const Feedback: React.FC = () => {
  const [selectedIntern, setSelectedIntern] = useState('all');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const filteredFeedbacks =
    selectedIntern === 'all'
      ? MOCK_FEEDBACKS
      : MOCK_FEEDBACKS.filter(f => f.internId === selectedIntern);

  const submitFeedback = () => {
    if (!rating || !comment || selectedIntern === 'all') {
      alert('Please select intern, rating and comment');
      return;
    }

    alert('Feedback submitted (mock)');
    setRating(0);
    setComment('');
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#2D0B59' }}>
          Feedback Management
        </h1>
        <p style={{ color: '#64748b' }}>
          Provide and review intern performance feedback
        </p>
      </div>

      {/* Feedback Form */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '32px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}>
        <h2 style={{
          fontWeight: 700,
          marginBottom: '16px',
          display: 'flex',
          gap: '8px',
          color: '#2D0B59'
        }}>
          <MessageSquare size={20} color="#7C3AED" /> Give Feedback
        </h2>

        {/* Select Intern */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
            INTERN
          </label>
          <select
            value={selectedIntern}
            onChange={(e) => setSelectedIntern(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginTop: '6px',
              outlineColor: '#7C3AED',
            }}
          >
            <option value="all">Select Intern</option>
            {MOCK_INTERNS.map(i => (
              <option key={i._id} value={i._id}>
                {i.name} • {i.domain}
              </option>
            ))}
          </select>
        </div>

        {/* Rating */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
            RATING
          </label>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                size={22}
                onClick={() => setRating(star)}
                style={{
                  cursor: 'pointer',
                  color: star <= rating ? '#facc15' : '#cbd5f5',
                }}
              />
            ))}
          </div>
        </div>

        {/* Comment */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
            COMMENTS
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write feedback about intern performance..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginTop: '6px',
              outlineColor: '#7C3AED',
            }}
          />
        </div>

        <button
          onClick={submitFeedback}
          style={{
            background: '#7C3AED',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#5B1AA6')}
          onMouseOut={e => (e.currentTarget.style.background = '#7C3AED')}
        >
          <Send size={16} /> Submit Feedback
        </button>
      </div>

      {/* Feedback List */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}>
        <h2 style={{
          fontWeight: 700,
          marginBottom: '16px',
          display: 'flex',
          gap: '8px',
          color: '#2D0B59'
        }}>
          <Users size={20} color="#7C3AED" /> Previous Feedback
        </h2>

        {filteredFeedbacks.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No feedback available</p>
        ) : (
          filteredFeedbacks.map(f => {
            const intern = MOCK_INTERNS.find(i => i._id === f.internId);
            return (
              <div
                key={f._id}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div style={{ fontWeight: 700, color: '#2D0B59' }}>
                  {intern?.name} • {intern?.domain}
                </div>
                <div style={{ display: 'flex', gap: '4px', margin: '6px 0' }}>
                  {[...Array(f.rating)].map((_, i) => (
                    <Star key={i} size={14} color="#facc15" />
                  ))}
                </div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>
                  {f.comment}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  {f.date}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Feedback;
