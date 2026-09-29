import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { HACKATHONS_DATA, type Hackathon } from '../data/hackathonsData';
import { LEARNING_TRACKS } from '../data/learningTracksData';
import { PRICING_PLANS } from '../data/pricingPlansData';
import { HackathonCard } from '../components/hackathon/HackathonCard';
import { HackathonDetailModal } from '../components/hackathon/HackathonDetailModal';
import { EnrollmentConfirmationModal } from '../components/hackathon/EnrollmentConfirmationModal';
import { SubscriptionModal } from '../components/hackathon/SubscriptionModal';

export const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // API State
  const [health, setHealth] = useState<any>(null);
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState<boolean>(true);

  // Modals & UI State
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [confirmedHackathon, setConfirmedHackathon] = useState<Hackathon | null>(null);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [pricingCycle, setPricingCycle] = useState<'annual' | 'monthly'>('annual');

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);

  // Sync category or query from URL query params (e.g. from Navbar)
  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat) {
      setSelectedCategory(cat);
    }
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Load backend metrics & live results from SQLite
  useEffect(() => {
    async function loadBackendData() {
      try {
        const healthRes: any = await apiClient.get('/health');
        setHealth(healthRes.data);

        const resultsRes: any = await apiClient.get('/judging/results');
        if (resultsRes?.data) {
          setLiveResults(resultsRes.data);
        }
      } catch (err) {
        console.warn('Backend metrics loading fallback', err);
      } finally {
        setLoadingDb(false);
      }
    }
    loadBackendData();
  }, []);

  // Filtered Hackathons
  const filteredHackathons = useMemo(() => {
    return HACKATHONS_DATA.filter((h) => {
      // Category filter
      if (selectedCategory !== 'All' && h.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && h.status !== selectedStatus) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = h.title.toLowerCase().includes(q);
        const matchesSub = h.subtitle.toLowerCase().includes(q);
        const matchesOrg = h.organization.toLowerCase().includes(q);
        const matchesSkills = h.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSub && !matchesOrg && !matchesSkills) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, selectedStatus, searchQuery]);

  // Category counts
  const categoriesList = [
    'All',
    'AI & Machine Learning',
    'Cloud & Systems',
    'BioTech & Health',
    'FinTech & Trading',
    'Climate & CleanTech',
    'Web3 & Cryptography',
  ];

  const handleEnrollSuccess = (hackathon: Hackathon, teamData: any) => {
    setSelectedHackathon(null);
    setConfirmedHackathon(hackathon);
    setRegistrationData(teamData);
  };

  const faqs = [
    {
      q: 'What is included with Veyra Hackathon Plus?',
      a: 'Veyra Hackathon Plus gives you unlimited free access to 500+ premier hackathons with over $2.5M in prizes, access to 40+ guided masterclasses and starter repos, verified digital credentials upon submission, and 1-on-1 office hours with verified industry judges.',
    },
    {
      q: 'How does the Z-Score Normalization Engine guarantee fair judging?',
      a: 'In traditional hackathons, a project assigned to a harsh judge gets unfairly penalized compared to one evaluated by a lenient judge. Our statistical engine calculates each judge\'s mean (μ) and standard deviation (σ), and maps every score to its standard normal Z-score: Z = (X - μ) / σ. This mathematically eliminates judge leniency bias.',
    },
    {
      q: 'Can I participate in hackathons for free without a Plus subscription?',
      a: 'Yes! Every hackathon features a 100% Free Hacker Pass tier that allows you to register your team, submit projects, access community forums, and compete for full cash prize pools.',
    },
    {
      q: 'Can I participate solo or do I need a team?',
      a: 'Most hackathons accommodate solo builders up to teams of 4. If you are looking for teammates, our platform includes an automated teammate matching algorithm based on complementary skills (e.g. Frontend + ML Engineer).',
    },
    {
      q: 'How are prize winnings distributed and verified?',
      a: 'Prize winnings are distributed within 14 business days following the public release of the normalized leaderboard. All winning codebases undergo automated plagiarism audits and repository verification before funds are disbursed via wire or crypto grant.',
    },
  ];

  return (
    <div className="coursera-home-wrapper">
      {/* 1. COURSERA PLUS HERO SECTION */}
      <section className="coursera-hero-section">
        <div className="hero-grid-container">
          {/* Left Column: Value Proposition */}
          <div className="hero-text-col">
            <div className="hero-eyebrow-badge">
              <span className="badge-coursera-plus">
                <span className="plus-star">★</span> VEYRA HACKATHON PLUS
              </span>
              <span className="eyebrow-text">500+ Official Competitions &bull; $2.5M Prizes</span>
            </div>

            <h1 className="coursera-hero-heading">
              Build Without Limits. <br />
              <span className="heading-highlight">Compete &amp; Get Hired.</span>
            </h1>

            <p className="coursera-hero-lead">
              Get unlimited access to the world&rsquo;s most prestigious hackathons, hands-on masterclasses from Stanford and Google DeepMind engineers, verified credentials, and real-time unbiased judging.
            </p>

            {/* Benefit Checkmarks */}
            <div className="hero-benefits-list">
              <div className="benefit-item">
                <span className="check-icon">✓</span>
                <span>Enter 500+ global competitions with zero entry fees</span>
              </div>
              <div className="benefit-item">
                <span className="check-icon">✓</span>
                <span>Earn verified credentials recognized by 400+ hiring partners</span>
              </div>
              <div className="benefit-item">
                <span className="check-icon">✓</span>
                <span>1-on-1 feedback from tech leads &amp; Z-Score fair evaluation</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="hero-cta-group">
              <button
                type="button"
                className="btn-hero-primary"
                onClick={() => setShowSubscriptionModal(true)}
              >
                <span>Start 7-Day Free Trial</span>
                <span className="btn-arrow">→</span>
              </button>

              <a href="#catalog" className="btn-hero-secondary">
                Explore All Hackathons
              </a>
            </div>

            <div className="hero-guarantee-note">
              <span>🔒 14-day money-back guarantee</span>
              <span>•</span>
              <span>Free participation option always available</span>
            </div>
          </div>

          {/* Right Column: Interactive Featured Card */}
          <div className="hero-card-col">
            <div className="hero-floating-card">
              <div className="floating-card-badge-row">
                <span className="badge-live-pulse">
                  <span className="pulse-dot"></span> LIVE NOW
                </span>
                <span className="badge-pool">$250,000 PRIZE POOL</span>
              </div>

              <div className="floating-card-banner">
                <div className="floating-org-icon">🧠</div>
                <div>
                  <span className="floating-org-name">Google DeepMind &amp; Stanford</span>
                  <h3 className="floating-card-title">Global Autonomous Agents Summit</h3>
                </div>
              </div>

              <p className="floating-card-desc">
                Build multi-agent architectures that autonomously plan, code, and execute complex workflows. Evaluated under strict multi-criteria rubrics.
              </p>

              <div className="floating-metrics-row">
                <div className="f-metric">
                  <strong>8,450</strong>
                  <span>Hackers Enrolled</span>
                </div>
                <div className="f-metric">
                  <strong>4.98 ★</strong>
                  <span>Judge Score</span>
                </div>
                <div className="f-metric">
                  <strong>29 Days</strong>
                  <span>Time Left</span>
                </div>
              </div>

              <div className="floating-tags-list">
                <span className="f-tag">Gemini 3.5 API</span>
                <span className="f-tag">LangGraph</span>
                <span className="f-tag">Function Calling</span>
                <span className="f-tag">Python</span>
              </div>

              <div className="floating-card-actions">
                <button
                  type="button"
                  className="btn-floating-enroll"
                  onClick={() => setSelectedHackathon(HACKATHONS_DATA[1])}
                >
                  Inspect Rubric &amp; Register Team →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PARTNER TRUST LOGOS BAR */}
      <section className="partners-trust-section">
        <p className="partners-label">
          COLLABORATING WITH LEADING UNIVERSITIES &amp; ADVANCED AI LABS
        </p>
        <div className="partners-marquee">
          <div className="partner-logo-item">
            <span className="p-icon">🧠</span> Google DeepMind
          </div>
          <div className="partner-logo-item">
            <span className="p-icon">🌲</span> Stanford University
          </div>
          <div className="partner-logo-item">
            <span className="p-icon">🏛️</span> MIT Media Lab
          </div>
          <div className="partner-logo-item">
            <span className="p-icon">☁️</span> Amazon Web Services
          </div>
          <div className="partner-logo-item">
            <span className="p-icon">🚀</span> Y Combinator
          </div>
          <div className="partner-logo-item">
            <span className="p-icon">⚡</span> Anthropic
          </div>
          <div className="partner-logo-item">
            <span className="p-icon">📈</span> Citadel Securities
          </div>
          <div className="partner-logo-item">
            <span className="p-icon">📊</span> Wharton FinTech
          </div>
        </div>
      </section>

      {/* 3. PLATFORM KPI COUNTERS */}
      <section className="kpi-banner-section">
        <div className="kpi-grid">
          <div className="kpi-box">
            <span className="kpi-value">$2,500,000+</span>
            <span className="kpi-label">Awarded Cash &amp; Grants</span>
            <span className="kpi-sub">Direct wire to winners</span>
          </div>
          <div className="kpi-box">
            <span className="kpi-value">120,000+</span>
            <span className="kpi-label">Active Global Hackers</span>
            <span className="kpi-sub">Across 85+ countries</span>
          </div>
          <div className="kpi-box">
            <span className="kpi-value">500+</span>
            <span className="kpi-label">Vetted Competitions</span>
            <span className="kpi-sub">100% verified rubrics</span>
          </div>
          <div className="kpi-box">
            <span className="kpi-value">94.2%</span>
            <span className="kpi-label">Hiring Fast-Track Rate</span>
            <span className="kpi-sub">For top 10% finalists</span>
          </div>
        </div>
      </section>

      {/* 4. MAIN HACKATHON CATALOG & FILTER MATRIX */}
      <section id="catalog" className="catalog-section">
        <div className="catalog-header-block">
          <div>
            <span className="badge-coursera-sub">COMPETITION DIRECTORY</span>
            <h2 className="catalog-section-title">Explore Premier Hackathons</h2>
            <p className="catalog-section-sub">
              Browse world-class engineering challenges with verified rubrics, live mentor support, and guaranteed prize pools.
            </p>
          </div>

          <div className="catalog-status-tabs">
            <button
              className={`status-tab ${selectedStatus === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('all')}
            >
              All Competitions ({HACKATHONS_DATA.length})
            </button>
            <button
              className={`status-tab ${selectedStatus === 'active' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('active')}
            >
              ● Live Now
            </button>
            <button
              className={`status-tab ${selectedStatus === 'upcoming' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('upcoming')}
            >
              ⏳ Upcoming
            </button>
            <button
              className={`status-tab ${selectedStatus === 'judging' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('judging')}
            >
              ⚖️ In Judging
            </button>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="category-pills-row">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search bar inside catalog */}
        <div className="catalog-search-row">
          <div className="catalog-search-wrapper">
            <span className="search-icon-inside">🔍</span>
            <input
              type="text"
              placeholder="Search by hackathon title, skill (e.g. PyTorch, SQLite), or organizer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
              >
                Clear
              </button>
            )}
          </div>
          <span className="catalog-count-badge">
            Showing {filteredHackathons.length} of {HACKATHONS_DATA.length} hackathons
          </span>
        </div>

        {/* Hackathons Cards Grid */}
        {filteredHackathons.length > 0 ? (
          <div className="hackathons-grid">
            {filteredHackathons.map((hackathon) => (
              <HackathonCard
                key={hackathon.id}
                hackathon={hackathon}
                onSelect={(h) => setSelectedHackathon(h)}
                onRegister={(h) => setSelectedHackathon(h)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-catalog-state">
            <span style={{ fontSize: '3rem' }}>🔍</span>
            <h3>No hackathons match your search filter</h3>
            <p>Try resetting the category filter or searching for broader terms like "AI" or "Systems".</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>

      {/* 5. "WHY COURSERA HACKATHON PLUS" 4-PILLAR VALUE GRID */}
      <section className="why-plus-section">
        <div className="why-plus-header">
          <span className="badge-coursera-plus" style={{ margin: '0 auto 0.5rem auto' }}>
            <span className="plus-star">★</span> VALUE PROPOSITION
          </span>
          <h2>Why Top Engineers Choose Veyra Hackathon Plus</h2>
          <p>
            Level up from casual weekend coder to an award-winning engineer with a proven portfolio and verified credentials.
          </p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon-box">🚀</div>
            <h3>Unlimited Submissions</h3>
            <p>
              Participate in as many hackathons as you want throughout the year without paying individual registration fees. Test ideas across multiple tracks.
            </p>
            <span className="pillar-sub">Over $2.5M in available prize pools</span>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">⚖️</div>
            <h3>Zero-Bias Z-Score Judging</h3>
            <p>
              Our statistical normalization algorithm normalizes every judge&rsquo;s score to eliminate harshness and leniency bias, ensuring fair deterministic rankings.
            </p>
            <span className="pillar-sub">Powered by our SQLite WAL engine</span>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">📜</div>
            <h3>Verified Digital Credentials</h3>
            <p>
              Earn cryptographically signed completion and finalist certificates shareable directly to LinkedIn and GitHub. Stand out to technical recruiters.
            </p>
            <span className="pillar-sub">Recognized by 400+ tech employers</span>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">💼</div>
            <h3>Direct Recruiter Fast-Track</h3>
            <p>
              Top 10% finalists get fast-tracked into direct technical interview loops with engineering directors and sponsors from Google, Meta, and top startups.
            </p>
            <span className="pillar-sub">94.2% placement interview rate</span>
          </div>
        </div>
      </section>

      {/* 6. LIVE DATABASE INTEGRATION: REAL-TIME NORMALIZED LEADERBOARD */}
      <section className="live-db-leaderboard-section">
        <div className="section-header-split">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge-live-pulse">
                <span className="pulse-dot"></span> LIVE FROM DATABASE
              </span>
              <span className="badge badge-info">
                System: {health?.status === 'ok' ? 'SQLite Connected' : 'Local DB'}
              </span>
            </div>
            <h2>Real-Time Normalized Leaderboard</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Live rankings from the active database. Ranked deterministically by normalized Z-Score &rarr; raw average &rarr; ID tie-breaker.
            </p>
          </div>

          <div className="leaderboard-header-actions">
            <button
              className="btn-secondary"
              onClick={() => navigate('/results')}
            >
              Full Leaderboard View →
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate('/judging')}
            >
              Grade as Judge ({currentUser.name}) →
            </button>
          </div>
        </div>

        {/* Live Leaderboard Table Preview */}
        <div className="live-results-card">
          {loadingDb ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading real-time normalized scores from SQLite...
            </div>
          ) : liveResults.length > 0 ? (
            <div className="table-responsive">
              <table className="coursera-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Rank</th>
                    <th>Project &amp; Team</th>
                    <th>Track</th>
                    <th>Normalized Z-Score</th>
                    <th>Raw Score</th>
                    <th>Reviews</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {liveResults.slice(0, 5).map((r, index) => {
                    return (
                      <tr key={r.submissionId || index}>
                        <td>
                          <span
                            className={`rank-badge ${
                              index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : ''
                            }`}
                          >
                            {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `#${index + 1}`}
                          </span>
                        </td>
                        <td>
                          <div className="project-title-cell">
                            <strong>{r.projectName || r.submissionId}</strong>
                            <small>{r.teamName || 'Engineering Team'}</small>
                          </div>
                        </td>
                        <td>
                          <span className="skill-chip">
                            {r.trackName || 'Offline First & SQLite Architecture'}
                          </span>
                        </td>
                        <td>
                          <span className="z-score-metric">
                            {typeof r.normalizedScore === 'number'
                              ? r.normalizedScore.toFixed(3)
                              : r.normalizedScore || '0.000'}
                          </span>
                        </td>
                        <td>
                          <span className="raw-score-metric">
                            {typeof r.rawAverageScore === 'number'
                              ? r.rawAverageScore.toFixed(2)
                              : r.rawAverageScore || '0.00'}{' '}
                            / 50.0
                          </span>
                        </td>
                        <td>
                          <span className="reviews-count-badge">
                            {r.judgeCount || 5} Verified Judges
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="badge badge-success">✓ Finalized</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No scores submitted yet. Jump into the <strong style={{ color: '#fff' }}>Judge Portal</strong> to evaluate demo submissions!
            </div>
          )}

          <div className="leaderboard-footer-note">
            <span>💡 <strong>Judges:</strong> You are currently viewing as <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()}). You can switch personas in the top right to test different roles.</span>
          </div>
        </div>
      </section>

      {/* 7. COURSERA PLUS PLAN COMPARISON MATRIX */}
      <section id="plans" className="pricing-section">
        <div className="pricing-header-center">
          <span className="badge-coursera-plus" style={{ margin: '0 auto 0.5rem auto' }}>
            <span className="plus-star">★</span> MEMBERSHIP OPTIONS
          </span>
          <h2>Simple, Transparent Plans for Every Builder</h2>
          <p>
            Choose the plan that suits your ambitions. Cancel anytime online with zero hidden fees.
          </p>

          {/* Billing Switch */}
          <div className="billing-cycle-toggle">
            <button
              className={`toggle-btn ${pricingCycle === 'annual' ? 'active' : ''}`}
              onClick={() => setPricingCycle('annual')}
            >
              Annual Billing
              <span className="save-chip">Save 32%</span>
            </button>
            <button
              className={`toggle-btn ${pricingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setPricingCycle('monthly')}
            >
              Monthly Billing
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-cards-container">
          {PRICING_PLANS.map((plan) => {
            const price = pricingCycle === 'annual' ? plan.priceYear : plan.priceMonth;
            const period = pricingCycle === 'annual' ? '/ year' : '/ month';

            return (
              <div
                key={plan.id}
                className={`pricing-card ${plan.isPopular ? 'popular-card' : ''}`}
              >
                {plan.isPopular && <div className="popular-ribbon">RECOMMENDED</div>}

                <div className="pricing-card-header">
                  <h3>{plan.name}</h3>
                  <p className="pricing-tagline">{plan.tagline}</p>
                </div>

                <div className="pricing-rate-box">
                  <span className="rate-amount">{price}</span>
                  <span className="rate-period">{period}</span>
                </div>
                <div className="rate-billed-sub">{plan.billedPeriod}</div>

                <button
                  type="button"
                  className={`btn-plan-action ${plan.isPopular ? 'btn-popular' : 'btn-standard'}`}
                  onClick={() => setShowSubscriptionModal(true)}
                >
                  {plan.ctaText}
                </button>

                <div className="pricing-features-block">
                  <span className="features-headline">What&rsquo;s included:</span>
                  <ul className="features-checklist">
                    {plan.features.map((f, i) => (
                      <li key={i} className={f.included ? 'included' : 'excluded'}>
                        <span className="check-bullet">{f.included ? '✓' : '✕'}</span>
                        <div className="feature-text-wrap">
                          <span>{f.name}</span>
                          {f.detail && <small className="feature-detail-text">{f.detail}</small>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. MASTERCLASSES & LEARNING TRACKS (COURSERA STYLE) */}
      <section id="masterclasses" className="masterclasses-section">
        <div className="section-header-split">
          <div>
            <span className="badge-coursera-sub">GUIDED SPECIALIZATIONS</span>
            <h2>Masterclasses &amp; Starter Toolkits</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Learn from engineers at DeepMind, Stanford, and YC to turn complex ideas into 1st-place hackathon submissions.
            </p>
          </div>
          <span className="all-tracks-count">4 Tracks Available</span>
        </div>

        <div className="tracks-grid">
          {LEARNING_TRACKS.map((t) => (
            <div key={t.id} className="track-course-card">
              <div className="track-banner" style={{ background: t.bannerUrl }}>
                <span className="track-badge-logo">{t.badgeLogo}</span>
                <span className="track-institution-tag">{t.institution}</span>
              </div>
              <div className="track-body">
                <div className="track-meta">
                  <span className="track-rating">★ {t.rating}</span>
                  <span>•</span>
                  <span>{t.studentsCount} builders enrolled</span>
                </div>
                <h3 className="track-title">{t.title}</h3>
                <p className="track-instructor">Instructor: {t.instructor}</p>

                <div className="track-syllabus-summary">
                  <strong>Key Curriculum:</strong>
                  <ul>
                    {t.syllabusHighlights.slice(0, 2).map((item, idx) => (
                      <li key={idx}>&bull; {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="track-footer">
                  <span className="track-duration">{t.duration}</span>
                  <button
                    className="btn-track-enroll"
                    onClick={() => setShowSubscriptionModal(true)}
                  >
                    Start Track
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. TESTIMONIALS & WINNERS WALL */}
      <section className="testimonials-section">
        <div className="testimonials-header">
          <span className="badge-coursera-plus" style={{ margin: '0 auto 0.5rem auto' }}>
            <span className="plus-star">★</span> SUCCESS STORIES
          </span>
          <h2>From Hackathon Participants to World-Class Leaders</h2>
          <p>Read how Veyra Hackathon Plus alumni launched startups, won prize money, and secured dream roles.</p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p className="testimonial-quote">
              &ldquo;Winning 1st place in the Autonomous Agents challenge gave our team the seed funding and credibility we needed. Google DeepMind recruiters reached out to us within 48 hours of the leaderboard finalizing!&rdquo;
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">👩‍💻</div>
              <div>
                <strong>Aria Montgomery</strong>
                <span>Staff AI Engineer &bull; Ex-1st Place Winner</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <p className="testimonial-quote">
              &ldquo;The Z-Score normalization is revolutionary. In other hackathons we got penalized by harsh judges. Here, we knew the math was completely unbiased and our architecture scored on true merit.&rdquo;
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">👨‍💻</div>
              <div>
                <strong>Devon Vance</strong>
                <span>Founder, AetherOS &bull; $50K Prize Recipient</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <p className="testimonial-quote">
              &ldquo;The 1-on-1 office hours with Stanford and AWS mentors helped us optimize our SQLite WAL architecture before submission deadline. We landed 2nd place and a fellowship.&rdquo;
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">👩‍🔬</div>
              <div>
                <strong>Mira Kulkarni</strong>
                <span>BioTech Researcher &bull; MIT Energy Finalist</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. INTERACTIVE FAQ ACCORDION */}
      <section id="faq" className="faq-section">
        <div className="faq-header">
          <span className="badge-coursera-sub">FREQUENTLY ASKED QUESTIONS</span>
          <h2>Everything You Need to Know</h2>
          <p>Got questions about rules, team size, rubrics, or prizes? We have answers.</p>
        </div>

        <div className="faq-accordion-container">
          {faqs.map((faq, index) => {
            const isOpen = faqOpenIndex === index;
            return (
              <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                >
                  <span>{faq.q}</span>
                  <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="faq-answer-panel">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. FINAL HIGH-CONVERSION CTA BANNER */}
      <section className="final-cta-section">
        <div className="final-cta-inner">
          <span className="badge-coursera-plus" style={{ margin: '0 auto 1rem auto' }}>
            <span className="plus-star">★</span> JOIN VEYRA HACKATHON PLUS
          </span>
          <h2>Ready to Build Your Next Breakthrough Project?</h2>
          <p>
            Join 120,000+ engineers participating in premier hackathons, building game-changing software, and competing for $2.5M in prizes.
          </p>

          <div className="final-cta-buttons">
            <button
              type="button"
              className="btn-hero-primary"
              onClick={() => setShowSubscriptionModal(true)}
            >
              Start 7-Day Free Trial Now →
            </button>
            <a href="#catalog" className="btn-hero-secondary">
              Browse Open Challenges
            </a>
          </div>

          <span className="cta-money-back-note">
            14-day money-back guarantee &bull; Free participation tier available &bull; No commitment
          </span>
        </div>
      </section>

      {/* MODALS */}
      <HackathonDetailModal
        hackathon={selectedHackathon}
        onClose={() => setSelectedHackathon(null)}
        onEnrollSuccess={handleEnrollSuccess}
      />

      <EnrollmentConfirmationModal
        hackathon={confirmedHackathon}
        registrationData={registrationData}
        onClose={() => setConfirmedHackathon(null)}
        onGoToJudging={() => {
          setConfirmedHackathon(null);
          navigate('/judging');
        }}
      />

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  );
};
