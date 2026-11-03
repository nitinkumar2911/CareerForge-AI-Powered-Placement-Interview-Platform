/**
 * ATS Scorer Service for CareerForge Resume Builder
 * Analyzes structure, keyword density, completeness, and quantifiable metrics
 */

function calculateATSScore(resumeData) {
  let score = 0;
  const feedback = [];

  const { personalInfo, education, experience, projects, skills } = resumeData || {};

  // 1. Personal & Contact Info (Max 20 pts)
  let contactScore = 0;
  if (personalInfo?.fullName) contactScore += 4;
  if (personalInfo?.email) contactScore += 4;
  if (personalInfo?.phone) contactScore += 4;
  if (personalInfo?.linkedin) contactScore += 4;
  if (personalInfo?.github || personalInfo?.website) contactScore += 4;

  score += contactScore;
  if (contactScore < 16) {
    feedback.push('Add all primary contact links (LinkedIn, GitHub, and Portfolio) to optimize recruiter reach.');
  }

  // 2. Professional Summary (Max 15 pts)
  if (personalInfo?.summary && personalInfo.summary.length > 50) {
    score += 15;
  } else if (personalInfo?.summary) {
    score += 8;
    feedback.push('Expand your professional summary to 2-3 sentences highlighting your specialization and career objectives.');
  } else {
    feedback.push('Include a compelling executive summary at the top of your resume.');
  }

  // 3. Education (Max 15 pts)
  if (education && education.length > 0) {
    const hasDegree = education.some(e => e.degree && e.institution);
    if (hasDegree) score += 15;
    else score += 8;
  } else {
    feedback.push('Add your college education, degree, and graduation timeline.');
  }

  // 4. Experience & Internships (Max 20 pts)
  if (experience && experience.length > 0) {
    const hasMetrics = experience.some(e =>
      /\d+%|\$\d+|\d+\s*(users|clients|requests|ms|times)/i.test(e.description || '')
    );
    if (hasMetrics) {
      score += 20;
    } else {
      score += 14;
      feedback.push('Incorporate quantifiable metrics into experience bullet points (e.g., "improved latency by 35%", "scaled to 10k users").');
    }
  } else {
    score += 5;
    feedback.push('Add prior internships, open-source contributions, or campus leadership roles.');
  }

  // 5. Technical Projects (Max 15 pts)
  if (projects && projects.length >= 2) {
    const hasLinks = projects.some(p => p.liveLink || p.githubLink);
    if (hasLinks) score += 15;
    else {
      score += 10;
      feedback.push('Add direct GitHub or live deployment URLs for your key technical projects.');
    }
  } else if (projects && projects.length === 1) {
    score += 8;
    feedback.push('Highlight at least 2-3 substantial technical projects showcasing diverse skills.');
  } else {
    feedback.push('Showcase your technical capability with full-stack or specialized projects.');
  }

  // 6. Skills Classification (Max 15 pts)
  let skillCount = 0;
  if (skills?.technical) skillCount += skills.technical.length;
  if (skills?.frameworks) skillCount += skills.frameworks.length;
  if (skills?.tools) skillCount += skills.tools.length;

  if (skillCount >= 8) {
    score += 15;
  } else if (skillCount >= 4) {
    score += 9;
    feedback.push('Enrich your technical skills section with core languages, frameworks, and modern developer tools.');
  } else {
    feedback.push('List relevant technologies, libraries, and cloud platforms to match recruiter keyword queries.');
  }

  const finalScore = Math.min(100, Math.max(0, score));

  return {
    score: finalScore,
    feedback: feedback.length > 0 ? feedback : ['Your resume is well-structured and fully ATS compliant!']
  };
}

module.exports = { calculateATSScore };
