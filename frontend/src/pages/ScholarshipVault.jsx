import { Award, DollarSign, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ScholarshipVault({ results }) {
  // Extract all unique scholarships from the current matching results
  const allScholarships = results ? results.flatMap(r => 
    (r.available_scholarships || []).map(s => ({ ...s, university_name: r.university_name }))
  ) : [];

  // Remove duplicates based on scholarship name
  const uniqueScholarships = Array.from(
    new Map(allScholarships.map(item => [item.name, item])).values()
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Award color="#fbbf24" /> Scholarship & Financial Aid Vault
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Explore verified institutional grants, merit scholarships, and financial aid packages matched to your profile.
        </p>
      </div>

      {/* Content Grid */}
      {uniqueScholarships.length === 0 ? (
        <div style={{ background: '#1e293b', padding: '3rem', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center' }}>
          <DollarSign size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>No Scholarships Discovered Yet</h3>
          <p style={{ color: '#94a3b8', margin: '0 0 1.5rem 0' }}>Run your program eligibility evaluation first to discover tied financial aid options.</p>
          <Link to="/programs" style={{ background: '#2563eb', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
            Go to Program Matcher
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
          {uniqueScholarships.map((sch, index) => (
            <div 
              key={index} 
              style={{ 
                background: '#1e293b', padding: '1.5rem', borderRadius: '16px', 
                border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '1rem',
                position: 'relative', overflow: 'hidden'
              }}
            >
              {/* Top Row: Type & University */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', background: '#422006', color: '#fbbf24', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  {sch.type}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>
                  {sch.university_name}
                </span>
              </div>

              {/* Title & Coverage */}
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', color: '#f8fafc' }}>{sch.name}</h3>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#34d399', marginBottom: '0.5rem' }}>
                  {sch.coverage}
                </div>
              </div>

              {/* Eligibility Logic */}
              <div style={{ background: '#0f172a', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>CRITERIA & LOGIC</span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>{sch.eligibility_logic}</p>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}