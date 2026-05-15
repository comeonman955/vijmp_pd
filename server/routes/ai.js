const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const fetch = require('node-fetch');

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

async function askGemini(prompt) {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gemini API error');
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// POST /api/ai/resume
router.post('/resume', protect, async (req, res) => {
  try {
    const user = req.user;
    const prompt = `You are a professional resume writer. Create a clean, professional resume for the following person. Format it nicely with clear sections. Write in English.

Name: ${user.name}
Bio: ${user.bio || 'Not provided'}
Education: ${user.education || 'Not provided'}
Skills: ${user.skills?.join(', ') || 'Not provided'}
Portfolio: ${user.portfolioLink || 'Not provided'}

Create a professional resume with these sections:
1. PROFESSIONAL SUMMARY (3-4 sentences based on their bio and skills)
2. SKILLS (organized by category)
3. EDUCATION
4. PROJECTS / PORTFOLIO (if portfolio link provided)
5. KEY STRENGTHS (3 bullet points)

Make it impressive and suitable for an internship level candidate. Keep it concise and impactful.`;

    const resume = await askGemini(prompt);
    res.json({ resume });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate resume: ' + err.message });
  }
});

// POST /api/ai/cover-letter
router.post('/cover-letter', protect, async (req, res) => {
  try {
    const { jobTitle, jobDescription, company } = req.body;
    if (!jobTitle) return res.status(400).json({ message: 'jobTitle is required' });
    const user = req.user;

    const prompt = `You are an expert career coach. Write a compelling, personalized cover letter in English. Keep it to 3 paragraphs. Be specific, enthusiastic, and professional.

Candidate: ${user.name}
Skills: ${user.skills?.join(', ') || 'various technical skills'}
Education: ${user.education || 'University student'}
Bio: ${user.bio || ''}

Job: ${jobTitle} at ${company || 'the company'}
Description: ${jobDescription || 'an internship position'}

Write a cover letter that connects their skills to the job. Start with "Dear Hiring Manager," and end with "Sincerely, ${user.name}". Do NOT use placeholder brackets.`;

    const coverLetter = await askGemini(prompt);
    res.json({ coverLetter });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate cover letter: ' + err.message });
  }
});

// POST /api/ai/career-advice
router.post('/career-advice', protect, async (req, res) => {
  try {
    const user = req.user;
    const { question } = req.body;

    const prompt = `You are a friendly career advisor for students. Answer in English. Be specific, practical and encouraging. Use bullet points.

Student: ${user.name}
Skills: ${user.skills?.join(', ') || 'none listed'}
Education: ${user.education || 'not specified'}
Bio: ${user.bio || 'not specified'}

Question: "${question || 'What skills should I develop to improve my career prospects?'}"

Give practical advice with: direct answer, 3-5 actionable steps, skills to learn, encouragement. Under 300 words.`;

    const advice = await askGemini(prompt);
    res.json({ advice });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get career advice: ' + err.message });
  }
});

// POST /api/ai/auto-apply
router.post('/auto-apply', protect, async (req, res) => {
  try {
    const Job = require('../models/Job');
    const Application = require('../models/Application');
    const user = req.user;

    if (!user.skills?.length) {
      return res.status(400).json({ message: 'Please add skills to your profile first' });
    }

    const jobs = await Job.find({ isActive: true }).populate('employer', 'name company');
    const applied = await Application.find({ candidate: user._id });
    const appliedIds = applied.map(a => a.job.toString());
    const notApplied = jobs.filter(j => !appliedIds.includes(j._id.toString()));

    if (!notApplied.length) {
      return res.json({ matches: [], message: 'You have applied to all available jobs!' });
    }

    const jobsList = notApplied.slice(0, 20).map((j, i) =>
      `${i + 1}. ID:${j._id} | Title: ${j.title} | Company: ${j.company} | Skills needed: ${j.skills?.join(', ')}`
    ).join('\n');

    const prompt = `You are a job matching AI. Find the top 3 jobs that best match this candidate.

Candidate Skills: ${user.skills.join(', ')}
Education: ${user.education || 'university'}

Jobs:
${jobsList}

Return ONLY a valid JSON array, no extra text:
[{"id":"job_id","match":90,"reason":"reason here"},{"id":"job_id","match":80,"reason":"reason here"},{"id":"job_id","match":70,"reason":"reason here"}]`;

    const aiResponse = await askGemini(prompt);

    let matches = [];
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        matches = parsed.map(item => {
          const job = notApplied.find(j => j._id.toString() === item.id);
          return job ? { job, match: item.match, reason: item.reason } : null;
        }).filter(Boolean);
      }
    } catch {
      matches = notApplied.slice(0, 3).map(job => ({
        job, match: 75, reason: 'Good potential match based on your profile'
      }));
    }

    if (!matches.length) {
      matches = notApplied.slice(0, 3).map(job => ({
        job, match: 75, reason: 'Good potential match based on your profile'
      }));
    }

    res.json({ matches });
  } catch (err) {
    res.status(500).json({ message: 'Failed to find matches: ' + err.message });
  }
});

module.exports = router;
