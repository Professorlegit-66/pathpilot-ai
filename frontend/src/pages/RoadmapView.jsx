import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Map, ArrowDown, Target, GraduationCap, Building2, 
  CheckCircle2, Banknote, Brain, Rocket, AlertCircle, ArrowRight 
} from 'lucide-react';

export default function RoadmapView({ profile }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract the specific program the user wants to add to their roadmap
  const selectedProgram = location.state?.selectedProgram;
  
  // If no program was selected from the Matcher, prompt them to go choose one.
  if (!selectedProgram) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '2.5rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', textAlign: 'center' }}>
        <div style={{ background: '#f59e0b22', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
          <AlertCircle size={28} color="#f59e0b" />
        </div>
        <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', marginBottom: '0.75rem' }}>No Program Selected</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
          Your roadmap is built around a specific academic program. Please evaluate your profile and select a program to add to your roadmap.
        </p>
        <button 
          onClick={() => navigate('/programs')}
          style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          Go to Program Matcher <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // PRD Rule 23: Roadmap Visual Structure Component
  const FlowStep = ({ icon, title, value, subtext }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {icon} <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc', marginBottom: '0.25rem' }}>{value}</div>
        {subtext && <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{subtext}</div>}
      </div>
      <ArrowDown size={24} color="#334155" style={{ margin: '1rem 0' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>

<Map size={16} />
YOUR PATH
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', margin: '0 0 0.5rem 0' }}>Personalized Career Roadmap</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          The grounded milestone progression for {profile?.name || 'Student'} based on verified dataset credentials.
        </p>
      </div>

      {/* Sequential Pipeline (PRD Rule 23) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <FlowStep 
          icon={<Target color="#38bdf8" />}
          title="Target Career"
          value={profile?.target_career || "Career Track"}
          subtext="Based on your profile interests"
        />

        <FlowStep 
          icon={<GraduationCap color="#a855f7" />}
          title="Education"
          value={selectedProgram.program_name}
          subtext={`Field: ${profile?.preferred_field || 'Computer Science'}`}
        />

        <FlowStep 
          icon={<Building2 color="#f43f5e" />}
          title="Program Option"
          value={selectedProgram.university_name}
          subtext={selectedProgram.city}
        />

        <FlowStep 
          icon={<CheckCircle2 color="#10b981" />}
          title="Eligibility"
          value={selectedProgram.eligibility_status === "ELIGIBLE" ? "Eligible" : selectedProgram.eligibility_status}
          subtext="Based on available academic requirements"
        />

        <FlowStep 
          icon={<Banknote color="#fbbf24" />}
          title="Financial Options"
          value={selectedProgram.available_scholarships?.length > 0 ? `${selectedProgram.available_scholarships.length} Available Records` : "No matching records"}
          subtext="Found in current dataset"
        />

        {/* Skills step - derived from dataset logic if available */}
        <FlowStep 
          icon={<Brain color="#6366f1" />}
          title="Skills to Develop"
          value="Technical & Professional Skills"
          subtext="Acquire the skills demanded by your target career track during your degree."
        />

        {/* Final Step (No downward arrow) */}
        <div style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', padding: '1.5rem', borderRadius: '12px', width: '100%', maxWidth: '400px', boxSizing: 'border-box', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Rocket color="#fff" /> <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Steps</h3>
          </div>
          <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Focus on maintaining your academic performance, prepare for the admission test of {selectedProgram.university_name}, and consider speaking to our AI Counselor for detailed module guidance.
          </p>
        </div>

      </div>
    </div>
  );
}