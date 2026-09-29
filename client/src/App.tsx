import type { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicLayout, ParticipantLayout, JudgeLayout, OrganizerLayout } from './layouts';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  EventsList,
  EventDetail,
  ProjectGallery,
  ProjectDetail,
  PublicResults,
  PublicArchive,
} from './pages/public';
import {
  ParticipantDashboard,
  MyRegistration,
  MyTeam,
  MyProject,
  Submission,
  Eligibility,
  Announcements,
  Results,
  Certificate,
} from './pages/participant';
import {
  JudgeDashboard,
  AssignedProjects,
  AssignmentDetail,
  ConflictOfInterest,
  JudgeHistory,
} from './pages/judge';
import {
  OrganizerDashboard,
  EventManager,
  ParticipantsManager,
  TeamsManager,
  ProjectsManager,
  SubmissionsManager,
  EligibilityManager,
  RubricsManager,
  JudgesManager,
  AssignmentsManager,
  CoiResolutions,
  ScoresStream,
  NormalizationManager,
  ResultsManager,
  AwardsManager,
  CertificatesManager,
  AnnouncementsManager,
  AuditLogViewer,
  ArchiveManager,
  SettingsManager,
} from './pages/organizer';

export const App: FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Portal Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="events" element={<EventsList />} />
            <Route path="events/:slug" element={<EventDetail />} />
            <Route path="events/:slug/projects" element={<ProjectGallery />} />
            <Route path="events/:slug/projects/:id" element={<ProjectDetail />} />
            <Route path="results" element={<PublicResults />} />
            <Route path="archive" element={<PublicArchive />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Participant Portal Routes */}
          <Route path="/participant" element={<ParticipantLayout />}>
            <Route index element={<ParticipantDashboard />} />
            <Route path="registration" element={<MyRegistration />} />
            <Route path="team" element={<MyTeam />} />
            <Route path="project" element={<MyProject />} />
            <Route path="submission" element={<Submission />} />
            <Route path="eligibility" element={<Eligibility />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="results" element={<Results />} />
            <Route path="certificate" element={<Certificate />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Judge Portal Routes */}
          <Route path="/judge" element={<JudgeLayout />}>
            <Route index element={<JudgeDashboard />} />
            <Route path="assignments" element={<AssignedProjects />} />
            <Route path="assignments/:id" element={<AssignmentDetail />} />
            <Route path="conflicts" element={<ConflictOfInterest />} />
            <Route path="history" element={<JudgeHistory />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Organizer Portal Routes */}
          <Route path="/organizer" element={<OrganizerLayout />}>
            <Route index element={<OrganizerDashboard />} />
            <Route path="event" element={<EventManager />} />
            <Route path="participants" element={<ParticipantsManager />} />
            <Route path="teams" element={<TeamsManager />} />
            <Route path="projects" element={<ProjectsManager />} />
            <Route path="submissions" element={<SubmissionsManager />} />
            <Route path="eligibility" element={<EligibilityManager />} />
            <Route path="rubrics" element={<RubricsManager />} />
            <Route path="judges" element={<JudgesManager />} />
            <Route path="assignments" element={<AssignmentsManager />} />
            <Route path="coi" element={<CoiResolutions />} />
            <Route path="scores" element={<ScoresStream />} />
            <Route path="normalization" element={<NormalizationManager />} />
            <Route path="results" element={<ResultsManager />} />
            <Route path="awards" element={<AwardsManager />} />
            <Route path="certificates" element={<CertificatesManager />} />
            <Route path="announcements" element={<AnnouncementsManager />} />
            <Route path="audit-log" element={<AuditLogViewer />} />
            <Route path="archive" element={<ArchiveManager />} />
            <Route path="settings" element={<SettingsManager />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
